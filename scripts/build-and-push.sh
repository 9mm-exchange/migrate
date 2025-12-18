#!/bin/bash
set -e

# Configuration
DOCKER_USERNAME="${DOCKER_USERNAME:-spiritmonkey}"
IMAGE_NAME="${IMAGE_NAME:-pulsex-migrator}"
VERSION="${VERSION:-latest}"
FULL_IMAGE="${DOCKER_USERNAME}/${IMAGE_NAME}:${VERSION}"

# Platform to build for
# Options: linux/amd64, linux/arm64, or linux/amd64,linux/arm64 for multi-platform
PLATFORM="${PLATFORM:-linux/amd64,linux/arm64}"

echo "🏗️  Building Docker image..."
echo "Image: ${FULL_IMAGE}"
echo "Platform: ${PLATFORM}"
echo ""

# Check if buildx is available
if ! docker buildx version &> /dev/null; then
    echo "⚠️  Docker buildx not available. Using standard docker build (native architecture only)..."
    docker build -t "${FULL_IMAGE}" .
else
    # Check if builder exists, create if not
    if ! docker buildx inspect multiplatform &> /dev/null; then
        echo "📦 Creating multiplatform builder..."
        docker buildx create --name multiplatform --use
    else
        docker buildx use multiplatform
    fi
    
    # Build for multiple platforms
    echo "🔨 Building multi-platform image..."
    docker buildx build \
        --platform "${PLATFORM}" \
        -t "${FULL_IMAGE}" \
        --load \
        .
fi

echo "✅ Build complete!"

# Optional: Push to registry
read -p "Push to registry? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]
then
    echo "🚀 Pushing to registry..."
    
    if docker buildx version &> /dev/null; then
        # Use buildx to push multi-platform
        docker buildx build \
            --platform "${PLATFORM}" \
            -t "${FULL_IMAGE}" \
            --push \
            .
    else
        docker push "${FULL_IMAGE}"
    fi
    
    echo "✅ Push complete!"
    
    echo ""
    echo "📝 Next steps:"
    echo "1. Image is already configured in k8s/deployment.yaml: ${FULL_IMAGE}"
    echo "2. Apply Kubernetes manifests: kubectl apply -f k8s/"
else
    echo "⏭️  Skipping push to registry"
    echo ""
    echo "📝 To push later, run:"
    echo "PLATFORM=${PLATFORM} ./scripts/build-and-push.sh"
fi

echo ""
echo "💡 Platform options:"
echo "  AMD64 only:    PLATFORM=linux/amd64 ./scripts/build-and-push.sh"
echo "  ARM64 only:    PLATFORM=linux/arm64 ./scripts/build-and-push.sh"
echo "  Both (default): PLATFORM=linux/amd64,linux/arm64 ./scripts/build-and-push.sh"
