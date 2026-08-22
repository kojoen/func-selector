// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test, console2} from "forge-std/Test.sol";
import {FunctionRegistry} from "../src/FunctionRegistry.sol";
import {FunctionDispatcher} from "../src/FunctionDispatcher.sol";
import {SelectorLib} from "../src/SelectorLib.sol";
import {MockCalc} from "../src/mocks/MockCalc.sol";
import {MockToken} from "../src/mocks/MockToken.sol";
import {IFunctionRegistry} from "../src/interfaces/IFunctionRegistry.sol";

/// @title FunctionSelectorTest
/// @notice Test suite for registry and dispatcher functionality.
contract FunctionSelectorTest is Test {
    using SelectorLib for string;

    /*«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-*/
    /*                            STATE                           */
    /*-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»*/

    address internal OWNER;
    address internal ALICE;
    address internal ATTACKER;

    FunctionRegistry internal registry;
    FunctionDispatcher internal dispatcher;
    MockCalc internal calc;
    MockToken internal token;

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
    /*                            SETUP                           */
    /*-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»*/

    function setUp() public {
        OWNER = makeAddr("owner");
        ALICE = makeAddr("alice");
        ATTACKER = makeAddr("attacker");

        vm.startPrank(OWNER);

        registry = new FunctionRegistry(OWNER);
        dispatcher = new FunctionDispatcher(address(registry));
        calc = new MockCalc();
        token = new MockToken();

        registry.register(SEL_ADD, address(calc), "add(uint256,uint256)");
        registry.register(SEL_SUB, address(calc), "sub(uint256,uint256)");
        registry.register(SEL_MUL, address(calc), "mul(uint256,uint256)");
        registry.register(SEL_DIV, address(calc), "div(uint256,uint256)");
        registry.register(SEL_MOD, address(calc), "mod(uint256,uint256)");

        registry.register(SEL_TRANSFER, address(token), "transfer(address,uint256)");
        registry.register(SEL_BALANCE, address(token), "balanceOf(address)");
        registry.register(SEL_TOTAL, address(token), "totalSupply()");
        registry.register(SEL_MINT, address(token), "mint(address,uint256)");

        vm.stopPrank();
    }

    /*«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-*/
    /*                   1. SELECTOR INTEGRITY                    */
    /*-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»*/

    function test_Selector_add() public pure {
        assertEq(MockCalc.add.selector, bytes4(keccak256("add(uint256,uint256)")));
    }

    function test_Selector_sub() public pure {
        assertEq(MockCalc.sub.selector, bytes4(keccak256("sub(uint256,uint256)")));
    }

    function test_Selector_mul() public pure {
        assertEq(MockCalc.mul.selector, bytes4(keccak256("mul(uint256,uint256)")));
    }

    function test_Selector_div() public pure {
        assertEq(MockCalc.div.selector, bytes4(keccak256("div(uint256,uint256)")));
    }

    function test_Selector_mod() public pure {
        assertEq(MockCalc.mod.selector, bytes4(keccak256("mod(uint256,uint256)")));
    }

    function test_Selector_transfer() public pure {
        assertEq(MockToken.transfer.selector, bytes4(keccak256("transfer(address,uint256)")));
    }

    function test_Selector_balanceOf() public pure {
        bytes4 sel = bytes4(keccak256("balanceOf(address)"));
        assertEq(sel, bytes4(0x70a08231));
    }

    function test_Selector_totalSupply() public pure {
        bytes4 sel = bytes4(keccak256("totalSupply()"));
        assertEq(sel, bytes4(0x18160ddd));
    }

    function test_Selector_mint() public pure {
        assertEq(MockToken.mint.selector, bytes4(keccak256("mint(address,uint256)")));
    }

    function test_Selector_NoCollision() public pure {
        bytes4[9] memory sels = [
            SEL_ADD, SEL_SUB, SEL_MUL, SEL_DIV, SEL_MOD,
            SEL_TRANSFER, SEL_BALANCE, SEL_TOTAL, SEL_MINT
        ];
        for (uint256 i = 0; i < sels.length; i++) {
            for (uint256 j = i + 1; j < sels.length; j++) {
                assertTrue(sels[i] != sels[j], "SELECTOR COLLISION DETECTED");
            }
        }
    }

    /*«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-*/
    /*                     2. REGISTRY TESTS                      */
    /*-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»*/

    function test_Registry_isRegistered() public view {
        assertTrue(registry.isRegistered(SEL_ADD));
        assertTrue(registry.isRegistered(SEL_TRANSFER));
        assertFalse(registry.isRegistered(bytes4(0xdeadbeef)));
    }

    function test_Registry_getImplementation() public view {
        assertEq(registry.getImplementation(SEL_ADD), address(calc));
        assertEq(registry.getImplementation(SEL_TRANSFER), address(token));
        assertEq(registry.getImplementation(bytes4(0xdeadbeef)), address(0));
    }

    function test_Registry_getSignature() public view {
        assertEq(registry.getSignature(SEL_ADD), "add(uint256,uint256)");
        assertEq(registry.getSignature(SEL_TRANSFER), "transfer(address,uint256)");
    }

    function test_Registry_getAllSelectors() public view {
        bytes4[] memory sels = registry.getAllSelectors();
        assertEq(sels.length, 9);
    }

    function test_Registry_Register_RevertIfDuplicate() public {
        vm.prank(OWNER);
        vm.expectRevert(abi.encodeWithSelector(IFunctionRegistry.SelectorAlreadyRegistered.selector, SEL_ADD));
        registry.register(SEL_ADD, address(calc), "add(uint256,uint256)");
    }

    function test_Registry_Register_RevertIfZeroAddress() public {
        vm.prank(OWNER);
        vm.expectRevert(IFunctionRegistry.ZeroImplementation.selector);
        registry.register(bytes4(0xdeadbeef), address(0), "foo()");
    }

    function test_Registry_Register_RevertIfUnauthorized() public {
        vm.prank(ATTACKER);
        vm.expectRevert(abi.encodeWithSelector(IFunctionRegistry.Unauthorized.selector, ATTACKER));
        registry.register(bytes4(0x12345678), address(calc), "foo()");
    }

    function test_Registry_Replace_Success() public {
        MockCalc newCalc = new MockCalc();
        vm.prank(OWNER);
        registry.replace(SEL_ADD, address(newCalc));
        assertEq(registry.getImplementation(SEL_ADD), address(newCalc));
    }

    function test_Registry_Replace_RevertIfNotRegistered() public {
        vm.prank(OWNER);
        vm.expectRevert(abi.encodeWithSelector(IFunctionRegistry.SelectorNotRegistered.selector, bytes4(0xdeadbeef)));
        registry.replace(bytes4(0xdeadbeef), address(calc));
    }

    function test_Registry_Replace_RevertIfUnauthorized() public {
        vm.prank(ATTACKER);
        vm.expectRevert(abi.encodeWithSelector(IFunctionRegistry.Unauthorized.selector, ATTACKER));
        registry.replace(SEL_ADD, address(calc));
    }

    function test_Registry_Remove_Success() public {
        vm.prank(OWNER);
        registry.remove(SEL_ADD);
        assertFalse(registry.isRegistered(SEL_ADD));
        assertEq(registry.getImplementation(SEL_ADD), address(0));
        bytes4[] memory sels = registry.getAllSelectors();
        assertEq(sels.length, 8);
    }

    function test_Registry_Remove_RevertIfNotRegistered() public {
        vm.prank(OWNER);
        vm.expectRevert(abi.encodeWithSelector(IFunctionRegistry.SelectorNotRegistered.selector, bytes4(0xdeadbeef)));
        registry.remove(bytes4(0xdeadbeef));
    }

    function test_Registry_Remove_RevertIfUnauthorized() public {
        vm.prank(ATTACKER);
        vm.expectRevert(abi.encodeWithSelector(IFunctionRegistry.Unauthorized.selector, ATTACKER));
        registry.remove(SEL_ADD);
    }

    function test_Registry_RemoveThenReRegister() public {
        vm.startPrank(OWNER);
        registry.remove(SEL_ADD);
        assertFalse(registry.isRegistered(SEL_ADD));
        registry.register(SEL_ADD, address(calc), "add(uint256,uint256)");
        assertTrue(registry.isRegistered(SEL_ADD));
        vm.stopPrank();
    }

    /*«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-*/
    /*                    3. DISPATCHER TESTS                     */
    /*-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»*/

    function test_Dispatcher_Add_ViaInterface() public {
        MockCalc dispCalc = MockCalc(address(dispatcher));
        uint256 result = dispCalc.add(10, 32);
        assertEq(result, 42);
    }

    function test_Dispatcher_Sub_ViaInterface() public {
        MockCalc dispCalc = MockCalc(address(dispatcher));
        uint256 result = dispCalc.sub(100, 58);
        assertEq(result, 42);
    }

    function test_Dispatcher_Mul_ViaInterface() public {
        MockCalc dispCalc = MockCalc(address(dispatcher));
        uint256 result = dispCalc.mul(6, 7);
        assertEq(result, 42);
    }

    function test_Dispatcher_Div_ViaInterface() public {
        MockCalc dispCalc = MockCalc(address(dispatcher));
        uint256 result = dispCalc.div(84, 2);
        assertEq(result, 42);
    }

    function test_Dispatcher_Mod_ViaInterface() public {
        MockCalc dispCalc = MockCalc(address(dispatcher));
        uint256 result = dispCalc.mod(142, 100);
        assertEq(result, 42);
    }

    function test_Dispatcher_Transfer_ViaInterface() public {
        MockToken dispToken = MockToken(address(dispatcher));

        vm.prank(OWNER);
        dispToken.mint(ALICE, 1000);

        vm.prank(ALICE);
        bool ok = dispToken.transfer(OWNER, 400);
        assertTrue(ok);

        assertEq(dispToken.balanceOf(ALICE), 600);
        assertEq(dispToken.balanceOf(OWNER), 400);
    }

    function test_Dispatcher_TotalSupply_ViaInterface() public {
        MockToken dispToken = MockToken(address(dispatcher));
        vm.prank(OWNER);
        dispToken.mint(ALICE, 500);
        assertEq(dispToken.totalSupply(), 500);
    }

    function test_Dispatcher_Revert_DivisionByZero() public {
        MockCalc dispCalc = MockCalc(address(dispatcher));
        vm.expectRevert(MockCalc.DivisionByZero.selector);
        dispCalc.div(10, 0);
    }

    function test_Dispatcher_Revert_InsufficientBalance() public {
        MockToken dispToken = MockToken(address(dispatcher));
        vm.prank(ALICE);
        vm.expectRevert(
            abi.encodeWithSelector(MockToken.InsufficientBalance.selector, ALICE, 0, 100)
        );
        dispToken.transfer(OWNER, 100);
    }

    /*«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-*/
    /*                    4. CALLDATA BOUNDARY                    */
    /*-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»*/

    function test_Boundary_ZeroBytes_CallsReceive() public {
        (bool ok,) = address(dispatcher).call("");
        assertTrue(ok, "0 byte call should succeed via receive()");
    }

    function test_Boundary_OneByte() public {
        (bool ok, bytes memory ret) = address(dispatcher).call(hex"aa");
        assertFalse(ok, "should revert on 1 byte");
        bytes4 errSel = bytes4(ret);
        assertEq(errSel, FunctionDispatcher.CalldataTooShort.selector);
    }

    function test_Boundary_TwoBytes() public {
        (bool ok, bytes memory ret) = address(dispatcher).call(hex"aabb");
        assertFalse(ok, "should revert on 2 bytes");
        bytes4 errSel = bytes4(ret);
        assertEq(errSel, FunctionDispatcher.CalldataTooShort.selector);
    }

    function test_Boundary_ThreeBytes() public {
        (bool ok, bytes memory ret) = address(dispatcher).call(hex"aabbcc");
        assertFalse(ok, "should revert on 3 bytes");
        bytes4 errSel = bytes4(ret);
        assertEq(errSel, FunctionDispatcher.CalldataTooShort.selector);
    }

    function test_Boundary_FourBytes_UnknownSelector() public {
        (bool ok, bytes memory ret) = address(dispatcher).call(hex"deadbeef");
        assertFalse(ok, "should revert on unknown selector");
        bytes4 errSel = bytes4(ret);
        assertEq(errSel, FunctionDispatcher.UnknownSelector.selector);
    }

    function test_Boundary_ExactFourBytes_KnownSelector() public {
        bytes memory data = abi.encodeWithSelector(SEL_ADD, uint256(0), uint256(0));
        (bool ok, bytes memory ret) = address(dispatcher).call(data);
        assertTrue(ok);
        uint256 result = abi.decode(ret, (uint256));
        assertEq(result, 0);
    }

    /*«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-*/
    /*                    5. SELECTORLIB TESTS                    */
    /*-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»*/

    function test_SelectorLib_Compute() public pure {
        bytes4 sel = SelectorLib.compute("add(uint256,uint256)");
        assertEq(sel, bytes4(keccak256("add(uint256,uint256)")));
    }

    function test_SelectorLib_ComputeFromBytes() public pure {
        bytes4 sel = SelectorLib.computeFromBytes(bytes("transfer(address,uint256)"));
        assertEq(sel, bytes4(keccak256("transfer(address,uint256)")));
    }

    function test_SelectorLib_Validate_True() public pure {
        assertTrue(SelectorLib.validate("add(uint256,uint256)", SEL_ADD));
    }

    function test_SelectorLib_Validate_False() public pure {
        assertFalse(SelectorLib.validate("add(uint256,uint256)", bytes4(0xdeadbeef)));
    }

    function test_SelectorLib_BuildCalldata() public pure {
        bytes memory args = abi.encode(uint256(10), uint256(32));
        bytes memory data = SelectorLib.buildCalldata(SEL_ADD, args);
        assertEq(bytes4(data), SEL_ADD);
        assertEq(data.length, 4 + 64);
    }

    function _splitHelper(bytes calldata data) external pure returns (bytes4 sel, bytes memory args) {
        bytes calldata argsSlice;
        (sel, argsSlice) = SelectorLib.split(data);
        args = argsSlice;
    }

    function test_SelectorLib_Split() public {
        bytes memory data = abi.encodeWithSelector(SEL_ADD, uint256(1), uint256(2));
        (bytes4 sel, bytes memory args) = this._splitHelper(data);
        assertEq(sel, SEL_ADD);
        (uint256 a, uint256 b) = abi.decode(args, (uint256, uint256));
        assertEq(a, 1);
        assertEq(b, 2);
    }

    /*«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-*/
    /*                       6. FUZZ TESTS                        */
    /*-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»*/

    function testFuzz_UnknownSelector_CannotMutateState(bytes4 sel) public {
        vm.assume(!registry.isRegistered(sel));

        uint256 totalBefore = MockToken(address(dispatcher)).totalSupply();

        (bool ok,) = address(dispatcher).call(abi.encodePacked(sel));
        assertFalse(ok, "unknown selector must revert");

        uint256 totalAfter = MockToken(address(dispatcher)).totalSupply();
        assertEq(totalBefore, totalAfter, "state must not change");
    }

    function testFuzz_KnownSelector_RoutesToCorrectImpl(uint256 a, uint256 b) public {
        a = bound(a, 0, type(uint128).max);
        b = bound(b, 0, type(uint128).max);

        MockCalc dispCalc = MockCalc(address(dispatcher));
        uint256 dispResult = dispCalc.add(a, b);

        uint256 directResult = calc.add(a, b);

        assertEq(dispResult, directResult, "results must be identical");
    }

    function testFuzz_RevertData_Preserved(uint256 b) public {
        vm.assume(b == 0);
        MockCalc dispCalc = MockCalc(address(dispatcher));
        vm.expectRevert(MockCalc.DivisionByZero.selector);
        dispCalc.div(100, b);
    }

    function testFuzz_SelectorLib_ConsistentWithKeccak(string calldata sig) public pure {
        bytes4 computed = SelectorLib.compute(sig);
        bytes4 expected = bytes4(keccak256(bytes(sig)));
        assertEq(computed, expected);
    }

    /*«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-*/
    /*                    7. PAYABILITY TESTS                     */
    /*-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»*/

    function test_Dispatcher_ReceiveETH() public {
        deal(ALICE, 1 ether);
        vm.prank(ALICE);
        (bool ok,) = address(dispatcher).call{value: 0.5 ether}("");
        assertTrue(ok, "receive() should accept ETH");
        assertEq(address(dispatcher).balance, 0.5 ether);
    }

    /*«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-*/
    /*                     8. GAS COMPARISON                      */
    /*-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»*/

    function test_Gas_DirectCall() public {
        uint256 gasBefore = gasleft();
        calc.add(100, 200);
        uint256 gasUsed = gasBefore - gasleft();
        console2.log("Gas direct call (add):", gasUsed);
    }

    function test_Gas_ViaDispatcher() public {
        MockCalc dispCalc = MockCalc(address(dispatcher));
        uint256 gasBefore = gasleft();
        dispCalc.add(100, 200);
        uint256 gasUsed = gasBefore - gasleft();
        console2.log("Gas via dispatcher (add):", gasUsed);
    }
}
