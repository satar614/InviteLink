# InviteLink CI/CD Setup Checklist

This checklist guides you through setting up the complete CI/CD pipeline for InviteLink.

## Phase 1: Azure Infrastructure Setup ✓

- [ ] Azure subscription created and active
- [ ] Azure CLI installed and logged in
  ```bash
  az login
  ```
- [ ] Correct subscription selected
  ```bash
  az account set --subscription "<subscription-id>"
  ```

## Phase 2: Azure Resource Group

- [ ] Create resource group
  ```bash
  az group create --name invitelink-rg --location eastus
  ```
- [ ] Resource group name noted for later: `invitelink-rg`

## Phase 3: Azure Container Registry (ACR)

- [ ] ACR created
  ```bash
  az acr create --resource-group invitelink-rg \
    --name invitelinkacr --sku Basic
  ```
- [ ] ACR login server: `invitelinkacr.azurecr.io`
- [ ] Admin credentials enabled and captured:
  ```bash
  az acr credential show --name invitelinkacr
  ```

## Phase 4: Azure Kubernetes Service (AKS)

- [ ] AKS cluster created with ACR integration
  ```bash
  az aks create --resource-group invitelink-rg \
    --name invitelink-aks --node-count 2 \
    --attach-acr invitelinkacr \
    --enable-managed-identity \
    --generate-ssh-keys
  ```
- [ ] Cluster name noted: `invitelink-aks`
- [ ] Credentials downloaded locally
  ```bash
  az aks get-credentials --resource-group invitelink-rg \
    --name invitelink-aks
  ```
- [ ] Cluster accessible
  ```bash
  kubectl cluster-info
  ```

## Phase 5: Terraform Setup

- [ ] Terraform files reviewed in `infra/`
- [ ] `terraform.tfvars` created with values:
  ```hcl
  subscription_id      = "your-subscription-id"
  location            = "UK South"
  acr_name            = "invitelinkacr"
  resource_group_name = "invitelink-rg"
  ```
- [ ] Terraform initialized locally
  ```bash
  cd infra
  terraform init
  terraform plan
  ```

## Phase 6: Docker Configuration

### Backend
- [ ] Dockerfile exists: `backend/SmartInvite.Api/SmartInvite.Api/Dockerfile`
- [ ] Backend builds locally
  ```bash
  docker build -f backend/SmartInvite.Api/SmartInvite.Api/Dockerfile \
    -t smartinvite-api:local .
  ```

### Frontend
- [ ] Dockerfile exists: `frontend/Dockerfile`
- [ ] Frontend builds locally
  ```bash
  docker build -f frontend/Dockerfile -t invitelink-frontend:local .
  ```

## Phase 7: Kubernetes Manifests

- [ ] Backend deployment manifest: `k8s/backend-deployment.yml`
- [ ] Frontend deployment manifest: `k8s/frontend-deployment.yml`
- [ ] Ingress configuration: `k8s/ingress.yml`
- [ ] Manifests tested locally with Minikube or Kind:
  ```bash
  kubectl apply -f k8s/backend-deployment.yml -n test
  kubectl apply -f k8s/frontend-deployment.yml -n test
  ```

## Phase 8: GitHub Actions Workflows

- [ ] Workflows created:
  - [ ] `.github/workflows/deploy-infra.yml`
  - [ ] `.github/workflows/deploy-backend.yml`
  - [ ] `.github/workflows/deploy-frontend.yml`
- [ ] Workflow syntax validated (GitHub will check on push)
- [ ] Path-based triggers configured correctly

## Phase 9: Azure Service Principal for CI/CD

- [ ] Service Principal created
  ```bash
  az ad sp create-for-rbac --name "github-actions-invitelink" \
    --role Contributor \
    --scopes /subscriptions/<subscription-id>
  ```
- [ ] Service Principal output saved (contains credentials)

## Phase 10: GitHub Repository Secrets

Navigate to: **Settings → Secrets and variables → Actions**

- [ ] `AZURE_CREDENTIALS` secret created
  - Paste the entire JSON from Service Principal output
  
- [ ] `ACR_LOGIN_SERVER` secret created
  - Value: `invitelinkacr.azurecr.io`
  
- [ ] `ACR_USERNAME` secret created
  - Get from: `az acr credential show --name invitelinkacr`
  
- [ ] `ACR_PASSWORD` secret created
  - Get from: `az acr credential show --name invitelinkacr`
  
- [ ] `AKS_CLUSTER_NAME` secret created
  - Value: `invitelink-aks`
  
- [ ] `AKS_RESOURCE_GROUP` secret created
  - Value: `invitelink-rg`

### Verify Secrets Script
```bash
./scripts/setup-github-secrets.sh
```

## Phase 11: Test Infrastructure Pipeline

- [ ] Commit to feature branch
  ```bash
  git checkout -b test/infra-setup
  ```
- [ ] Make a minor change to `infra/` files
- [ ] Push branch and create PR
  ```bash
  git push origin test/infra-setup
  ```
- [ ] GitHub Actions triggers `deploy-infra.yml`
- [ ] Workflow completes successfully (plan stage)
- [ ] Review Terraform plan output in GitHub Actions

## Phase 12: Test Backend Pipeline

- [ ] Commit to feature branch
  ```bash
  git checkout -b test/backend-deploy
  ```
