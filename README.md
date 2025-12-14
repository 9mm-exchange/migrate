# PulseX → 9mm V3 Migrator

A web application for migrating PulseX V2 liquidity positions to 9mm V3 full-range positions on PulseChain.

## Features

- 🔗 **Wallet Connection** - Connect via RainbowKit (MetaMask, WalletConnect, etc.)
- 📊 **LP Position Display** - View your PulseX V2 LP tokens
- ⚙️ **Migration Settings** - Configure fee tier and slippage tolerance
- 🚀 **One-Click Migration** - Approve and migrate in a single flow
- 💰 **Automatic Dust Refund** - Any leftover tokens are returned

## Technology Stack

- **Next.js 14** - React framework with App Router
- **wagmi + viem** - Ethereum interactions
- **RainbowKit** - Wallet connection UI
- **shadcn/ui** - Component library
- **Tailwind CSS v4** - Styling

## Contract Addresses

### 9mm V3 (Target)
| Contract | Address |
|----------|---------|
| V3 Migrator | `0xdee0BDC4cc82872f7D35941aBFA872F744FdF064` |
| Position Manager | `0xCC05bf158202b4F461Ede8843d76dcd7Bbad07f2` |
| V3 Factory | `0xe50DbDC88E87a2C92984d794bcF3D1d76f619C68` |

### PulseX V2 (Source)
| Contract | Address |
|----------|---------|
| Factory | `0x1715a3E4A142d8b698131108995174F37aEBA10D` |
| WPLS | `0xA1077a294dDE1B09bB078844df40758a5D0f9a27` |

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- A wallet with PulseX LP tokens

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd migrator

# Install dependencies
npm install

# Copy environment file
cp .env.local.example .env.local

# Edit .env.local and add your WalletConnect Project ID
# Get one at https://cloud.walletconnect.com
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm run start
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | WalletConnect Cloud Project ID | Yes |
| `NEXT_PUBLIC_PULSECHAIN_RPC` | PulseChain RPC URL (default: public RPC) | No |

## How It Works

1. **Connect Wallet** - Connect your wallet to PulseChain
2. **Select LP Position** - Choose which PulseX V2 LP to migrate
3. **Configure Settings** - Pick fee tier (0.3% recommended) and slippage
4. **Approve** - Approve LP tokens for the migrator contract
5. **Migrate** - Execute the migration transaction
6. **Done!** - Receive your 9mm V3 NFT position

### Migration Flow

```
PulseX V2 LP Token
        │
        ▼
┌───────────────────┐
│  9mm V3 Migrator  │
│  (0xdee0...064)   │
└───────────────────┘
        │
        ├── Burns V2 LP tokens
        ├── Receives Token A + Token B
        ├── Creates V3 full-range position
        └── Returns NFT + any dust
        │
        ▼
  9mm V3 NFT Position
```

## Supported Pairs

Currently configured for:
- HEX/WPLS
- WPLS/DAI

To add more pairs, edit `src/hooks/useLPPositions.ts`.

## Full-Range Positions

This migrator creates **full-range** V3 positions:
- Tick range: -887220 to 887220
- Behaves similarly to V2 (earns fees at all prices)
- No rebalancing required
- Minimal dust

## Security

- Uses the **official 9mm V3Migrator contract** (Uniswap fork)
- Contract is battle-tested and audited
- Stateless - no funds stored in migrator
- Slippage protection via `amount0Min` / `amount1Min`

## License

MIT

## Links

- [PulseScan](https://scan.pulsechain.com)
- [9mm](https://app.9mm.pro)
- [PulseX](https://pulsex.com)
