#!/bin/bash

# Azure Setup Script for GitHub Secrets
# This script sets up the necessary Azure credentials and environment variables for GitHub Actions

set -e

SUBSCRIPTION_ID="26105aab-ded4-4e66-a408-309b2e23092c"
REPO="saddeaden1/InviteLink"

echo "========================================="
echo "Azure GitHub Secrets Setup"
echo "========================================="
echo ""
echo "Subscription ID: $SUBSCRIPTION_ID"
echo "Repository: $REPO"
echo ""

# Check if user is logged into Azure
echo "Checking Azure CLI authentication..."
if ! az account show &>/dev/null; then
    echo "❌ Not logged into Azure"
    echo ""
    echo "Please log in to Azure:"
    echo "  az login"
    echo ""
    echo "Then set the subscription:"
    echo "  az account set --subscription $SUBSCRIPTION_ID"
    exit 1
fi

CURRENT_SUB=$(az account show --query id -o tsv)
if [ "$CURRENT_SUB" != "$SUBSCRIPTION_ID" ]; then
    echo "⚠️  Current subscription: $CURRENT_SUB"
    echo "Setting subscription to: $SUBSCRIPTION_ID"
    az account set --subscription "$SUBSCRIPTION_ID"
fi

echo "✅ Azure authenticated"
echo ""

# Get tenant ID
echo "Retrieving Azure tenant and subscription information..."
TENANT_ID=$(az account show --query tenantId -o tsv)
echo "Tenant ID: $TENANT_ID"

# Create service principal for GitHub Actions
SP_NAME="InviteLinkGitHubActions"
echo ""
echo "Creating service principal: $SP_NAME"

# Check if service principal already exists
SP_EXISTS=$(az ad sp list --filter "displayName eq '$SP_NAME'" --query "[0].appId" -o tsv 2>/dev/null || echo "")

if [ -z "$SP_EXISTS" ]; then
    echo "Creating new service principal..."
    SP_JSON=$(az ad sp create-for-rbac \
        --name "$SP_NAME" \
        --role Contributor \
        --scopes "/subscriptions/$SUBSCRIPTION_ID" \
        --json-auth)
    
    CLIENT_ID=$(echo "$SP_JSON" | jq -r '.clientId')
    CLIENT_SECRET=$(echo "$SP_JSON" | jq -r '.clientSecret')
else
    echo "Service principal already exists"
    CLIENT_ID=$SP_EXISTS
    echo "⚠️  Cannot retrieve password for existing service principal"
    echo "You must create a new credential or use an existing one"
    echo ""
    echo "To create a new credential for existing service principal:"
    echo "  az ad sp credential reset --id $CLIENT_ID --credential-description GitHub --years 1"
    exit 1
fi

echo "✅ Service Principal Created"
echo ""
echo "Client ID: $CLIENT_ID"
echo ""

# Create AZURE_CREDENTIALS JSON
AZURE_CREDENTIALS=$(cat <<EOF
{
  "clientId": "$CLIENT_ID",
  "clientSecret": "$CLIENT_SECRET",
  "subscriptionId": "$SUBSCRIPTION_ID",
  "tenantId": "$TENANT_ID"
}
EOF
)

echo "Setting GitHub secrets..."
echo ""

# Set AZURE_CREDENTIALS
echo "Setting AZURE_CREDENTIALS..."
echo "$AZURE_CREDENTIALS" | gh secret set AZURE_CREDENTIALS --repo "$REPO"
echo "✅ AZURE_CREDENTIALS set"

# Set individual credentials
echo "Setting AZURE_SUBSCRIPTION_ID..."
echo "$SUBSCRIPTION_ID" | gh secret set AZURE_SUBSCRIPTION_ID --repo "$REPO"
echo "✅ AZURE_SUBSCRIPTION_ID set"

echo "Setting AZURE_CLIENT_ID..."
echo "$CLIENT_ID" | gh secret set AZURE_CLIENT_ID --repo "$REPO"
echo "✅ AZURE_CLIENT_ID set"

echo "Setting AZURE_TENANT_ID..."
echo "$TENANT_ID" | gh secret set AZURE_TENANT_ID --repo "$REPO"
echo "✅ AZURE_TENANT_ID set"

echo ""
echo "========================================="
echo "✅ Azure secrets configured successfully!"
echo "========================================="
echo ""
echo "The following secrets have been set in GitHub:"
echo "  • AZURE_CREDENTIALS (for azure/login action)"
echo "  • AZURE_SUBSCRIPTION_ID"
echo "  • AZURE_CLIENT_ID"
echo "  • AZURE_TENANT_ID"
echo ""
echo "Your workflows can now authenticate with Azure."
echo ""

# Prompt for AKS cluster information
echo "Now you need to provide AKS cluster information..."
echo ""
read -p "Enter your AKS cluster name: " AKS_CLUSTER_NAME
read -p "Enter your AKS resource group: " AKS_RESOURCE_GROUP

if [ -n "$AKS_CLUSTER_NAME" ] && [ -n "$AKS_RESOURCE_GROUP" ]; then
    echo ""
    echo "Setting AKS secrets..."
    echo "$AKS_CLUSTER_NAME" | gh secret set AKS_CLUSTER_NAME --repo "$REPO"
    echo "✅ AKS_CLUSTER_NAME set"
    
    echo "$AKS_RESOURCE_GROUP" | gh secret set AKS_RESOURCE_GROUP --repo "$REPO"
    echo "✅ AKS_RESOURCE_GROUP set"
    
    echo ""
    echo "========================================="
    echo "✅ All secrets configured!"
    echo "========================================="
fi

echo ""
echo "Summary of setup:"
echo "  Subscription: $SUBSCRIPTION_ID"
echo "  Tenant: $TENANT_ID"
echo "  Service Principal: $SP_NAME"
echo "  Client ID: $CLIENT_ID"
if [ -n "$AKS_CLUSTER_NAME" ]; then
    echo "  AKS Cluster: $AKS_CLUSTER_NAME"
    echo "  AKS Resource Group: $AKS_RESOURCE_GROUP"
fi
echo ""
