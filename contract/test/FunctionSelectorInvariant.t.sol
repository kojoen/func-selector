// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {FunctionRegistry} from "../src/FunctionRegistry.sol";
import {FunctionDispatcher} from "../src/FunctionDispatcher.sol";
import {MockCalc} from "../src/mocks/MockCalc.sol";
import {MockToken} from "../src/mocks/MockToken.sol";
import {IFunctionRegistry} from "../src/interfaces/IFunctionRegistry.sol";

/// @title FunctionSelectorInvariantTest
/// @notice Invariant test suite for registry integrity and access control.
contract FunctionSelectorInvariantTest is Test {
    /*«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-*/
    /*                            STATE                           */
    /*-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»*/

    address internal OWNER;
    address internal ATTACKER;

    FunctionRegistry internal registry;
    FunctionDispatcher internal dispatcher;
    MockCalc internal calc;
    RegistryHandler internal handler;

    /*«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-*/
    /*                            SETUP                           */
    /*-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»*/

    function setUp() public {
        OWNER = makeAddr("owner");
        ATTACKER = makeAddr("attacker");

        vm.startPrank(OWNER);

        registry = new FunctionRegistry(OWNER);
        dispatcher = new FunctionDispatcher(address(registry));
        calc = new MockCalc();

        vm.stopPrank();

        handler = new RegistryHandler(registry, dispatcher, calc, OWNER, ATTACKER);
        targetContract(address(handler));
    }

    /*«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-*/
    /*                         INVARIANTS                         */
    /*-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»*/

    function invariant_RegisteredSelectorHasNonZeroImpl() public view {
        bytes4[] memory active = handler.getActiveSelectors();
        for (uint256 i = 0; i < active.length; i++) {
            bytes4 sel = active[i];
            assertTrue(registry.isRegistered(sel), "registered selector must exist");
            address impl = registry.getImplementation(sel);
            assertTrue(impl != address(0), "registered selector must have non-zero impl");
        }
    }

    function invariant_RemovedSelectorNotInRegistry() public view {
        bytes4[] memory removed = handler.getRemovedSelectors();
        for (uint256 i = 0; i < removed.length; i++) {
            bytes4 sel = removed[i];
            assertFalse(registry.isRegistered(sel), "removed selector must not be registered");
            assertEq(registry.getImplementation(sel), address(0), "removed selector impl must be zero");
        }
    }

    function invariant_SelectorCountConsistent() public view {
        bytes4[] memory onChain = registry.getAllSelectors();
        bytes4[] memory tracked = handler.getActiveSelectors();
        assertEq(onChain.length, tracked.length, "selector count must be consistent");
    }

    function invariant_OwnerIsImmutable() public view {
        assertEq(registry.owner(), OWNER, "owner must never change");
    }
}

contract RegistryHandler is Test {
    FunctionRegistry internal registry;
    FunctionDispatcher internal dispatcher;
    MockCalc internal calc;
    address internal owner;
    address internal attacker;

    bytes4[] internal _activeSelectors;
    bytes4[] internal _removedSelectors;
    mapping(bytes4 => bool) internal _isActive;
    uint256 private _nonce;

    constructor(
        FunctionRegistry _registry,
        FunctionDispatcher _dispatcher,
        MockCalc _calc,
        address _owner,
        address _attacker
    ) {
        registry = _registry;
        dispatcher = _dispatcher;
        calc = _calc;
        owner = _owner;
        attacker = _attacker;
    }

    /*«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-*/
    /*                     STATE TRANSITIONS                      */
    /*-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»*/

    function register(uint256 seed) external {
        bytes4 sel = bytes4(keccak256(abi.encode("handler_sig_", _nonce++, seed)));
        if (_isActive[sel] || registry.isRegistered(sel)) return;

        vm.prank(owner);
        registry.register(sel, address(calc), string(abi.encodePacked("handler_fn_", _nonce)));

        _activeSelectors.push(sel);
        _isActive[sel] = true;
    }

    function remove(uint256 idx) external {
        if (_activeSelectors.length == 0) return;
        idx = idx % _activeSelectors.length;
        bytes4 sel = _activeSelectors[idx];

        vm.prank(owner);
        registry.remove(sel);

        _removedSelectors.push(sel);
        _isActive[sel] = false;

        uint256 last = _activeSelectors.length - 1;
        if (idx != last) {
            _activeSelectors[idx] = _activeSelectors[last];
        }
        _activeSelectors.pop();
    }

    function replace(uint256 idx, address newImpl) external {
        if (_activeSelectors.length == 0) return;
        if (newImpl == address(0)) return;
        idx = idx % _activeSelectors.length;
        bytes4 sel = _activeSelectors[idx];

        vm.prank(owner);
        registry.replace(sel, newImpl);
    }

    function attackerTryRegister(uint256 seed) external {
        bytes4 sel = bytes4(keccak256(abi.encode("attack_", seed)));
        vm.prank(attacker);
        try registry.register(sel, address(calc), "foo()") {
            revert("INVARIANT BROKEN: attacker registered selector");
        } catch {}
    }

    function attackerTryRemove(uint256 idx) external {
        if (_activeSelectors.length == 0) return;
        idx = idx % _activeSelectors.length;
        bytes4 sel = _activeSelectors[idx];

        vm.prank(attacker);
        try registry.remove(sel) {
            revert("INVARIANT BROKEN: attacker removed selector");
        } catch {}
    }

    /*«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-*/
    /*                          GETTERS                           */
    /*-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»*/

    function getActiveSelectors() external view returns (bytes4[] memory) {
        return _activeSelectors;
    }

    function getRemovedSelectors() external view returns (bytes4[] memory) {
        return _removedSelectors;
    }
}
