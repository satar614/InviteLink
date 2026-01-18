terraform {
  backend "azurerm" {
    resource_group_name  = "terraform-state-rg"
    storage_account_name = "tfstate8752688"
    container_name       = "tfstate"
    key                  = "invitelink.tfstate"
  }
}