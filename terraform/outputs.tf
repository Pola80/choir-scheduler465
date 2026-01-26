output "cluster_name" {
  description = "GKE Cluster Name"
  value       = module.gke.name
}

output "cluster_host" {
  description = "GKE Cluster Host"
  value       = module.gke.endpoint
  sensitive   = true
}

output "region" {
  description = "GCP Region"
  value       = var.region
}

output "project_id" {
  description = "GCP Project ID"
  value       = var.project_id
}

output "kubernetes_cluster_host" {
  description = "GKE Cluster Host"
  value       = "https://${module.gke.endpoint}"
  sensitive   = true
}

output "kubernetes_cluster_name" {
  description = "GKE Cluster Name"
  value       = module.gke.name
}

output "ca_certificate" {
  description = "Cluster CA Certificate"
  value       = module.gke.ca_certificate
  sensitive   = true
}
