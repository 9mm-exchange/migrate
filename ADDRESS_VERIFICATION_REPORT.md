# Address Verification Report
**Date:** December 15, 2025  
**Status:** ✅ ALL VERIFIED

## Summary
This report documents the comprehensive verification of all token addresses, V2 LP pairs, and V3 pools using Foundry tests against PulseChain mainnet. Two critical issues were discovered and fixed.

---

## Issues Found and Fixed

### 🔴 Issue #1: WPLS/eDAI V2 and V3 Addresses Swapped
**Severity:** CRITICAL  
**Status:** FIXED

**Problem:**
The V2 pair address and V3 pool address for WPLS/eDAI were reversed in the configuration.

**Incorrect Configuration:**
```typescript
{
  name: "WPLS/eDAI (V2)",
  v2Pair: "0xe37a2c1755151ff910ff895a14fad5570730f6e9",  // ❌ This is actually V3 pool
  v3Pool: "0xe56043671df55de5cdf8459710433c10324de0ae",  // ❌ This is actually V2 pair
  feeTier: 2500,
}
```

**Corrected Configuration:**
```typescript
{
  name: "WPLS/eDAI (V2)",
  v2Pair: "0xE56043671df55dE5CDf8459710433C10324DE0aE",  // ✅ Correct V2 pair (PulseX V2)
  v3Pool: "0xE37a2c1755151Ff910FF895A14FAD5570730f6e9",  // ✅ Correct V3 pool (9mm V3)
  feeTier: 2500,
}
```

**Root Cause:**
- `0xE37a2c1755151Ff910FF895A14FAD5570730f6e9` has factory `0xe50DbDC88E87a2C92984d794bcF3D1d76f619C68` (9mm V3 Factory) → It's a V3 pool
- `0xE56043671df55dE5CDf8459710433C10324DE0aE` has factory `0x1715a3E4A142d8b698131108995174F37aEBA10D` (PulseX V2 Factory) → It's a V2 pair

---

### 🟡 Issue #2: INC/PLSX V3 Pool Fee Tier Incorrect
**Severity:** MEDIUM  
**Status:** FIXED

**Problem:**
The INC/PLSX V3 pool was configured with a 0.25% (2500) fee tier, but the actual pool has a 1% (10000) fee tier.

**Incorrect Configuration:**
```typescript
{
  name: "INC/PLSX",
  v2Pair: "0x7dbeca4c74d01cd8782d4ef5c05c0769723fb0ea",
  v3Pool: "0x864Da5B36da7cd93E54b1ED1582b2C622AcD69a3",
  feeTier: 2500,  // ❌ Incorrect - pool actually has 1% fee
}
```

**Corrected Configuration:**
```typescript
{
  name: "INC/PLSX",
  v2Pair: "0x7Dbeca4c74d01cd8782D4EF5C05C0769723fb0ea",
  v3Pool: "0x864Da5B36da7cd93E54b1ED1582b2C622AcD69a3",
  feeTier: 10000,  // ✅ Correct - 1% fee tier
}
```

**Note:** The 1% pool has significantly more liquidity (~10T vs ~318B) and is the correct pool to use for migrations.

**Alternative Pool Available:**
- 0.25% pool: `0xE9C0D7aA05f8a4dC326C1D483B62576D25700eEb` (much lower liquidity)
- 1% pool: `0x864Da5B36da7cd93E54b1ED1582b2C622AcD69a3` (✅ using this one)

---

## Verified Token Addresses ✅

| Token | Address | Symbol | Status |
|-------|---------|--------|--------|
| WPLS | `0xA1077a294dDE1B09bB078844df40758a5D0f9a27` | WPLS | ✅ |
| pHEX | `0x2b591e99afE9f32eAA6214f7B7629768c40Eeb39` | HEX | ✅ |
| eHEX | `0x57fde0a71132198BBeC939B98976993d8D89D225` | HEX | ✅ |
| eDAI | `0xefD766cCb38EaF1dfd701853BFCe31359239F305` | DAI | ✅ |
| pDAI | `0x6B175474E89094C44Da98b954EedeAC495271d0F` | DAI | ✅ |
| eWETH | `0x02DcdD04e3F455D838cd1249292C58f3B79e3C3C` | WETH | ✅ |
| pWETH | `0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2` | WETH | ✅ |
| PLSX | `0x95B303987A60C71504D99Aa1b13B4DA07b0790ab` | PLSX | ✅ |
| INC | `0x2fa878Ab3F87CC1C9737Fc071108F904c0B0C95d` | INC | ✅ |

---

## Verified PulseX V2 Pairs ✅

| Pair | Address | Factory | Liquidity |
|------|---------|---------|-----------|
| pHEX/WPLS | `0xf1F4ee610b2bAbB05C635F726eF8B0C568c8dc65` | V2 | 23.4B |
| PLSX/WPLS | `0x1b45b9148791d3a104184Cd5DFE5CE57193a3ee9` | V2 | 125T |
| WPLS/eDAI | `0xE56043671df55dE5CDf8459710433C10324DE0aE` | V2 | 302.7T |
| pHEX/eDAI | `0x6F1747370B1CAcb911ad6D4477b718633DB328c8` | V2 | 8.6B |
| INC/WPLS | `0xf808Bb6265e9Ca27002c0A04562Bf50d4FE37EAA` | V2 | 230.2T |
| INC/PLSX | `0x7Dbeca4c74d01cd8782D4EF5C05C0769723fb0ea` | V2 | 407.8T |

