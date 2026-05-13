# AWS Deployment Guide for Choir Scheduler

This guide provides step-by-step instructions for deploying Choir Scheduler to AWS using Terraform.

## Prerequisites

1. **AWS Account** - You need an active AWS account
2. **AWS CLI** - Install and configure the AWS CLI
   ```bash
   aws configure
   ```
3. **Terraform** - Install Terraform 1.0 or higher
4. **Docker** - For building and pushing container images
5. **ECR Login** - Configure Docker to push to AWS ECR

## Architecture Overview

- **VPC** - Custom VPC with public and private subnets across 2 Availability Zones
- **ALB** - Application Load Balancer for traffic distribution
- **ECS Fargate** - Containerized application running on AWS Fargate
- **RDS PostgreSQL** - Managed PostgreSQL database
- **CloudWatch** - Logs and monitoring
- **S3** - Backup storage
- **Secrets Manager** - Secure secrets storage

## Deployment Steps

### 1. Prepare AWS Environment

```bash
# Set your AWS region
export AWS_REGION=us-east-1

# Verify AWS CLI is configured
aws sts get-caller-identity
```

### 2. Build and Push Docker Image

```bash
# Login to ECR (requires aws cli)
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin <ACCOUNT_ID>.dkr.ecr.$AWS_REGION.amazonaws.com

# Build the Docker image
docker build -t choir-scheduler:latest .

# Tag the image for ECR (update ACCOUNT_ID and REGION)
docker tag choir-scheduler:latest <ACCOUNT_ID>.dkr.ecr.$AWS_REGION.amazonaws.com/choir-scheduler:latest

# Push to ECR
docker push <ACCOUNT_ID>.dkr.ecr.$AWS_REGION.amazonaws.com/choir-scheduler:latest
```

### 3. Configure Terraform Variables

```bash
# Navigate to AWS terraform directory
cd terraform/aws

# Copy example variables
cp terraform.tfvars.example terraform.tfvars

# Edit terraform.tfvars with your configuration
# IMPORTANT: Set secure values for:
# - db_password (strong password for database)
# - jwt_secret (random secret for JWT tokens)
vi terraform.tfvars
```

### 4. Initialize Terraform

```bash
# Initialize Terraform (downloads providers and modules)
terraform init

# Validate the configuration
terraform validate

# Format the configuration (optional)
terraform fmt
```

### 5. Plan Deployment

```bash
# Create execution plan
terraform plan -out=tfplan

# Review the plan to see what resources will be created
```

### 6. Apply Configuration

```bash
# Apply the Terraform configuration
terraform apply tfplan

# Terraform will create:
# - VPC with subnets and routing
# - Security groups
# - RDS PostgreSQL database
# - ECS cluster, task definition, and service
# - Application Load Balancer
# - CloudWatch logs
# - S3 backup bucket
# - Secrets in AWS Secrets Manager
```

### 7. Verify Deployment

```bash
# Get the application URL
terraform output application_url

# Wait 2-3 minutes for ECS tasks to start
# Then check the ALB health check
curl http://<ALB_DNS_NAME>/health

# View ECS logs
aws logs tail /ecs/choir-scheduler --follow

# Check ECS service status
aws ecs describe-services --cluster choir-scheduler-cluster --services choir-scheduler-service
```

## Environment Variables

The application uses the following environment variables (managed via Secrets Manager):

- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret key for JWT token generation
- `NODE_ENV` - Environment (set to "production")
- `PORT` - Application port (8080)

## Database Access

To connect to the RDS database from your local machine or an EC2 instance:

```bash
# Install PostgreSQL client
sudo apt-get install postgresql-client

# Connect to the database (requires VPN/bastion or security group changes)
psql -h <RDS_ENDPOINT> -U choiradmin -d choir_scheduler
```

## Scaling

Auto-scaling is configured based on:
- **CPU Utilization** - Targets 70% average CPU
- **Memory Utilization** - Targets 80% average memory

