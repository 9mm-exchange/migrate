#!/bin/bash
set -e

# Build specifically for AMD64 (x86_64) - most common for Kubernetes clusters
# This is useful if you're on Apple Silicon (M1/M2) and need AMD64 images

DOCKER_USERNAME="${DOCKER_USERNAME:-spiritmonkey}"
IMAGE_NAME="${IMAGE_NAME:-pulsex-migrator}"
VERSION="${VERSION:-latest}"
FULL_IMAGE="${DOCKER_USERNAME}/${IMAGE_NAME}:${VERSION}"

echo "🏗️  Building AMD64 Docker image for Kubernetes..."
echo "Image: ${FULL_IMAGE}"
echo "Platform: linux/amd64"
echo ""

docker buildx build \
    --platform linux/amd64 \
    -t "${FULL_IMAGE}" \
    --push \
    .

echo ""
echo "✅ AMD64 image built and pushed successfully!"
echo ""
echo "📝 Next steps:"
echo "1. Deploy to Kubernetes: kubectl apply -f k8s/"
echo "2. Check pods: kubectl get pods -n ninemm-frontend"
