// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title SelectorLib
/// @notice Pure helper library for computing and extracting function selectors.
library SelectorLib {
    /*«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-*/
    /*                    SELECTOR COMPUTATION                    */
    /*-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»*/

    /// @notice Compute bytes4 selector from string signature.
    /// @param signature The function signature string (e.g. "transfer(address,uint256)").
    /// @return sel The 4-byte Keccak-256 function selector.
    function compute(string memory signature) internal pure returns (bytes4 sel) {
        return bytes4(keccak256(bytes(signature)));
    }

    /// @notice Compute bytes4 selector from bytes signature.
    /// @param signature The function signature as raw bytes.
    /// @return sel The 4-byte Keccak-256 function selector.
    function computeFromBytes(bytes memory signature) internal pure returns (bytes4 sel) {
        return bytes4(keccak256(signature));
    }

    /*«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-*/
    /*                    SELECTOR EXTRACTION                     */
    /*-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»*/

    /// @notice Extract selector from current msg.data.
    /// @return sel The 4-byte selector at the head of msg.data.
    function extractFromCalldata() internal pure returns (bytes4 sel) {
        require(msg.data.length >= 4, "SelectorLib: calldata too short");
        return bytes4(msg.data[:4]);
    }

    /// @notice Extract selector from calldata bytes.
    /// @param data The calldata byte slice to extract from.
    /// @return sel The 4-byte selector at index 0..4.
    function extractFromBytes(bytes calldata data) internal pure returns (bytes4 sel) {
        require(data.length >= 4, "SelectorLib: data too short");
        return bytes4(data[:4]);
    }

    /*«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-*/
    /*                    SELECTOR VALIDATION                     */
    /*-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»*/

    /// @notice Validate that signature matches expected selector.
    /// @param signature The function signature to verify.
    /// @param expected The expected bytes4 selector.
    /// @return valid True if keccak256(signature) matches expected.
    function validate(string memory signature, bytes4 expected) internal pure returns (bool valid) {
        return compute(signature) == expected;
    }

    /*«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-*/
    /*                      CALLDATA HELPERS                      */
    /*-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»*/

    /// @notice Pack selector and encoded args into calldata.
    /// @param selector The 4-byte function selector.
    /// @param args Encoded function parameters.
    /// @return data Packed calldata buffer.
    function buildCalldata(bytes4 selector, bytes memory args) internal pure returns (bytes memory data) {
        return abi.encodePacked(selector, args);
    }

    /// @notice Split calldata into selector and arguments.
    /// @param data The full calldata payload.
    /// @return sel The leading 4-byte selector.
    /// @return args The remaining payload arguments.
    function split(bytes calldata data) internal pure returns (bytes4 sel, bytes calldata args) {
        require(data.length >= 4, "SelectorLib: data too short");
        sel = bytes4(data[:4]);
        args = data[4:];
    }
}
