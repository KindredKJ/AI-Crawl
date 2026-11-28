// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable2Step} from "@openzeppelin/contracts/access/Ownable2Step.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @notice Fixed-supply test economy token. Tax policy is immutable and auditable.
contract MerkToken is ERC20, Ownable2Step {
    uint256 public constant TOTAL_SUPPLY = 1_000_000_000 ether;
    uint16 public constant TREASURY_TAX_BPS = 200;
    uint16 public constant BURN_TAX_BPS = 100;
    uint16 private constant BPS = 10_000;

    address public immutable treasury;

    error ZeroAddress();

    constructor(address initialOwner, address treasury_) ERC20("Merk", "MERK") Ownable(initialOwner) {
        if (initialOwner == address(0) || treasury_ == address(0)) revert ZeroAddress();
        treasury = treasury_;
        _mint(initialOwner, TOTAL_SUPPLY);
    }

    /// @dev Applying the fee in _update covers transfer and transferFrom uniformly.
    function _update(address from, address to, uint256 value) internal override {
        if (from == address(0) || to == address(0) || value == 0) {
            super._update(from, to, value);
            return;
        }

        uint256 treasuryAmount = (value * TREASURY_TAX_BPS) / BPS;
        uint256 burnAmount = (value * BURN_TAX_BPS) / BPS;
        super._update(from, treasury, treasuryAmount);
        super._update(from, address(0), burnAmount);
        super._update(from, to, value - treasuryAmount - burnAmount);
    }
}
