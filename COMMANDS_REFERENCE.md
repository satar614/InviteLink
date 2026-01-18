#!/bin/bash

# InviteLink Common CI/CD Commands
# Quick reference for frequent operations

# ============================================================================
# AZURE SETUP & AUTHENTICATION
# ============================================================================

# Login to Azure
az login

# Set active subscription
az account set --subscription "subscription-id"

# List all subscriptions
az account list --output table

# ============================================================================
# CONTAINER REGISTRY (ACR)
# ============================================================================

# Create ACR
az acr create --resource-group <rg-name> --name <acr-name> --sku Basic

# Get ACR credentials
az acr credential show --name <acr-name>

# Get ACR login server
az acr show --name <acr-name> --query loginServer --output tsv

# Push image to ACR
docker tag <image>:<tag> <acr-server>/<image>:<tag>
docker push <acr-server>/<image>:<tag>

# List images in ACR
az acr repository list --name <acr-name>

# Delete image from ACR
az acr repository delete --name <acr-name> --image <image>:<tag>

# ============================================================================
# KUBERNETES CLUSTER (AKS)
# ============================================================================

# Create AKS cluster with ACR integration
az aks create \
  --resource-group <rg-name> \
  --name <cluster-name> \
  --node-count 2 \
  --attach-acr <acr-name> \
  --enable-managed-identity \
  --generate-ssh-keys

# Get AKS credentials
az aks get-credentials --resource-group <rg-name> --name <cluster-name>

# List AKS clusters
az aks list --output table

# Delete AKS cluster
az aks delete --resource-group <rg-name> --name <cluster-name>

# ============================================================================
# KUBERNETES OPERATIONS
# ============================================================================

# Verify cluster connection
kubectl cluster-info

# Get nodes
kubectl get nodes

# Get namespaces
kubectl get namespaces

# Create namespace
kubectl create namespace <namespace-name>

# Delete namespace
kubectl delete namespace <namespace-name>

# Get pods in namespace
kubectl get pods -n <namespace>

# Get deployments in namespace
kubectl get deployments -n <namespace>

# Get services in namespace
kubectl get services -n <namespace>

# Describe deployment
kubectl describe deployment <deployment-name> -n <namespace>

# View logs
kubectl logs -n <namespace> -l app=<app-label>

# View specific pod logs
kubectl logs <pod-name> -n <namespace>

# Watch pod status
kubectl get pods -n <namespace> -w

# Port forward to service
kubectl port-forward -n <namespace> svc/<service-name> 8080:80

# Scale deployment
kubectl scale deployment <deployment-name> --replicas=3 -n <namespace>

# Rollout status
kubectl rollout status deployment/<deployment-name> -n <namespace>

# Rollback deployment
kubectl rollout undo deployment/<deployment-name> -n <namespace>

# ============================================================================
# APPLY KUBERNETES MANIFESTS
# ============================================================================

# Apply manifest to namespace
kubectl apply -f k8s/backend-deployment.yml -n <namespace>

# Apply all manifests in directory
kubectl apply -f k8s/ -n <namespace>

# Delete resources from manifest
kubectl delete -f k8s/backend-deployment.yml -n <namespace>

# Dry-run to see what would be applied
kubectl apply -f k8s/backend-deployment.yml -n <namespace> --dry-run=client

# ============================================================================
# DOCKER OPERATIONS (LOCAL)
# ============================================================================

# Build backend image
docker build -f backend/SmartInvite.Api/SmartInvite.Api/Dockerfile \
  -t smartinvite-api:latest .

# Build frontend image
docker build -f frontend/Dockerfile -t invitelink-frontend:latest .

# Login to ACR
az acr login --name <acr-name>

# Tag image for ACR
docker tag smartinvite-api:latest <acr-server>/smartinvite-api:latest

# Push to ACR
docker push <acr-server>/smartinvite-api:latest

# List local images
docker images

# Remove local image
docker rmi <image>:<tag>

# Run container locally
docker run -p 8080:8080 smartinvite-api:latest

# ============================================================================
# TERRAFORM OPERATIONS
# ============================================================================

# Initialize Terraform
cd infra && terraform init

# Format Terraform files
terraform fmt

# Validate configuration
terraform validate

# Create plan
terraform plan -out=tfplan

# Apply plan
terraform apply tfplan

