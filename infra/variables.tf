variable "subscription_id" {
  description = "Azure subscription id to deploy into"
  type        = string
}

variable "location" {
  description = "Azure region for resources"
  type        = string
  default     = "uksouth"
}

variable "acr_name" {
  description = "Azure Container Registry name (must be globally unique)"
  type        = string
}

variable "resource_group_name" {
  description = "Resource group name for hub resources"
  type        = string
  default     = "invitelink-rg"
}
