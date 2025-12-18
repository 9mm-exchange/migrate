# Kubernetes Deployment

This document provides a quick guide to deploy the PulseX Migrator to Kubernetes.

## 📋 Prerequisites

1. **Kubernetes Cluster** (1.24+)
2. **kubectl** installed and configured
3. **Docker** registry access (Docker Hub, GCR, ECR, etc.)
4. **WalletConnect Project ID** from https://cloud.walletconnect.com

## 🚀 Quick Deploy

### Option 1: Using Scripts (Recommended)

```bash
# 1. Build and push Docker image
chmod +x scripts/*.sh
DOCKER_REGISTRY=your-registry IMAGE_NAME=pulsex-migrator ./scripts/build-and-push.sh

# 2. Update configuration
# Edit k8s/secret.yaml and add your WalletConnect Project ID
# Edit k8s/deployment.yaml and update the image

# 3. Deploy to Kubernetes
./scripts/deploy.sh
```

### Option 2: Manual Deployment

```bash
# 1. Build Docker image
docker build -t your-registry/pulsex-migrator:latest .
docker push your-registry/pulsex-migrator:latest

# 2. Create namespace
kubectl apply -f k8s/namespace.yaml

# 3. Configure secrets
kubectl create secret generic migrator-secrets \
  --from-literal=WALLETCONNECT_PROJECT_ID=your_project_id \
  -n migrator

# 4. Deploy application
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml

# 5. (Optional) Deploy ingress
kubectl apply -f k8s/ingress.yaml
```

## 🔧 Configuration

### Required Configuration

1. **WalletConnect Project ID**: Get from https://cloud.walletconnect.com
   - Update in `k8s/secret.yaml`, or
   - Create secret directly with kubectl

2. **Docker Image**: Update `k8s/deployment.yaml`:
   ```yaml
   image: YOUR_REGISTRY/pulsex-migrator:latest
   ```

3. **Domain** (if using Ingress): Update `k8s/ingress.yaml`:
   ```yaml
   host: migrator.yourdomain.com
   ```

### Optional Configuration

**ConfigMap** (`k8s/configmap.yaml`):
- RPC URLs
- Feature flags
- Environment settings

**Resources** (`k8s/deployment.yaml`):
- CPU/Memory limits
- Replica count

**Autoscaling** (`k8s/hpa.yaml`):
- Min/Max replicas
- CPU/Memory thresholds

## 📊 Verify Deployment

```bash
# Check pods
kubectl get pods -n migrator

# View logs
kubectl logs -f deployment/migrator -n migrator

# Check service
kubectl get svc -n migrator

# Check ingress (if deployed)
kubectl get ingress -n migrator
```

## 🌐 Access Application

### With Ingress
Visit your configured domain: https://migrator.yourdomain.com

### Without Ingress (Port Forward)
```bash
kubectl port-forward svc/migrator -n migrator 3000:80
```
Then visit: http://localhost:3000

### With LoadBalancer
```bash
# Get external IP
kubectl get svc migrator -n migrator
```

## 📈 Scaling

### Manual Scaling
```bash
kubectl scale deployment migrator -n migrator --replicas=5
```

### Auto Scaling
Deploy HPA: `kubectl apply -f k8s/hpa.yaml`

## 🔄 Updates

```bash
# Build new version
docker build -t your-registry/pulsex-migrator:v2 .
docker push your-registry/pulsex-migrator:v2

# Update deployment
kubectl set image deployment/migrator migrator=your-registry/pulsex-migrator:v2 -n migrator

# Check rollout
kubectl rollout status deployment/migrator -n migrator
```

## 🛠️ Troubleshooting

### Pods not starting
```bash
kubectl describe pod <pod-name> -n migrator
kubectl logs <pod-name> -n migrator
```

### Service not accessible
```bash
kubectl get endpoints migrator -n migrator
kubectl describe svc migrator -n migrator
```

### View all resources
```bash
kubectl get all -n migrator
```

## 🗑️ Clean Up

```bash
# Delete namespace (removes everything)
kubectl delete namespace migrator

# Or delete individually
kubectl delete -f k8s/
```

## 📚 Full Documentation

For detailed documentation, see [k8s/README.md](k8s/README.md)

## 🔐 Security Checklist

- [ ] WalletConnect Project ID configured in secrets
- [ ] Docker image from trusted registry
- [ ] Ingress SSL/TLS configured
- [ ] Resource limits set appropriately
- [ ] Network policies configured (if needed)
- [ ] Regular security updates

## 📦 File Structure

```
Migrator/
├── Dockerfile                  # Docker build configuration
├── .dockerignore              # Files to exclude from Docker build
├── k8s/                       # Kubernetes manifests
│   ├── namespace.yaml         # Namespace definition
│   ├── configmap.yaml         # Configuration
│   ├── secret.yaml            # Sensitive data
│   ├── deployment.yaml        # Application deployment
│   ├── service.yaml           # Service definition
│   ├── ingress.yaml           # Ingress rules
│   ├── hpa.yaml              # Horizontal Pod Autoscaler
│   └── README.md             # Detailed K8s docs
├── scripts/
│   ├── build-and-push.sh     # Build & push Docker image
│   └── deploy.sh             # Deploy to Kubernetes
└── KUBERNETES.md             # This file
```
