# GitHub Actions Workflows for InviteLink

This directory contains the CI/CD workflows that automate the deployment of InviteLink to Azure AKS.

## 📊 Workflow Overview

### Workflows

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| `deploy-infra.yml` | Push/PR to `infra/` | Provisions AKS, ACR, and supporting Azure resources using Terraform |
| `deploy-backend.yml` | Push/PR to `backend/` | Builds, tests, containerizes, and deploys the C# .NET backend API |
| `deploy-frontend.yml` | Push/PR to `frontend/` | Builds, tests, containerizes, and deploys the React Native frontend |

## 🚀 Quick Start

1. **Set up GitHub Secrets:**
   ```bash
   chmod +x scripts/setup-github-secrets.sh
   ./scripts/setup-github-secrets.sh
   ```

2. **Create a Pull Request:**
   - Make changes to `backend/`, `frontend/`, or `infra/`
   - Push to your feature branch
   - Create a PR against `main`
   - Workflows automatically trigger and deploy to `pr-{PR-number}` namespace

3. **Merge to Main:**
   - When PR is approved and merged
   - Workflows deploy to `main` namespace (production)

## 📝 Required GitHub Secrets

Before workflows can run, configure these secrets in your repository:

- `AZURE_CREDENTIALS` - Azure Service Principal (JSON)
- `ACR_LOGIN_SERVER` - Container registry server URL
- `ACR_USERNAME` - Container registry username
- `ACR_PASSWORD` - Container registry password
- `AKS_CLUSTER_NAME` - Kubernetes cluster name
- `AKS_RESOURCE_GROUP` - Azure resource group name

See [SETUP.md](./.SETUP.md) for detailed setup instructions.

## 🎯 Deployment Strategy

### Pull Request Deployment
```
PR Created/Updated
       ↓
Build & Test
       ↓
Deploy to pr-{N} namespace
       ↓
PR Tests/Reviews
       ↓
PR Closed
       ↓
Delete pr-{N} namespace (auto)
```

### Main Branch Deployment
```
Push to main
       ↓
Build & Test
       ↓
Deploy to main namespace (prod)
       ↓
Ready for users
```

## 🔍 Monitoring Deployments

### View Workflow Status
- Go to **Actions** tab in GitHub
- Click on a workflow run to see detailed logs

### View Kubernetes Deployment
```bash
# Get AKS credentials
az aks get-credentials --resource-group <rg> --name <cluster>

# View all namespaces
kubectl get namespaces

# View deployments in main
kubectl get deployments -n main

# View PR deployment
kubectl get deployments -n pr-5

# View pods
kubectl get pods -n main

# View logs
kubectl logs -n main -l app=smartinvite-api
```

## 📦 Docker Images

All images are pushed to your Azure Container Registry (ACR).

**Image Names:**
- `smartinvite-api:main-{sha}` - Backend API
- `invitelink-frontend:main-{sha}` - Frontend
- `smartinvite-api:pr-{number}-{sha}` - Backend PR
- `invitelink-frontend:pr-{number}-{sha}` - Frontend PR

## ✅ Workflow Checklist

Before each deployment, ensure:

- [ ] All GitHub secrets are configured
- [ ] AKS cluster is running
- [ ] ACR is accessible and has sufficient quota
- [ ] Docker images build successfully locally
- [ ] Tests pass in GitHub Actions
- [ ] Code reviews are complete (for main branch)

## 🆘 Troubleshooting

### Workflow fails with missing secrets
→ Check Settings → Secrets and Variables → Actions

### Docker push fails
→ Verify ACR credentials and permissions

### Deployment to AKS fails
→ Check cluster exists: `az aks list -o table`

### Pods not starting
→ View logs: `kubectl logs <pod> -n <namespace>`

## 📚 Additional Resources

- [Deployment Guide](../docs/DEPLOYMENT.md)
- [GitHub Actions Docs](https://docs.github.com/actions)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Azure AKS Documentation](https://docs.microsoft.com/azure/aks/)

## 🔐 Security Best Practices

1. ✅ Use Azure Service Principal with minimal required permissions
2. ✅ Rotate credentials regularly
3. ✅ Never commit secrets to the repository
4. ✅ Use GitHub encrypted secrets for sensitive data
5. ✅ Limit workflow access to appropriate teams
6. ✅ Audit workflow logs regularly
