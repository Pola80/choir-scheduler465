# Migration Guide: GCP to AWS

This guide explains how to migrate Choir Scheduler from Google Cloud Platform (GCP) to Amazon Web Services (AWS).

## Overview of Changes

| Component | GCP | AWS |
|-----------|-----|-----|
| **Container Orchestration** | Cloud Run | ECS Fargate |
| **Container Registry** | Artifact Registry | ECR (Elastic Container Registry) |
| **Database** | Cloud SQL (PostgreSQL) | RDS PostgreSQL |
| **Networking** | Cloud VPC | AWS VPC |
| **Load Balancing** | Cloud Run routing | ALB (Application Load Balancer) |
| **Storage** | Cloud Storage | S3 |
| **Logging** | Cloud Logging | CloudWatch Logs |
| **Secrets** | Secret Manager | AWS Secrets Manager |
| **Build/Deploy** | Cloud Build | CodeBuild / Manual Docker push |

## Key Differences

### 1. Container Deployment Model

**GCP Cloud Run:**
- Serverless, fully managed
- Automatic scaling (0 to N instances)
- No infrastructure management
- Pay per request

**AWS ECS Fargate:**
- Container orchestration platform
- Managed compute (Fargate) without EC2 instances
- VPC integration required
- Pay per task/vCPU/memory

### 2. Database Access

**GCP Cloud SQL:**
- Cloud SQL Proxy or Unix socket
- Connection string: `postgresql://user:pass@/db?host=/cloudsql/instance_name`

**AWS RDS:**
- Direct network access via endpoint
- Connection string: `postgresql://user:pass@endpoint:5432/db`
- Must be in same VPC or have security group access

### 3. Environment Variables

**GCP Cloud Run:**
```yaml
DATABASE_URL: postgresql://user:pass@/choir_scheduler?host=/cloudsql/choir-scheduler-deploy:us-central1:choir-db
JWT_SECRET: choir-scheduler-jwt-secret-2026
NODE_ENV: production
```

**AWS (via Secrets Manager):**
```bash
# Stored securely and injected via task definition
DATABASE_URL: postgresql://choiradmin:password@choir-scheduler-db.xxxxx.us-east-1.rds.amazonaws.com:5432/choir_scheduler
JWT_SECRET: (same as GCP)
NODE_ENV: production
PORT: 8080
```

## Migration Steps

### Phase 1: Preparation

#### 1.1 Export GCP Data

```bash
# Connect to Cloud SQL
gcloud sql connect choir-db --user=choiradmin

# Dump database to SQL file
gcloud sql export sql choir-db gs://choir-scheduler-backups/backup-$(date +%Y%m%d).sql \
  --database=choir_scheduler

# Download from GCS
gsutil cp gs://choir-scheduler-backups/backup-20240101.sql ./backup.sql
```

#### 1.2 Set up AWS Environment

```bash
# Configure AWS CLI
aws configure

# Verify access
aws sts get-caller-identity

# Create S3 bucket for backups
aws s3 mb s3://choir-scheduler-backups-$(aws sts get-caller-identity --query Account --output text)
```

#### 1.3 Build and Push Docker Image

```bash
# Login to AWS ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 123456789.dkr.ecr.us-east-1.amazonaws.com

# Build image (same Dockerfile works)
docker build -t choir-scheduler:latest .

# Tag for ECR
docker tag choir-scheduler:latest 123456789.dkr.ecr.us-east-1.amazonaws.com/choir-scheduler:latest

# Push to ECR
docker push 123456789.dkr.ecr.us-east-1.amazonaws.com/choir-scheduler:latest
```

### Phase 2: AWS Infrastructure Setup

#### 2.1 Initialize Terraform

```bash
cd terraform/aws

# Copy and configure variables
cp terraform.tfvars.example terraform.tfvars
vi terraform.tfvars

# Initialize
terraform init

# Validate
terraform validate

# Plan
terraform plan -out=tfplan
```

#### 2.2 Deploy Infrastructure

```bash
# Apply Terraform configuration
terraform apply tfplan

# Wait 5-10 minutes for all resources to be created
# Get outputs
terraform output
```

#### 2.3 Restore Database

```bash
# Get RDS endpoint
RDS_ENDPOINT=$(terraform output -raw rds_endpoint)

# Restore database dump
psql -h $RDS_ENDPOINT -U choiradmin -d choir_scheduler < backup.sql

# Verify data
psql -h $RDS_ENDPOINT -U choiradmin -d choir_scheduler -c "SELECT COUNT(*) FROM events;"
```

### Phase 3: Testing and Validation

#### 3.1 Test Application

```bash
# Get ALB URL
ALB_URL=$(terraform output -raw application_url)

# Test health endpoint
curl $ALB_URL/health

# Test API endpoints
curl -X POST $ALB_URL/api/v1/users/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","name":"Test"}'
```

#### 3.2 Verify Database Connectivity

```bash
# SSH to ECS task (requires setup) or check logs
aws logs tail /ecs/choir-scheduler --follow

# Look for successful database connections
```

#### 3.3 Test Auto-scaling

```bash
# Monitor task count
watch 'aws ecs describe-services --cluster choir-scheduler-cluster --services choir-scheduler-service | grep runningCount'

# Generate load (in separate terminal)
ab -n 1000 -c 10 $ALB_URL/health
```

### Phase 4: DNS and Traffic Migration

#### 4.1 Update DNS Records

