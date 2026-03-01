# Quick Start: Deploy to GCP Cloud Run

## ⚡ 5-Minute Deployment

### Prerequisites
```bash
# Install these tools
brew install terraform
brew install --cask google-cloud-sdk
brew install docker
```

### Step 1: Authenticate with GCP
```bash
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
```

### Step 2: Enable Required APIs
```bash
gcloud services enable cloudrun.googleapis.com \
  artifactregistry.googleapis.com \
  cloudbuild.googleapis.com
```

### Step 3: Configure Terraform
```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars

# Edit terraform.tfvars with your project ID
# Replace "your-gcp-project-id" with your actual project ID
```

### Step 4: Build and Push Docker Image
```bash
# Go back to root directory
cd ..

# Build Docker image
docker build -t choir-scheduler:latest .

# Tag for GCP
docker tag choir-scheduler:latest \
  us-central1-docker.pkg.dev/YOUR_PROJECT_ID/choir-scheduler/choir-scheduler:latest

# Configure Docker auth
gcloud auth configure-docker us-central1-docker.pkg.dev

# Push to GCP
docker push us-central1-docker.pkg.dev/YOUR_PROJECT_ID/choir-scheduler/choir-scheduler:latest
```

### Step 5: Deploy with Terraform
```bash
cd terraform
terraform init
terraform plan
terraform apply
```

### 🎉 Done!
Terraform will output your application URL. Visit it to access your app!

## Test Credentials
- Email: `Jamesola1946@gmail.com`
- Password: `Wole1960!@#22`

## Cleanup
```bash
terraform destroy
```

## Full Documentation
See `TERRAFORM_DEPLOYMENT.md` for detailed instructions.
