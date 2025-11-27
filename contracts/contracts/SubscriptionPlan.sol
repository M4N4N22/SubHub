// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title SubscriptionPlan
 * @dev Creator-owned subscription plan registry.
 * Stores price, frequency and metadata for each plan.
 *
 * NOTE:
 * - PaymentManager handles actual payments & subscription logic.
 * - This contract ONLY stores plan definitions.
 */
contract SubscriptionPlan {
    
    // ----------------------------
    // Data Structures
    // ----------------------------
    struct Plan {
        uint256 price;         // Price in Wei (MATIC or USDC decimals)
        uint256 frequency;     // Billing interval (in seconds)
        string metadataCID;    // IPFS/Arweave CID containing plan metadata
        bool active;           // Whether new subscribers can join
        address creator;       // Owner of the plan
    }

    // planId → Plan struct
    mapping(uint256 => Plan) private plans;

    // creator → list of planIds
    mapping(address => uint256[]) private creatorPlans;

    uint256 public nextPlanId = 1;

    // ----------------------------
    // Events
    // ----------------------------
    event PlanCreated(
        uint256 indexed planId,
        address indexed creator,
        uint256 price,
        uint256 frequency,
        string metadataCID
    );

    event PlanUpdated(
        uint256 indexed planId,
        uint256 price,
        uint256 frequency,
        string metadataCID
    );

    event PlanStatusChanged(
        uint256 indexed planId,
        bool active
    );

    // ----------------------------
    // Modifiers
    // ----------------------------
    modifier onlyPlanOwner(uint256 planId) {
        require(plans[planId].creator == msg.sender, "Not plan owner");
        _;
    }

    // ----------------------------
    // Write Functions
    // ----------------------------

    /**
     * @notice A creator registers a new subscription plan.
     */
    function createPlan(
        uint256 price,
        uint256 frequency,
        string calldata metadataCID
    ) external {
        require(price > 0, "Price required");
        require(frequency >= 1 days, "Minimum billing frequency: 1 day");
        require(bytes(metadataCID).length > 0, "CID required");

        uint256 planId = nextPlanId++;

        plans[planId] = Plan({
            price: price,
            frequency: frequency,
            metadataCID: metadataCID,
            active: true,
            creator: msg.sender
        });

        creatorPlans[msg.sender].push(planId);

        emit PlanCreated(planId, msg.sender, price, frequency, metadataCID);
    }

    /**
     * @notice Update plan’s price, frequency, or metadata.
     */
    function updatePlan(
        uint256 planId,
        uint256 price,
        uint256 frequency,
        string calldata metadataCID
    ) external onlyPlanOwner(planId) {
        require(price > 0, "Price required");
        require(frequency >= 1 days, "Min frequency: 1 day");
        require(bytes(metadataCID).length > 0, "CID required");

        Plan storage p = plans[planId];
        p.price = price;
        p.frequency = frequency;
        p.metadataCID = metadataCID;

        emit PlanUpdated(planId, price, frequency, metadataCID);
    }

    /**
     * @notice Toggle plan availability (pause or resume).
     */
    function setActive(uint256 planId, bool active)
        external
        onlyPlanOwner(planId)
    {
        plans[planId].active = active;
        emit PlanStatusChanged(planId, active);
    }

    // ----------------------------
    // Read Functions
    // ----------------------------

    function getCreatorPlans(address creator)
        external
        view
        returns (uint256[] memory)
    {
        return creatorPlans[creator];
    }

    function getPlan(uint256 planId)
        external
        view
        returns (Plan memory)
    {
        return plans[planId];
    }

    function isActive(uint256 planId) external view returns (bool) {
        return plans[planId].active;
    }

    function getPrice(uint256 planId) external view returns (uint256) {
        return plans[planId].price;
    }
}
