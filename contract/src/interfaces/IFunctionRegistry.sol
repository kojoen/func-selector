// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title IFunctionRegistry
/// @notice Registry interface for selector-to-implementation mappings.
interface IFunctionRegistry {
    /*«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-*/
    /*                           EVENTS                           */
    /*-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»*/

    event SelectorRegistered(bytes4 indexed selector, address indexed implementation, string signature);
    event SelectorRemoved(bytes4 indexed selector, address indexed oldImplementation);
    event SelectorReplaced(bytes4 indexed selector, address indexed oldImpl, address indexed newImpl);

    /*«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-*/
    /*                        CUSTOM ERRORS                       */
    /*-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»*/

    error SelectorAlreadyRegistered(bytes4 selector);
    error SelectorNotRegistered(bytes4 selector);
    error ZeroImplementation();
    error Unauthorized(address caller);
    error CalldataTooShort(uint256 size);
    error UnknownSelector(bytes4 selector);

    /*«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-*/
    /*                     REGISTRY MUTATIONS                     */
    /*-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»*/

    /// @notice Register a new selector mapping.
    function register(bytes4 selector, address implementation, string calldata signature) external;

    /// @notice Replace implementation for an existing selector.
    function replace(bytes4 selector, address newImplementation) external;

    /// @notice Remove a selector mapping.
    function remove(bytes4 selector) external;

    /*«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-*/
    /*                       REGISTRY READS                       */
    /*-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»*/

    /// @notice Get implementation address for a selector.
    function getImplementation(bytes4 selector) external view returns (address implementation);

    /// @notice Check if selector is registered.
    function isRegistered(bytes4 selector) external view returns (bool registered);

    /// @notice Get canonical signature for a selector.
    function getSignature(bytes4 selector) external view returns (string memory sig);

    /// @notice Get all active selectors.
    function getAllSelectors() external view returns (bytes4[] memory selectors);
}
