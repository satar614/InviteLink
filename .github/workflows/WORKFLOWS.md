# Workflows Documentation

## Overview

This project uses simplified GitHub Actions workflows for CI/CD with Helm-based deployments and automated testing.

## Workflows

### 1. Deploy Backend (`deploy-backend.yml`)
**Purpose:** Build, test, and deploy the backend API

**Triggers:**
- Push to `main` branch (paths: `backend/**`, workflow file)
- Pull requests to `main` (paths: `backend/**`, workflow file)

**Steps:**
1. Determine namespace (PR → `pr-{number}`, main → `main`)
2. Build and test .NET backend
3. Build and push Docker image to ACR
4. Deploy to AKS using Helm
5. Comment deployment info on PR (URL, namespace)

**Outputs:**
- Backend URL (LoadBalancer IP)
- PR comment with deployment details

---

### 2. Deploy Frontend (`deploy-frontend.yml`)
**Purpose:** Build, test, and deploy the React Native frontend

**Triggers:**
- Push to `main` branch (paths: `frontend/**`, workflow file)
- Pull requests to `main` (paths: `frontend/**`, workflow file)

**Steps:**
1. Determine namespace (PR → `pr-{number}`, main → `main`)
2. Build and test React Native app
3. Build and push Docker image to ACR
4. Deploy to AKS using Helm
5. Comment deployment info on PR (URL, namespace)

**Outputs:**
- Frontend URL (LoadBalancer IP)
- PR comment with deployment details

---

### 3. E2E Tests (`e2e-tests.yml`)
**Purpose:** Run end-to-end tests against deployed environments

**Triggers:**
- After successful completion of Deploy Backend or Deploy Frontend
- Manual trigger with namespace input

**Steps:**
1. Determine namespace from workflow run or input
2. Get service URLs from Kubernetes
3. Run Playwright + Cucumber E2E tests
4. Upload test results as artifacts
5. Comment test results on PR

**Features:**
- Runs against actual deployed environment
- Generates test report artifacts
- Posts results to PR comments
- Works with both PR and main deployments

---

### 4. Deploy Infrastructure (`deploy-infra.yml`)
**Purpose:** Deploy Azure infrastructure using Terraform

**Triggers:**
- Push to `main` branch (paths: `infra/**`)
- Pull requests (plan only)

**Resources Deployed:**
- Azure Container Registry (ACR)
- Azure Kubernetes Service (AKS)
- Resource Group

**Steps:**
1. Terraform init
2. Terraform format check
3. Terraform plan
4. Terraform apply (main branch only)

---

### 5. Cleanup (`cleanup.yml`)
**Purpose:** Clean up PR namespaces when PRs are closed

**Triggers:**
- Pull request closed
- Manual trigger with namespace input

**Steps:**
1. Delete all resources in namespace
2. Delete namespace

---

## Workflow Features

### Namespace Management
- **PR deployments:** `pr-{number}` (e.g., `pr-123`)
- **Main deployments:** `main`
- Automatic namespace creation
- Automatic cleanup on PR close

### Helm Deployments
- Uses `helm upgrade --install` for idempotent deployments
- Simplified charts with minimal configuration
- Namespace-scoped deployments
- Automatic rollback on failure

### PR Comments
Each deployment adds a comment to the PR with:
- **Backend:** Backend URL, namespace, timestamp
- **Frontend:** Frontend URL, namespace, timestamp
- **E2E Tests:** Test results, namespace, URLs, link to artifacts

### Image Tagging
Format: `{namespace}-{git-sha}`
Examples:
- `pr-123-abc1234`
- `main-def5678`

## Required Secrets

```yaml
AZURE_CREDENTIALS          # Azure service principal credentials
ACR_LOGIN_SERVER          # ACR registry URL (e.g., myacr.azurecr.io)
ACR_USERNAME              # ACR admin username
ACR_PASSWORD              # ACR admin password
AKS_CLUSTER_NAME          # AKS cluster name
AKS_RESOURCE_GROUP        # Azure resource group name
```

## Workflow Dependencies

```
PR Created/Updated
  ├─> Deploy Backend
  │     └─> E2E Tests
  └─> Deploy Frontend
        └─> E2E Tests

PR Closed
  └─> Cleanup

Main Branch Push
  ├─> Deploy Backend
  │     └─> E2E Tests
  └─> Deploy Frontend
        └─> E2E Tests

Infrastructure Changes
  └─> Deploy Infrastructure
```

## Local Testing

### Run E2E tests locally:
```bash
cd tests
npm install
FRONTEND_URL=http://your-frontend BACKEND_URL=http://your-backend npm test
```

### Deploy to namespace manually:
```bash
# Backend
helm upgrade --install smartinvite-api ./k8s/charts/backend \
  --namespace my-test \
  --set image.tag=my-test-tag \
  --create-namespace

# Frontend
helm upgrade --install invitelink-frontend ./k8s/charts/frontend \
  --namespace my-test \
  --set image.tag=my-test-tag \
  --create-namespace
```

### Cleanup namespace:
```bash
kubectl delete namespace my-test
```

## Simplified Architecture

### Before (Complex)
- Multiple reusable workflows
- Complex templating
- Nested workflow calls
- Kubectl checks before deployment

### After (Simplified)
- Self-contained component workflows
- Minimal Helm configuration
- Direct deployment steps
- Helm handles all deployment logic

## Benefits

1. **Simplicity:** Each workflow is standalone and easy to understand
2. **Idempotency:** Helm handles updates automatically
3. **PR Isolation:** Each PR gets its own namespace
4. **Automated Testing:** E2E tests run after every deployment
5. **Visibility:** PR comments provide instant feedback
6. **Cleanup:** Automatic namespace deletion on PR close
