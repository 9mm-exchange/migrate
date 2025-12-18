# PulseX V2 → 9mm V3 Migrator

Migrate your PulseX V2 liquidity positions to 9mm V3 with full-range liquidity in a single transaction.

🌐 **Live App:** https://migrate.9mm.pro

---

## ✨ Features

- 🔄 **One-Click Migration** - Move from V2 to V3 in a single transaction
- 📦 **Batch Migration** - Migrate multiple positions at once
- 🎯 **Full-Range Liquidity** - Automatic tick range calculation
- 💰 **Zero Platform Fees** - Only pay gas
- 🔒 **Secure** - Audited smart contracts
- ⚡ **Fast** - Optimized for PulseChain

## 🚀 Supported Pairs

✅ **10 Migration Paths** (V2 → V3)
- pHEX/WPLS (V1 & V2)
- PLSX/WPLS (V1 & V2)
- WPLS/eDAI (V1 & V2)
- pHEX/eDAI (V2)
- eWETH/WPLS (V1)
- INC/WPLS (V2)
- INC/PLSX (V2)

## 🏗️ Architecture

### Smart Contracts
- **Migrator:** `0xcD2f7f58Fff604B460c02E08b542de75549177c4`
- **9mm V3 Factory:** `0xe50DbDC88E87a2C92984d794bcF3D1d76f619C68`
- **Position Manager:** `0xCC05bf158202b4F461Ede8843d76dcd7Bbad07f2`

### Frontend
- **Framework:** Next.js 16 (React 19)
- **Web3:** wagmi v2 + viem
- **Wallet:** RainbowKit
- **Styling:** Tailwind CSS v4

---

## 🛠️ Development

### Prerequisites
- Node.js 20+
- npm or yarn
- MetaMask or compatible wallet

### Local Setup

```bash
# Install dependencies
npm install

# Set up environment
cp .env.local.example .env.local
# Edit .env.local with your WalletConnect Project ID

# Run dev server
npm run dev
```

Visit http://localhost:3000

### Build

```bash
npm run build
npm start
```

---

## 🐳 Docker

### Build Image

```bash
docker build -t spiritmonkey/pulsex-migrator:latest .
```

### Run Container

```bash
docker run -p 3000:3000 spiritmonkey/pulsex-migrator:latest
```

---

## ☸️ Kubernetes Deployment

### Quick Deploy

```bash
# Build and push to Docker Hub
./scripts/build-amd64.sh

# Deploy to Kubernetes
kubectl apply -f k8s/

# Check deployment
kubectl get pods -n ninemm-frontend
```

### Access Application

The app is deployed at: **https://migrate.9mm.pro**

For detailed Kubernetes documentation, see [KUBERNETES.md](KUBERNETES.md)

---

## 🔧 Configuration

### Environment Variables

```bash
# WalletConnect Project ID (required)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id

# PulseChain RPC (optional - defaults to public RPC)
NEXT_PUBLIC_PULSECHAIN_RPC=https://rpc.pulsechain.com
```

### Kubernetes Secrets

The following secrets must be configured in Kubernetes:
- `DOCKERHUB_TOKEN` - Docker Hub access token
- `DOCKERHUB_USERNAME` - Docker Hub username (spiritmonkey)
- `KUBECONFIG` - Kubernetes cluster configuration (base64 encoded)

---

## 🔄 CI/CD

### Automatic Deployment

Every push to `main` triggers:
1. ✅ Docker image build (AMD64)
2. ✅ Push to Docker Hub
3. ✅ Kubernetes deployment restart
4. ✅ Rolling update (zero downtime)

See [.github/workflows/deploy.yml](.github/workflows/deploy.yml)

### Manual Deployment

```bash
# Trigger via GitHub Actions UI
# Or push to main branch
git push origin main
```

---

## 📊 Monitoring

### View Logs

```bash
kubectl logs -f deployment/migrator -n ninemm-frontend
```

### Check Status

```bash
kubectl get all -n ninemm-frontend -l app=pulsex-migrator
```

### Scaling

```bash
# Manual scaling
kubectl scale deployment migrator -n ninemm-frontend --replicas=5

# Auto-scaling (HPA configured for 2-10 replicas)
kubectl get hpa -n ninemm-frontend
```

---

## 🧪 Testing

### Address Verification

All token and LP addresses are verified using Foundry tests:

```bash
cd foundry-contracts
forge test --match-path test/VerifyAddresses.t.sol -vv --fork-url https://pulsechain.publicnode.com
```

See [ADDRESS_VERIFICATION_REPORT.md](ADDRESS_VERIFICATION_REPORT.md) for details.

---

## 🔒 Security

### Smart Contract Security
- ✅ Modified UniswapV3 migrator for PulseX compatibility
- ✅ Handles PulseX's unique `burn(address, address)` signature
- ✅ All addresses verified on-chain

### Web Security
- ✅ React 19.2.1 (patched for React2Shell vulnerability)
- ✅ Next.js 16.0.10 (latest stable)
- ✅ SSL/TLS via Cloudflare
- ✅ Rate limiting enabled

---

## 📚 Documentation

- [KUBERNETES.md](KUBERNETES.md) - Kubernetes deployment guide
- [DOCKER_BUILD.md](DOCKER_BUILD.md) - Docker build options
- [ADDRESS_VERIFICATION_REPORT.md](ADDRESS_VERIFICATION_REPORT.md) - Address verification
- [VERIFIED_ADDRESSES.md](VERIFIED_ADDRESSES.md) - Quick address reference
- [k8s/README.md](k8s/README.md) - Detailed K8s documentation

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## 📝 License

MIT License - see LICENSE file for details

---

## 🔗 Links

- **Live App:** https://migrate.9mm.pro
- **9mm DEX:** https://dex.9mm.pro
- **PulseChain:** https://pulsechain.com
- **Docs:** https://docs.9mm.pro

---

**Built with ❤️ for the PulseChain community**
