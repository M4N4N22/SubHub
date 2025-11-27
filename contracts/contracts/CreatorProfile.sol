// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title CreatorProfile
 * @dev Stores creator profiles on-chain backed by an IPFS/Arweave CID.
 * Used by SubHub to handle creator identity + discovery.
 */
contract CreatorProfile {
    // -------------------------------
    // Storage
    // -------------------------------
    
    mapping(address => string) private profileCID;

    // Track creator list for discovery
    address[] private creatorList;
    mapping(address => bool) private isCreatorRegistered;

    // -------------------------------
    // Events
    // -------------------------------
    event ProfileUpdated(address indexed creator, string cid);
    event CreatorRegistered(address indexed creator);

    // -------------------------------
    // Public Write Functions
    // -------------------------------

    /**
     * @notice Create or update your creator profile.
     * @param cid IPFS/Arweave CID string containing metadata JSON.
     */
    function setCreatorProfile(string memory cid) external {
        require(bytes(cid).length > 0, "CID required");

        // Register creator if first time
        if (!isCreatorRegistered[msg.sender]) {
            creatorList.push(msg.sender);
            isCreatorRegistered[msg.sender] = true;

            emit CreatorRegistered(msg.sender);
        }

        profileCID[msg.sender] = cid;

        emit ProfileUpdated(msg.sender, cid);
    }

    // -------------------------------
    // Public Read Functions
    // -------------------------------

    /**
     * @notice Get profile CID for a creator.
     */
    function getCreatorProfile(address creator) external view returns (string memory) {
        return profileCID[creator];
    }

    /**
     * @notice Total number of creators.
     */
    function getCreatorCount() external view returns (uint256) {
        return creatorList.length;
    }

    /**
     * @notice Fetch creator address by index (for pagination).
     */
    function getCreatorByIndex(uint256 index) external view returns (address) {
        require(index < creatorList.length, "Index out of bounds");
        return creatorList[index];
    }

    /**
     * @notice Get full list (not recommended for very large lists)
     * Use getCreatorCount + getCreatorByIndex for pagination in production.
     */
    function getAllCreators() external view returns (address[] memory) {
        return creatorList;
    }
}
