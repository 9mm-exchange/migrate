// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity =0.7.6;
pragma abicoder v2;

import '@openzeppelin/contracts/token/ERC20/IERC20.sol';

/// @title PulseX V2 Pair Interface (with senderOrigin parameter)
interface IPulseXPair {
    function burn(address to, address senderOrigin) external returns (uint256 amount0, uint256 amount1);
    function transferFrom(address from, address to, uint256 value) external returns (bool);
    function token0() external view returns (address);
    function token1() external view returns (address);
}

/// @title 9mm V3 Nonfungible Position Manager Interface
interface INonfungiblePositionManager {
    struct MintParams {
        address token0;
        address token1;
        uint24 fee;
        int24 tickLower;
        int24 tickUpper;
        uint256 amount0Desired;
        uint256 amount1Desired;
        uint256 amount0Min;
        uint256 amount1Min;
        address recipient;
        uint256 deadline;
    }

    function mint(MintParams calldata params)
        external
        payable
        returns (
            uint256 tokenId,
            uint128 liquidity,
            uint256 amount0,
            uint256 amount1
        );

    function createAndInitializePoolIfNecessary(
        address token0,
        address token1,
        uint24 fee,
        uint160 sqrtPriceX96
    ) external payable returns (address pool);
}

/// @title IWETH9
interface IWETH9 is IERC20 {
    function deposit() external payable;
    function withdraw(uint256) external;
}

/// @title PulseX to 9mm V3 Migrator
/// @notice Migrates liquidity from PulseX V2 to 9mm V3
/// @dev Modified to work with PulseX's burn(address,address) signature
contract PulseXV3Migrator {
    address public immutable nonfungiblePositionManager;
    address public immutable WETH9;

    struct MigrateParams {
        address pair;               // PulseX V2 pair address
        uint256 liquidityToMigrate; // Amount of LP tokens to migrate
        uint8 percentageToMigrate;  // Percentage (1-100) of liquidity to migrate
        address token0;             // Token0 address
        address token1;             // Token1 address
        uint24 fee;                 // V3 fee tier
        int24 tickLower;            // V3 tick lower bound
        int24 tickUpper;            // V3 tick upper bound
        uint256 amount0Min;         // Minimum amount of token0
        uint256 amount1Min;         // Minimum amount of token1
        address recipient;          // Recipient of the V3 NFT position
        uint256 deadline;           // Transaction deadline
        bool refundAsETH;           // Whether to refund WPLS as PLS
    }

    event MigrationCompleted(
        address indexed user,
        address indexed pair,
        uint256 tokenId,
        uint128 liquidity,
        uint256 amount0,
        uint256 amount1
    );

    constructor(address _nonfungiblePositionManager, address _WETH9) {
        nonfungiblePositionManager = _nonfungiblePositionManager;
        WETH9 = _WETH9;
    }

    /// @notice Migrates liquidity from PulseX V2 to 9mm V3
    /// @param params The migration parameters
    function migrate(MigrateParams calldata params) external {
        require(params.percentageToMigrate > 0 && params.percentageToMigrate <= 100, 'Invalid percentage');
        require(block.timestamp <= params.deadline, 'Transaction too old');

        // Calculate actual liquidity to migrate based on percentage
        uint256 liquidityToMigrate = (params.liquidityToMigrate * params.percentageToMigrate) / 100;

        // Transfer LP tokens from user to the pair contract
        IPulseXPair pair = IPulseXPair(params.pair);
        require(
            pair.transferFrom(msg.sender, params.pair, liquidityToMigrate),
            'Transfer failed'
        );

        // Burn LP tokens using PulseX's burn(address, address) signature
        // The second parameter is senderOrigin (tx.origin for tracking)
        (uint256 amount0V2, uint256 amount1V2) = pair.burn(address(this), msg.sender);

        // Approve tokens to position manager
        IERC20(params.token0).approve(nonfungiblePositionManager, amount0V2);
        IERC20(params.token1).approve(nonfungiblePositionManager, amount1V2);

        // Mint V3 position
        INonfungiblePositionManager.MintParams memory mintParams = INonfungiblePositionManager.MintParams({
            token0: params.token0,
            token1: params.token1,
            fee: params.fee,
            tickLower: params.tickLower,
            tickUpper: params.tickUpper,
            amount0Desired: amount0V2,
            amount1Desired: amount1V2,
            amount0Min: params.amount0Min,
            amount1Min: params.amount1Min,
            recipient: params.recipient,
            deadline: params.deadline
        });

        (uint256 tokenId, uint128 liquidity, uint256 amount0, uint256 amount1) = 
            INonfungiblePositionManager(nonfungiblePositionManager).mint(mintParams);

        // Refund any leftover tokens
        uint256 refund0 = amount0V2 - amount0;
        uint256 refund1 = amount1V2 - amount1;

        if (refund0 > 0) {
            if (params.refundAsETH && params.token0 == WETH9) {
                IWETH9(WETH9).withdraw(refund0);
                _safeTransferETH(msg.sender, refund0);
            } else {
                IERC20(params.token0).transfer(msg.sender, refund0);
            }
        }

        if (refund1 > 0) {
            if (params.refundAsETH && params.token1 == WETH9) {
                IWETH9(WETH9).withdraw(refund1);
                _safeTransferETH(msg.sender, refund1);
            } else {
                IERC20(params.token1).transfer(msg.sender, refund1);
            }
        }

        emit MigrationCompleted(msg.sender, params.pair, tokenId, liquidity, amount0, amount1);
    }

    /// @notice Safely transfers ETH to an address
    function _safeTransferETH(address to, uint256 value) internal {
        (bool success, ) = to.call{value: value}('');
        require(success, 'ETH transfer failed');
    }

    /// @notice Receive function to accept ETH from WETH withdrawal
    receive() external payable {}
}

