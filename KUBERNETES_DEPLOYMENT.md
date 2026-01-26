# GKE Deployment Guide

## Cluster Information

**Cluster Name:** gke-choir-scheduler  
**Region:** us-central1  
**Project:** choir-scheduler-deploy  
**Status:** Check with `gcloud container clusters list --project choir-scheduler-deploy`

## Prerequisites

```bash
# Install gcloud CLI (already done)
# Install kubectl
gcloud components install kubectl

# Install Helm (optional, for advanced deployments)
brew install helm
```

## 1. Get Cluster Credentials

Once cluster is in `RUNNING` status:

```bash
gcloud container clusters get-credentials gke-choir-scheduler \
  --region=us-central1 \
  --project=choir-scheduler-deploy
```

## 2. Verify Cluster Access

```bash
kubectl cluster-info
kubectl get nodes
kubectl get namespaces
```

## 3. Build and Push Backend Docker Image

```bash
# From backend directory
cd backend

# Build Docker image
docker build -t gcr.io/choir-scheduler-deploy/choir-scheduler-backend:latest .

# Push to Google Container Registry
docker push gcr.io/choir-scheduler-deploy/choir-scheduler-backend:latest
```

## 4. Deploy Application

```bash
# Deploy backend with all components
kubectl apply -f kubernetes/deployment.yaml

# Deploy monitoring stack
kubectl apply -f kubernetes/monitoring.yaml

# Verify deployments
kubectl get deployments -n choir-scheduler
kubectl get pods -n choir-scheduler
kubectl get services -n choir-scheduler
```

## 5. Get Service Endpoints

```bash
# Get the LoadBalancer IP for backend
kubectl get service choir-scheduler-backend -n choir-scheduler

# Get the LoadBalancer IP for Prometheus (monitoring)
kubectl get service prometheus -n monitoring

# Port forward for local access
kubectl port-forward -n choir-scheduler svc/choir-scheduler-backend 3000:80
```

## 6. Monitor Deployments

```bash
# Watch pod status
kubectl get pods -n choir-scheduler -w

# Check pod logs
kubectl logs -n choir-scheduler deployment/choir-scheduler-backend -f

# Check events
kubectl describe pod -n choir-scheduler <pod-name>
```

## 7. Horizontal Pod Autoscaling

The deployment includes HPA configured to scale based on:
- CPU utilization > 70%
- Memory utilization > 80%
- Min: 3 replicas, Max: 10 replicas

Check HPA status:
```bash
kubectl get hpa -n choir-scheduler
kubectl describe hpa choir-scheduler-backend-hpa -n choir-scheduler
```

## 8. View Prometheus Metrics

Once service is running:
1. Get Prometheus LoadBalancer IP: `kubectl get svc prometheus -n monitoring`
2. Open `http://<PROMETHEUS_IP>:9090`
3. Query metrics like `container_memory_usage_bytes`, `container_cpu_usage_seconds_total`

## 9. Scaling

### Manual Scaling
```bash
kubectl scale deployment choir-scheduler-backend -n choir-scheduler --replicas=5
```

### Node Pool Scaling
```bash
gcloud container clusters update gke-choir-scheduler \
  --region=us-central1 \
  --node-locations=us-central1-b,us-central1-c \
  --num-nodes=5
```

## 10. Cleanup

```bash
# Delete specific deployments
kubectl delete namespace choir-scheduler
kubectl delete namespace monitoring

# Destroy entire cluster
cd terraform
terraform destroy
```

## Troubleshooting

### Cluster stuck in PROVISIONING
```bash
gcloud container clusters describe gke-choir-scheduler --region=us-central1
```

### Pod not starting
```bash
kubectl describe pod <pod-name> -n choir-scheduler
kubectl logs <pod-name> -n choir-scheduler
```

### Check resource usage
```bash
kubectl top nodes
kubectl top pods -n choir-scheduler
```

### View cluster events
```bash
kubectl get events -n choir-scheduler
kubectl get events --all-namespaces --sort-by='.lastTimestamp'
```

## Useful Resources

- [GKE Documentation](https://cloud.google.com/kubernetes-engine/docs)
- [kubectl Cheat Sheet](https://kubernetes.io/docs/reference/kubectl/cheatsheet/)
- [Kubernetes Best Practices](https://kubernetes.io/docs/concepts/configuration/overview/)
