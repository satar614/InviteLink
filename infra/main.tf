provider "azurerm" {
  features {}
  subscription_id = var.subscription_id
}

provider "kubernetes" {
  skip_credentials_validation = true
  skip_metadata_api_check     = true
  
  # Use placeholder values - will be configured properly once AKS is in state
  host                   = "https://kubernetes.default.svc"
  client_certificate     = ""
  client_key             = ""
  cluster_ca_certificate = ""
}

provider "helm" {
  # Use placeholder values - will be configured properly once AKS is in state
  kubernetes {
    skip_credentials_validation = true
    host                   = "https://kubernetes.default.svc"
    client_certificate     = ""
    client_key             = ""
    cluster_ca_certificate = ""
  }
}

resource "azurerm_resource_group" "hub_rg" {
  name     = var.resource_group_name
  location = var.location
}

resource "azurerm_container_registry" "acr" {
  name                = var.acr_name
  resource_group_name = azurerm_resource_group.hub_rg.name
  location            = azurerm_resource_group.hub_rg.location
  sku                 = "Basic"
  admin_enabled       = true
}

# AKS Cluster
resource "azurerm_kubernetes_cluster" "aks" {
  name                = "invitelink-aks"
  location            = azurerm_resource_group.hub_rg.location
  resource_group_name = azurerm_resource_group.hub_rg.name
  dns_prefix          = "invitelink"

  default_node_pool {
    name       = "default"
    node_count = 1
    vm_size    = "Standard_B2s"
  }

  identity {
    type = "SystemAssigned"
  }

  network_profile {
    network_plugin = "azure"
  }
}

# Helm Release - Backend
resource "helm_release" "backend" {
  name       = "invitelink-backend"
  chart      = "${path.module}/../k8s/charts/backend"
  namespace  = "default"

  values = [
    file("${path.module}/../k8s/charts/backend/values.yaml")
  ]

  depends_on = [azurerm_kubernetes_cluster.aks]
}

# Helm Release - Frontend
resource "helm_release" "frontend" {
  name       = "invitelink-frontend"
  chart      = "${path.module}/../k8s/charts/frontend"
  namespace  = "default"

  values = [
    file("${path.module}/../k8s/charts/frontend/values.yaml")
  ]

  depends_on = [azurerm_kubernetes_cluster.aks]
}