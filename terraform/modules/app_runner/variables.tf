variable "app_name" {
  type = string
}

variable "ecr_repository_url" {
  type = string
}

variable "ecr_access_role_arn" {
  type = string
}

variable "vpc_connector_arn" {
  type = string
}

variable "db_host" {
  type      = string
  sensitive = true
}

variable "db_port" {
  type = number
}

variable "db_username" {
  type = string
}

variable "db_name" {
  type = string
}

variable "db_password" {
  type      = string
  sensitive = true
}

variable "cpu" {
  type    = string
  default = "1024"
}

variable "memory" {
  type    = string
  default = "2048"
}
