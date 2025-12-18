#!/bin/bash
set -e

# Build and push directly to Docker Hub, then deploy to Kubernetes
# Configuration
DOCKER_USERNAME="${DOCKER_USERNAME:-spiritmonkey}"
IMAGE_NAME="${IMAGE_NAME:-pulsex-migrator}"
VERSION="${VERSION:-latest}"
FULL_IMAGE="${DOCKER_USERNAME}/${IMAGE_NAME}:${VERSION}"
PLATFORM="${PLATFORM:-linux/amd64}"

echo "🚀 Building and Deploying PulseX Migrator"
echo "=========================================="
echo "Image: ${FULL_IMAGE}"
echo "Platform: ${PLATFORM}"
echo ""

# Check Docker login
echo "🔐 Checking Docker Hub authentication..."
if ! docker info | grep -q "Username"; then
    echo "❌ Not logged into Docker Hub"
    echo "Please run: docker login"
    exit 1
fi

echo "✅ Docker Hub authenticated"
echo ""

# Build and push
echo "🏗️  Building Docker image..."
if docker buildx version &> /dev/null; then
    # Use buildx for cross-platform
    if ! docker buildx inspect multiplatform &> /dev/null; then
        echo "📦 Creating multiplatform builder..."
        docker buildx create --name multiplatform --use
    else
        docker buildx use multiplatform
    fi
    
    echo "🔨 Building and pushing ${PLATFORM} image..."
    docker buildx build \
        --platform "${PLATFORM}" \
        -t "${FULL_IMAGE}" \
        --push \
        .
else
    # Standard build and push
    docker build -t "${FULL_IMAGE}" .
    docker push "${FULL_IMAGE}"
fi

echo ""
echo "✅ Image built and pushed successfully!"
echo ""
echo "📊 Image details:"
echo "  Registry: Docker Hub"
echo "  Image: ${FULL_IMAGE}"
echo "  Platform: ${PLATFORM}"
echo ""

# Ask about Kubernetes deployment
read -p "Deploy to Kubernetes now? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "🚀 Deploying to Kubernetes..."
    
    # Check if kubectl is available
    if ! command -v kubectl &> /dev/null; then
        echo "❌ kubectl not found. Please install kubectl first."
        exit 1
    fi
    
    # Apply Kubernetes manifests
    kubectl apply -f k8s/
    
    echo ""
    echo "✅ Deployment complete!"
    echo ""
    echo "📊 Checking status..."
    kubectl get pods -n ninemm-frontend
    echo ""
    echo "📝 Useful commands:"
    echo "  View logs:    kubectl logs -f deployment/migrator -n ninemm-frontend"
    echo "  View pods:    kubectl get pods -n ninemm-frontend"
    echo "  Port forward: kubectl port-forward svc/migrator -n ninemm-frontend 3000:80"
else
    echo ""
    echo "⏭️  Skipping Kubernetes deployment"
    echo ""
    echo "📝 To deploy later, run:"
    echo "  kubectl apply -f k8s/"
fi

echo ""
echo "🎉 Done!"
