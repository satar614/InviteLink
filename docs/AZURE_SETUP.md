# Azure Secrets Setup Guide

This guide explains how to set up Azure credentials for GitHub Actions workflows.

## Prerequisites

- Azure subscription: `26105aab-ded4-4e66-a408-309b2e23092c`
- `az` CLI installed
- `gh` (GitHub CLI) installed and authenticated
- Access to create service principals in the Azure subscription

## What Gets Configured

The setup script creates and configures:

1. **Service Principal** - For GitHub Actions to authenticate with Azure
2. **GitHub Secrets** - Stores credentials securely in the repository
3. **AKS Information** - Cluster name and resource group for Kubernetes operations

## Required GitHub Secrets

| Secret Name | Purpose | Example |
|---|---|---|
| `AZURE_CREDENTIALS` | JSON credentials for `azure/login@v1` | See below |
| `AZURE_SUBSCRIPTION_ID` | Azure subscription ID | `26105aab-ded4-4e66-a408-309b2e23092c` |
| `AZURE_CLIENT_ID` | Service principal application ID | UUID |
| `AZURE_TENANT_ID` | Azure tenant ID | UUID |
| `AKS_CLUSTER_NAME` | Kubernetes cluster name | `my-aks-cluster` |
| `AKS_RESOURCE_GROUP` | Azure resource group | `my-resource-group` |

## AZURE_CREDENTIALS Format

```json
{
  "clientId": "00000000-0000-0000-0000-000000000000",
  "clientSecret": "your-client-secret",
  "subscriptionId": "26105aab-ded4-4e66-a408-309b2e23092c",
  "tenantId": "00000000-0000-0000-0000-000000000000"
}
```

## Setup Steps

### Option 1: Automated Setup (Recommended)

```bash
# Make sure you're logged into Azure
az login

# Set the subscription
az account set --subscription 26105aab-ded4-4e66-a408-309b2e23092c

# Run the setup script
./setup-azure-secrets.sh
```

The script will:
1. ✅ Verify Azure authentication
2. ✅ Get tenant ID and subscription info
3. ✅ Create a service principal named "InviteLinkGitHubActions"
4. ✅ Set all required GitHub secrets
5. ✅ Prompt for AKS cluster information

### Option 2: Manual Setup

#### Step 1: Authenticate with Azure

```bash
az login
az account set --subscription 26105aab-ded4-4e66-a408-309b2e23092c
```

#### Step 2: Get Subscription Information

```bash
# Get Tenant ID
az account show --query tenantId -o tsv

# Get Subscription ID
az account show --query id -o tsv
```

#### Step 3: Create Service Principal

```bash
az ad sp create-for-rbac \
  --name InviteLinkGitHubActions \
  --role Contributor \
  --scopes "/subscriptions/26105aab-ded4-4e66-a408-309b2e23092c" \
  --json-auth
```

Save the output - you'll need the `clientId` and `clientSecret`.

#### Step 4: Set GitHub Secrets

Using GitHub CLI:

```bash
# Set AZURE_CREDENTIALS
gh secret set AZURE_CREDENTIALS --repo saddeaden1/InviteLink < credentials.json

# Set individual secrets
gh secret set AZURE_SUBSCRIPTION_ID --repo saddeaden1/InviteLink
gh secret set AZURE_CLIENT_ID --repo saddeaden1/InviteLink
gh secret set AZURE_TENANT_ID --repo saddeaden1/InviteLink
gh secret set AKS_CLUSTER_NAME --repo saddeaden1/InviteLink
gh secret set AKS_RESOURCE_GROUP --repo saddeaden1/InviteLink
```

Or use the GitHub web interface:
1. Go to https://github.com/saddeaden1/InviteLink/settings/secrets/actions
2. Click "New repository secret"
3. Add each secret with the corresponding value

## Verify Setup

### Check GitHub Secrets

```bash
gh secret list --repo saddeaden1/InviteLink
```

Expected output:
```
AZURE_CREDENTIALS
AZURE_SUBSCRIPTION_ID
AZURE_CLIENT_ID
AZURE_TENANT_ID
AKS_CLUSTER_NAME
AKS_RESOURCE_GROUP
```

### Test Workflow

Push a change to trigger the workflows:

```bash
git commit --allow-empty -m "test: Trigger workflows to verify Azure setup"
git push origin sadde-work
```

Monitor the workflow run at: https://github.com/saddeaden1/InviteLink/actions

## Troubleshooting

### "AADSTS700016: Application with identifier 'xxx' was not found in the directory"

The service principal may not have propagated. Wait 1-2 minutes and retry.

### "PERMISSION_DENIED: The caller does not have permission to..."

The service principal may not have the required role. Verify:
- Role assignment is `Contributor` or higher
- Scope is the subscription: `/subscriptions/26105aab-ded4-4e66-a408-309b2e23092c`

### "Failed to get credentials for the Azure subscription"

Verify the AZURE_CREDENTIALS secret contains valid JSON with all required fields.

## Security Best Practices

1. **Rotate Credentials Regularly**
   ```bash
   az ad sp credential reset --id <CLIENT_ID>
   ```

2. **Limit Service Principal Scope**
   - Use resource group scope instead of subscription if possible
   - Use minimal required roles (e.g., "AKS Cluster Admin")

3. **Monitor Service Principal Usage**
   ```bash
   az monitor activity-log list --caller "service principal" --output table
   ```

4. **Audit GitHub Secrets**
   - Regularly check which workflows access Azure secrets
   - Use branch protection rules to control secret access

## Related Documentation

- [Azure/login GitHub Action](https://github.com/Azure/login)
- [Azure Service Principal](https://docs.microsoft.com/en-us/azure/active-directory/develop/app-objects-and-service-principals)
- [GitHub Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [AKS Authentication](https://docs.microsoft.com/en-us/azure/aks/control-kubeconfig-access)