**Factory:** `0x1715a3E4A142d8b698131108995174F37aEBA10D` (PulseX V2)

---

## Verified PulseX V1 Pairs ✅

| Pair | Address | Factory | Liquidity |
|------|---------|---------|-----------|
| pHEX/WPLS | `0x19BB45a7270177e303DEe6eAA6F5Ad700812bA98` | V1 | 12.2B |
| PLSX/WPLS | `0x149B2C629e652f2E89E11cd57e5d4D77ee166f9F` | V1 | 27.9T |
| WPLS/eDAI | `0x146E1f1e060e5b5016Db0D118D2C5a11A240ae32` | V1 | 6.6T |
| eWETH/WPLS | `0x29d66D5900Eb0d629E1e6946195520065A6c5aeE` | V1 | 650.8T |

**Factory:** `0x29eA7545DEf87022BAdc76323F373EA1e707C523` (PulseX V1)

---

## Verified 9mm V3 Pools ✅

| Pool | Address | Fee | Liquidity |
|------|---------|-----|-----------|
| pHEX/WPLS | `0x6639a38f7b6F9BA236227C4dcd723a8Dc4Bd368F` | 1% | 607.3T |
| PLSX/WPLS | `0x96737676cb25396a9F857272cdDc8E3A346d63da` | 1% | 30.9Q |
| WPLS/eDAI | `0xE37a2c1755151Ff910FF895A14FAD5570730f6e9` | 0.25% | 22.4Q |
| pHEX/eDAI | `0x6ACe474A9FdE57e663E47A4c7965964440b35f71` | 0.25% | 23.3B |
| INC/WPLS | `0xfC4745206D437ebb55A9590cBAF09724F068B726` | 0.25% | 80.7T |
| INC/PLSX | `0x864Da5B36da7cd93E54b1ED1582b2C622AcD69a3` | 1% | 10.0Q |
| eWETH/WPLS | `0xf91d0CBfbA8e11cCd203e97AEFdA4352AcCFFEEb` | 0.25% | 2.6T |

**Factory:** `0xe50DbDC88E87a2C92984d794bcF3D1d76f619C68` (9mm V3)

---

## Verified Contract Addresses ✅

| Contract | Address | Status |
|----------|---------|--------|
| 9mm V3 Factory | `0xe50DbDC88E87a2C92984d794bcF3D1d76f619C68` | ✅ |
| 9mm Position Manager | `0xCC05bf158202b4F461Ede8843d76dcd7Bbad07f2` | ✅ |
| 9mm V3 Migrator | `0xcD2f7f58Fff604B460c02E08b542de75549177c4` | ✅ |
| PulseX Factory V2 | `0x1715a3E4A142d8b698131108995174F37aEBA10D` | ✅ |
| PulseX Factory V1 | `0x29eA7545DEf87022BAdc76323F373EA1e707C523` | ✅ |

---

## Migration Mappings Verified ✅

All V2 → V3 migration mappings have been verified to ensure:
1. V2 pair and V3 pool contain the same token pair (order-agnostic)
2. Both contracts exist and have liquidity
3. Factories are correct
4. Token addresses match

**Total Verified Mappings:** 10
- 6 PulseX V2 pairs → 9mm V3 pools
- 4 PulseX V1 pairs → 9mm V3 pools

---

## Test Results

```bash
forge test --match-path test/VerifyAddresses.t.sol
```

**All Tests Passed:** ✅
- ✅ Token addresses verification
- ✅ Contract addresses verification  
- ✅ PulseX V2 pairs verification
- ✅ PulseX V1 pairs verification
- ✅ 9mm V3 pools verification
- ✅ Migration mappings verification

---

## Files Updated

1. **`src/constants/pairs.ts`**
   - Fixed WPLS/eDAI V2 pair address
   - Fixed WPLS/eDAI V3 pool address
   - Fixed INC/PLSX fee tier

2. **`foundry-contracts/test/VerifyAddresses.t.sol`**
   - Created comprehensive test suite
   - Verifies all tokens, pairs, pools, and migration mappings

---

## Recommendations

### ✅ All Addresses Verified
All token and LP addresses are now verified and correct. The migrator is safe to use.

### Testing Recommendations
1. Run verification tests before any deployment:
   ```bash
   cd foundry-contracts
   forge test --match-path test/VerifyAddresses.t.sol -vv
   ```

2. The test suite verifies:
   - Token contracts exist and have correct symbols
   - V2 pairs belong to correct factories
   - V3 pools have correct fees and tokens
   - Migration mappings are valid
   - All contracts have liquidity

### Future Maintenance
- Re-run verification tests periodically
- Always verify on-chain before adding new pairs
- Check liquidity levels when choosing between multiple fee tiers

---

## Conclusion

✅ **ALL ADDRESSES VERIFIED AND CORRECTED**

The comprehensive Foundry test suite has verified all 9 tokens, 10 V2 pairs (6 V2 + 4 V1), 7 V3 pools, and 10 migration mappings against PulseChain mainnet. Two critical issues were found and fixed:

1. **WPLS/eDAI addresses were swapped** - FIXED
2. **INC/PLSX fee tier was incorrect** - FIXED

All addresses now correspond correctly to V2 and V3, and all migration paths are validated.
