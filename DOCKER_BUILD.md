# Docker Build Guide

## Architecture Support

The build scripts support multiple architectures for different deployment scenarios.

## 🚀 Quick Build Options

### Option 1: Multi-Platform Build (Default) - RECOMMENDED
Builds for both AMD64 and ARM64. Best for maximum compatibility.

```bash
./scripts/build-and-push.sh
```

**When to use:** Production deployments where you want compatibility with both architectures.

---

### Option 2: AMD64 Only - FASTEST for Kubernetes
Builds only for AMD64/x86_64 (most common in Kubernetes clusters).

```bash
./scripts/build-amd64.sh
```

**When to use:**
- Your Kubernetes cluster runs on AMD64/x86_64 nodes (most common)
- You want faster build times
- You're building on Apple Silicon (M1/M2) for Intel servers

---

### Option 3: ARM64 Only
Builds only for ARM64 (Apple Silicon, some cloud instances).

```bash
PLATFORM=linux/arm64 ./scripts/build-and-push.sh
```

**When to use:**
- Your Kubernetes cluster runs on ARM64 nodes (AWS Graviton, etc.)
- Local development on Apple Silicon

---

## 📋 Platform Detection

### Your Current Platform
Check what platform your machine is:
```bash
docker version --format '{{.Server.Arch}}'
```

- `amd64` = Intel/AMD x86_64
- `arm64` = Apple Silicon (M1/M2/M3)

### What Kubernetes Needs
Most Kubernetes clusters use **AMD64** (x86_64), unless you're specifically using:
- AWS Graviton instances
- Oracle Cloud ARM instances
- Self-hosted ARM servers

## 🛠️ Build Commands Explained

### Standard Build (Native Architecture)
```bash
docker build -t spiritmonkey/pulsex-migrator:latest .
```
Builds for your current machine's architecture only.

### Multi-Platform Build
```bash
docker buildx build \
    --platform linux/amd64,linux/arm64 \
    -t spiritmonkey/pulsex-migrator:latest \
    --push \
    .
```
Builds for both AMD64 and ARM64, pushes to registry.

### AMD64 Only (Cross-platform)
```bash
docker buildx build \
    --platform linux/amd64 \
    -t spiritmonkey/pulsex-migrator:latest \
    --push \
    .
```
Builds only AMD64, even if you're on Apple Silicon.

## 🔧 Setup Docker Buildx (if needed)

### Check if buildx is available
```bash
docker buildx version
```

### Create multi-platform builder
```bash
docker buildx create --name multiplatform --use
docker buildx inspect --bootstrap
```

### Enable experimental features (if needed)
Add to `~/.docker/config.json`:
```json
{
  "experimental": "enabled"
}
```

## 📊 Recommended Workflows

### For Apple Silicon (M1/M2/M3) → Intel Kubernetes
```bash
# Use the AMD64-specific script
./scripts/build-amd64.sh
```

### For Intel Mac → Intel Kubernetes
```bash
# Standard build works fine
docker build -t spiritmonkey/pulsex-migrator:latest .
docker push spiritmonkey/pulsex-migrator:latest
```

### For Multi-Architecture Support
```bash
# Build for both platforms
./scripts/build-and-push.sh
# Select 'y' when prompted to push
```

## 🐛 Troubleshooting

### Error: "exec format error" in Kubernetes
**Cause:** Image architecture doesn't match cluster architecture.

**Solution:** Rebuild for correct platform:
```bash
./scripts/build-amd64.sh  # Most Kubernetes clusters
```

### Error: "buildx not found"
**Solution:** Update Docker Desktop or install buildx:
```bash
# macOS/Linux
brew install docker-buildx

# Or update Docker Desktop to latest version
```

### Slow Build Times
**Cause:** Building for multiple platforms.

**Solution:** Build for single platform:
```bash
PLATFORM=linux/amd64 ./scripts/build-and-push.sh
# or
./scripts/build-amd64.sh
```

## 📝 Custom Builds

### Build with Custom Tag
```bash
VERSION=v1.0.0 ./scripts/build-and-push.sh
```

### Build for Specific Platform
```bash
PLATFORM=linux/amd64 ./scripts/build-and-push.sh
```

### Build Without Pushing
```bash
# Edit script and select 'N' when prompted
./scripts/build-and-push.sh
```

### Manual Build and Push
```bash
# Build
docker buildx build --platform linux/amd64 -t spiritmonkey/pulsex-migrator:latest .

# Push
docker push spiritmonkey/pulsex-migrator:latest

# Or build and push in one command
docker buildx build \
    --platform linux/amd64 \
    -t spiritmonkey/pulsex-migrator:latest \
    --push \
    .
```

## 🎯 Summary

| Scenario | Command | Platforms |
|----------|---------|-----------|
| **Most Common (Kubernetes)** | `./scripts/build-amd64.sh` | AMD64 only |
| **Maximum Compatibility** | `./scripts/build-and-push.sh` | AMD64 + ARM64 |
| **Local Development** | `docker build -t spiritmonkey/pulsex-migrator:latest .` | Native only |
| **ARM Kubernetes** | `PLATFORM=linux/arm64 ./scripts/build-and-push.sh` | ARM64 only |

## 📚 Additional Resources

- [Docker Multi-Platform Builds](https://docs.docker.com/build/building/multi-platform/)
- [Docker Buildx Documentation](https://docs.docker.com/buildx/working-with-buildx/)
- [Next.js Docker Deployment](https://nextjs.org/docs/deployment#docker-image)
