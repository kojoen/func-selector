// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console2} from "forge-std/Script.sol";
import {FunctionRegistry} from "../src/FunctionRegistry.sol";
import {FunctionDispatcher} from "../src/FunctionDispatcher.sol";
import {MockCalc} from "../src/mocks/MockCalc.sol";
import {MockToken} from "../src/mocks/MockToken.sol";
import {SelectorLib} from "../src/SelectorLib.sol";

/// @title SetupSelectorSystem
/// @notice Setup script for registry, dispatcher, and mock implementations.
contract SetupSelectorSystem is Script {
    /*«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-*/
    /*                     SELECTOR CONSTANTS                     */
    /*-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»*/

    bytes4 constant SEL_ADD = bytes4(keccak256("add(uint256,uint256)"));
    bytes4 constant SEL_SUB = bytes4(keccak256("sub(uint256,uint256)"));
    bytes4 constant SEL_MUL = bytes4(keccak256("mul(uint256,uint256)"));
    bytes4 constant SEL_DIV = bytes4(keccak256("div(uint256,uint256)"));
    bytes4 constant SEL_MOD = bytes4(keccak256("mod(uint256,uint256)"));
    bytes4 constant SEL_TRANSFER = bytes4(keccak256("transfer(address,uint256)"));
    bytes4 constant SEL_BALANCE = bytes4(keccak256("balanceOf(address)"));
    bytes4 constant SEL_TOTAL = bytes4(keccak256("totalSupply()"));
    bytes4 constant SEL_MINT = bytes4(keccak256("mint(address,uint256)"));

    /*«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-*/
    /*                            RUN                             */
    /*-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»*/

    function run() external {
        address deployer = msg.sender;

        console2.log("=== Function Selector Setup ===");
        console2.log("Deployer:", deployer);

        vm.startBroadcast();

        MockCalc calc = new MockCalc();
        MockToken token = new MockToken();
        console2.log("MockCalc    :", address(calc));
        console2.log("MockToken   :", address(token));

        FunctionRegistry registry = new FunctionRegistry(deployer);
        console2.log("Registry    :", address(registry));

        FunctionDispatcher dispatcher = new FunctionDispatcher(address(registry));
        console2.log("Dispatcher  :", address(dispatcher));

        registry.register(SEL_ADD, address(calc), "add(uint256,uint256)");
        registry.register(SEL_SUB, address(calc), "sub(uint256,uint256)");
        registry.register(SEL_MUL, address(calc), "mul(uint256,uint256)");
        registry.register(SEL_DIV, address(calc), "div(uint256,uint256)");
        registry.register(SEL_MOD, address(calc), "mod(uint256,uint256)");

        registry.register(SEL_TRANSFER, address(token), "transfer(address,uint256)");
        registry.register(SEL_BALANCE, address(token), "balanceOf(address)");
        registry.register(SEL_TOTAL, address(token), "totalSupply()");
        registry.register(SEL_MINT, address(token), "mint(address,uint256)");

        vm.stopBroadcast();

        console2.log("\n=== Selector Inventory ===");
        _printSelector("add(uint256,uint256)", SEL_ADD, address(calc));
        _printSelector("sub(uint256,uint256)", SEL_SUB, address(calc));
        _printSelector("mul(uint256,uint256)", SEL_MUL, address(calc));
        _printSelector("div(uint256,uint256)", SEL_DIV, address(calc));
        _printSelector("mod(uint256,uint256)", SEL_MOD, address(calc));
        _printSelector("transfer(address,uint256)", SEL_TRANSFER, address(token));
        _printSelector("balanceOf(address)", SEL_BALANCE, address(token));
        _printSelector("totalSupply()", SEL_TOTAL, address(token));
        _printSelector("mint(address,uint256)", SEL_MINT, address(token));

        console2.log("\n=== Selector Validation ===");
        _verifySelector("add(uint256,uint256)", SEL_ADD);
        _verifySelector("transfer(address,uint256)", SEL_TRANSFER);
        _verifySelector("totalSupply()", SEL_TOTAL);

        console2.log("\nSetup complete!");
        console2.log("Use dispatcher at:", address(dispatcher));
    }

    /*«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-*/
    /*                          HELPERS                           */
    /*-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»*/

    function _printSelector(string memory sig, bytes4 sel, address impl) internal pure {
        console2.log(string(abi.encodePacked("  ", sig)));
        console2.log("    selector:", _bytes4ToString(sel));
        console2.log("    impl    :", impl);
    }

    function _verifySelector(string memory sig, bytes4 expected) internal pure {
        bytes4 computed = SelectorLib.compute(sig);
        bool valid = computed == expected;
        console2.log(string(abi.encodePacked(valid ? "[OK] " : "[FAIL] ", sig)));
    }

    function _bytes4ToString(bytes4 b) internal pure returns (string memory) {
        bytes memory hexChars = "0123456789abcdef";
        bytes memory str = new bytes(10);
        str[0] = "0";
        str[1] = "x";
        for (uint256 i = 0; i < 4; i++) {
            str[2 + i * 2] = hexChars[uint8(b[i]) >> 4];
            str[3 + i * 2] = hexChars[uint8(b[i]) & 0x0f];
        }
        return string(str);
    }
}
