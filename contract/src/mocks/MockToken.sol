// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title MockToken
/// @notice Minimal ERC20-like contract for multi-implementation routing tests.
contract MockToken {
    /*«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-*/
    /*                           EVENTS                           */
    /*-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»*/

    event Transfer(address indexed from, address indexed to, uint256 amount);
    event Mint(address indexed to, uint256 amount);

    /*«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-*/
    /*                        CUSTOM ERRORS                       */
    /*-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»*/

    error InsufficientBalance(address from, uint256 balance, uint256 requested);
    error InvalidAddress();

    /*«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-*/
    /*                            STATE                           */
    /*-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»*/

    mapping(address => uint256) public balanceOf;
    uint256 public totalSupply;

    /*«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-*/
    /*                         FUNCTIONS                          */
    /*-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»*/

    function transfer(address to, uint256 amount) external returns (bool success) {
        if (to == address(0)) revert InvalidAddress();
        uint256 senderBalance = balanceOf[msg.sender];
        if (senderBalance < amount) {
            revert InsufficientBalance(msg.sender, senderBalance, amount);
        }

        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;

        emit Transfer(msg.sender, to, amount);
        return true;
    }

    function mint(address to, uint256 amount) external {
        if (to == address(0)) revert InvalidAddress();
        balanceOf[to] += amount;
        totalSupply += amount;
        emit Mint(to, amount);
    }
}
