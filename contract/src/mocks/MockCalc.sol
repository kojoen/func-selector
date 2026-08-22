// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title MockCalc
/// @notice Arithmetic contract used as a dispatcher implementation target.
contract MockCalc {
    /*«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-*/
    /*                        CUSTOM ERRORS                       */
    /*-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»*/

    error DivisionByZero();

    /*«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-*/
    /*                         FUNCTIONS                          */
    /*-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»*/

    function add(uint256 a, uint256 b) external pure returns (uint256 result) {
        return a + b;
    }

    function sub(uint256 a, uint256 b) external pure returns (uint256 result) {
        return a - b;
    }

    function mul(uint256 a, uint256 b) external pure returns (uint256 result) {
        return a * b;
    }

    function div(uint256 a, uint256 b) external pure returns (uint256 result) {
        if (b == 0) revert DivisionByZero();
        return a / b;
    }

    function mod(uint256 a, uint256 b) external pure returns (uint256 result) {
        if (b == 0) revert DivisionByZero();
        return a % b;
    }
}
