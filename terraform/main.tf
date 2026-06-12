terraform {
  required_version = ">= 1.5"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    tls = {
      source  = "hashicorp/tls"
      version = "~> 4.0"
    }
  }

  backend "s3" {
    bucket         = "choir-scheduler-tfstate"
    key            = "choir-scheduler/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "choir-scheduler-tfstate-lock"
  }
}

provider "aws" {
  region = var.aws_region
}

module "iam" {
  source = "./modules/iam"

  app_name                    = var.app_name
  github_org                  = var.github_org
  github_repo                 = var.github_repo
  create_github_oidc_provider = var.create_github_oidc_provider
}

module "networking" {
  source = "./modules/networking"

  app_name = var.app_name
}

module "ecr" {
  source = "./modules/ecr"

  app_name = var.app_name
}

module "database" {
  source = "./modules/database"

  app_name                = var.app_name
  db_name                 = var.db_name
  db_username             = var.db_username
  db_password             = var.db_password
  db_subnet_group_name    = module.networking.db_subnet_group_name
  rds_security_group_id   = module.networking.rds_security_group_id
  rds_instance_class      = var.rds_instance_class
  backup_retention_period = var.backup_retention_period
  deletion_protection     = var.deletion_protection
  skip_final_snapshot     = var.skip_final_snapshot
}

module "app_runner" {
  source = "./modules/app_runner"

  app_name            = var.app_name
  ecr_repository_url  = module.ecr.repository_url
  ecr_access_role_arn = module.iam.app_runner_ecr_role_arn
  vpc_connector_arn   = module.networking.vpc_connector_arn
  db_host             = module.database.db_address
  db_port             = module.database.db_port
  db_username         = var.db_username
  db_name             = var.db_name
  db_password         = var.db_password
  cpu                 = var.app_runner_cpu
  memory              = var.app_runner_memory
}