# Apply with auto-approve
terraform apply -auto-approve

# Destroy infrastructure
terraform destroy

# View current state
terraform show

# View outputs
terraform output

# ============================================================================
# GITHUB ACTIONS / CI-CD
# ============================================================================

# View workflow file syntax (can't be run from command line, 
# but workflows are validated when pushed)

# Trigger workflow manually (using GitHub CLI if installed)
gh workflow run deploy-backend.yml

# View workflow status
gh run list --workflow deploy-backend.yml

# View workflow logs
gh run view <run-id> --log

# ============================================================================
# TROUBLESHOOTING & DEBUGGING
# ============================================================================

# Check AKS cluster status
az aks show --name <cluster-name> --resource-group <rg-name>

# Get events in namespace (useful for debugging)
kubectl get events -n <namespace> --sort-by='.lastTimestamp'

# Describe pod for detailed error info
kubectl describe pod <pod-name> -n <namespace>

# Execute command in pod
kubectl exec -it <pod-name> -n <namespace> -- /bin/bash

# Check resource usage
kubectl top nodes
kubectl top pods -n <namespace>

# Get detailed pod info
kubectl get pods -n <namespace> -o wide

# Check secret exists
kubectl get secret -n <namespace>

# Check configmap
kubectl get configmap -n <namespace>

# Check persistent volumes
kubectl get pv
kubectl get pvc -n <namespace>

# Verify image pull secret exists
kubectl get secret acr-secret -n <namespace>

# ============================================================================
# USEFUL ALIASES (Add to ~/.bashrc or ~/.zshrc)
# ============================================================================

# alias k='kubectl'
# alias kgn='kubectl get namespaces'
# alias kgp='kubectl get pods'
# alias kgs='kubectl get services'
# alias kgd='kubectl get deployments'
# alias kl='kubectl logs'
# alias kdp='kubectl describe pod'
# alias kdd='kubectl describe deployment'
# alias k-main='kubectl -n main'
# alias k-pr='kubectl -n pr-$1'

# ============================================================================
# COMMON WORKFLOWS
# ============================================================================

# 1. DEPLOY TO MINIKUBE FOR LOCAL TESTING
minikube start
kubectl create namespace test
kubectl apply -f k8s/ -n test
minikube service invitelink-frontend -n test
minikube stop

# 2. CHECK PR DEPLOYMENT
PR_NUMBER=5
kubectl get pods -n pr-$PR_NUMBER
kubectl get services -n pr-$PR_NUMBER
kubectl port-forward -n pr-$PR_NUMBER svc/smartinvite-api 8080:80

# 3. CHECK MAIN DEPLOYMENT
kubectl get pods -n main
kubectl get services -n main
kubectl port-forward -n main svc/invitelink-frontend 3000:80

# 4. VIEW ALL NAMESPACES AND RUNNING PODS
kubectl get namespaces
kubectl get pods --all-namespaces

# 5. CLEAN UP PR NAMESPACE
kubectl delete namespace pr-5

# 6. VIEW COMPLETE DEPLOYMENT STATUS
kubectl rollout status deployment/smartinvite-api -n main
kubectl rollout status deployment/invitelink-frontend -n main

# 7. BUILD AND PUSH IMAGE
docker build -f frontend/Dockerfile -t invitelink-frontend:local .
docker tag invitelink-frontend:local <acr>.azurecr.io/invitelink-frontend:local
docker push <acr>.azurecr.io/invitelink-frontend:local

# 8. UPDATE IMAGE IN RUNNING DEPLOYMENT
kubectl set image deployment/invitelink-frontend \
  invitelink-frontend=<acr>.azurecr.io/invitelink-frontend:latest \
  -n main --record

# ============================================================================
# USEFUL LINKS
# ============================================================================

# Azure Documentation
# https://docs.microsoft.com/azure/

# Azure CLI Reference
# https://docs.microsoft.com/cli/azure/

# Kubernetes Documentation
# https://kubernetes.io/docs/

# kubectl Cheat Sheet
# https://kubernetes.io/docs/reference/kubectl/cheatsheet/

# GitHub Actions Documentation
# https://docs.github.com/actions

# Terraform Azure Provider
# https://registry.terraform.io/providers/hashicorp/azurerm/latest

# ============================================================================
