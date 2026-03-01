# 🎵 Choir Scheduler - Web Application

A modern, scalable web application for scheduling and managing choir events. This project includes complete infrastructure as code, containerization, and deployment configurations for GCP and ArgoCD.

## 📋 Table of Contents

- [Features](#features)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Local Development](#local-development)
- [Docker Deployment](#docker-deployment)
- [GCP Deployment](#gcp-deployment)
- [ArgoCD Deployment](#argocd-deployment)
- [CI/CD Pipeline](#cicd-pipeline)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

- **Express.js Backend**: RESTful API for choir event management
- **Modern Frontend**: Interactive HTML5 interface with real-time updates
- **Containerization**: Docker & Docker Compose for easy deployment
- **Infrastructure as Code**: Terraform for GCP provisioning
- **Kubernetes Ready**: Helm charts for container orchestration
- **GitOps Deployment**: ArgoCD integration for continuous deployment
- **CI/CD Automation**: GitHub Actions workflows
- **Security**: RBAC, network policies, security contexts
- **Monitoring**: Built-in health checks and logging
- **Scalability**: Auto-scaling with HPA and cluster autoscaling

## 📁 Project Structure

```
.
├── src/                          # Application source code
│   ├── server.ts                 # Express server entry point
│   └── config.ts                 # Configuration management
├── public/                        # Static assets
│   └── index.html               # Frontend interface
├── config/                       # Configuration files
├── terraform/
│   └── gcp/                      # Terraform for GCP
│       ├── main.tf              # Main infrastructure
│       ├── variables.tf          # Variable definitions
│       ├── outputs.tf            # Output definitions
│       └── terraform.tfvars.example  # Example values
├── helm/
│   └── choir-scheduler/          # Helm chart
│       ├── Chart.yaml            # Chart metadata
│       ├── values.yaml           # Default values
│       ├── templates/            # Kubernetes templates
│       └── argocd-application.yaml  # ArgoCD config
├── .github/
│   └── workflows/                # GitHub Actions
│       ├── build.yml             # Build pipeline
│       ├── deploy-gcp.yml        # GCP deployment
│       ├── deploy-argocd.yml     # ArgoCD deployment
│       └── terraform.yml         # Terraform automation
├── Dockerfile                    # Docker image definition
├── docker-compose.yml            # Multi-container setup
├── package.json                  # Node.js dependencies
├── tsconfig.json                 # TypeScript configuration
└── README.md                     # This file
```

## 🔧 Prerequisites

### Local Development
- **Node.js**: v18 or higher
- **npm**: v8 or higher
- **Docker**: v20.10 or higher
- **Docker Compose**: v1.29 or higher

### GCP Deployment
- **Google Cloud Account** with billing enabled
- **gcloud CLI**: Latest version
- **Terraform**: v1.0 or higher
- **kubectl**: Latest version

### ArgoCD Deployment
- **Kubernetes Cluster**: GKE or any K8s cluster
- **ArgoCD**: v2.5 or higher installed
- **Helm**: v3.0 or higher

## 🚀 Local Development

### 1. Clone the Repository

```bash
git clone https://github.com/Pola80/choir-scheduler465.git
cd "web-application for saying a car"
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

```bash
cp .env.example .env
# Edit .env with your settings
```

### 4. Start Development Server

```bash
npm run dev
```

The server will start at `http://localhost:3000`

### 5. Build Production Bundle

```bash
npm run build
npm start
```

## 🐳 Docker Deployment

### Build Docker Image

```bash
# Build single-platform image
docker build -t choir-scheduler:latest .

# Build multi-platform image (requires buildx)
docker buildx build --platform linux/amd64,linux/arm64 -t choir-scheduler:latest .
```

### Run with Docker Compose

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop services
docker-compose down
```

Access the application at `http://localhost:3000`

### Database Services

- **MongoDB**: `mongodb://localhost:27017`
- **Redis**: `redis://localhost:6379`

## ☁️ GCP Deployment

### Prerequisites Setup

1. **Create GCP Project**
   ```bash
   gcloud projects create choir-scheduler-prod
   gcloud config set project choir-scheduler-prod
   ```

2. **Enable Required APIs**
   ```bash
   gcloud services enable container.googleapis.com
   gcloud services enable compute.googleapis.com
   gcloud services enable artifactregistry.googleapis.com
   ```

3. **Create Service Account**
   ```bash
   gcloud iam service-accounts create terraform-sa \
     --display-name="Terraform Service Account"
   
   gcloud projects add-iam-policy-binding $(gcloud config get-value project) \
     --member="serviceAccount:terraform-sa@$(gcloud config get-value project).iam.gserviceaccount.com" \
     --role="roles/container.admin"
   ```

### Deploy with Terraform

1. **Configure Terraform Variables**
   ```bash
   cp terraform/gcp/terraform.tfvars.example terraform/gcp/terraform.tfvars
   # Edit terraform/gcp/terraform.tfvars with your values
   ```

2. **Initialize Terraform**
   ```bash
   cd terraform/gcp
   terraform init
   ```

3. **Plan Deployment**
   ```bash
   terraform plan -out=tfplan
   ```

4. **Apply Configuration**
   ```bash
   terraform apply tfplan
   ```

5. **Configure kubectl**
   ```bash
   gcloud container clusters get-credentials choir-scheduler-cluster \
     --region us-central1 \
     --project your-gcp-project-id
   ```

### Verify GKE Deployment

```bash
# Check cluster
kubectl get nodes

# Check services
kubectl get svc -n choir-scheduler

# Check pods
kubectl get pods -n choir-scheduler

# View logs
kubectl logs -n choir-scheduler -l app.kubernetes.io/name=choir-scheduler -f
```

## 📦 ArgoCD Deployment

### 1. Install ArgoCD (if not already installed)

```bash
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
```

### 2. Deploy with ArgoCD

```bash
# Apply the ArgoCD Application manifest
kubectl apply -f helm/choir-scheduler/argocd-application.yaml

# Monitor sync status
kubectl get application -n argocd
kubectl describe application choir-scheduler -n argocd
```

### 3. Access ArgoCD UI

```bash
# Port-forward to ArgoCD server
kubectl port-forward svc/argocd-server -n argocd 8080:443

# Get initial admin password
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d
```

Access at `https://localhost:8080`

### 4. Configure GitOps

- Connect your Git repository in ArgoCD UI
- Configure automatic sync policies
- Monitor deployments in real-time

## 🔄 CI/CD Pipeline

### GitHub Actions Workflows

#### Build Pipeline (`build.yml`)
- Lints code
- Runs tests
- Builds Docker image
- Pushes to Google Artifact Registry
- Runs security scans with Snyk

**Trigger**: Push to main/develop, Pull requests

#### GCP Deployment (`deploy-gcp.yml`)
- Builds and pushes Docker image
- Authenticates with GCP
- Deploys to GKE using Helm
- Runs smoke tests
- Triggers ArgoCD sync

**Trigger**: Push to main, tags with v*

#### ArgoCD Deployment (`deploy-argocd.yml`)
- Applies ArgoCD Application manifest
- Waits for sync completion
- Verifies deployment status
- Sends Slack notifications

**Trigger**: Push to main (helm/ changes), manual workflow

#### Terraform Pipeline (`terraform.yml`)
- Validates Terraform code
- Plans infrastructure changes
- Applies changes on main branch
- Exports outputs

**Trigger**: Push to main (terraform/ changes), manual workflow

### Required Secrets

Configure these in GitHub Settings → Secrets:

```
GCP_PROJECT_ID              # GCP Project ID
GCR_JSON_KEY               # GCP service account key (base64 encoded)
WIF_PROVIDER               # Workload Identity Provider
WIF_SERVICE_ACCOUNT        # Service account email
GKE_CLUSTER_NAME           # GKE cluster name
GCP_REGION                 # GCP region
SNYK_TOKEN                 # Snyk security scanning token
ARGOCD_SERVER              # ArgoCD server URL
ARGOCD_TOKEN               # ArgoCD API token
SLACK_WEBHOOK              # Slack webhook for notifications
KUBECONFIG                 # kubeconfig (base64 encoded)
```

## 📚 API Documentation

### Health Check

```
GET /health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2026-01-11T12:00:00Z",
  "uptime": 3600,
  "environment": "production"
}
```

### API Status

```
GET /api/v1/status
```

Response:
```json
{
  "message": "Choir Scheduler API is running",
  "version": "1.0.0",
  "timestamp": "2026-01-11T12:00:00Z"
}
```

### Get Events

```
GET /api/v1/events
```

Response:
```json
{
  "events": [
    {
      "id": "1",
      "title": "Choir Practice",
      "date": "2026-01-15T19:00:00Z",
      "duration": 120,
      "location": "Church Hall"
    }
  ]
}
```

### Create Event

```
POST /api/v1/events
Content-Type: application/json

{
  "title": "Concert",
  "date": "2026-02-01T15:00:00Z",
  "duration": 90,
  "location": "Concert Hall"
}
```

Response:
```json
{
  "id": "random-id",
  "title": "Concert",
  "date": "2026-02-01T15:00:00Z",
  "duration": 90,
  "location": "Concert Hall"
}
```

## 🔒 Security Features

- **Pod Security Context**: Non-root user, read-only filesystem
- **Network Policies**: Restricted ingress/egress
- **RBAC**: Service account with minimal permissions
- **Health Checks**: Liveness, readiness, startup probes
- **Resource Limits**: CPU and memory constraints
- **Security Scanning**: Snyk integration in CI/CD
- **Image Security**: Minimal base images, multi-stage builds

## 📊 Monitoring and Logging

### Health Checks

- **Liveness**: Monitors container health
- **Readiness**: Checks application availability
- **Startup**: Waits for application startup

### Logging

```bash
# View logs from all pods
kubectl logs -n choir-scheduler -l app.kubernetes.io/name=choir-scheduler -f

# View logs from specific pod
kubectl logs -n choir-scheduler pod-name -f

# View previous logs (crashed container)
kubectl logs -n choir-scheduler pod-name --previous
```

### Metrics

Application exposes metrics at `/metrics` (configure Prometheus scraping):

```yaml
prometheus.io/scrape: "true"
prometheus.io/port: "3000"
prometheus.io/path: "/metrics"
```

## 🛠️ Troubleshooting

### Docker Issues

```bash
# Check container logs
docker logs choir-scheduler

# Inspect container
docker inspect choir-scheduler

# Execute command in container
docker exec -it choir-scheduler sh
```

### Kubernetes Issues

```bash
# Check pod status
kubectl describe pod -n choir-scheduler <pod-name>

# Check events
kubectl get events -n choir-scheduler

# Debug pod
kubectl debug -it <pod-name> -n choir-scheduler

# Check resource usage
kubectl top pods -n choir-scheduler
```

### Common Issues

**Pod stuck in ImagePullBackOff**
```bash
# Check image exists and credentials are correct
kubectl get events -n choir-scheduler
docker pull <image-url>
```

**Service not accessible**
```bash
# Check ingress
kubectl get ingress -n choir-scheduler
kubectl describe ingress -n choir-scheduler choir-scheduler

# Check DNS
nslookup choir-scheduler.example.com
```

## 📈 Scaling

### Manual Scaling

```bash
# Scale deployment
kubectl scale deployment choir-scheduler -n choir-scheduler --replicas=5

# Check HPA status
kubectl get hpa -n choir-scheduler
```

### Auto-scaling Configuration

Edit `helm/choir-scheduler/values.yaml`:

```yaml
autoscaling:
  enabled: true
  minReplicas: 2
  maxReplicas: 10
  targetCPUUtilizationPercentage: 70
  targetMemoryUtilizationPercentage: 80
```

## 🚢 Production Deployment Checklist

- [ ] Configure all GitHub secrets
- [ ] Set up GCP project and service account
- [ ] Configure domain and SSL certificate
- [ ] Update ArgoCD repository URL
- [ ] Configure monitoring and logging
- [ ] Set up backup strategy
- [ ] Configure resource limits
- [ ] Enable network policies
- [ ] Set up alerting
- [ ] Test disaster recovery

## 📝 Contributing

1. Create a feature branch
2. Make changes and test
3. Submit a pull request
4. Ensure CI/CD checks pass
5. Get code review approval
6. Merge and deploy

## 📞 Support

For issues, questions, or contributions:
- GitHub Issues: [Create an issue](https://github.com/Pola80/choir-scheduler465/issues)
- Email: pola@example.com

## 📄 License

MIT License - see LICENSE file for details

---

**Built with ❤️ for choir management**
