# GKE Deployment Complete ✅

## Summary

Your Kubernetes cluster has been successfully deployed to Google Cloud Platform!

### Cluster Details
- **Cluster Name:** gke-choir-scheduler
- **Region:** us-central1
- **Status:** ✅ RUNNING
- **Master IP:** 34.71.186.46
- **Master Version:** 1.33.5-gke.2100000
- **Node Configuration:** e2-medium with NVIDIA L4 GPUs
- **Autoscaling:** 1-100 nodes (currently scaled to 3)

### Deployed Resources

#### 1. Application Namespace (choir-scheduler)
```
✅ Namespace created
✅ ConfigMap for backend configuration
✅ Deployment: choir-scheduler-backend (3 replicas)
✅ Service: LoadBalancer (pending external IP)
✅ HPA: Auto-scaling 3-10 replicas based on CPU/Memory
✅ PodDisruptionBudget: Min 2 available replicas
✅ ServiceAccount with RBAC
```

#### 2. Monitoring Namespace (monitoring)
```
✅ Prometheus deployment
✅ Prometheus service (LoadBalancer, pending external IP)
✅ RBAC for Prometheus to query cluster metrics
```

## Next Steps

### 1. Build and Push Docker Image

```bash
cd backend

# Build the Docker image
docker build -t gcr.io/choir-scheduler-deploy/choir-scheduler-backend:latest .

# Configure Docker to push to GCR
gcloud auth configure-docker

# Push to Google Container Registry
docker push gcr.io/choir-scheduler-deploy/choir-scheduler-backend:latest
```

Once the image is pushed, the pods will automatically start running.

### 2. Monitor Pod Status

```bash
export PATH="/opt/homebrew/share/google-cloud-sdk/bin:$PATH"

# Watch pods start up (they're currently Pending)
kubectl get pods -n choir-scheduler -w

# Get service endpoints when ready
kubectl get services -n choir-scheduler
kubectl get services -n monitoring
```

### 3. Access Your Services

Once pods are running and external IPs are assigned:

```bash
# Get the backend service external IP
BACKEND_IP=$(kubectl get service choir-scheduler-backend -n choir-scheduler -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
echo "Backend: http://$BACKEND_IP"

# Get Prometheus external IP for monitoring
PROMETHEUS_IP=$(kubectl get service prometheus -n monitoring -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
echo "Prometheus: http://$PROMETHEUS_IP:9090"
```

### 4. View Logs

```bash
# Check why pods might be pending
kubectl describe pod -n choir-scheduler choir-scheduler-backend-<pod-id>

# View logs once running
kubectl logs -n choir-scheduler deployment/choir-scheduler-backend -f
```

### 5. Port Forward for Local Testing

```bash
# Port forward to test locally
kubectl port-forward -n choir-scheduler svc/choir-scheduler-backend 3000:80

# Then access: http://localhost:3000
```

## Kubernetes Setup Details

### Deployment Configuration
- **Container Image:** gcr.io/choir-scheduler-deploy/choir-scheduler-backend:latest
- **Replicas:** 3 (min), 10 (max)
- **Resources:**
  - Requests: 256Mi memory, 250m CPU
  - Limits: 512Mi memory, 500m CPU
- **Health Checks:** Liveness and readiness probes configured
- **Security:** Running as non-root user, read-only root filesystem

### Autoscaling
- Min replicas: 3
- Max replicas: 10
- CPU threshold: 70%
- Memory threshold: 80%
- Scale up: Instant (5% pods per 15s or 4 pods per 15s)
- Scale down: Gradual (50% reduction over 5 minutes)

### Monitoring
- **Tool:** Prometheus
- **Metrics collected:**
  - Kubernetes API server metrics
  - Node metrics
  - Pod metrics
  - Custom application metrics (when configured)

## Troubleshooting

### Pods Stuck in Pending
**Cause:** Docker image not available in GCR
**Solution:** Build and push your Docker image (see step 1 above)

### Check Cluster Events
```bash
kubectl get events -n choir-scheduler --sort-by='.lastTimestamp'
```

### View Resource Quotas
```bash
kubectl describe nodes
```

### Verify Service Account Permissions
```bash
kubectl get rolebindings -n choir-scheduler
kubectl describe role choir-scheduler-backend -n choir-scheduler
```

## Useful Commands

```bash
# Get cluster credentials again if needed
gcloud container clusters get-credentials gke-choir-scheduler --region=us-central1

# View cluster info
gcloud container clusters describe gke-choir-scheduler --region=us-central1

# Scale deployment manually
kubectl scale deployment choir-scheduler-backend -n choir-scheduler --replicas=5

# Update image
kubectl set image deployment/choir-scheduler-backend \
  choir-scheduler-backend=gcr.io/choir-scheduler-deploy/choir-scheduler-backend:v2 \
  -n choir-scheduler

# Check HPA status
kubectl get hpa -n choir-scheduler
kubectl describe hpa choir-scheduler-backend-hpa -n choir-scheduler

# View resource usage
kubectl top nodes
kubectl top pods -n choir-scheduler
```

## Files Created

- `kubernetes/deployment.yaml` - Backend deployment, service, and autoscaling config
- `kubernetes/monitoring.yaml` - Prometheus monitoring stack
- `terraform/main.tf` - GKE cluster configuration
- `terraform/network.tf` - VPC, subnets, and firewall rules
- `terraform/variables.tf` - Terraform variables
- `terraform/outputs.tf` - Terraform outputs
- `terraform/terraform.tfvars` - Terraform values
- `KUBERNETES_DEPLOYMENT.md` - Detailed deployment guide

## Status

✅ GKE Cluster: RUNNING  
✅ Infrastructure: Deployed  
⏳ Application Pods: Pending (waiting for docker image)  
✅ Monitoring: Ready  

**Next action:** Push your Docker image to GCR to start the pods!

---

For detailed information, see `KUBERNETES_DEPLOYMENT.md`
