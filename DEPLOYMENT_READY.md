# InviteLink CI/CD Pipeline - Complete Setup Guide

## 📋 What Has Been Set Up

You now have a complete, production-ready CI/CD pipeline for InviteLink that:

1. **Automatically deploys** on every push and pull request
2. **Isolates PR deployments** with namespace-per-PR strategy
3. **Orchestrates 3 independent pipelines** for infrastructure, backend, and frontend
4. **Manages namespaces intelligently** - PR namespaces auto-delete when PR closes
5. **Deploys to Azure AKS** with Azure Container Registry for image management
6. **Uses Terraform** for infrastructure as code

## 📁 Files Created

### GitHub Actions Workflows
```
.github/
├── workflows/
│   ├── deploy-infra.yml        # Infrastructure provisioning (Terraform)
│   ├── deploy-backend.yml      # Backend API deployment
│   ├── deploy-frontend.yml     # Frontend deployment
│   └── README.md               # Workflow documentation
├── SETUP.md                    # GitHub Actions setup guide
└── SETUP_CHECKLIST.md          # Complete setup checklist
```

### Kubernetes Manifests
```
k8s/
├── backend-deployment.yml      # Backend service & deployment config
├── frontend-deployment.yml     # Frontend service & deployment config
└── ingress.yml                 # Optional ingress configuration
```

### Docker Configuration
```
backend/SmartInvite.Api/SmartInvite.Api/
└── Dockerfile                  # Multi-stage .NET build

frontend/
└── Dockerfile                  # Multi-stage Node.js/React build
```

### Documentation
```
docs/
└── DEPLOYMENT.md               # Comprehensive deployment guide

SETUP_CHECKLIST.md              # Phase-by-phase setup checklist
COMMANDS_REFERENCE.md           # Quick reference for CLI commands
```

### Scripts
```
scripts/
└── setup-github-secrets.sh     # Automated GitHub secrets setup script
```

## 🎯 How It Works

### Pipeline 1: Infrastructure (deploy-infra.yml)

**Triggers:** `infra/` folder changes + `main` branch

```
┌─────────────────┐
│ Terraform Plan  │
├─────────────────┤
│ On PR:          │ Show what would change
│ On Main merge:  │ Apply changes to Azure
└─────────────────┘
     ↓
   AKS, ACR, and supporting resources
```

**What it provisions:**
- Azure Kubernetes Service (AKS) cluster
- Azure Container Registry (ACR)
- Networking, storage, and monitoring resources

### Pipeline 2: Backend (deploy-backend.yml)

**Triggers:** `backend/` folder changes + any branch

```
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│ Build & Test │ → │ Build Docker │ → │ Push to ACR  │
└──────────────┘   └──────────────┘   └──────────────┘
                                            ↓
                                      ┌──────────────────┐
                                      │ Deploy to AKS    │
                                      ├──────────────────┤
                                      │ PR: pr-{number}  │
                                      │ Main: main       │
                                      └──────────────────┘
```

**Automatic cleanup:** PR namespace deleted when PR closes

### Pipeline 3: Frontend (deploy-frontend.yml)

**Triggers:** `frontend/` folder changes + any branch

```
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│ Build & Test │ → │ Build Docker │ → │ Push to ACR  │
└──────────────┘   └──────────────┘   └──────────────┘
                                            ↓
                                      ┌──────────────────┐
                                      │ Deploy to AKS    │
                                      ├──────────────────┤
                                      │ PR: pr-{number}  │
                                      │ Main: main       │
                                      └──────────────────┘
```

**Automatic cleanup:** PR namespace deleted when PR closes

## 🚀 Quick Start

### 1. Set Up GitHub Secrets (5 minutes)

```bash
chmod +x scripts/setup-github-secrets.sh
./scripts/setup-github-secrets.sh
```

