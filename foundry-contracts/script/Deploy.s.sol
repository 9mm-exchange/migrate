// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity =0.7.6;

import "forge-std/Script.sol";
import "../src/PulseXV3Migrator.sol";

contract DeployScript is Script {
    // 9mm V3 NonfungiblePositionManager on PulseChain
    address constant POSITION_MANAGER = 0xCC05bf158202b4F461Ede8843d76dcd7Bbad07f2;
    // WPLS (Wrapped PLS) on PulseChain
    address constant WPLS = 0xA1077a294dDE1B09bB078844df40758a5D0f9a27;

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        vm.startBroadcast(deployerPrivateKey);
        
        PulseXV3Migrator migrator = new PulseXV3Migrator(
            POSITION_MANAGER,
            WPLS
        );
        
        vm.stopBroadcast();
        
        console.log("PulseXV3Migrator deployed at:", address(migrator));
    }
}

