// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ERC1155} from "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import {Ownable2Step} from "@openzeppelin/contracts/access/Ownable2Step.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract MerkDungeon is ERC1155, Ownable2Step, Pausable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    struct Floor {
        uint128 entryFee;
        bool enabled;
        string contentUri;
    }

    IERC20 public immutable merk;
    address public immutable treasury;
    mapping(uint256 floorId => Floor floor) private floors;
    mapping(address player => uint256 floorId) public playerFloor;

    event FloorConfigured(uint256 indexed floorId, uint256 entryFee, bool enabled, string contentUri);
    event FloorEntered(
        address indexed player,
        uint256 indexed floorId,
        uint256 requestedFee,
        uint256 receivedFee,
        bytes32 indexed commandId
    );
    event LootDropped(address indexed player, uint256 indexed itemId, uint256 amount, bytes32 indexed commandId);

    error FloorUnavailable(uint256 floorId);
    error InvalidConfiguration();
    error DuplicateCommand(bytes32 commandId);
    error ZeroAddress();

    mapping(bytes32 commandId => bool processed) public processedCommands;

    constructor(address initialOwner, address merk_, address treasury_)
        ERC1155("")
        Ownable(initialOwner)
    {
        if (initialOwner == address(0) || merk_ == address(0) || treasury_ == address(0)) revert ZeroAddress();
        merk = IERC20(merk_);
        treasury = treasury_;
    }

    function configureFloor(uint256 floorId, uint128 entryFee, bool enabled, string calldata contentUri)
        external
        onlyOwner
    {
        if (floorId == 0 || bytes(contentUri).length == 0) revert InvalidConfiguration();
        floors[floorId] = Floor(entryFee, enabled, contentUri);
        emit FloorConfigured(floorId, entryFee, enabled, contentUri);
    }

    function floor(uint256 floorId) external view returns (Floor memory) {
        return floors[floorId];
    }

    function enterFloor(uint256 floorId, bytes32 commandId) external nonReentrant whenNotPaused {
        Floor storage selected = floors[floorId];
        if (!selected.enabled) revert FloorUnavailable(floorId);
        _consumeCommand(keccak256(abi.encode("ENTER_FLOOR", msg.sender, commandId)), commandId);

        uint256 beforeBalance = merk.balanceOf(treasury);
        merk.safeTransferFrom(msg.sender, treasury, selected.entryFee);
        uint256 received = merk.balanceOf(treasury) - beforeBalance;
        playerFloor[msg.sender] = floorId;
        emit FloorEntered(msg.sender, floorId, selected.entryFee, received, commandId);
    }

    function dropLoot(address to, uint256 itemId, uint256 amount, bytes32 commandId) external onlyOwner whenNotPaused {
        if (to == address(0) || amount == 0) revert InvalidConfiguration();
        _consumeCommand(keccak256(abi.encode("DROP_LOOT", to, commandId)), commandId);
        _mint(to, itemId, amount, "");
        emit LootDropped(to, itemId, amount, commandId);
    }

    function uri(uint256 itemId) public view override returns (string memory) {
        return floors[itemId].contentUri;
    }

    function pause() external onlyOwner { _pause(); }
    function unpause() external onlyOwner { _unpause(); }

    // Registry keys include operation and actor so public entry cannot consume
    // a privileged loot command ID. The raw command ID remains in events.
    function _consumeCommand(bytes32 scopedKey, bytes32 commandId) private {
        if (commandId == bytes32(0)) revert InvalidConfiguration();
        if (processedCommands[scopedKey]) revert DuplicateCommand(commandId);
        processedCommands[scopedKey] = true;
    }
}
