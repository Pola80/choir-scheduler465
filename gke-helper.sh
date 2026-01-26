#!/bin/bash
# GKE Deployment Helper Script

# Set up kubectl path
export PATH="/opt/homebrew/share/google-cloud-sdk/bin:$PATH"
KUBECTL="/opt/homebrew/share/google-cloud-sdk/bin/kubectl"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ID="choir-scheduler-deploy"
CLUSTER_NAME="gke-choir-scheduler"
REGION="us-central1"
IMAGE_REPO="gcr.io/choir-scheduler-deploy"
BACKEND_IMAGE="choir-scheduler-backend"

# Helper functions
print_header() {
    echo -e "${BLUE}=== $1 ===${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

# Commands
show_status() {
    print_header "Cluster Status"
    gcloud container clusters describe $CLUSTER_NAME --region=$REGION --format='value(status)'
    
    print_header "Deployments"
    $KUBECTL get deployments -n choir-scheduler
    $KUBECTL get deployments -n monitoring
    
    print_header "Services"
    $KUBECTL get services -n choir-scheduler
    $KUBECTL get services -n monitoring
    
    print_header "Pods"
    $KUBECTL get pods -n choir-scheduler
    $KUBECTL get pods -n monitoring
}

build_and_push_image() {
    print_header "Building and Pushing Docker Image"
    
    cd backend || { print_error "Backend directory not found"; return 1; }
    
    print_info "Building Docker image..."
    docker build -t $IMAGE_REPO/$BACKEND_IMAGE:latest .
    
    if [ $? -ne 0 ]; then
        print_error "Docker build failed"
        return 1
    fi
    print_success "Docker image built successfully"
    
    print_info "Configuring Docker for GCR..."
    gcloud auth configure-docker
    
    print_info "Pushing image to GCR..."
    docker push $IMAGE_REPO/$BACKEND_IMAGE:latest
    
    if [ $? -ne 0 ]; then
        print_error "Docker push failed"
        return 1
    fi
    print_success "Image pushed to GCR"
    
    print_info "Image will be pulled by Kubernetes. Pods should start shortly..."
    
    cd ..
}

get_service_ips() {
    print_header "Service IPs"
    
    echo -e "${BLUE}Backend Service:${NC}"
    $KUBECTL get service choir-scheduler-backend -n choir-scheduler -o wide
    BACKEND_IP=$($KUBECTL get service choir-scheduler-backend -n choir-scheduler -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null)
    if [ -z "$BACKEND_IP" ]; then
        print_info "Backend IP: Pending (will be assigned once pods are running)"
    else
        print_success "Backend IP: $BACKEND_IP"
    fi
    
    echo ""
    echo -e "${BLUE}Prometheus Service:${NC}"
    $KUBECTL get service prometheus -n monitoring -o wide
    PROMETHEUS_IP=$($KUBECTL get service prometheus -n monitoring -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null)
    if [ -z "$PROMETHEUS_IP" ]; then
        print_info "Prometheus IP: Pending (will be assigned once pods are running)"
    else
        print_success "Prometheus IP: http://$PROMETHEUS_IP:9090"
    fi
}

watch_pods() {
    print_header "Watching Pod Status (press Ctrl+C to stop)"
    $KUBECTL get pods -n choir-scheduler -w
}

watch_deployment() {
    print_header "Watching Deployment Status (press Ctrl+C to stop)"
    $KUBECTL rollout status deployment/choir-scheduler-backend -n choir-scheduler -w
}

view_logs() {
    print_header "Backend Logs"
    $KUBECTL logs -n choir-scheduler deployment/choir-scheduler-backend -f
}

view_events() {
    print_header "Cluster Events (most recent first)"
    $KUBECTL get events --all-namespaces --sort-by='.lastTimestamp' | tail -20
}

port_forward_backend() {
    print_header "Port Forwarding Backend"
    print_info "Forwarding localhost:3000 to choir-scheduler-backend:80"
    print_info "Access at: http://localhost:3000"
    print_info "Press Ctrl+C to stop"
    $KUBECTL port-forward -n choir-scheduler svc/choir-scheduler-backend 3000:80
}

port_forward_prometheus() {
    print_header "Port Forwarding Prometheus"
    print_info "Forwarding localhost:9090 to Prometheus:9090"
    print_info "Access at: http://localhost:9090"
    print_info "Press Ctrl+C to stop"
    $KUBECTL port-forward -n monitoring svc/prometheus 9090:9090
}

scale_deployment() {
    local replicas=$1
    if [ -z "$replicas" ]; then
        print_error "Usage: scale_deployment <number>"
        return 1
    fi
    print_info "Scaling deployment to $replicas replicas..."
    $KUBECTL scale deployment choir-scheduler-backend -n choir-scheduler --replicas=$replicas
}

update_image() {
    local image=$1
    if [ -z "$image" ]; then
        print_error "Usage: update_image <image_tag>"
        return 1
    fi
    print_info "Updating image to: $image"
    $KUBECTL set image deployment/choir-scheduler-backend \
        choir-scheduler-backend=$IMAGE_REPO/$BACKEND_IMAGE:$image \
        -n choir-scheduler
    print_success "Image updated. Check status with: kubectl rollout status"
}

cleanup() {
    print_header "Cleanup"
    read -p "Are you sure you want to delete all deployments? (yes/no): " confirm
    if [ "$confirm" = "yes" ]; then
        $KUBECTL delete namespace choir-scheduler
        $KUBECTL delete namespace monitoring
        print_success "Deployments deleted"
    fi
}

# Main menu
if [ $# -eq 0 ]; then
    cat << EOF
${BLUE}GKE Deployment Helper${NC}

Usage: ./gke-helper.sh [command]

Commands:
  status              - Show cluster, deployment, and pod status
  build               - Build and push Docker image to GCR
  ips                 - Show service IPs/endpoints
  watch-pods          - Watch pod status in real-time
  watch-deploy        - Watch deployment rollout
  logs                - View backend pod logs (streaming)
  events              - View cluster events
  forward-backend     - Port forward backend to localhost:3000
  forward-prometheus  - Port forward prometheus to localhost:9090
  scale <num>         - Scale deployment to N replicas
  update <tag>        - Update image to specified tag
  cleanup             - Delete all deployments

Examples:
  ./gke-helper.sh status
  ./gke-helper.sh build
  ./gke-helper.sh scale 5
  ./gke-helper.sh update v2

EOF
else
    case "$1" in
        status)
            show_status
            ;;
        build)
            build_and_push_image
            ;;
        ips)
            get_service_ips
            ;;
        watch-pods)
            watch_pods
            ;;
        watch-deploy)
            watch_deployment
            ;;
        logs)
            view_logs
            ;;
        events)
            view_events
            ;;
        forward-backend)
            port_forward_backend
            ;;
        forward-prometheus)
            port_forward_prometheus
            ;;
        scale)
            scale_deployment "$2"
            ;;
        update)
            update_image "$2"
            ;;
        cleanup)
            cleanup
            ;;
        *)
            print_error "Unknown command: $1"
            ;;
    esac
fi
