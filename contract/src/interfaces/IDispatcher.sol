// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title IDispatcher
/// @notice Dispatcher interface for routing calldata by function selector.
interface IDispatcher {
    /*«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-*/
    /*                          FUNCTIONS                         */
    /*-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»*/

    /// @notice Routes call based on selector in calldata.
    fallback() external payable;

    /// @notice Accepts plain ETH transfers.
    receive() external payable;
}
