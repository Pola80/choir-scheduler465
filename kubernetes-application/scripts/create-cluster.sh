#!/bin/bash

# Create a Kubernetes cluster using kind
kind create cluster --name my-kubernetes-cluster

# Apply the namespace configuration
kubectl apply -f ../k8s/namespace.yaml

# Apply the deployment configuration
kubectl apply -f ../k8s/deployment.yaml

# Apply the service configuration
kubectl apply -f ../k8s/service.yaml

# Apply the ingress configuration
kubectl apply -f ../k8s/ingress.yaml

# Apply the configmap configuration
kubectl apply -f ../k8s/configmap.yaml

echo "Kubernetes cluster and application resources created successfully."