variable "do_token" {
  description = "DigitalOcean API token. Supply through DIGITALOCEAN_TOKEN or Terraform variables."
  type        = string
  sensitive   = true
}

variable "app_name" {
  description = "Unique DigitalOcean App Platform app name."
  type        = string
  default     = "gas-backoffice-frontend"
}

variable "app_region" {
  description = "DigitalOcean App Platform region slug."
  type        = string
  default     = "fra"
}

variable "github_owner" {
  description = "GitHub organization or user that owns the frontend repository."
  type        = string
  default     = "isaac-olle"
}

variable "github_repo" {
  description = "Frontend GitHub repository name."
  type        = string
  default     = "gas-backoffice-frontend"
}

variable "source_branch" {
  description = "Branch App Platform builds and watches for deployments."
  type        = string
  default     = "main"
}

variable "api_base_url" {
  description = "Public base URL of the GAS backoffice API, injected during the frontend build."
  type        = string
}

variable "oauth_client_id" {
  description = "Public OAuth client ID used by the frontend."
  type        = string
}

variable "project_name" {
  description = "Existing DigitalOcean project to associate the app with; leave empty to skip association."
  type        = string
  default     = "GAS"
}
