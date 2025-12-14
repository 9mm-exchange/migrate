// Supported V2 → V3 Migration Pairs
// Each V2 pair maps to a specific V3 pool
//
// TOKEN REFERENCE:
// - pHEX: 0x2b591e99afE9f32eAA6214f7B7629768c40Eeb39 (PulseChain native HEX)
// - eHEX: 0x57fde0a71132198BBeC939B98976993d8D89D225 (HEX bridged from Ethereum)
// - WPLS: 0xA1077a294dDE1B09bB078844df40758a5D0f9a27 (Wrapped PLS)
// - eWETH: 0x02DcdD04e3F455D838cd1249292C58f3B79e3C3C (WETH bridged from Ethereum)
// - pWETH: 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2 (PulseChain copy of WETH)
// - eDAI: 0xefD766cCb38EaF1dfd701853BFCe31359239F305 (DAI bridged from Ethereum)
// - pDAI: 0x6B175474E89094C44Da98b954EedeAC495271d0F (PulseChain copy of DAI)
// - PLSX: 0x95B303987A60C71504D99Aa1b13B4DA07b0790ab

export interface MigrationPair {
  name: string;
  v2Pair: `0x${string}`;
  v3Pool: `0x${string}`;
  feeTier: number; // V3 fee tier (2500 = 0.25%, 10000 = 1%)
}

export const SUPPORTED_MIGRATIONS: MigrationPair[] = [
  // ============ PulseX V2 Factory Pairs ============
  {
    name: "pHEX/WPLS (V2)",
    v2Pair: "0xf1f4ee610b2babb05c635f726ef8b0c568c8dc65",
    // V2 contains: pHEX + WPLS
    v3Pool: "0x6639a38f7b6F9BA236227C4dcd723a8Dc4Bd368F", // pHEX/WPLS 1%
    feeTier: 10000, // 1%
  },
  {
    name: "PLSX/WPLS (V2)",
    v2Pair: "0x1b45b9148791d3a104184cd5dfe5ce57193a3ee9",
    // V2 contains: PLSX + WPLS
    v3Pool: "0x96737676cb25396a9f857272cddc8e3a346d63da",
    feeTier: 10000, // 1%
  },
  {
    name: "WPLS/eDAI (V2)",
    v2Pair: "0xe37a2c1755151ff910ff895a14fad5570730f6e9",
    // V2 contains: WPLS + eDAI (bridged from Ethereum)
    v3Pool: "0xe56043671df55de5cdf8459710433c10324de0ae",
    feeTier: 2500, // 0.25%
  },
  {
    name: "pHEX/eDAI",
    v2Pair: "0x6F1747370B1CAcb911ad6D4477b718633DB328c8",
    // V2 contains: pHEX + eDAI
    v3Pool: "0x6ace474a9fde57e663e47a4c7965964440b35f71",
    feeTier: 2500, // 0.25%
  },
  {
    name: "INC/WPLS",
    v2Pair: "0xf808Bb6265e9Ca27002c0A04562Bf50d4FE37EAA",
    v3Pool: "0xfc4745206d437ebb55a9590cbaf09724f068b726",
    feeTier: 2500, // 0.25%
  },
  {
    name: "INC/PLSX",
    v2Pair: "0x7dbeca4c74d01cd8782d4ef5c05c0769723fb0ea",
    v3Pool: "0x864Da5B36da7cd93E54b1ED1582b2C622AcD69a3",
    feeTier: 2500, // 0.25%
  },
  
  // ============ PulseX V1 Factory Pairs ============
  {
    name: "pHEX/WPLS (V1)",
    v2Pair: "0x19bb45a7270177e303dee6eaa6f5ad700812ba98",
    // V2 contains: pHEX + WPLS
    v3Pool: "0x6639a38f7b6F9BA236227C4dcd723a8Dc4Bd368F", // pHEX/WPLS 1%
    feeTier: 10000, // 1%
  },
  {
    name: "PLSX/WPLS (V1)",
    v2Pair: "0x149b2c629e652f2e89e11cd57e5d4d77ee166f9f",
    // V2 contains: PLSX + WPLS
    v3Pool: "0x96737676cb25396a9f857272cddc8e3a346d63da",
    feeTier: 10000, // 1%
  },
  {
    name: "WPLS/eDAI (V1)",
    v2Pair: "0x146e1f1e060e5b5016db0d118d2c5a11a240ae32",
    // V2 contains: WPLS + eDAI (bridged from Ethereum)
    v3Pool: "0xe56043671df55de5cdf8459710433c10324de0ae",
    feeTier: 2500, // 0.25%
  },
  {
    name: "eWETH/WPLS (V1)",
    v2Pair: "0x29d66d5900eb0d629e1e6946195520065a6c5aee",
    // V2 contains: eWETH (bridged from Ethereum) + WPLS
    v3Pool: "0xf91d0CBfbA8e11cCd203e97AEFdA4352AcCFFEEb", // eWETH/WPLS 0.25%
    feeTier: 2500, // 0.25%
  },
];

// REMOVED: 0x84b3f5d458cf006ce86c9243740eb22729491120 was labeled WETH/WPLS but is actually pHEX/eHEX!

// Helper to find V3 pool for a V2 pair
export function getV3PoolForV2Pair(v2PairAddress: string): MigrationPair | undefined {
  return SUPPORTED_MIGRATIONS.find(
    (m) => m.v2Pair.toLowerCase() === v2PairAddress.toLowerCase()
  );
}

// Get all supported V2 pair addresses
export function getSupportedV2Pairs(): `0x${string}`[] {
  return SUPPORTED_MIGRATIONS.map((m) => m.v2Pair);
}
