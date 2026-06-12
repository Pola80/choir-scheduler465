variable "aws_region" {
  description = "AWS region to deploy into"
  type        = string
  default     = "us-east-1"
}

variable "app_name" {
  description = "Application name prefix — should include environment (e.g. choir-dev, choir-prod)"
  type        = string
}

variable "github_org" {
  description = "GitHub organisation or username that owns the repo"
  type        = string
}

variable "github_repo" {
  description = "GitHub repository name"
  type        = string
  default     = "choir-scheduler"
}

variable "create_github_oidc_provider" {
  description = "Set to false if the GitHub OIDC provider already exists in this AWS account"
  type        = bool
  default     = true
}

variable "db_username" {
  description = "PostgreSQL admin username"
  type        = string
  default     = "choiradmin"
}

variable "db_password" {
  description = "PostgreSQL admin password — never commit this value"
  type        = string
  sensitive   = true
}

variable "db_name" {
  description = "PostgreSQL database name"
  type        = string
  default     = "choir_scheduler"
}

variable "rds_instance_class" {
  description = "RDS instance class"
  type        = string
}

variable "backup_retention_period" {
  description = "Days to retain RDS automated backups (0 disables backups)"
  type        = number
}

variable "deletion_protection" {
  description = "Prevent accidental RDS deletion"
  type        = bool
}

variable "skip_final_snapshot" {
  description = "Skip final snapshot when destroying RDS (set true for non-prod)"
  type        = bool
}

variable "app_runner_cpu" {
  description = "App Runner vCPU units (256, 512, 1024, 2048, 4096)"
  type        = string
}

variable "app_runner_memory" {
  description = "App Runner memory in MB (512, 1024, 2048, 3072, 4096)"
  type        = string
}
