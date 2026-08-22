// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IFunctionRegistry} from "./interfaces/IFunctionRegistry.sol";

/// @title FunctionRegistry
/// @notice Maps function selectors (bytes4) to implementation addresses.
contract FunctionRegistry is IFunctionRegistry {
    /*«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-*/
    /*                            STATE                           */
    /*-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»*/

    /// @notice Owner address with mutation permissions.
    address public immutable owner;

    /// @dev Selector to implementation address.
    mapping(bytes4 => address) private _implementations;

    /// @dev Selector to signature string.
    mapping(bytes4 => string) private _signatures;

    /// @dev Enumerable array of active selectors.
    bytes4[] private _selectors;

    /// @dev Selector to index in array for O(1) removal.
    mapping(bytes4 => uint256) private _selectorIndex;

    /// @dev Selector registration status flag.
    mapping(bytes4 => bool) private _registered;

    /*«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-*/
    /*                         CONSTRUCTOR                        */
    /*-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»*/

    constructor(address _owner) {
        require(_owner != address(0), "owner cannot be zero");
        owner = _owner;
    }

    /*«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-*/
    /*                       ACCESS CONTROL                       */
    /*-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»*/

    modifier onlyOwner() {
        if (msg.sender != owner) revert Unauthorized(msg.sender);
        _;
    }

    /*«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-*/
    /*                     REGISTRY MUTATIONS                     */
    /*-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»*/

    /// @inheritdoc IFunctionRegistry
    function register(bytes4 selector, address implementation, string calldata signature) external onlyOwner {
        if (implementation == address(0)) revert ZeroImplementation();
        if (_registered[selector]) revert SelectorAlreadyRegistered(selector);

        _implementations[selector] = implementation;
        _signatures[selector] = signature;
        _registered[selector] = true;

        _selectorIndex[selector] = _selectors.length;
        _selectors.push(selector);

        emit SelectorRegistered(selector, implementation, signature);
    }

    /// @inheritdoc IFunctionRegistry
    function replace(bytes4 selector, address newImplementation) external onlyOwner {
        if (newImplementation == address(0)) revert ZeroImplementation();
        if (!_registered[selector]) revert SelectorNotRegistered(selector);

        address oldImpl = _implementations[selector];
        _implementations[selector] = newImplementation;

        emit SelectorReplaced(selector, oldImpl, newImplementation);
    }

    /// @inheritdoc IFunctionRegistry
    function remove(bytes4 selector) external onlyOwner {
        if (!_registered[selector]) revert SelectorNotRegistered(selector);

        address oldImpl = _implementations[selector];

        uint256 idx = _selectorIndex[selector];
        uint256 lastIdx = _selectors.length - 1;

        if (idx != lastIdx) {
            bytes4 lastSelector = _selectors[lastIdx];
            _selectors[idx] = lastSelector;
            _selectorIndex[lastSelector] = idx;
        }

        _selectors.pop();

        delete _implementations[selector];
        delete _signatures[selector];
        delete _selectorIndex[selector];
        delete _registered[selector];

        emit SelectorRemoved(selector, oldImpl);
    }

    /*«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-*/
    /*                       REGISTRY READS                       */
    /*-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»*/

    /// @inheritdoc IFunctionRegistry
    function getImplementation(bytes4 selector) external view returns (address implementation) {
        return _implementations[selector];
    }

    /// @inheritdoc IFunctionRegistry
    function isRegistered(bytes4 selector) external view returns (bool registered) {
        return _registered[selector];
    }

    /// @inheritdoc IFunctionRegistry
    function getSignature(bytes4 selector) external view returns (string memory sig) {
        return _signatures[selector];
    }

    /// @inheritdoc IFunctionRegistry
    function getAllSelectors() external view returns (bytes4[] memory selectors) {
        return _selectors;
    }
}
