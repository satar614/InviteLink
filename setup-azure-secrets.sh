#!/bin/bash

# Azure Service Principal Setup Script for GitHub Actions CI/CD
# This script creates a service principal and sets up GitHub secrets
# Infrastructure deployment (ACR, AKS, etc.) is handled by the deploy-infra workflow

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values (can be overridden)
SUBSCRIPTION_ID="${SUBSCRIPTION_ID:-}"
REPO="${REPO:-}"
SP_NAME="InviteLinkGitHubActions"

# Functions
print_header() {
    echo ""
    echo -e "${BLUE}=========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}=========================================${NC}"
    echo ""
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check prerequisites
print_header "Checking Prerequisites"

# Check if Azure CLI is installed
if ! command -v az &> /dev/null; then
    print_error "Azure CLI not found. Please install it first: https://docs.microsoft.com/cli/azure/install-azure-cli"
    exit 1
fi

# Check if GitHub CLI is installed
if ! command -v gh &> /dev/null; then
    print_error "GitHub CLI not found. Please install it first: https://cli.github.com/"
    exit 1
fi

# Check if jq is installed
if ! command -v jq &> /dev/null; then
    print_error "jq not found. Please install it: apt-get install jq (Linux) or brew install jq (macOS)"
    exit 1
fi

print_success "All prerequisites found (Azure CLI, GitHub CLI, jq)"

# Get interactive inputs if not provided
print_header "Configuration Setup"

# Get Subscription ID
if [ -z "$SUBSCRIPTION_ID" ]; then
    echo "Available subscriptions:"
    az account list --output table
    echo ""
    read -p "Enter your Subscription ID: " SUBSCRIPTION_ID
fi

# Get Repository
if [ -z "$REPO" ]; then
    read -p "Enter repository (owner/repo): " REPO
fi

print_info "Configuration:"
echo "  Subscription: $SUBSCRIPTION_ID"
echo "  Repository: $REPO"
echo "  Container Registry: $REGISTRY_NAME"
echo "  Location: $LOCATION"
echo "  AKS Cluster: $AKS_CLUSTER_NAME"
echo ""

read -p "Continue with these settings? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
fi

# Azure Authentication
print_header "Azure Authentication"

if ! az account show &>/dev/null; then
    print_error "Not logged into Azure"
    echo "Please run: az login"
    exit 1
fi

CURRENT_SUB=$(az account show --query id -o tsv)
if [ "$CURRENT_SUB" != "$SUBSCRIPTION_ID" ]; then
    print_warning "Current subscription: $CURRENT_SUB"
    print_info "Setting subscription to: $SUBSCRIPTION_ID"
    az account set --subscription "$SUBSCRIPTION_ID"
fi

TENANT_ID=$(az account show --query tenantId -o tsv)
print_success "Authenticated with subscription: $SUBSCRIPTION_ID"
print_info "Tenant ID: $TENANT_ID"

# Create Service Principal
print_header "Creating Service Principal for GitHub Actions"

SP_EXISTS=$(az ad sp list --filter "displayName eq '$SP_NAME'" --query "[0].appId" -o tsv 2>/dev/null || echo "")

if [ -z "$SP_EXISTS" ]; then
    echo "Creating new service principal: $SP_NAME"
    SP_JSON=$(az ad sp create-for-rbac \
        --name "$SP_NAME" \
        --role Contributor \
        --scopes "/subscriptions/$SUBSCRIPTION_ID" \
        --json-auth)
    
    CLIENT_ID=$(echo "$SP_JSON" | jq -r '.clientId')
    CLIENT_SECRET=$(echo "$SP_JSON" | jq -r '.clientSecret')
    print_success "Service Principal created"
else
    print_warning "Service principal already exists: $SP_EXISTS"
    print_error "Cannot retrieve password for existing service principal"
    echo ""
    echo "To create new credentials, run:"
    echo "  az ad sp credential reset --id $SP_EXISTS --credential-description GitHub --years 1"
    exit 1
fi

print_info "Client ID: $CLIENT_ID"

# Set GitHub Secrets
print_header "Setting GitHub Secrets"

echo "Checking GitHub authentication..."
if ! gh auth status &>/dev/null; then
    print_error "Not authenticated with GitHub"
    echo "Please run: gh auth login"
    exit 1
fi

echo ""
echo "Setting secrets in GitHub repository: $REPO"

# Set AZURE_CLIENT_SECRET
echo "  • AZURE_CLIENT_SECRET"
echo "$CLIENT_SECRET" | gh secret set AZURE_CLIENT_SECRET --repo "$REPO"

print_success "All secrets set in GitHub"

# Save configuration to file
CONFIG_FILE="/tmp/azure_setup_config.txt"
cat > "$CONFIG_FILE" << EOF
# Azure Service Principal Configuration
# Generated: $(date)

SUBSCRIPTION_ID=$SUBSCRIPTION_ID
TENANT_ID=$TENANT_ID
CLIENT_ID=$CLIENT_ID
REPO=$REPO
SP_NAME=$SP_NAME
EOF

# Final Summary
print_header "Setup Complete!"

echo -e "${GREEN}✅ Azure infrastructure and GitHub secrets configured${NC}"
echo ""
echo "Configuration saved to: $CONFIG_FILE"
echo ""
echo -e "${BLUE}SumService principal created and GitHub secrets configured${NC}"
echo ""
echo "Configuration saved to: $CONFIG_FILE"
echo ""
echo -e "${BLUE}Service Principal Details:${NC}"
echo "  Name: $SP_NAME"
echo "  Client ID: $CLIENT_ID"
echo "  Subscription: $SUBSCRIPTION_ID"
echo "  Tenant: $TENANT_ID"
echo ""
echo -e "${BLUE}GitHub Secret Set:${NC}"
echo "  • AZURE_CLIENT_SECRET"
echo ""
echo -e "${BLUE}Update these values in .github/workflows/*.yml:${NC}"
echo "  clientId: \"$CLIENT_ID\""
echo "  subscriptionId: \"$SUBSCRIPTION_ID\""
echo "  tenantId: \"$TENANT_ID\""
echo ""
echo -e "${BLUE}Next Steps:${NC}"
echo "  1. Update workflow files (.github/workflows/deploy-*.yml) with the hardcoded values above"
echo "  2. Run the deploy-infra workflow to create Azure infrastructure (ACR, AKS, etc.)"
echo "  3. The service principal has Contributor access to deploy resources"
echo ""
echo "Configuration