This script will help you gather and create:
- `AZURE_CREDENTIALS`
- `ACR_LOGIN_SERVER`
- `ACR_USERNAME`
- `ACR_PASSWORD`
- `AKS_CLUSTER_NAME`
- `AKS_RESOURCE_GROUP`

Then add them to GitHub: **Settings → Secrets and variables → Actions**

### 2. Create Azure Resources (10 minutes)

```bash
# Login to Azure
az login

# Create resource group
az group create --name invitelink-rg --location eastus

# Create ACR
az acr create --resource-group invitelink-rg \
  --name invitelinkacr --sku Basic

# Create AKS with ACR integration
az aks create --resource-group invitelink-rg \
  --name invitelink-aks --node-count 2 \
  --attach-acr invitelinkacr \
  --enable-managed-identity \
  --generate-ssh-keys
```

### 3. Test the Pipeline (5 minutes)

```bash
# Create a feature branch
git checkout -b feature/test-deployment

# Make a change to backend/
echo "# Test" >> backend/SmartInvite.Api/README.md

# Push and create PR
git add -A
git commit -m "test: trigger deployment pipeline"
git push origin feature/test-deployment
```

Then create a PR on GitHub and watch the workflow:
- Go to **Actions** tab
- Click on the workflow run
- Watch it build, push, and deploy to `pr-{number}` namespace

### 4. Merge to Main

When your changes are ready:
```bash
# Merge via GitHub UI
# Or merge locally
git checkout main
git merge feature/test-deployment
git push origin main
```

The pipeline will:
1. Apply Terraform infrastructure changes (if any)
2. Deploy backend to `main` namespace
3. Deploy frontend to `main` namespace

## 📊 Namespace Strategy

```
                Your AKS Cluster
    ┌───────────────────────────────────────┐
    │                                       │
    ├─────────────┐  ┌─────────────────┐   │
    │  Namespace  │  │   Namespace     │   │
    │  pr-1       │  │   pr-2          │   │
    │             │  │                 │   │
    │ Backend Pod │  │ Backend Pod     │   │
    │ Frontend Pod│  │ Frontend Pod    │   │
    ├─────────────┤  ├─────────────────┤   │
    │                                   │   │
    │  ┌──────────────────────────┐    │   │
    │  │   Namespace: main        │    │   │
    │  │                          │    │   │
    │  │ • Backend Pod (2 replicas)    │   │
    │  │ • Frontend Pod (2 replicas)   │   │
    │  │ (Production)             │    │   │
    │  └──────────────────────────┘    │   │
    │                                   │   │
    └───────────────────────────────────────┘
```

**Benefits:**
- Multiple developers can test simultaneously
- Changes don't interfere with production
- Automatic cleanup saves resources
- Easy to debug and rollback

## 🔒 Deployment Isolation Example

```
Developer A creates PR #5
├─ Deploys to pr-5 namespace
├─ Tests their backend changes
└─ Services accessible independently

Developer B creates PR #6
├─ Deploys to pr-6 namespace
├─ Tests their frontend changes
└─ Services accessible independently

Developer C merges PR #4 to main
├─ Deploys to main namespace
├─ Updates production
└─ Available to all users

PR #5 is merged
├─ Merges into main
├─ Redeploys with final changes
├─ pr-5 namespace is deleted
└─ Resources freed

PR #6 is closed without merging
├─ pr-6 namespace is deleted
├─ Changes discarded
└─ No cleanup needed
```

## 🔑 GitHub Secrets Configuration

In your GitHub repository, set these secrets:

| Secret | Example Value | Source |
|--------|--------------|--------|
| `AZURE_CREDENTIALS` | `{"clientId":"...", ...}` | `az ad sp create-for-rbac` |
| `ACR_LOGIN_SERVER` | `myacr.azurecr.io` | `az acr show` |
| `ACR_USERNAME` | `myacr` | `az acr credential show` |
| `ACR_PASSWORD` | `xxxxxxxxxx` | `az acr credential show` |
| `AKS_CLUSTER_NAME` | `invitelink-aks` | `az aks list` |
| `AKS_RESOURCE_GROUP` | `invitelink-rg` | Your resource group |

