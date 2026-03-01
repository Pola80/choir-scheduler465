variable "project_id" {
  description = "GCP Project ID"
  type        = string
}

variable "region" {
  description = "GCP region for deployment"
  type        = string
  default     = "us-central1"
}

variable "app_name" {
  description = "Name of the application"
  type        = string
  default     = "choir-scheduler"
}

variable "app_port" {
  description = "Port the application runs on"
  type        = number
  default     = 3000
}

variable "environment" {
  description = "Environment (dev, staging, prod)"
  type        = string
  default     = "production"

  validation {
    condition     = contains(["dev", "staging", "production"], var.environment)
    error_message = "Environment must be dev, staging, or production."
  }
}

variable "container_image" {
  description = "Container image URI (leave empty to build from source)"
  type        = string
  default     = ""
}

variable "container_cpu" {
  description = "CPU allocation for container"
  type        = string
  default     = "1"
}

variable "container_memory" {
  description = "Memory allocation for container"
  type        = string
  default     = "1Gi"
}

variable "min_instances" {
  description = "Minimum number of instances"
  type        = number
  default     = 0
}

variable "max_instances" {
  description = "Maximum number of instances"
  type        = number
  default     = 10
}

variable "create_backup_bucket" {
  description = "Whether to create a backup storage bucket"
  type        = bool
  default     = true
}

variable "force_destroy_buckets" {
  description = "Force destroy storage buckets (use with caution)"
  type        = bool
  default     = false
}

variable "allow_public_access" {
  description = "Allow unauthenticated (public) access to the Cloud Run service"
  type        = bool
  default     = true
}

# ---------------------------------------------------------------------------
# Cloud SQL variables
# ---------------------------------------------------------------------------

variable "db_tier" {
  description = "Cloud SQL machine tier (e.g. db-f1-micro, db-g1-small)"
  type        = string
  default     = "db-f1-micro"
}

variable "db_name" {
  description = "Name of the PostgreSQL database to create"
  type        = string
  default     = "choir"
}

variable "db_user" {
  description = "PostgreSQL application user name"
  type        = string
  default     = "choir_app"
}

variable "db_password" {
  description = "PostgreSQL application user password (use a strong random value)"
  type        = string
  sensitive   = true
}
