// 9mm V3 Contracts (PulseChain)
export const NINEMM_CONTRACTS = {
  // Custom PulseX-compatible V3 Migrator (deployed by us)
  V3_MIGRATOR: "0xcD2f7f58Fff604B460c02E08b542de75549177c4" as const,
  // Original 9mm migrator (doesn't work with PulseX due to burn signature)
  V3_MIGRATOR_ORIGINAL: "0xdee0BDC4cc82872f7D35941aBFA872F744FdF064" as const,
  POSITION_MANAGER: "0xCC05bf158202b4F461Ede8843d76dcd7Bbad07f2" as const,
  V3_FACTORY: "0xe50DbDC88E87a2C92984d794bcF3D1d76f619C68" as const,
  SWAP_ROUTER: "0x7bE8fbe502191bBBCb38b02f2d4fA0D628301bEA" as const,
  SMART_ROUTER: "0xa9444246d80d6E3496C9242395213B4f22226a59" as const,
  QUOTER_V2: "0x500260dD7C27eCE20b89ea0808d05a13CF867279" as const,
  MASTERCHEF_V3: "0x842f3eD1C390637C99F82833D01D37695BF22066" as const,
} as const;

// PulseX Contracts (both V1 and V2)
export const PULSEX_CONTRACTS = {
  // V1 Factory (older)
  FACTORY_V1: "0x29eA7545DEf87022BAdc76323F373EA1e707C523" as const,
  // V2 Factory (newer)
  FACTORY_V2: "0x1715a3E4A142d8b698131108995174F37aEBA10D" as const,
  // Main factory to use (V2)
  FACTORY: "0x1715a3E4A142d8b698131108995174F37aEBA10D" as const,
  ROUTER: "0x98bf93ebf5c380C0e6Ae8e192A7e2AE08edAcc02" as const, // PulseX V2 Router
} as const;

// All PulseX factory addresses (for LP token detection)
export const PULSEX_FACTORIES = [
  "0x1715a3E4A142d8b698131108995174F37aEBA10D", // V2
  "0x29eA7545DEf87022BAdc76323F373EA1e707C523", // V1
] as const;

// Common Tokens on PulseChain
// Note: PulseChain has both native copies (p-) and bridged versions (e-) of tokens
export const TOKENS = {
  // Wrapped PLS
  WPLS: "0xA1077a294dDE1B09bB078844df40758a5D0f9a27" as const,
  
  // HEX - PulseChain native copy
  pHEX: "0x2b591e99afE9f32eAA6214f7B7629768c40Eeb39" as const,
  HEX: "0x2b591e99afE9f32eAA6214f7B7629768c40Eeb39" as const, // Alias for pHEX
  // HEX - bridged from Ethereum
  eHEX: "0x57fde0a71132198BBeC939B98976993d8D89D225" as const,
  
  // DAI - bridged from Ethereum
  eDAI: "0xefD766cCb38EaF1dfd701853BFCe31359239F305" as const,
  DAI: "0xefD766cCb38EaF1dfd701853BFCe31359239F305" as const, // Alias for eDAI (more common)
  // DAI - PulseChain native copy
  pDAI: "0x6B175474E89094C44Da98b954EedeAC495271d0F" as const,
  
  // WETH - bridged from Ethereum
  eWETH: "0x02DcdD04e3F455D838cd1249292C58f3B79e3C3C" as const,
  WETH: "0x02DcdD04e3F455D838cd1249292C58f3B79e3C3C" as const, // Alias for eWETH (more common)
  // WETH - PulseChain native copy
  pWETH: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2" as const,
  
  // PLSX
  PLSX: "0x95B303987A60C71504D99Aa1b13B4DA07b0790ab" as const,
  
  // Stablecoins
  USDC: "0x15D38573d2feeb82e7ad5187aB8c1D52810B1f07" as const,
  USDT: "0x0Cb6F5a34ad42ec934882A05265A7d5F59b51A2f" as const,
} as const;

// Tick spacing by fee tier (9mm V3)
export const TICK_SPACING: Record<number, number> = {
  100: 1,      // 0.01%
  500: 10,     // 0.05%
  2500: 50,    // 0.25%
  3000: 60,    // 0.3%
  10000: 200,  // 1%
} as const;

// Calculate full range ticks based on fee tier
export function getFullRangeTicks(feeTier: number): { minTick: number; maxTick: number } {
  const tickSpacing = TICK_SPACING[feeTier] || 50; // default to 0.25% spacing
  
  // Max tick must be divisible by tick spacing
  const maxTick = Math.floor(887272 / tickSpacing) * tickSpacing;
  const minTick = -maxTick;
  
  return { minTick, maxTick };
}

// Default full-range tick values (for 0.25% fee tier)
export const FULL_RANGE_TICKS = {
  MIN_TICK: -887250,
  MAX_TICK: 887250,
} as const;

// Fee tiers available on 9mm V3
export const FEE_TIERS = {
  LOWEST: 100, // 0.01%
  LOW: 500, // 0.05%
  MEDIUM: 2500, // 0.25% (9mm default)
  HIGH: 10000, // 1%
} as const;

export const FEE_TIER_OPTIONS = [
  { value: FEE_TIERS.LOWEST, label: "0.01%" },
  { value: FEE_TIERS.LOW, label: "0.05%" },
  { value: FEE_TIERS.MEDIUM, label: "0.25%" },
  { value: FEE_TIERS.HIGH, label: "1%" },
] as const;

// PulseChain explorer URLs
export const EXPLORER = {
  BASE_URL: "https://scan.pulsechain.com",
  tx: (hash: string) => `https://scan.pulsechain.com/tx/${hash}`,
  address: (address: string) => `https://scan.pulsechain.com/address/${address}`,
  token: (address: string) => `https://scan.pulsechain.com/token/${address}`,
} as const;

