// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IFunctionRegistry} from "./interfaces/IFunctionRegistry.sol";
import {FunctionRegistry} from "./FunctionRegistry.sol";

/// @title FunctionDispatcher
/// @notice Routes calldata directly to target implementation by function selector.
contract FunctionDispatcher {
    /*«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-*/
    /*                            STATE                           */
    /*-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»*/

    /// @notice Selector registry address.
    FunctionRegistry public immutable registry;

    /*«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-*/
    /*                        CUSTOM ERRORS                       */
    /*-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»*/

    error CalldataTooShort(uint256 size);
    error UnknownSelector(bytes4 selector);
    error ZeroImplementation(bytes4 selector);

    /*«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-*/
    /*                         CONSTRUCTOR                        */
    /*-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»*/

    constructor(address _registry) {
        require(_registry != address(0), "registry cannot be zero");
        registry = FunctionRegistry(_registry);
    }

    /*«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-*/
    /*                      DISPATCHER CORE                       */
    /*-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»*/

    /// @notice Routes calls by selector and bubbles return/revert data.
    fallback() external payable {
        if (msg.data.length < 4) {
            revert CalldataTooShort(msg.data.length);
        }

        bytes4 sel = msg.sig;
        address impl = registry.getImplementation(sel);

        if (impl == address(0)) {
            if (!registry.isRegistered(sel)) {
                revert UnknownSelector(sel);
            }
            revert ZeroImplementation(sel);
        }

        assembly {
            calldatacopy(0, 0, calldatasize())
            let success := delegatecall(gas(), impl, 0, calldatasize(), 0, 0)
            returndatacopy(0, 0, returndatasize())

            switch success
            case 0 { revert(0, returndatasize()) }
            default { return(0, returndatasize()) }
        }
    }

    /// @notice Accepts plain ETH transfers.
    receive() external payable {}
}
