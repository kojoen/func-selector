// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title SelectorLib
/// @notice Pure helper library for computing and extracting function selectors.
library SelectorLib {
    /*«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-*/
    /*                    SELECTOR COMPUTATION                    */
    /*-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»*/

    /// @notice Compute bytes4 selector from string signature.
    function compute(string memory signature) internal pure returns (bytes4 sel) {
        return bytes4(keccak256(bytes(signature)));
    }

    /// @notice Compute bytes4 selector from bytes signature.
    function computeFromBytes(bytes memory signature) internal pure returns (bytes4 sel) {
        return bytes4(keccak256(signature));
    }

    /*«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-*/
    /*                    SELECTOR EXTRACTION                     */
    /*-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»*/

    /// @notice Extract selector from current msg.data.
    function extractFromCalldata() internal pure returns (bytes4 sel) {
        require(msg.data.length >= 4, "SelectorLib: calldata too short");
        return bytes4(msg.data[:4]);
    }

    /// @notice Extract selector from calldata bytes.
    function extractFromBytes(bytes calldata data) internal pure returns (bytes4 sel) {
        require(data.length >= 4, "SelectorLib: data too short");
        return bytes4(data[:4]);
    }

    /*«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-*/
    /*                    SELECTOR VALIDATION                     */
    /*-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»*/

    /// @notice Validate that signature matches expected selector.
    function validate(string memory signature, bytes4 expected) internal pure returns (bool valid) {
        return compute(signature) == expected;
    }

    /*«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-*/
    /*                      CALLDATA HELPERS                      */
    /*-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»*/

    /// @notice Pack selector and encoded args into calldata.
    function buildCalldata(bytes4 selector, bytes memory args) internal pure returns (bytes memory data) {
        return abi.encodePacked(selector, args);
    }

    /// @notice Split calldata into selector and arguments.
    function split(bytes calldata data) internal pure returns (bytes4 sel, bytes calldata args) {
        require(data.length >= 4, "SelectorLib: data too short");
        sel = bytes4(data[:4]);
        args = data[4:];
    }
}