- [ ] Make a minor change to `backend/` files
- [ ] Push branch and create PR
- [ ] GitHub Actions triggers `deploy-backend.yml`
- [ ] Watch workflow progress:
  - Build and test
  - Docker image creation
  - ACR push
  - AKS deployment to `pr-{N}` namespace
- [ ] Verify in AKS
  ```bash
  kubectl get pods -n pr-<your-pr-number>
  ```

## Phase 13: Test Frontend Pipeline

- [ ] Commit to feature branch
  ```bash
  git checkout -b test/frontend-deploy
  ```
- [ ] Make a minor change to `frontend/` files
- [ ] Push branch and create PR
- [ ] GitHub Actions triggers `deploy-frontend.yml`
- [ ] Watch workflow progress
- [ ] Verify in AKS
  ```bash
  kubectl get pods -n pr-<your-pr-number>
  ```

## Phase 14: Test PR Namespace Isolation

- [ ] Create 2 or 3 PRs simultaneously
- [ ] Verify separate namespaces created
  ```bash
  kubectl get namespaces
  # Should see: pr-1, pr-2, pr-3, etc.
  ```
- [ ] Verify services accessible independently
  ```bash
  kubectl get services -n pr-1
  kubectl get services -n pr-2
  ```

## Phase 15: Test PR Cleanup

- [ ] Close one of the test PRs
- [ ] Wait for workflow completion
- [ ] Verify namespace deleted
  ```bash
  kubectl get namespaces | grep pr-<closed-pr-number>
  # Should not appear
  ```

## Phase 16: Test Main Deployment

- [ ] Merge one test PR to `main`
- [ ] GitHub Actions triggers all applicable pipelines
- [ ] Verify deployment to `main` namespace
  ```bash
  kubectl get pods -n main
  kubectl get services -n main
  ```
- [ ] Services accessible from production endpoints

## Phase 17: Verify End-to-End Flow

- [ ] Backend API accessible
  ```bash
  kubectl port-forward -n main svc/smartinvite-api 8080:80
  curl http://localhost:8080/health
  ```

- [ ] Frontend accessible
  ```bash
  kubectl port-forward -n main svc/invitelink-frontend 3000:80
  curl http://localhost:3000
  ```

## Phase 18: Documentation

- [ ] `docs/DEPLOYMENT.md` reviewed
- [ ] `.github/SETUP.md` reviewed
- [ ] `.github/workflows/README.md` reviewed
- [ ] Team trained on deployment process
- [ ] Runbooks created for common issues

## Phase 19: Security Review

- [ ] Service Principal permissions minimized
- [ ] No secrets in code or commit history
- [ ] GitHub branch protection configured for `main`
  ```
  Require pull request reviews before merging
  Require status checks to pass before merging
  Require branch to be up to date before merging
  ```
- [ ] Audit logging enabled in Azure
- [ ] ACR registry access limited

## Phase 20: Monitoring & Alerts

- [ ] GitHub Actions notifications configured
- [ ] Azure Monitor alerts set up for AKS
- [ ] Log Analytics workspace connected to AKS
- [ ] Monitoring dashboard created

## Phase 21: Performance Optimization (Optional)

- [ ] Review and optimize Dockerfile build times
- [ ] Consider multi-stage builds for smaller images
- [ ] Implement Docker layer caching in workflows
- [ ] Review AKS cluster sizing and scaling

## Phase 22: Disaster Recovery

- [ ] Backup strategy documented
- [ ] Disaster recovery plan created
- [ ] Tested restoration from backups
- [ ] RTO/RPO targets defined

## Final Verification Checklist

Before declaring setup complete:

- [ ] All 6 required GitHub secrets configured
- [ ] Infrastructure created with Terraform
- [ ] AKS cluster running and accessible
- [ ] ACR accessible from AKS
- [ ] All three pipelines working
- [ ] PR namespace isolation verified
- [ ] PR cleanup verified
- [ ] Main namespace deployment verified
- [ ] Services accessible and responsive
- [ ] Documentation complete and accurate
- [ ] Team trained on processes
- [ ] Security measures in place

## Success Criteria

✅ **Setup is complete when:**

1. PR #X deploys successfully to `pr-X` namespace
2. PR #Y deploys successfully to `pr-Y` namespace (simultaneously)
3. PR #X merges to main and deploys to `main` namespace
4. PR #Y closes and `pr-Y` namespace is deleted
5. Both backend API and frontend are accessible and functioning
6. All GitHub Actions workflows run without errors

## Troubleshooting Quick Links

- **Terraform Issues:** See [Terraform Troubleshooting](../docs/DEPLOYMENT.md#troubleshooting)
- **Docker Build Issues:** Check Docker logs and Dockerfile syntax
- **AKS Issues:** See [AKS Troubleshooting](../docs/DEPLOYMENT.md#troubleshooting)
- **GitHub Actions Issues:** Check workflow logs in GitHub Actions tab

## Support

For issues not covered in this checklist:

1. Check [DEPLOYMENT.md](../docs/DEPLOYMENT.md)
2. Review [GitHub Actions documentation](https://docs.github.com/actions)
3. Check [Azure AKS documentation](https://docs.microsoft.com/azure/aks/)
4. Review workflow logs in GitHub Actions tab

---

**Last Updated:** January 18, 2026
**Status:** Ready for Deployment
