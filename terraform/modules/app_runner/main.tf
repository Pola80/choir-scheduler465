resource "aws_apprunner_service" "backend" {
  service_name = var.app_name

  source_configuration {
    image_repository {
      image_identifier      = "${var.ecr_repository_url}:latest"
      image_repository_type = "ECR"

      image_configuration {
        port = "3001"
        runtime_environment_variables = {
          NODE_ENV    = "production"
          PORT        = "3001"
          DB_HOST     = var.db_host
          DB_PORT     = tostring(var.db_port)
          DB_USER     = var.db_username
          DB_NAME     = var.db_name
          DB_PASSWORD = var.db_password
        }
      }
    }

    authentication_configuration {
      access_role_arn = var.ecr_access_role_arn
    }

    auto_deployments_enabled = false
  }

  instance_configuration {
    cpu    = var.cpu
    memory = var.memory
  }

  network_configuration {
    egress_configuration {
      egress_type       = "VPC"
      vpc_connector_arn = var.vpc_connector_arn
    }
  }

  health_check_configuration {
    protocol = "HTTP"
    path     = "/health"
  }

  tags = { Name = "${var.app_name}-app-runner" }
}
