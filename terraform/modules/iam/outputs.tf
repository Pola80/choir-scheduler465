output "github_actions_role_arn" {
  description = "Set this as the AWS_ROLE_ARN secret in your GitHub repo"
  value       = aws_iam_role.github_actions.arn
}

output "app_runner_ecr_role_arn" {
  description = "Set this as the APP_RUNNER_ECR_ROLE_ARN secret in your GitHub repo"
  value       = aws_iam_role.app_runner_ecr.arn
}
