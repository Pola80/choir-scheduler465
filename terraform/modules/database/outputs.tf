output "db_address" {
  value     = aws_db_instance.postgres.address
  sensitive = true
}

output "db_port" {
  value = aws_db_instance.postgres.port
}
