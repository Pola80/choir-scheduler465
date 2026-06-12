output "service_url" {
  value = "https://${aws_apprunner_service.backend.service_url}"
}
