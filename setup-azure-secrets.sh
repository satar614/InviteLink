#!/bin/bash

# Complete Azure Setup Script for GitHub Actions CI/CD
# This script sets up all necessary Azure resources and GitHub secrets for full CI/CD pipeline

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
RESOURCE_GROUP="${RESOURCE_GROUP:-}"
LOCATION="${LOCATION:-eastus}"
REGISTRY_NAME="${REGISTRY_NAME:-}"
AKS_CLUSTER_NAME="${AKS_CLUSTER_NAME:-invitelink-aks}"
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

# Get Resource Group
if [ -z "$RESOURCE_GROUP" ]; then
    read -p "Enter resource group name [invitelink-rg]: " RESOURCE_GROUP
    RESOURCE_GROUP="${RESOURCE_GROUP:-invitelink-rg}"
fi

# Get Registry Name
if [ -z "$REGISTRY_NAME" ]; then
    read -p "Enter container registry name [invitelinkregistry]: " REGISTRY_NAME
    REGISTRY_NAME="${REGISTRY_NAME:-invitelinkregistry}"
fi

# Get AKS Cluster Name
if [ -z "$AKS_CLUSTER_NAME" ]; then
    read -p "Enter AKS cluster name [invitelink-aks]: " AKS_CLUSTER_NAME
    AKS_CLUSTER_NAME="${AKS_CLUSTER_NAME:-invitelink-aks}"
fi

# Validate registry name (must be lowercase alphanumeric only)
if ! [[ "$REGISTRY_NAME" =~ ^[a-z0-9]+$ ]]; then
    print_error "Registry name must contain only lowercase alphanumeric characters"
    exit 1
fi

# Validate cluster name
if ! [[ "$AKS_CLUSTER_NAME" =~ ^[a-z0-9-]+$ ]]; then
    print_error "Cluster name must contain only lowercase alphanumeric characters and hyphens"
    exit 1
fi

print_info "Configuration:"
echo "  Subscription: $SUBSCRIPTION_ID"
echo "  Repository: $REPO"
echo "  Resource Group: $RESOURCE_GROUP"
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

# Create Resource Group
print_header "Creating Azure Resources"

echo "Creating resource group: $RESOURCE_GROUP"
az group create --name "$RESOURCE_GROUP" --location "$LOCATION" > /dev/null 2>&1 || print_warning "Resource group may already exist"
print_success "Resource group ready"

# Create Storage Account (for Terraform state)
STORAGE_ACCOUNT="${RESOURCE_GROUP}storage"
echo ""
echo "Creating storage account for Terraform state: $STORAGE_ACCOUNT"
az storage account create \
    --name "$STORAGE_ACCOUNT" \
    --resource-group "$RESOURCE_GROUP" \
    --location "$LOCATION" \
    --sku Standard_LRS \
    --kind StorageV2 > /dev/null 2>&1 || print_warning "Storage account may already exist"
print_success "Storage account ready"

# Create Container Registry
echo ""
echo "Creating container registry: $REGISTRY_NAME"
az acr create \
    --resource-group "$RESOURCE_GROUP" \
    --name "$REGISTRY_NAME" \
    --sku Basic \
    --location "$LOCATION" > /dev/null 2>&1 || print_warning "Container registry may already exist"
print_success "Container registry ready"

# Get ACR credentials
ACR_LOGIN_SERVER=$(az acr show --resource-group "$RESOURCE_GROUP" --name "$REGISTRY_NAME" --query loginServer -o tsv)
ACR_USERNAME=$(az acr credential show --resource-group "$RESOURCE_GROUP" --name "$REGISTRY_NAME" --query username -o tsv)
ACR_PASSWORD=$(az acr credential show --resource-group "$RESOURCE_GROUP" --name "$REGISTRY_NAME" --query passwords[0].value -o tsv)
print_info "ACR Login Server: $ACR_LOGIN_SERVER"

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

# Set ACR credentials
echo "  • ACR_LOGIN_SERVER"
echo "$ACR_LOGIN_SERVER" | gh secret set ACR_LOGIN_SERVER --repo "$REPO"

echo "  • ACR_USERNAME"
echo "$ACR_USERNAME" | gh secret set ACR_USERNAME --repo "$REPO"

echo "  • ACR_PASSWORD"
echo "$ACR_PASSWORD" | gh secret set ACR_PASSWORD --repo "$REPO"

print_success "All secrets set in GitHub"

# Save configuration to file
CONFIG_FILE="/tmp/azure_setup_config.txt"
cat > "$CONFIG_FILE" << EOF
# Azure Setup Configuration
# Generated: $(date)

SUBSCRIPTION_ID=$SUBSCRIPTION_ID
TENANT_ID=$TENANT_ID
CLIENT_ID=$CLIENT_ID
RESOURCE_GROUP=$RESOURCE_GROUP
REGISTRY_NAME=$REGISTRY_NAME
ACR_LOGIN_SERVER=$ACR_LOGIN_SERVER
AKS_CLUSTER_NAME=$AKS_CLUSTER_NAME
LOCATION=$LOCATION
REPO=$REPO
EOF

# Final Summary
print_header "Setup Complete!"

echo -e "${GREEN}✅ Azure infrastructure and GitHub secrets configured${NC}"
echo ""
echo "Configuration saved to: $CONFIG_FILE"
echo ""
echo -e "${BLUE}Summary of Resources Created:${NC}"
echo "  Resource Group: $RESOURCE_GROUP"
echo "  Storage Account: $STORAGE_ACCOUNT"
echo "  Container Registry: $REGISTRY_NAME"
echo "  Registry Server: $ACR_LOGIN_SERVER"
echo "  AKS Cluster Name: $AKS_CLUSTER_NAME"
echo ""
echo -e "${BLUE}GitHub Secrets Set:${NC}"
echo "  • AZURE_CLIENT_SECRET (Client Secret)"
echo "  • ACR_LOGIN_SERVER"
echo "  • ACR_USERNAME"
echo "  • ACR_PASSWORD"
echo ""
echo -e "${BLUE}Hardcoded in Workflows (Update .github/workflows/*.yml):${NC}"
echo "  SUBSCRIPTION_ID=$SUBSCRIPTION_ID"
echo "  TENANT_ID=$TENANT_ID"
echo "  CLIENT_ID=$CLIENT_ID"
echo "  AKS_CLUSTER_NAME=$AKS_CLUSTER_NAME"
echo "  AKS_RESOURCE_GROUP=$RESOURCE_GROUP"
echo ""
echo -e "${BLUE}Next Steps:${NC}"
echo "  1. Update workflow files with hardcoded values:"
echo "     - .github/workflows/deploy-backend.yml"
echo "     - .github/workflows/deploy-infra.yml"
echo "     Replace placeholder values with the ones above"
echo ""
echo "  2. Create AKS Cluster (optional - can be created via Terraform):"
echo "     az aks create --resource-group $RESOURCE_GROUP --name $AKS_CLUSTER_NAME --node-count 1"
echo ""
echo "  3. Push changes to trigger CI/CD pipeline:"
echo "     git push origin your-branch"
echo ""
echo "Configuration details saved to: $CONFIG_FILE"
echo ""
