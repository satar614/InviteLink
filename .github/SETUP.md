# GitHub Actions Setup Guide

## Required Secrets

To enable the GitHub Actions workflows to deploy to Azure AKS, you need to set up the following secrets in your GitHub repository:

### 1. Azure Credentials
**Secret Name:** `AZURE_CREDENTIALS`

Generate Azure credentials using Azure CLI:
```bash
az ad sp create-for-rbac --name "github-actions" --role Contributor --scopes /subscriptions/{subscription-id} --json
```

Copy the JSON output and set it as the `AZURE_CREDENTIALS` secret in GitHub.

### 2. Azure Container Registry (ACR)
**Secrets:**
- `ACR_LOGIN_SERVER`: Your ACR login server (e.g., `myacr.azurecr.io`)
- `ACR_USERNAME`: Your ACR username
- `ACR_PASSWORD`: Your ACR password

Get these from Azure Portal or via Azure CLI:
```bash
az acr show -n <acr-name> --query loginServer -o tsv
az acr credential show -n <acr-name> --query "passwords[0].value" -o tsv
az acr credential show -n <acr-name> --query "username" -o tsv
```

### 3. Azure Kubernetes Service (AKS)
**Secrets:**
- `AKS_CLUSTER_NAME`: Your AKS cluster name
- `AKS_RESOURCE_GROUP`: Your Azure resource group name

Example:
```bash
az aks list --query "[].{name: name, rg: resourceGroup}" -o table
```

## Setting Up Secrets in GitHub

1. Go to your GitHub repository
2. Navigate to **Settings > Secrets and variables > Actions**
3. Click **New repository secret**
4. Add each secret name and value

## Workflow Structure

### Infrastructure Deployment (`deploy-infra.yml`)
- **Triggers:** Push to `main` or PR against `main` when `infra/` changes
- **Action:** Applies Terraform to provision AKS, ACR, and supporting resources
- **Only applies:** When merged to main (PRs only plan)

### Backend Deployment (`deploy-backend.yml`)
- **Triggers:** Push to `main` or PR against `main` when `backend/` changes
- **Action:** Builds .NET backend, pushes Docker image to ACR, deploys to AKS
- **Namespace:** Uses `pr-{pr-number}` for PRs, `main` for main branch
- **Cleanup:** Deletes PR namespace when PR is closed

### Frontend Deployment (`deploy-frontend.yml`)
- **Triggers:** Push to `main` or PR against `main` when `frontend/` changes
- **Action:** Builds React Native app, pushes Docker image to ACR, deploys to AKS
- **Namespace:** Uses `pr-{pr-number}` for PRs, `main` for main branch
- **Cleanup:** Deletes PR namespace when PR is closed

## Deployment Flow

```
┌─────────────────────────────────────────────────────────────┐
│ Pull Request Created / Push to Branch                       │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
        ▼              ▼              ▼
   Infra Changes   Backend Changes  Frontend Changes
        │              │              │
        └──────────────┼──────────────┘
                       │
        ┌──────────────┴──────────────┐
        │                             │
   ▼ (On PR)                  ▼ (On Merge to Main)
   Plan Terraform            Apply Terraform
   Build & Test              Build & Push Images
   Build & Push Images       Deploy to PR Namespace
   Deploy to PR-{N}          or Main Namespace
   Namespace
        │                             │
        │                             │
   PR Close Event                     │
        │                             │
        ▼                             ▼
   Delete PR                    Namespace remains
   Namespace
```

## PR Isolation

Each pull request gets its own Kubernetes namespace named `pr-{pr-number}`. This allows:
- Multiple developers to test simultaneously
- Independent resource scaling per PR
- Automatic cleanup when PR is closed
- Isolated databases/configurations per PR (if configured)

Example namespaces:
- `pr-1`
- `pr-2`
- `main` (production/main branch)

## Testing Locally

### Test Terraform Plan
```bash
cd infra
terraform init
terraform plan
```

### Build Backend Docker Image
```bash
docker build -f backend/SmartInvite.Api/SmartInvite.Api/Dockerfile -t smartinvite-api:local .
```

### Build Frontend Docker Image
```bash
docker build -f frontend/Dockerfile -t invitelink-frontend:local .
```

## Troubleshooting

### Workflow Fails Due to Missing Secrets
- Check that all required secrets are set in GitHub Settings
- Verify secret names match exactly (they are case-sensitive)

### AKS Deployment Fails
- Verify AKS cluster exists and is running
- Check AKS cluster name and resource group are correct
- Ensure Azure credentials have proper permissions

### Docker Image Push Fails
- Verify ACR credentials are correct
- Ensure ACR exists and is accessible
- Check that ACR login server URL is correct

### Namespace Creation Issues
- Verify the service account has permission to create namespaces
- Check AKS RBAC settings

## Advanced Configuration

### Environment-Specific Variables
Modify the Kubernetes manifests in `k8s/` to use ConfigMaps for environment-specific settings.

### Database Connections
Add database connection strings as Kubernetes secrets:
```bash
kubectl create secret generic db-secret \
  --from-literal=connection-string="your-connection-string" \
  -n {namespace}
```

### Custom Domain Routing
Configure Ingress resources to route traffic to backend and frontend services.
