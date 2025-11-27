// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./PaymentManager.sol";
import "./MembershipNFT.sol";

/**
 * @title ContentGating
 * @dev Gated content layer supporting subscription plans + NFT memberships.
 */
contract ContentGating {
    PaymentManager public paymentManager;
    MembershipNFT public membershipNFT;

    constructor(address paymentManagerAddr, address membershipNFTAddr) {
        paymentManager = PaymentManager(paymentManagerAddr);
        membershipNFT = MembershipNFT(membershipNFTAddr);
    }

    enum GateType {
        PUBLIC,             // 0 - open to everyone
        SUBSCRIPTION,        // 1 - requires active subscription
        NFT_ANY,             // 2 - requires any membership NFT
        NFT_TIER,            // 3 - requires specific tier
        SUB_OR_NFT           // 4 - either subscription or NFT
    }

    struct Content {
        address creator;
        uint256 planId;       // subscription plan
        uint256 tierId;       // required NFT tier (if any)
        GateType gate;        // gating mode
        string contentCID;    // IPFS/Arweave
        uint256 timestamp;
    }

    mapping(uint256 => Content) public contents;
    mapping(address => uint256[]) public creatorPosts;

    uint256 public nextContentId = 1;

    event ContentPosted(
        uint256 indexed contentId,
        address indexed creator,
        GateType gate,
        uint256 planId,
        uint256 tierId
    );

    // ---------------- WRITE ----------------

    function postContent(
        GateType gate,
        uint256 planId,
        uint256 tierId,
        string calldata cid
    ) external {
        require(bytes(cid).length > 0, "CID required");

        // Validate gating logic
        if (gate == GateType.SUBSCRIPTION) {
            require(planId > 0, "Plan ID required");
        }
        if (gate == GateType.NFT_TIER) {
            require(tierId > 0, "Tier ID required");
        }

        uint256 id = nextContentId++;

        contents[id] = Content({
            creator: msg.sender,
            planId: planId,
            tierId: tierId,
            gate: gate,
            contentCID: cid,
            timestamp: block.timestamp
        });

        creatorPosts[msg.sender].push(id);

        emit ContentPosted(id, msg.sender, gate, planId, tierId);
    }

    // ---------------- ACCESS LOGIC ----------------

    function canAccess(address user, uint256 contentId) public view returns (bool) {
        Content memory c = contents[contentId];

        if (c.gate == GateType.PUBLIC) {
            return true;
        }

        bool subscribed = false;
        if (c.planId > 0) {
            subscribed = paymentManager.isSubscribed(user, c.planId);
        }

        bool ownsNFT = membershipNFT.balanceOf(user) > 0;

        bool ownsTier = false;
        if (c.tierId > 0) {
            // Check if user owns NFT from required tier
            uint256 balance = membershipNFT.balanceOf(user);
            for (uint256 i = 0; i < balance; i++) {
                uint256 tokenId = membershipNFT.tokenOfOwnerByIndex(user, i);
                if (membershipNFT.getTokenTier(tokenId) == c.tierId) {
                    ownsTier = true;
                    break;
                }
            }
        }

        if (c.gate == GateType.SUBSCRIPTION) return subscribed;
        if (c.gate == GateType.NFT_ANY) return ownsNFT;
        if (c.gate == GateType.NFT_TIER) return ownsTier;
        if (c.gate == GateType.SUB_OR_NFT) return subscribed || ownsNFT;

        return false;
    }

    // ---------------- READ ----------------

    function getContent(uint256 id) external view returns (Content memory) {
        return contents[id];
    }

    function getCreatorPosts(address creator) external view returns (uint256[] memory) {
        return creatorPosts[creator];
    }
}
