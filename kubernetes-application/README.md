# Kubernetes Application

This project contains the necessary configurations and scripts to deploy an application on a Kubernetes cluster.

## Project Structure

- **k8s/**: Contains Kubernetes resource definitions.
  - **namespace.yaml**: Defines the Kubernetes namespace for the application.
  - **deployment.yaml**: Describes the deployment configuration for the application.
  - **service.yaml**: Defines the service to expose the application.
  - **ingress.yaml**: Configures ingress for external access to the services.
  - **configmap.yaml**: Creates a ConfigMap for application configuration data.
  
- **scripts/**: Contains scripts for managing the Kubernetes cluster.
  - **create-cluster.sh**: Shell script to create the Kubernetes cluster.

## Getting Started

1. **Prerequisites**
   - Ensure you have access to a Kubernetes cluster.
   - Install `kubectl` and `kubectl` command-line tool.

2. **Creating the Kubernetes Cluster**
   - Run the script to create the cluster:
     ```
     ./scripts/create-cluster.sh
     ```

3. **Deploying the Application**
   - Apply the Kubernetes configurations:
     ```
     kubectl apply -f k8s/namespace.yaml
     kubectl apply -f k8s/deployment.yaml
     kubectl apply -f k8s/service.yaml
     kubectl apply -f k8s/ingress.yaml
     kubectl apply -f k8s/configmap.yaml
     ```

4. **Accessing the Application**
   - Use the ingress rules defined in `ingress.yaml` to access the application externally.

## License

This project is licensed under the MIT License.