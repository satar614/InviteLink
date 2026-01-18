terraform {
  backend "azurerm" {
    resource_group_name  = "terraform-state-rg"
    storage_account_name = "tfstate8752688"
    container_name       = "tfstate"
    key                  = "invitelink-prod.tfstate"
  }
}

# Note: For different environments, use different keys:
# - dev: invitelink-dev.tfstate
# - staging: invitelink-staging.tfstate  
# - prod: invitelink-prod.tfstate