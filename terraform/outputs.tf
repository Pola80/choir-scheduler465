output "app_runner_service_url" {
  description = "Public URL of the deployed backend"
  value       = module.app_runner.service_url
}

output "ecr_repository_url" {
  description = "ECR repository URL — used in docker build/push commands"
  value       = module.ecr.repository_url
}

output "rds_endpoint" {
  description = "RDS host address"
  value       = module.database.db_address
  sensitive   = true
}

output "github_actions_role_arn" {
  description = "Set as the AWS_ROLE_ARN secret in your GitHub repo"
  value       = module.iam.github_actions_role_arn
}

output "app_runner_ecr_role_arn" {
  description = "Set as the APP_RUNNER_ECR_ROLE_ARN secret in your GitHub repo"
  value       = module.iam.app_runner_ecr_role_arn
}
