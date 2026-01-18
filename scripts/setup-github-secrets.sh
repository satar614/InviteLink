#!/bin/bash

# InviteLink GitHub Secrets Setup Script
# This script helps you gather and configure the required GitHub secrets

set -e

echo "================================"
echo "InviteLink GitHub Secrets Setup"
echo "================================"
echo ""

# Check if Azure CLI is installed
if ! command -v az &> /dev/null; then
    echo "❌ Azure CLI is not installed. Please install it first."
    echo "   Visit: https://docs.microsoft.com/cli/azure/install-azure-cli"
    exit 1
fi

# Check if jq is installed for JSON parsing
if ! command -v jq &> /dev/null; then
    echo "⚠️  jq is not installed. Some features may not work."
    echo "   Install with: apt-get install jq (Linux) or brew install jq (macOS)"
fi

# Login to Azure
echo "📝 Logging into Azure..."
az login

# Get subscription
echo ""
echo "📋 Available subscriptions:"
az account list --query "[].{name:name, id:id}" -o table

read -p "Enter your subscription ID: " SUBSCRIPTION_ID

az account set --subscription "$SUBSCRIPTION_ID"

echo ""
echo "✅ Subscription set to: $SUBSCRIPTION_ID"

# Create Service Principal for GitHub Actions
echo ""
echo "🔑 Creating Azure Service Principal for GitHub Actions..."

SP_NAME="github-actions-invitelink"
SP_OUTPUT=$(az ad sp create-for-rbac --name "$SP_NAME" --role Contributor --scopes /subscriptions/$SUBSCRIPTION_ID)

echo ""
echo "✅ Service Principal created!"
echo ""
echo "📋 AZURE_CREDENTIALS Secret (copy this entire JSON):"
echo "$SP_OUTPUT" | jq '.'

# Get ACR details
echo ""
echo "📋 Available Container Registries:"
az acr list --query "[].{name:name, loginServer:loginServer}" -o table

read -p "Enter your ACR name: " ACR_NAME

echo ""
echo "📋 Getting ACR credentials..."

ACR_SERVER=$(az acr show -n $ACR_NAME --query loginServer -o tsv)
ACR_USERNAME=$(az acr credential show -n $ACR_NAME --query "username" -o tsv)
ACR_PASSWORD=$(az acr credential show -n $ACR_NAME --query "passwords[0].value" -o tsv)

echo "✅ ACR credentials retrieved!"
echo ""
echo "ACR_LOGIN_SERVER: $ACR_SERVER"
echo "ACR_USERNAME: $ACR_USERNAME"
echo "ACR_PASSWORD: $ACR_PASSWORD"

# Get AKS details
echo ""
echo "📋 Available AKS Clusters:"
az aks list --query "[].{name:name, resourceGroup:resourceGroup}" -o table

read -p "Enter your AKS cluster name: " AKS_CLUSTER_NAME
read -p "Enter your AKS resource group: " AKS_RESOURCE_GROUP

echo "✅ AKS cluster details set!"
echo ""
echo "AKS_CLUSTER_NAME: $AKS_CLUSTER_NAME"
echo "AKS_RESOURCE_GROUP: $AKS_RESOURCE_GROUP"

# Summary
echo ""
echo "================================"
echo "📋 SUMMARY - Add these to GitHub"
echo "================================"
echo ""
echo "1. AZURE_CREDENTIALS:"
echo "   (Copy the Service Principal JSON output above)"
echo ""
echo "2. ACR_LOGIN_SERVER: $ACR_SERVER"
echo "3. ACR_USERNAME: $ACR_USERNAME"
echo "4. ACR_PASSWORD: $ACR_PASSWORD"
echo "5. AKS_CLUSTER_NAME: $AKS_CLUSTER_NAME"
echo "6. AKS_RESOURCE_GROUP: $AKS_RESOURCE_GROUP"
echo ""
echo "================================"
echo ""
echo "📝 Steps to add secrets to GitHub:"
echo "1. Go to your repository on GitHub"
echo "2. Click Settings → Secrets and variables → Actions"
echo "3. Click 'New repository secret'"
echo "4. Add each secret with the exact names above"
echo ""
echo "✅ Setup complete!"
