# InviteLink CI/CD Deployment Guide

## Overview

This guide explains how the InviteLink project is automatically deployed to Azure Kubernetes Service (AKS) using GitHub Actions and Terraform.

## Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                     GitHub Repository                             │
├──────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ GitHub Actions Workflows (.github/workflows/)               │ │
│  ├─────────────────────────────────────────────────────────────┤ │
│  │ • deploy-infra.yml      (Infrastructure provisioning)       │ │
│  │ • deploy-backend.yml    (C# .NET API)                       │ │
│  │ • deploy-frontend.yml   (React Native Web)                  │ │
│  └─────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
                                │
                ┌───────────────┼───────────────┐
                │               │               │
                ▼               ▼               ▼
        ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
        │ Terraform    │  │ Docker Build │  │ Docker Build │
        │ (Azure)      │  │ Backend      │  │ Frontend     │
        └──────────────┘  └──────────────┘  └──────────────┘
                │               │               │
                │               ▼               ▼
                │        ┌──────────────────────────────┐
                │        │ Azure Container Registry     │
                │        │ (ACR)                        │
                │        └──────────────────────────────┘
                │               │
                └───────────────┼───────────────┐
                                │
                                ▼
                    ┌──────────────────────────┐
                    │ Azure Kubernetes Service │
                    │ (AKS)                    │
                    ├──────────────────────────┤
                    │ Namespaces:              │
                    │ • main                   │
                    │ • pr-1, pr-2, pr-3, ...  │
                    └──────────────────────────┘
```

## Workflow Triggers

### 1. Infrastructure Pipeline (`deploy-infra.yml`)

**When it runs:**
- When you push to `main` branch with changes in `infra/`
- When you create a PR with changes in `infra/`

**What it does:**
- Validates Terraform configuration
- Creates a Terraform plan
- **On PR:** Only shows the plan (doesn't apply)
- **On merge to main:** Applies the Terraform changes to provision/update AKS, ACR, and related resources

**Files that trigger it:**
```
infra/**
.github/workflows/deploy-infra.yml
```

### 2. Backend Pipeline (`deploy-backend.yml`)

**When it runs:**
- When you push to `main` branch with changes in `backend/`
- When you create a PR with changes in `backend/`

**What it does:**
1. Checks out code
2. Builds and tests the .NET API
3. Creates a Docker image
4. Pushes image to Azure Container Registry (ACR)
5. Deploys to AKS in the appropriate namespace:
   - **PR:** Deploys to `pr-{pr-number}` namespace
   - **Main:** Deploys to `main` namespace
6. Waits for the deployment to be ready

**PR Cleanup:**
- When the PR is closed, the `pr-{pr-number}` namespace is automatically deleted

**Files that trigger it:**
```
backend/**
.github/workflows/deploy-backend.yml
```

### 3. Frontend Pipeline (`deploy-frontend.yml`)

**When it runs:**
- When you push to `main` branch with changes in `frontend/`
- When you create a PR with changes in `frontend/`

**What it does:**
1. Checks out code
2. Installs dependencies and runs tests
3. Builds the React Native app
4. Creates a Docker image
5. Pushes image to Azure Container Registry (ACR)
6. Deploys to AKS in the appropriate namespace:
   - **PR:** Deploys to `pr-{pr-number}` namespace
   - **Main:** Deploys to `main` namespace
7. Waits for the deployment to be ready

**PR Cleanup:**
- When the PR is closed, the `pr-{pr-number}` namespace is automatically deleted

**Files that trigger it:**
```
frontend/**
.github/workflows/deploy-frontend.yml
```

## Namespace Strategy

### Main Branch Deployment
When you merge a PR to `main`:
- Code is deployed to the `main` Kubernetes namespace
- This is your production/staging environment
- Services are accessible at their stable endpoints

### PR Deployment
When you create a PR or push to a PR:
- Code is built and deployed to `pr-{pr-number}` namespace
- Example: PR #5 deploys to `pr-5` namespace
- Multiple PRs can be deployed simultaneously without interfering
- Each PR has its own:
  - Pods and containers
  - Services and load balancers
  - Environment variables and configurations
  - Database connections (if configured separately)

### PR Cleanup
When a PR is closed or merged:
- The `pr-{pr-number}` namespace is automatically deleted
- All associated resources (pods, services, volumes) are cleaned up
- No manual cleanup needed

## Kubernetes Manifests

The deployment configurations are stored in the `k8s/` directory:

### `backend-deployment.yml`
Defines the backend API deployment:
- 2 replicas for high availability
- LoadBalancer service on port 80
- Health checks (liveness and readiness probes)
- Resource limits (CPU 500m, Memory 512Mi)
- ACR image pull secret for authentication

### `frontend-deployment.yml`
Defines the frontend deployment:
- 2 replicas for high availability
- LoadBalancer service on port 80
- Health checks
- Resource limits
- ACR image pull secret for authentication

### `ingress.yml`
Optional Ingress configuration for:
- Single entry point for both services
- Path-based routing (/api → backend, / → frontend)
- Custom domain support

## Docker Images

### Backend Dockerfile
Location: `backend/SmartInvite.Api/SmartInvite.Api/Dockerfile`

Multi-stage build:
1. **Build stage:** Uses .NET 8 SDK to compile the C# application
2. **Runtime stage:** Uses .NET 8 runtime (smaller image) to run the compiled app

### Frontend Dockerfile
Location: `frontend/Dockerfile`

Multi-stage build:
1. **Build stage:** Uses Node.js 18 to install dependencies and build React app
2. **Runtime stage:** Uses Node.js 18-alpine with `serve` to run the built app

## Setting Up GitHub Secrets

The workflows need several secrets configured in GitHub:

### Required Secrets

1. **`AZURE_CREDENTIALS`** (JSON format)
   ```json
   {
     "clientId": "...",
     "clientSecret": "...",
     "subscriptionId": "...",
     "tenantId": "..."
   }
   ```
   Generate with: `az ad sp create-for-rbac`

2. **`ACR_LOGIN_SERVER`**
   - Example: `myacr.azurecr.io`

3. **`ACR_USERNAME`**
   - Your ACR username

4. **`ACR_PASSWORD`**
   - Your ACR password/admin key

5. **`AKS_CLUSTER_NAME`**
   - Your AKS cluster name
   - Example: `invitelink-aks`

6. **`AKS_RESOURCE_GROUP`**
   - Azure resource group containing your AKS cluster
   - Example: `invitelink-rg`

### Setting Secrets in GitHub

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add each secret with the exact name listed above

## Local Development

### Build Backend Locally
```bash
cd backend/SmartInvite.Api
dotnet build
dotnet run
```

### Build Frontend Locally
```bash
cd frontend
npm install
npm run dev  # or npm start for development
```

### Build Docker Images Locally
```bash
# Backend
docker build -f backend/SmartInvite.Api/SmartInvite.Api/Dockerfile \
  -t smartinvite-api:local .

# Frontend
docker build -f frontend/Dockerfile \
  -t invitelink-frontend:local .
```

### Deploy Locally to Minikube/Kind
```bash
# Start local Kubernetes
minikube start

# Create namespaces
kubectl create namespace main
kubectl create namespace pr-dev

# Apply manifests
kubectl apply -f k8s/backend-deployment.yml -n main
kubectl apply -f k8s/frontend-deployment.yml -n main

# View services
kubectl get services -n main
```

## Image Tagging

Images are tagged with:
- **Main branch:** `main-{git-sha}`
  - Example: `main-a1b2c3d4e5f6g7h8`
- **PR branch:** `pr-{pr-number}-{git-sha}`
  - Example: `pr-5-a1b2c3d4e5f6g7h8`
- **Latest tag:** Also tagged as `latest`

This allows:
- Tracking which exact commit was deployed
- Rolling back to previous versions
- Identifying which version is currently running

## Monitoring Deployments

### View Deployment Status
```bash
# Get AKS credentials
az aks get-credentials --resource-group <rg-name> --name <cluster-name>

# List all namespaces
kubectl get namespaces

# View deployments in main namespace
kubectl get deployments -n main

# View pods in PR namespace
kubectl get pods -n pr-5

# View services
kubectl get services -n main

# View events
kubectl get events -n main
```

### View Logs
```bash
# Backend logs
kubectl logs -n main -l app=smartinvite-api

# Frontend logs
kubectl logs -n main -l app=invitelink-frontend
```

### Describe Deployment
```bash
kubectl describe deployment smartinvite-api -n main
kubectl describe deployment invitelink-frontend -n main
```

## Troubleshooting

### Workflow Fails with "Secret not found"
- Check that all required secrets are set in GitHub Settings
- Verify secret names match exactly (case-sensitive)
- Restart the workflow

### Docker Push to ACR Fails
- Verify ACR credentials are correct
- Check ACR exists and is in the correct region
- Ensure service principal has ACR push permissions

### Deployment to AKS Fails
- Check AKS cluster is running: `az aks list -o table`
- Verify credentials with: `az aks get-credentials --resource-group <rg> --name <cluster>`
- Check pod events: `kubectl describe pod <pod-name> -n <namespace>`
- View logs: `kubectl logs <pod-name> -n <namespace>`

### Namespace Creation Issues
- Verify Azure credentials have cluster-admin role
- Check RBAC settings in AKS cluster
- Manually create namespace: `kubectl create namespace pr-5`

### Service Not Accessible
- Check service exists: `kubectl get services -n main`
- Check service has external IP: `kubectl get services -n main -w`
- Check pod is running: `kubectl get pods -n main`
- Check deployment status: `kubectl rollout status deployment/<name> -n main`

## Best Practices

1. **Test locally first** before pushing to GitHub
2. **Use PR deployments** to validate changes in a real Kubernetes environment
3. **Monitor deployment status** in GitHub Actions workflow output
4. **Review Terraform plan** before approving main branch merges
5. **Keep secrets secure** - never commit secrets to the repository
6. **Version your images** - the automatic tagging helps track versions
7. **Test database migrations** in PR namespace before merging to main
8. **Document infrastructure changes** in commit messages and PR descriptions

## CI/CD Pipeline Flow

```
Developer pushes code
        │
        ▼
GitHub detects changes
        │
        ├─ Changed files in backend/ → Trigger deploy-backend
        ├─ Changed files in frontend/ → Trigger deploy-frontend
        └─ Changed files in infra/ → Trigger deploy-infra
        │
        ▼
Is this a Pull Request?
        │
    ┌───┴───┐
    │       │
   YES     NO (push to main)
    │       │
    ▼       ▼
Create   Merge to
PR-{N}   main
Namespace Namespace
    │       │
    ▼       ▼
Deploy   Deploy
to PR   to main
    │       │
    ▼       ▼
Run      Ready for
Tests    Production
    │
    ▼
PR Closed?
    │
   YES
    ▼
Delete PR-{N}
Namespace
```

## Related Documentation

- [GitHub Actions Documentation](https://docs.github.com/actions)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Azure Kubernetes Service Docs](https://docs.microsoft.com/azure/aks/)
- [Terraform Azure Provider](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs)
- [Azure Container Registry](https://docs.microsoft.com/azure/container-registry/)