Scaling configuration:
- Minimum tasks: 1
- Maximum tasks: 10
- Desired count: 2

To modify scaling, update variables in `terraform.tfvars`:
```terraform
min_capacity  = 1      # Minimum number of tasks
max_capacity  = 10     # Maximum number of tasks
desired_count = 2      # Initial desired count
```

## Monitoring and Logs

### CloudWatch Logs

View application logs:
```bash
# Stream logs in real-time
aws logs tail /ecs/choir-scheduler --follow

# View specific time range
aws logs filter-log-events \
  --log-group-name /ecs/choir-scheduler \
  --start-time $(date -d '1 hour ago' +%s)000
```

### ECS Dashboard

Monitor tasks and services:
```bash
# Get service status
aws ecs describe-services \
  --cluster choir-scheduler-cluster \
  --services choir-scheduler-service

# Get task details
aws ecs list-tasks --cluster choir-scheduler-cluster
```

## Backup and Recovery

### RDS Backups

- Automated backups: 7 days retention
- Backup window: 03:00-04:00 UTC
- Multi-AZ: Enabled for high availability

To restore from a snapshot:
```bash
aws rds describe-db-snapshots --db-instance-identifier choir-scheduler-db
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier choir-scheduler-db-restored \
  --db-snapshot-identifier <SNAPSHOT_ID>
```

### S3 Backups

Manual backups of application data:
```bash
# Upload to S3
aws s3 sync ./data s3://choir-scheduler-backups-<ACCOUNT_ID>/

# Download from S3
aws s3 sync s3://choir-scheduler-backups-<ACCOUNT_ID>/ ./data
```

## Updating the Application

1. Build and push new Docker image to ECR
2. Update task definition with new image
3. Restart ECS service

```bash
# Build and push new image
docker build -t <ACCOUNT_ID>.dkr.ecr.$AWS_REGION.amazonaws.com/choir-scheduler:latest .
docker push <ACCOUNT_ID>.dkr.ecr.$AWS_REGION.amazonaws.com/choir-scheduler:latest

# Update ECS service to use new image
aws ecs update-service \
  --cluster choir-scheduler-cluster \
  --service choir-scheduler-service \
  --force-new-deployment
```

## Destroying Resources

To remove all AWS resources:

```bash
# WARNING: This will delete all resources created by Terraform
terraform destroy

# You'll be prompted to confirm
```

## Troubleshooting

### Tasks not starting

```bash
# Check task logs
aws ecs describe-tasks --cluster choir-scheduler-cluster --tasks <TASK_ARN>

# View CloudWatch logs
aws logs tail /ecs/choir-scheduler --follow
```

### Database connection issues

```bash
# Check security group
aws ec2 describe-security-groups --group-ids <RDS_SG_ID>

# Test connection from EC2 instance in same VPC
psql -h <RDS_ENDPOINT> -U choiradmin -d choir_scheduler
```

### Load Balancer health checks failing

```bash
# Check target group health
aws elbv2 describe-target-health --target-group-arn <TARGET_GROUP_ARN>

# View ALB logs (if enabled)
aws s3 ls s3://choir-scheduler-alb-logs/
```

## Cost Optimization

To reduce costs:

1. **Use Fargate Spot** - Update ECS capacity provider strategy
2. **Reduce instance size** - Change `db_instance_class` to smaller tier
3. **Reduce storage** - Lower `db_allocated_storage`
4. **Reduce task count** - Lower `desired_count` and `max_capacity`

Example cost-optimized configuration:
```terraform
db_instance_class = "db.t3.micro"     # ~$15/month
container_memory = "512"              # Lower memory
desired_count = 1                      # Single instance
max_capacity = 5                       # Lower max
```

## Support and Documentation

- [AWS ECS Documentation](https://docs.aws.amazon.com/ecs/)
- [RDS PostgreSQL Documentation](https://docs.aws.amazon.com/rds/latest/userguide/CHAP_PostgreSQL.html)
- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [Application Health Endpoint](http://<ALB_DNS_NAME>/health)