```bash
# Get new ALB DNS name
ALB_DNS=$(terraform output -raw alb_dns_name)

# Update DNS provider (Route53, CloudFlare, etc.)
# Old: points to GCP Cloud Run
# New: points to ALB_DNS

# For Route53:
aws route53 change-resource-record-sets \
  --hosted-zone-id ZONE_ID \
  --change-batch file://dns-change.json
```

#### 4.2 Gradual Traffic Migration (Optional)

```bash
# Use weighted routing in Route53 to gradually shift traffic
# Week 1: 10% AWS, 90% GCP
# Week 2: 25% AWS, 75% GCP
# Week 3: 50% AWS, 50% GCP
# Week 4: 100% AWS
```

### Phase 5: Cleanup GCP Resources

After verifying AWS is working correctly:

```bash
# Stop Cloud Run service
gcloud run services delete choir-backend --region us-central1

# Delete Cloud SQL instance
gcloud sql instances delete choir-db

# Delete Artifact Registry
gcloud artifacts repositories delete choir-scheduler --location us-central1

# Delete Cloud Storage buckets
gsutil -m rm -r gs://choir-scheduler-backups

# Disable APIs (optional)
gcloud services disable cloudrun.googleapis.com \
  artifactregistry.googleapis.com \
  cloudbuild.googleapis.com \
  sqladmin.googleapis.com
```

## Configuration Updates Needed

### Application Code Changes

Update environment variable access:

```typescript
// Before (GCP): Automatically available
const dbUrl = process.env.DATABASE_URL;

// After (AWS): Retrieved from Secrets Manager by ECS
// Task definition injects it automatically, so code doesn't change
const dbUrl = process.env.DATABASE_URL;
```

### Docker Configuration

No changes needed - same Dockerfile works for both GCP and AWS.

### Environment Variables

Update `.env.example` or CI/CD configuration:

```bash
# AWS specific
AWS_REGION=us-east-1
ECR_REPOSITORY=123456789.dkr.ecr.us-east-1.amazonaws.com/choir-scheduler

# Database
DATABASE_URL=postgresql://choiradmin:PASSWORD@choir-scheduler-db.xxxx.us-east-1.rds.amazonaws.com:5432/choir_scheduler
JWT_SECRET=choir-scheduler-jwt-secret-2026
```

## Terraform Files Structure

```
terraform/
├── gcp/                    # GCP configuration (keep for reference)
│   ├── main.tf
│   ├── variables.tf
│   └── terraform.tfvars
└── aws/                    # NEW AWS configuration
    ├── main.tf             # VPC, ECS, RDS, ALB, etc.
    ├── variables.tf        # All input variables
    ├── outputs.tf          # Terraform outputs
    └── terraform.tfvars.example
```

## Rollback Plan

If issues occur during migration:

```bash
# Keep GCP running until AWS is fully validated
# If problems found:

# 1. Update DNS back to GCP
aws route53 change-resource-record-sets ... # Point back to GCP

# 2. Keep AWS infrastructure running for investigation
# 3. Fix issues
# 4. Try migration again

# To destroy AWS infrastructure if needed:
cd terraform/aws
terraform destroy
```

## Cost Comparison

### GCP Cloud Run (Previous)
- Cloud Run: ~$0.4/million requests
- Cloud SQL: ~$50-100/month
- Cloud Storage: ~$0.020/GB/month
- **Estimated: $50-150/month**

### AWS (New)
- ECS Fargate: ~$30/month (512 MB, 2 tasks)
- RDS: ~$30/month (db.t3.micro)
- ALB: ~$16/month
- CloudWatch: ~$5/month
- S3: ~$0.50/month
- **Estimated: $80-100/month**

> Note: Costs may vary based on usage and configuration

## Support Resources

- **AWS Documentation**: https://docs.aws.amazon.com
- **ECS User Guide**: https://docs.aws.amazon.com/ecs/
- **RDS PostgreSQL**: https://docs.aws.amazon.com/rds/latest/userguide/CHAP_PostgreSQL.html
- **Terraform AWS Provider**: https://registry.terraform.io/providers/hashicorp/aws/latest/docs

## Checklist

- [ ] Export GCP database
- [ ] Setup AWS CLI and credentials
- [ ] Build and push Docker image to ECR
- [ ] Configure terraform.tfvars
- [ ] Run terraform plan and review
- [ ] Apply terraform configuration
- [ ] Restore database to RDS
- [ ] Test health endpoint
- [ ] Test API endpoints
- [ ] Verify database connectivity
- [ ] Test auto-scaling
- [ ] Update DNS records
- [ ] Monitor traffic and logs
- [ ] Run gradient traffic migration (if applicable)
- [ ] Cleanup GCP resources
- [ ] Archive GCP Terraform state

## Troubleshooting

### ECS Tasks not starting
```bash
# Check task definition
aws ecs describe-task-definition --task-definition choir-scheduler

# Check service
aws ecs describe-services --cluster choir-scheduler-cluster --services choir-scheduler-service

# Check logs
aws logs tail /ecs/choir-scheduler --follow
```

### Database connection failing
```bash
# Verify RDS is accessible
psql -h <RDS_ENDPOINT> -U choiradmin -d choir_scheduler -c "SELECT 1"

# Check security group
aws ec2 describe-security-groups --group-ids <RDS_SG_ID>
```

### ALB health checks failing
```bash
# Check if application is running
curl -v http://<ALB_DNS>/health

# Check target group health
aws elbv2 describe-target-health --target-group-arn <TG_ARN>
```