## 📊 Workflow Status Monitoring

### In GitHub
1. Go to **Actions** tab
2. Select a workflow (e.g., `Deploy Backend`)
3. Click on a run to see:
   - Build logs
   - Test results
   - Docker image details
   - Deployment status

### In Azure/Kubernetes
```bash
# Check cluster
kubectl cluster-info

# List namespaces
kubectl get namespaces

# View PR deployment
kubectl get deployments -n pr-5

# View main deployment
kubectl get deployments -n main

# Check service endpoints
kubectl get services -n main
```

## 🆘 Common Issues & Solutions

### Issue: "Secret not found"
**Solution:** Ensure all 6 secrets are configured in GitHub Settings

### Issue: "Docker push failed"
**Solution:** 
```bash
az acr login --name <acr-name>
docker push <acr-server>/<image>
```

### Issue: "Deployment fails in AKS"
**Solution:**
```bash
kubectl describe pod <pod-name> -n <namespace>
kubectl logs <pod-name> -n <namespace>
```

### Issue: "Service not accessible"
**Solution:**
```bash
kubectl port-forward svc/<service-name> 8080:80 -n <namespace>
curl localhost:8080
```

## 📚 Documentation Index

- **[SETUP_CHECKLIST.md](./SETUP_CHECKLIST.md)** - Phase-by-phase setup guide (22 phases)
- **[COMMANDS_REFERENCE.md](./COMMANDS_REFERENCE.md)** - CLI command quick reference
- **[docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md)** - Comprehensive deployment guide
- **[.github/SETUP.md](./.github/SETUP.md)** - GitHub Actions setup details
- **[.github/workflows/README.md](./.github/workflows/README.md)** - Workflow documentation

## ✅ Verification Checklist

Before you start using this in production:

- [ ] All 6 GitHub secrets are configured
- [ ] Azure resources created (resource group, AKS, ACR)
- [ ] Terraform files reviewed and validated
- [ ] Dockerfiles build successfully locally
- [ ] Kubernetes manifests tested locally
- [ ] All three workflows passing on test branch
- [ ] PR deployment creates correct namespace
- [ ] PR cleanup deletes namespace on close
- [ ] Main deployment works correctly
- [ ] Backend and frontend are accessible
- [ ] Documentation reviewed by team

## 🎓 Next Steps

1. **Complete the Setup Checklist** - Follow [SETUP_CHECKLIST.md](./SETUP_CHECKLIST.md)
2. **Review the Deployment Guide** - Read [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md)
3. **Test the Pipeline** - Create a PR and watch it deploy
4. **Train Your Team** - Share this documentation with your team
5. **Set Up Monitoring** - Configure alerts and logging in Azure

## 🚀 Going Live

When ready for production:

1. Review security settings
2. Set up monitoring and alerts
3. Configure backup and disaster recovery
4. Test failure scenarios
5. Document runbooks
6. Brief your team on operations

## 📞 Support Resources

- [GitHub Actions Documentation](https://docs.github.com/actions)
- [Azure AKS Documentation](https://docs.microsoft.com/azure/aks/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Terraform Azure Provider](https://registry.terraform.io/providers/hashicorp/azurerm/latest)

## 🎉 Success!

Your InviteLink project now has:

✅ Automated infrastructure provisioning with Terraform
✅ Three independent CI/CD pipelines
✅ Intelligent PR namespace isolation
✅ Automatic cleanup and resource management
✅ Production-ready deployment to Azure AKS
✅ Complete documentation and guides

You're ready to start deploying with confidence!

---

**Created:** January 18, 2026
**Status:** Ready to Deploy
**Architecture:** Azure AKS + ACR + Terraform + GitHub Actions
