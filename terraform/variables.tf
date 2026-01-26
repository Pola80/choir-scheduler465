variable "project_id" {
  description = "GCP Project ID"
  type        = string
  default     = "choir-scheduler-deploy"
}

variable "region" {
  description = "GCP region"
  type        = string
  default     = "us-central1"
}

variable "cluster_name" {
  description = "GKE Cluster name"
  type        = string
  default     = "gke-test-1"
}

variable "zones" {
  description = "GCP zones for the cluster"
  type        = list(string)
  default     = ["us-central1-a", "us-central1-b", "us-central1-f"]
}

variable "network_name" {
  description = "VPC network name"
  type        = string
  default     = "vpc-01"
}

variable "subnetwork_name" {
  description = "Subnetwork name"
  type        = string
  default     = "us-central1-01"
}

variable "ip_range_pods" {
  description = "Secondary IP range for pods"
  type        = string
  default     = "us-central1-01-gke-01-pods"
}

variable "ip_range_services" {
  description = "Secondary IP range for services"
  type        = string
  default     = "us-central1-01-gke-01-services"
}

variable "machine_type" {
  description = "Machine type for nodes"
  type        = string
  default     = "e2-medium"
}

variable "node_locations" {
  description = "Node locations"
  type        = list(string)
  default     = ["us-central1-b", "us-central1-c"]
}

variable "min_node_count" {
  description = "Minimum node count"
  type        = number
  default     = 1
}

variable "max_node_count" {
  description = "Maximum node count"
  type        = number
  default     = 100
}

variable "initial_node_count" {
  description = "Initial node count"
  type        = number
  default     = 80
}

variable "service_account_email" {
  description = "Service account email"
  type        = string
  default     = "project-service-account@choir-scheduler-deploy.iam.gserviceaccount.com"
}

variable "gpu_count" {
  description = "Number of GPUs per node"
  type        = number
  default     = 1
}

variable "gpu_type" {
  description = "GPU type"
  type        = string
  default     = "nvidia-l4"
}
