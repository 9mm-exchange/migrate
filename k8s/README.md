# Kubernetes Deployment Guide

This guide explains how to deploy the PulseX V2 → 9mm V3 Migrator to Kubernetes.

## Prerequisites

- Kubernetes cluster (v1.24+)
- kubectl configured
- Docker registry access (Docker Hub, GCR, ECR, etc.)
- WalletConnect Project ID from https://cloud.walletconnect.com

## Quick Start

### 1. Build and Push Docker Image

```bash
# Build the Docker image
docker build -t YOUR_REGISTRY/pulsex-migrator:latest .

# Push to your registry
docker push YOUR_REGISTRY/pulsex-migrator:latest
```

### 2. Configure Secrets

Edit `k8s/secret.yaml` and replace `YOUR_WALLETCONNECT_PROJECT_ID` with your actual WalletConnect Project ID.

Alternatively, create the secret directly:

```bash
kubectl create secret generic migrator-secrets \
  --from-literal=WALLETCONNECT_PROJECT_ID=your_project_id_here \
  -n migrator
```

### 3. Update Deployment

Edit `k8s/deployment.yaml` and replace `YOUR_REGISTRY/pulsex-migrator:latest` with your actual image.

### 4. Update Ingress (if using)

Edit `k8s/ingress.yaml` and replace `migrator.yourdomain.com` with your actual domain.

### 5. Deploy to Kubernetes

```bash
# Apply all manifests
kubectl apply -f k8s/

# Or apply individually
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/ingress.yaml  # if using
kubectl apply -f k8s/hpa.yaml      # if using autoscaling
```

### 6. Verify Deployment

```bash
# Check namespace
kubectl get namespace migrator

# Check pods
kubectl get pods -n migrator

# Check services
kubectl get svc -n migrator

# Check ingress
kubectl get ingress -n migrator

# View logs
kubectl logs -f deployment/migrator -n migrator

# Describe pod (for troubleshooting)
kubectl describe pod <pod-name> -n migrator
```

## Configuration

### Environment Variables

Configuration is managed through ConfigMaps and Secrets:

**ConfigMap** (`k8s/configmap.yaml`):
- `NODE_ENV`: Production environment
- `NEXT_PUBLIC_PULSECHAIN_RPC_URL`: PulseChain RPC endpoint
- `NEXT_PUBLIC_ENABLE_TESTNETS`: Enable/disable testnet support

**Secret** (`k8s/secret.yaml`):
- `WALLETCONNECT_PROJECT_ID`: Your WalletConnect project ID

### Resource Limits

Default resource configuration in `deployment.yaml`:

```yaml
resources:
  requests:
    memory: "256Mi"
    cpu: "100m"
  limits:
    memory: "512Mi"
    cpu: "500m"
```

Adjust based on your cluster capacity and expected traffic.

### Horizontal Pod Autoscaling

The HPA configuration scales between 2-10 replicas based on:
- CPU utilization (target: 70%)
- Memory utilization (target: 80%)

Modify `k8s/hpa.yaml` to adjust these settings.

## Ingress Configuration

### Nginx Ingress Controller

If using Nginx Ingress Controller, the provided `ingress.yaml` includes:
- SSL/TLS termination
- Security headers
- Rate limiting
- Let's Encrypt certificate automation (via cert-manager)

### Other Ingress Controllers

For other ingress controllers (Traefik, HAProxy, etc.), adjust the annotations accordingly.

### Without Ingress

If not using Ingress, you can expose the service via:

**NodePort:**
```bash
kubectl patch svc migrator -n migrator -p '{"spec":{"type":"NodePort"}}'
```

**LoadBalancer:**
```bash
kubectl patch svc migrator -n migrator -p '{"spec":{"type":"LoadBalancer"}}'
```

**Port Forward (testing only):**
```bash
kubectl port-forward svc/migrator -n migrator 3000:80
```

## SSL/TLS Configuration

### Using cert-manager (Recommended)

1. Install cert-manager:
```bash
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml
```

2. Create ClusterIssuer for Let's Encrypt:
```bash
cat <<EOF | kubectl apply -f -
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: your-email@example.com
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
    - http01:
        ingress:
          class: nginx
EOF
```

