# Terraform Deployment Guide

This guide explains how to deploy the Choir Scheduler application to Google Cloud Platform using Terraform.

## Prerequisites

1. **Google Cloud Account** - Sign up at [cloud.google.com](https://cloud.google.com)
2. **Terraform** - Install from [terraform.io](https://www.terraform.io/downloads.html)
3. **Google Cloud SDK** - Install from [cloud.google.com/sdk](https://cloud.google.com/sdk)
4. **Docker** - For building container images

## Setup Steps

### 1. Initialize Google Cloud

```bash
# Authenticate with Google Cloud
gcloud auth login

# Set your default project
gcloud config set project YOUR_PROJECT_ID

# Enable required APIs
gcloud services enable cloudrun.googleapis.com \
  artifactregistry.googleapis.com \
  cloudbuild.googleapis.com \
  containerregistry.googleapis.com
```

### 2. Prepare Terraform Configuration

```bash
cd terraform

# Copy the example configuration
cp terraform.tfvars.example terraform.tfvars

# Edit with your values
nano terraform.tfvars
```

Update `terraform.tfvars` with:
- Your GCP project ID
- Desired region
- Container resources
- Auto-scaling settings

### 3. Build and Push Docker Image

```bash
# Build the Docker image
docker build -t choir-scheduler:latest .

# Tag for Artifact Registry
docker tag choir-scheduler:latest \
  YOUR_REGION-docker.pkg.dev/YOUR_PROJECT_ID/choir-scheduler/choir-scheduler:latest

# Configure Docker authentication
gcloud auth configure-docker YOUR_REGION-docker.pkg.dev

# Push to Artifact Registry
docker push YOUR_REGION-docker.pkg.dev/YOUR_PROJECT_ID/choir-scheduler/choir-scheduler:latest
```

### 4. Deploy with Terraform

```bash
# Initialize Terraform
terraform init

# Review planned changes
terraform plan

# Apply configuration
terraform apply
```

## Accessing Your Application

After deployment, Terraform will output the Cloud Run service URL:

```
cloud_run_url = "https://choir-scheduler-xxxxx-uc.a.run.app"
```

Visit this URL in your browser to access the application.

## Managing Deployments

### View Current State
```bash
terraform show
```

### Update Configuration
Edit `terraform.tfvars` and run:
```bash
terraform apply
```

### Destroy Infrastructure
⚠️ **Warning**: This will delete all resources
```bash
terraform destroy
```

## Important Files

- **main.tf** - Main Terraform configuration
- **variables.tf** - Variable definitions
- **terraform.tfvars** - Your configuration values (create from .example)
- **Dockerfile** - Container image definition

## Troubleshooting

### Authentication Errors
```bash
gcloud auth application-default login
```

### Docker Push Errors
```bash
gcloud auth configure-docker us-central1-docker.pkg.dev
```

### Terraform State Issues
```bash
# Refresh state
terraform refresh

# Show current state
terraform show
```

## Cost Estimation

Cloud Run pricing (per month):
- **Compute**: $0.00002400 per vCPU-second
- **Memory**: $0.0000050 per GB-second
- **Requests**: Free up to 2M requests/month
- **Storage**: $0.026 per GB (for backups)

For typical usage with 0-10 concurrent instances: ~$5-20/month

## Next Steps

1. ✅ Deploy your application
2. 📝 Test all features (login, dashboard, etc.)
3. 🔐 Set up environment variables if needed
4. 📊 Monitor Cloud Run metrics in GCP console
5. 🔄 Set up CI/CD pipeline for automatic deployments
