#!/bin/bash
set -e

echo "🚀 Deploying PulseX Migrator to Kubernetes..."

# Check if kubectl is available
if ! command -v kubectl &> /dev/null; then
    echo "❌ kubectl not found. Please install kubectl first."
    exit 1
fi

# Check if connected to cluster
if ! kubectl cluster-info &> /dev/null; then
    echo "❌ Not connected to a Kubernetes cluster."
    echo "Please configure kubectl to connect to your cluster."
    exit 1
fi

echo "✅ Connected to Kubernetes cluster"

# Apply namespace first
echo "📦 Creating namespace..."
kubectl apply -f k8s/namespace.yaml

# Apply ConfigMap and Secrets
echo "⚙️  Applying configuration..."
kubectl apply -f k8s/configmap.yaml

# Check if secret exists, if not, create it
if ! kubectl get secret migrator-secrets -n ninemm-frontend &> /dev/null; then
    echo "🔐 Creating secrets..."
    echo "⚠️  WARNING: Using default secret from k8s/secret.yaml"
    echo "    Update this with your actual WalletConnect Project ID!"
    kubectl apply -f k8s/secret.yaml
else
    echo "✅ Secret already exists, skipping..."
fi

# Apply Deployment
echo "🚢 Deploying application..."
kubectl apply -f k8s/deployment.yaml

# Apply Service
echo "🌐 Creating service..."
kubectl apply -f k8s/service.yaml

# Apply Ingress (optional)
if [ -f "k8s/ingress.yaml" ]; then
    read -p "Deploy Ingress? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🔒 Creating ingress..."
        kubectl apply -f k8s/ingress.yaml
    else
        echo "⏭️  Skipping Ingress deployment"
    fi
fi

# Apply HPA (optional)
if [ -f "k8s/hpa.yaml" ]; then
    read -p "Deploy HorizontalPodAutoscaler? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "📊 Creating HPA..."
        kubectl apply -f k8s/hpa.yaml
    else
        echo "⏭️  Skipping HPA deployment"
    fi
fi

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📊 Checking status..."
kubectl get pods -n ninemm-frontend
echo ""
echo "📝 Useful commands:"
echo "  View pods:    kubectl get pods -n ninemm-frontend"
echo "  View logs:    kubectl logs -f deployment/migrator -n ninemm-frontend"
echo "  View service: kubectl get svc -n ninemm-frontend"
echo "  Port forward: kubectl port-forward svc/migrator -n ninemm-frontend 3000:80"
