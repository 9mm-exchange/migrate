// SPDX-License-Identifier: MIT
pragma solidity =0.7.6;
pragma abicoder v2;

import "forge-std/Test.sol";

// Interfaces
interface IPulseXFactory {
    function getPair(address tokenA, address tokenB) external view returns (address pair);
}

interface IPulseXPair {
    function token0() external view returns (address);
    function token1() external view returns (address);
    function factory() external view returns (address);
    function totalSupply() external view returns (uint256);
}

interface I9mmV3Factory {
    function getPool(address tokenA, address tokenB, uint24 fee) external view returns (address pool);
}

interface I9mmV3Pool {
    function token0() external view returns (address);
    function token1() external view returns (address);
    function fee() external view returns (uint24);
    function factory() external view returns (address);
    function liquidity() external view returns (uint128);
}

interface IERC20Metadata {
    function name() external view returns (string memory);
    function symbol() external view returns (string memory);
    function decimals() external view returns (uint8);
}

/// @title Address Verification Test Suite
/// @notice Comprehensive verification of all token, LP, and pool addresses
contract VerifyAddressesTest is Test {
    // ============ PulseX V2 Factories ============
    address constant PULSEX_FACTORY_V2 = 0x1715a3E4A142d8b698131108995174F37aEBA10D;
    address constant PULSEX_FACTORY_V1 = 0x29eA7545DEf87022BAdc76323F373EA1e707C523;

    // ============ 9mm V3 Contracts ============
    address constant NINEMM_V3_FACTORY = 0xe50DbDC88E87a2C92984d794bcF3D1d76f619C68;
    address constant NINEMM_POSITION_MANAGER = 0xCC05bf158202b4F461Ede8843d76dcd7Bbad07f2;
    address constant NINEMM_V3_MIGRATOR = 0xcD2f7f58Fff604B460c02E08b542de75549177c4;

    // ============ Common Tokens ============
    address constant WPLS = 0xA1077a294dDE1B09bB078844df40758a5D0f9a27;
    address constant pHEX = 0x2b591e99afE9f32eAA6214f7B7629768c40Eeb39;
    address constant eHEX = 0x57fde0a71132198BBeC939B98976993d8D89D225;
    address constant eDAI = 0xefD766cCb38EaF1dfd701853BFCe31359239F305;
    address constant pDAI = 0x6B175474E89094C44Da98b954EedeAC495271d0F;
    address constant eWETH = 0x02DcdD04e3F455D838cd1249292C58f3B79e3C3C;
    address constant pWETH = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;
    address constant PLSX = 0x95B303987A60C71504D99Aa1b13B4DA07b0790ab;
    address constant INC = 0x2fa878Ab3F87CC1C9737Fc071108F904c0B0C95d;

    // Fork for testing
    uint256 pulsechainFork;

    function setUp() public {
        // Create fork of PulseChain mainnet
        string memory rpcUrl = vm.envOr("PULSECHAIN_RPC_URL", string("https://rpc.pulsechain.com"));
        pulsechainFork = vm.createFork(rpcUrl);
        vm.selectFork(pulsechainFork);
    }

    // ============================================
    // TOKEN VERIFICATION TESTS
    // ============================================

    function testVerifyTokensExist() public view {
        console.log("=== Verifying Token Addresses ===");
        
        _verifyToken(WPLS, "WPLS");
        _verifyToken(pHEX, "pHEX");
        _verifyToken(eHEX, "eHEX");
        _verifyToken(eDAI, "eDAI");
        _verifyToken(pDAI, "pDAI");
        _verifyToken(eWETH, "eWETH");
        _verifyToken(pWETH, "pWETH");
        _verifyToken(PLSX, "PLSX");
        _verifyToken(INC, "INC");
        
        console.log("All tokens verified successfully!");
    }

    function _verifyToken(address token, string memory name) internal view {
        uint256 codeSize;
        assembly {
            codeSize := extcodesize(token)
        }
        require(codeSize > 0, string(abi.encodePacked(name, " - No contract at address")));
        
        try IERC20Metadata(token).symbol() returns (string memory symbol) {
            console.log(name, "- Symbol:", symbol);
        } catch {
            console.log(name, "- Address valid (no symbol method)");
        }
    }

    // ============================================
    // V2 PAIR VERIFICATION TESTS
    // ============================================

    function testVerifyPulseXV2Pairs() public view {
        console.log("\n=== Verifying PulseX V2 Pairs ===");
        
        // pHEX/WPLS (V2)
        _verifyV2Pair(
            0xf1F4ee610b2bAbB05C635F726eF8B0C568c8dc65,
            pHEX,
            WPLS,
            PULSEX_FACTORY_V2,
            "pHEX/WPLS (V2)"
        );

        // PLSX/WPLS (V2)
        _verifyV2Pair(
            0x1b45b9148791d3a104184Cd5DFE5CE57193a3ee9,
            PLSX,
            WPLS,
            PULSEX_FACTORY_V2,
            "PLSX/WPLS (V2)"
        );

        // WPLS/eDAI (V2)
        _verifyV2Pair(
            0xE56043671df55dE5CDf8459710433C10324DE0aE,
            WPLS,
            eDAI,
            PULSEX_FACTORY_V2,
            "WPLS/eDAI (V2)"
        );

        // pHEX/eDAI (V2)
        _verifyV2Pair(
            0x6F1747370B1CAcb911ad6D4477b718633DB328c8,
            pHEX,
            eDAI,
            PULSEX_FACTORY_V2,
            "pHEX/eDAI (V2)"
        );

        // INC/WPLS (V2)
        _verifyV2Pair(
            0xf808Bb6265e9Ca27002c0A04562Bf50d4FE37EAA,
            INC,
            WPLS,
            PULSEX_FACTORY_V2,
            "INC/WPLS (V2)"
        );

        // INC/PLSX (V2)
        _verifyV2Pair(
            0x7Dbeca4c74d01cd8782D4EF5C05C0769723fb0ea,
            INC,
            PLSX,
            PULSEX_FACTORY_V2,
            "INC/PLSX (V2)"
        );

        console.log("All V2 pairs verified successfully!");
    }

    function testVerifyPulseXV1Pairs() public view {
        console.log("\n=== Verifying PulseX V1 Pairs ===");
        
        // pHEX/WPLS (V1)
        _verifyV2Pair(
            0x19BB45a7270177e303DEe6eAA6F5Ad700812bA98,
            pHEX,
            WPLS,
            PULSEX_FACTORY_V1,
            "pHEX/WPLS (V1)"
        );

        // PLSX/WPLS (V1)
        _verifyV2Pair(
            0x149B2C629e652f2E89E11cd57e5d4D77ee166f9F,
            PLSX,
            WPLS,
            PULSEX_FACTORY_V1,
            "PLSX/WPLS (V1)"
        );

        // WPLS/eDAI (V1)
        _verifyV2Pair(
            0x146E1f1e060e5b5016Db0D118D2C5a11A240ae32,
            WPLS,
            eDAI,
            PULSEX_FACTORY_V1,
            "WPLS/eDAI (V1)"
        );

        // eWETH/WPLS (V1)
        _verifyV2Pair(
            0x29d66D5900Eb0d629E1e6946195520065A6c5aeE,
            eWETH,
            WPLS,
            PULSEX_FACTORY_V1,
            "eWETH/WPLS (V1)"
        );

        console.log("All V1 pairs verified successfully!");
    }

    function _verifyV2Pair(
        address pairAddress,
        address tokenA,
        address tokenB,
        address expectedFactory,
        string memory pairName
    ) internal view {
        console.log("\nVerifying:", pairName);
        console.log("Pair address:", pairAddress);
        
        // Check pair exists
        uint256 codeSize;
        assembly {
            codeSize := extcodesize(pairAddress)
        }
        require(codeSize > 0, string(abi.encodePacked(pairName, " - Pair does not exist")));

        IPulseXPair pair = IPulseXPair(pairAddress);
        
        // Get tokens from pair
        address token0 = pair.token0();
        address token1 = pair.token1();
        
        console.log("Token0:", token0);
        console.log("Token1:", token1);

        // Verify tokens match (order-agnostic)
        bool tokensMatch = (token0 == tokenA && token1 == tokenB) || 
                          (token0 == tokenB && token1 == tokenA);
        require(tokensMatch, string(abi.encodePacked(pairName, " - Token mismatch")));

        // Verify factory
        address factory = pair.factory();
        console.log("Factory:", factory);
        require(factory == expectedFactory, string(abi.encodePacked(pairName, " - Factory mismatch")));

        // Verify pair has liquidity
        uint256 totalSupply = pair.totalSupply();
        console.log("Total Supply:", totalSupply);
        require(totalSupply > 0, string(abi.encodePacked(pairName, " - No liquidity")));

        // Verify factory can find this pair
        address factoryPair = IPulseXFactory(expectedFactory).getPair(tokenA, tokenB);
        require(factoryPair == pairAddress, string(abi.encodePacked(pairName, " - Factory lookup failed")));

        console.log("PASS:", pairName);
    }

    // ============================================
    // V3 POOL VERIFICATION TESTS
    // ============================================

    function testVerify9mmV3Pools() public view {
        console.log("\n=== Verifying 9mm V3 Pools ===");

        // pHEX/WPLS 1%
        _verifyV3Pool(
            0x6639a38f7b6F9BA236227C4dcd723a8Dc4Bd368F,
            pHEX,
            WPLS,
            10000,
            "pHEX/WPLS 1%"
        );

        // PLSX/WPLS 1%
        _verifyV3Pool(
            0x96737676cb25396a9F857272cdDc8E3A346d63da,
            PLSX,
            WPLS,
            10000,
            "PLSX/WPLS 1%"
        );

        // WPLS/eDAI 0.25%
        _verifyV3Pool(
            0xE37a2c1755151Ff910FF895A14FAD5570730f6e9,
            WPLS,
            eDAI,
            2500,
            "WPLS/eDAI 0.25%"
        );

        // pHEX/eDAI 0.25%
        _verifyV3Pool(
            0x6ACe474A9FdE57e663E47A4c7965964440b35f71,
            pHEX,
            eDAI,
            2500,
            "pHEX/eDAI 0.25%"
        );

        // INC/WPLS 0.25%
        _verifyV3Pool(
            0xfC4745206D437ebb55A9590cBAF09724F068B726,
            INC,
            WPLS,
            2500,
            "INC/WPLS 0.25%"
        );

        // INC/PLSX 1%
        _verifyV3Pool(
            0x864Da5B36da7cd93E54b1ED1582b2C622AcD69a3,
            INC,
            PLSX,
            10000,
            "INC/PLSX 1%"
        );

        // eWETH/WPLS 0.25%
        _verifyV3Pool(
            0xf91d0CBfbA8e11cCd203e97AEFdA4352AcCFFEEb,
            eWETH,
            WPLS,
            2500,
            "eWETH/WPLS 0.25%"
        );

        console.log("All V3 pools verified successfully!");
    }

    function _verifyV3Pool(
        address poolAddress,
        address tokenA,
        address tokenB,
        uint24 expectedFee,
        string memory poolName
    ) internal view {
        console.log("\nVerifying:", poolName);
        console.log("Pool address:", poolAddress);
        
        // Check pool exists
        uint256 codeSize;
        assembly {
            codeSize := extcodesize(poolAddress)
        }
        require(codeSize > 0, string(abi.encodePacked(poolName, " - Pool does not exist")));

        I9mmV3Pool pool = I9mmV3Pool(poolAddress);
        
        // Get tokens from pool
        address token0 = pool.token0();
        address token1 = pool.token1();
        
        console.log("Token0:", token0);
        console.log("Token1:", token1);

        // Tokens should be sorted (token0 < token1)
        require(uint160(token0) < uint160(token1), string(abi.encodePacked(poolName, " - Tokens not sorted")));

        // Verify tokens match (must respect V3 sorting)
        address expectedToken0 = uint160(tokenA) < uint160(tokenB) ? tokenA : tokenB;
        address expectedToken1 = uint160(tokenA) < uint160(tokenB) ? tokenB : tokenA;
        
        require(token0 == expectedToken0, string(abi.encodePacked(poolName, " - Token0 mismatch")));
        require(token1 == expectedToken1, string(abi.encodePacked(poolName, " - Token1 mismatch")));

        // Verify fee
        uint24 fee = pool.fee();
        console.log("Fee (basis points):", uint256(fee));
        require(fee == expectedFee, string(abi.encodePacked(poolName, " - Fee mismatch")));

        // Verify factory
        address factory = pool.factory();
        console.log("Factory:", factory);
        require(factory == NINEMM_V3_FACTORY, string(abi.encodePacked(poolName, " - Factory mismatch")));

        // Verify pool has liquidity
        uint128 liquidity = pool.liquidity();
        console.log("Liquidity:", uint256(liquidity));
        require(liquidity > 0, string(abi.encodePacked(poolName, " - No liquidity")));

        // Verify factory can find this pool
        address factoryPool = I9mmV3Factory(NINEMM_V3_FACTORY).getPool(tokenA, tokenB, expectedFee);
        require(factoryPool == poolAddress, string(abi.encodePacked(poolName, " - Factory lookup failed")));

        console.log("PASS:", poolName);
    }

    // ============================================
    // MIGRATION MAPPING VERIFICATION
    // ============================================

    function testVerifyMigrationMappings() public view {
        console.log("\n=== Verifying Migration Mappings ===");
        console.log("This test ensures each V2 pair correctly maps to its V3 pool");

        // V2: pHEX/WPLS -> V3: pHEX/WPLS 1%
        _verifyMigrationMapping(
            0xf1F4ee610b2bAbB05C635F726eF8B0C568c8dc65,  // V2 pair
            0x6639a38f7b6F9BA236227C4dcd723a8Dc4Bd368F,  // V3 pool
            "pHEX/WPLS (V2 -> V3)"
        );

        // V2: PLSX/WPLS -> V3: PLSX/WPLS 1%
        _verifyMigrationMapping(
            0x1b45b9148791d3a104184Cd5DFE5CE57193a3ee9,
            0x96737676cb25396a9F857272cdDc8E3A346d63da,
            "PLSX/WPLS (V2 -> V3)"
        );

        // V2: WPLS/eDAI -> V3: WPLS/eDAI 0.25%
        _verifyMigrationMapping(
            0xE56043671df55dE5CDf8459710433C10324DE0aE,
            0xE37a2c1755151Ff910FF895A14FAD5570730f6e9,
            "WPLS/eDAI (V2 -> V3)"
        );

        // V2: pHEX/eDAI -> V3: pHEX/eDAI 0.25%
        _verifyMigrationMapping(
            0x6F1747370B1CAcb911ad6D4477b718633DB328c8,
            0x6ACe474A9FdE57e663E47A4c7965964440b35f71,
            "pHEX/eDAI (V2 -> V3)"
        );

        // V2: INC/WPLS -> V3: INC/WPLS 0.25%
        _verifyMigrationMapping(
            0xf808Bb6265e9Ca27002c0A04562Bf50d4FE37EAA,
            0xfC4745206D437ebb55A9590cBAF09724F068B726,
            "INC/WPLS (V2 -> V3)"
        );

        // V2: INC/PLSX -> V3: INC/PLSX 0.25%
        _verifyMigrationMapping(
            0x7Dbeca4c74d01cd8782D4EF5C05C0769723fb0ea,
            0x864Da5B36da7cd93E54b1ED1582b2C622AcD69a3,
            "INC/PLSX (V2 -> V3)"
        );

        // V1: pHEX/WPLS -> V3: pHEX/WPLS 1% (same as V2)
        _verifyMigrationMapping(
            0x19BB45a7270177e303DEe6eAA6F5Ad700812bA98,
            0x6639a38f7b6F9BA236227C4dcd723a8Dc4Bd368F,
            "pHEX/WPLS (V1 -> V3)"
        );

        // V1: PLSX/WPLS -> V3: PLSX/WPLS 1% (same as V2)
        _verifyMigrationMapping(
            0x149B2C629e652f2E89E11cd57e5d4D77ee166f9F,
            0x96737676cb25396a9F857272cdDc8E3A346d63da,
            "PLSX/WPLS (V1 -> V3)"
        );

        // V1: WPLS/eDAI -> V3: WPLS/eDAI 0.25% (same as V2)
        _verifyMigrationMapping(
            0x146E1f1e060e5b5016Db0D118D2C5a11A240ae32,
            0xE37a2c1755151Ff910FF895A14FAD5570730f6e9,
            "WPLS/eDAI (V1 -> V3)"
        );

        // V1: eWETH/WPLS -> V3: eWETH/WPLS 0.25%
        _verifyMigrationMapping(
            0x29d66D5900Eb0d629E1e6946195520065A6c5aeE,
            0xf91d0CBfbA8e11cCd203e97AEFdA4352AcCFFEEb,
            "eWETH/WPLS (V1 -> V3)"
        );

        console.log("All migration mappings verified successfully!");
    }

    function _verifyMigrationMapping(
        address v2PairAddress,
        address v3PoolAddress,
        string memory mappingName
    ) internal view {
        console.log("\nVerifying migration:", mappingName);
        
        // Get tokens from V2 pair
        IPulseXPair v2Pair = IPulseXPair(v2PairAddress);
        address v2Token0 = v2Pair.token0();
        address v2Token1 = v2Pair.token1();
        
        // Get tokens from V3 pool
        I9mmV3Pool v3Pool = I9mmV3Pool(v3PoolAddress);
        address v3Token0 = v3Pool.token0();
        address v3Token1 = v3Pool.token1();
        
        // Verify same token pair (order-agnostic for V2, sorted for V3)
        bool sameTokens = (
            (v2Token0 == v3Token0 && v2Token1 == v3Token1) ||
            (v2Token0 == v3Token1 && v2Token1 == v3Token0)
        );
        
        require(sameTokens, string(abi.encodePacked(mappingName, " - Token mismatch between V2 and V3")));
        
        console.log("PASS:", mappingName);
    }

    // ============================================
    // CONTRACT VERIFICATION TESTS
    // ============================================

    function testVerifyContracts() public view {
        console.log("\n=== Verifying Contract Addresses ===");
        
        _verifyContract(NINEMM_V3_FACTORY, "9mm V3 Factory");
        _verifyContract(NINEMM_POSITION_MANAGER, "9mm Position Manager");
        _verifyContract(NINEMM_V3_MIGRATOR, "9mm V3 Migrator");
        _verifyContract(PULSEX_FACTORY_V2, "PulseX Factory V2");
        _verifyContract(PULSEX_FACTORY_V1, "PulseX Factory V1");
        
        console.log("All contracts verified successfully!");
    }

    function _verifyContract(address contractAddress, string memory name) internal view {
        uint256 codeSize;
        assembly {
            codeSize := extcodesize(contractAddress)
        }
        require(codeSize > 0, string(abi.encodePacked(name, " - No contract at address")));
        console.log("PASS:", name, "-", contractAddress);
    }

    // ============================================
    // SUMMARY TEST
    // ============================================

    function testRunAllVerifications() public view {
        console.log("\n========================================");
        console.log("RUNNING COMPLETE ADDRESS VERIFICATION");
        console.log("========================================");
        
        testVerifyTokensExist();
        testVerifyContracts();
        testVerifyPulseXV2Pairs();
        testVerifyPulseXV1Pairs();
        testVerify9mmV3Pools();
        testVerifyMigrationMappings();
        
        console.log("\n========================================");
        console.log("ALL VERIFICATIONS PASSED!");
        console.log("========================================");
    }
}