3. The Ingress will automatically request and manage certificates.

### Using Existing Certificates

If you have existing certificates:

```bash
kubectl create secret tls migrator-tls \
  --cert=path/to/cert.crt \
  --key=path/to/cert.key \
  -n migrator
```

## Monitoring

### Health Checks

The deployment includes:
- **Liveness Probe**: Checks if app is running (restarts pod if failing)
- **Readiness Probe**: Checks if app is ready to receive traffic

### Logs

View application logs:
```bash
# Follow logs
kubectl logs -f deployment/migrator -n migrator

# View logs from all pods
kubectl logs -l app=pulsex-migrator -n migrator

# View logs from specific pod
kubectl logs <pod-name> -n migrator
```

### Metrics

If you have Prometheus installed, the deployment is annotated for scraping:
```yaml
annotations:
  prometheus.io/scrape: "true"
  prometheus.io/port: "3000"
```

## Scaling

### Manual Scaling

```bash
# Scale to 5 replicas
kubectl scale deployment migrator -n migrator --replicas=5
```

### Auto Scaling

HPA is configured in `k8s/hpa.yaml`. View HPA status:

```bash
kubectl get hpa -n migrator
kubectl describe hpa migrator -n migrator
```

## Updates and Rollouts

### Rolling Update

```bash
# Update image
kubectl set image deployment/migrator migrator=YOUR_REGISTRY/pulsex-migrator:v2 -n migrator

# Check rollout status
kubectl rollout status deployment/migrator -n migrator

# View rollout history
kubectl rollout history deployment/migrator -n migrator
```

### Rollback

```bash
# Rollback to previous version
kubectl rollout undo deployment/migrator -n migrator

# Rollback to specific revision
kubectl rollout undo deployment/migrator --to-revision=2 -n migrator
```

## Troubleshooting

### Pod not starting

```bash
# Check pod status
kubectl get pods -n migrator

# Describe pod
kubectl describe pod <pod-name> -n migrator

# View logs
kubectl logs <pod-name> -n migrator

# Check events
kubectl get events -n migrator --sort-by='.lastTimestamp'
```

### Service not accessible

```bash
# Check service
kubectl get svc migrator -n migrator

# Check endpoints
kubectl get endpoints migrator -n migrator

# Test service internally
kubectl run -it --rm debug --image=alpine --restart=Never -n migrator -- wget -O- http://migrator
```

### Ingress issues

```bash
# Check ingress
kubectl describe ingress migrator -n migrator

# Check ingress controller logs
kubectl logs -n ingress-nginx -l app.kubernetes.io/component=controller
```

### Resource issues

```bash
# Check resource usage
kubectl top pods -n migrator
kubectl top nodes

# Check resource quotas
kubectl describe quota -n migrator
```

## Clean Up

Remove all resources:

```bash
# Delete namespace (removes everything)
kubectl delete namespace migrator

# Or delete individually
kubectl delete -f k8s/
```

## Production Checklist

- [ ] WalletConnect Project ID configured
- [ ] Docker image built and pushed to registry
- [ ] Domain name configured in Ingress
- [ ] SSL/TLS certificates configured
- [ ] Resource limits appropriate for your traffic
- [ ] HPA configured for auto-scaling
- [ ] Monitoring and logging set up
- [ ] Backup strategy in place
- [ ] Security policies reviewed
- [ ] Rate limiting configured
- [ ] Health checks validated

## Security Best Practices

1. **Non-root user**: Container runs as user 1001
2. **Read-only root filesystem**: Enabled where possible
3. **Security headers**: Configured in Ingress
4. **Network policies**: Consider adding NetworkPolicy for pod-to-pod communication
5. **Secrets management**: Use external secrets management (Vault, Sealed Secrets, etc.)
6. **Image scanning**: Scan Docker images for vulnerabilities
7. **RBAC**: Configure appropriate service accounts and RBAC policies

## Additional Resources

- [Next.js Production Deployment](https://nextjs.org/docs/deployment)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Nginx Ingress Controller](https://kubernetes.github.io/ingress-nginx/)
- [cert-manager Documentation](https://cert-manager.io/docs/)
