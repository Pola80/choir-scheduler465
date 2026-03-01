#!/bin/bash

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🚀 Choir Scheduler - GCP Deployment Script${NC}\n"

# Check prerequisites
echo "📋 Checking prerequisites..."

command -v terraform &> /dev/null || { echo -e "${RED}❌ Terraform not installed${NC}"; exit 1; }
command -v gcloud &> /dev/null || { echo -e "${RED}❌ Google Cloud SDK not installed${NC}"; exit 1; }
command -v docker &> /dev/null || { echo -e "${RED}❌ Docker not installed${NC}"; exit 1; }

echo -e "${GREEN}✓ All prerequisites installed${NC}\n"

# Get configuration
read -p "Enter your GCP Project ID: " PROJECT_ID
read -p "Enter desired region (default: us-central1): " REGION
REGION=${REGION:-us-central1}

echo -e "\n📝 Configuration:"
echo "  Project ID: $PROJECT_ID"
echo "  Region: $REGION"

read -p "Continue? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "Cancelled."
  exit 1
fi

# Step 1: Authenticate
echo -e "\n${YELLOW}Step 1: Authenticating with Google Cloud...${NC}"
gcloud auth login
gcloud config set project "$PROJECT_ID"
echo -e "${GREEN}✓ Authentication successful${NC}"

# Step 2: Enable APIs
echo -e "\n${YELLOW}Step 2: Enabling required APIs...${NC}"
gcloud services enable cloudrun.googleapis.com \
  artifactregistry.googleapis.com \
  cloudbuild.googleapis.com \
  containerregistry.googleapis.com
echo -e "${GREEN}✓ APIs enabled${NC}"

# Step 3: Build Docker image
echo -e "\n${YELLOW}Step 3: Building Docker image...${NC}"
docker build --no-cache -t choir-scheduler:latest -f Dockerfile .
echo -e "${GREEN}✓ Docker image built successfully${NC}"

# Step 4: Tag and Push to Artifact Registry
echo -e "\n${YELLOW}Step 4: Configuring Docker authentication...${NC}"
gcloud auth configure-docker "${REGION}"-docker.pkg.dev
echo -e "${GREEN}✓ Docker authentication configured${NC}"

echo -e "\n${YELLOW}Step 5: Pushing image to Artifact Registry...${NC}"
IMAGE_URI="${REGION}-docker.pkg.dev/${PROJECT_ID}/choir-scheduler/choir-scheduler:latest"
docker tag choir-scheduler:latest "$IMAGE_URI"
docker push "$IMAGE_URI"
echo -e "${GREEN}✓ Image pushed: $IMAGE_URI${NC}"

# Step 6: Deploy with Terraform (Optional)
echo -e "\n${YELLOW}Step 6: Configuring Terraform...${NC}"
cd terraform

if [ ! -f terraform.tfvars ]; then
  cp terraform.tfvars.example terraform.tfvars
  if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '' "s/your-gcp-project-id/$PROJECT_ID/" terraform.tfvars
    sed -i '' "s/us-central1/$REGION/" terraform.tfvars
  else
    sed -i "s/your-gcp-project-id/$PROJECT_ID/" terraform.tfvars
    sed -i "s/us-central1/$REGION/" terraform.tfvars
  fi
  echo -e "${GREEN}✓ Created terraform.tfvars${NC}"
else
  echo -e "${YELLOW}⚠ terraform.tfvars already exists, skipping...${NC}"
fi

# Step 7: Deploy to Cloud Run
echo -e "\n${YELLOW}Step 7: Deploying to Cloud Run...${NC}"
read -p "Deploy with Terraform? (y/n): " -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
  terraform init
  terraform plan
  read -p "Review the plan above. Continue with deployment? (y/n): " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    terraform apply -auto-approve
    APP_URL=$(terraform output -raw cloud_run_url)
    echo -e "${GREEN}✓ Terraform deployment successful${NC}"
  else
    echo "Terraform deployment cancelled."
    APP_URL="Manual deployment required"
  fi
else
  # Manual Cloud Run deployment
  echo -e "\n${YELLOW}Using gcloud CLI for deployment...${NC}"
  gcloud run deploy choir-scheduler \
    --image "$IMAGE_URI" \
    --platform managed \
    --region "$REGION" \
    --allow-unauthenticated \
    --set-env-vars "NODE_ENV=production,PORT=3000"
  
  APP_URL=$(gcloud run services describe choir-scheduler --region "$REGION" --format 'value(status.url)')
  echo -e "${GREEN}✓ Cloud Run deployment successful${NC}"
fi

cd ..

# Success message
echo -e "\n${GREEN}✅ Deployment successful!${NC}\n"
echo "🌐 Application URL: $APP_URL"
echo -e "\n📚 Test login credentials are seeded from the database initialisation (development only)."
echo -e "\n💡 Next steps:"
echo "  1. Visit: $APP_URL"
echo "  2. Test the login and dashboard features"
echo "  3. Monitor logs: gcloud run logs read choir-scheduler --limit 50 --region $REGION"
echo -e "\n❌ To destroy infrastructure:"
echo "  - Terraform: cd terraform && terraform destroy"
echo "  - Cloud Run: gcloud run services delete choir-scheduler --region $REGION"
echo ""
