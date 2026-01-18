provider "azurerm" {
  features {}
  subscription_id = var.subscription_id
}

provider "helm" {
  kubernetes {
    host                   = azurerm_kubernetes_cluster.aks.kube_config.0.host
    client_certificate     = base64decode(azurerm_kubernetes_cluster.aks.kube_config.0.client_certificate)
    client_key             = base64decode(azurerm_kubernetes_cluster.aks.kube_config.0.client_key)
    cluster_ca_certificate = base64decode(azurerm_kubernetes_cluster.aks.kube_config.0.cluster_ca_certificate)
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

  lifecycle {
    prevent_destroy = true
  }
}

# AKS Cluster
resource "azurerm_kubernetes_cluster" "aks" {
  name                = "invitelink-aks"
  location            = azurerm_resource_group.hub_rg.location
  resource_group_name = azurerm_resource_group.hub_rg.name
  dns_prefix          = "invitelink"
  kubernetes_version  = "1.28"

  default_node_pool {
    name                = "default"
    node_count          = 2
    vm_size             = "Standard_D2s_v3"
    os_disk_size_gb     = 30
    max_pods            = 110
    availability_zones  = ["1", "2", "3"]
  }

  identity {
    type = "SystemAssigned"
  }

  network_profile {
    network_plugin    = "azure"
    service_cidr      = "10.0.0.0/16"
    dns_service_ip    = "10.0.0.10"
    docker_bridge_cidr = "172.17.0.1/16"
  }
}

# Helm Release - Backend
resource "helm_release" "backend" {
  name       = "invitelink-backend"
  repository = "oci://${azurerm_container_registry.acr.login_server}/helm"
  chart      = "backend"
  namespace  = "default"
  
  values = [
    file("${path.module}/../k8s/charts/backend/values.yaml")
  ]

  depends_on = [azurerm_kubernetes_cluster.aks]
}

# Helm Release - Frontend
resource "helm_release" "frontend" {
  name       = "invitelink-frontend"
  repository = "oci://${azurerm_container_registry.acr.login_server}/helm"
  chart      = "frontend"
  namespace  = "default"
  
  values = [
    file("${path.module}/../k8s/charts/frontend/values.yaml")
  ]

  depends_on = [azurerm_kubernetes_cluster.aks]
}