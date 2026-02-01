// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./SubscriptionPlan.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title PaymentManager
 * @dev Handles subscription payments in MATIC and USDC
 * Acts as a payment rail that produces access rights
 */
contract PaymentManager is ReentrancyGuard {
    SubscriptionPlan public planContract;
    IERC20 public usdc;

    // ----------------------------------------
    // Structs
    // ----------------------------------------
    struct SubscriptionInfo {
        uint256 expiry;
        uint256 lastPaid;
        bool usingUSDC;
    }

    // user -> planId -> details
    mapping(address => mapping(uint256 => SubscriptionInfo)) public subscriptions;

    // Earnings
    mapping(address => uint256) public maticBalance;
    mapping(address => uint256) public usdcBalance;

    // ----------------------------------------
    // Subscriber Tracking
    // ----------------------------------------
    mapping(uint256 => address[]) private planSubscribers;
    mapping(uint256 => mapping(address => bool)) private hasSubscribedBefore;
    mapping(uint256 => mapping(address => uint256)) private joinTimestamp;

    // ----------------------------------------
    // User Dashboard Tracking
    // ----------------------------------------
    mapping(address => uint256[]) private userSubscribedPlans;
    mapping(address => mapping(uint256 => bool)) private userPlanAdded;

    // ----------------------------------------
    // Events
    // ----------------------------------------
    event Subscribed(
        address indexed user,
        uint256 indexed planId,
        uint256 expiry,
        bool isUSDC
    );

    /// @dev Core payment → access signal
    event AccessGranted(
        address indexed user,
        uint256 indexed planId,
        uint256 expiry,
        address paymentToken
    );

    event EarningsWithdrawnMATIC(address indexed creator, uint256 amount);
    event EarningsWithdrawnUSDC(address indexed creator, uint256 amount);

    // ----------------------------------------
    // Constructor
    // ----------------------------------------
    constructor(address planContractAddr, address usdcAddress) {
        planContract = SubscriptionPlan(planContractAddr);
        usdc = IERC20(usdcAddress);
    }

    // ----------------------------------------
    // INTERNAL: Track subscriber
    // ----------------------------------------
    function _trackSubscriber(uint256 planId, address user) internal {
        if (!hasSubscribedBefore[planId][user]) {
            hasSubscribedBefore[planId][user] = true;
            planSubscribers[planId].push(user);
            joinTimestamp[planId][user] = block.timestamp;
        }

        if (!userPlanAdded[user][planId]) {
            userPlanAdded[user][planId] = true;
            userSubscribedPlans[user].push(planId);
        }
    }

    // ----------------------------------------
    // Subscription: MATIC
    // ----------------------------------------
    function subscribeMATIC(uint256 planId) external payable nonReentrant {
        SubscriptionPlan.Plan memory plan = planContract.getPlan(planId);

        require(plan.active, "Plan inactive");
        require(msg.value == plan.price, "Incorrect MATIC amount");

        SubscriptionInfo storage sub = subscriptions[msg.sender][planId];

        uint256 newExpiry = block.timestamp > sub.expiry
            ? block.timestamp + plan.frequency
            : sub.expiry + plan.frequency;

        sub.expiry = newExpiry;
        sub.lastPaid = block.timestamp;
        sub.usingUSDC = false;

        _trackSubscriber(planId, msg.sender);

        maticBalance[plan.creator] += msg.value;

        emit Subscribed(msg.sender, planId, newExpiry, false);
        emit AccessGranted(msg.sender, planId, newExpiry, address(0));
    }

    // ----------------------------------------
    // Subscription: USDC (PRIMARY STABLECOIN RAIL)
    // ----------------------------------------
    function subscribeUSDC(uint256 planId) external nonReentrant {
        SubscriptionPlan.Plan memory plan = planContract.getPlan(planId);
        require(plan.active, "Plan inactive");

        require(
            usdc.transferFrom(msg.sender, address(this), plan.price),
            "USDC payment failed"
        );

        SubscriptionInfo storage sub = subscriptions[msg.sender][planId];

        uint256 newExpiry = block.timestamp > sub.expiry
            ? block.timestamp + plan.frequency
            : sub.expiry + plan.frequency;

        sub.expiry = newExpiry;
        sub.lastPaid = block.timestamp;
        sub.usingUSDC = true;

        _trackSubscriber(planId, msg.sender);

        usdcBalance[plan.creator] += plan.price;

        emit Subscribed(msg.sender, planId, newExpiry, true);
        emit AccessGranted(msg.sender, planId, newExpiry, address(usdc));
    }

    // ----------------------------------------
    // Withdraw Earnings
    // ----------------------------------------
    function withdrawMATIC() external nonReentrant {
        uint256 amount = maticBalance[msg.sender];
        require(amount > 0, "No MATIC");

        maticBalance[msg.sender] = 0;
        payable(msg.sender).transfer(amount);

        emit EarningsWithdrawnMATIC(msg.sender, amount);
    }

    function withdrawUSDC() external nonReentrant {
        uint256 amount = usdcBalance[msg.sender];
        require(amount > 0, "No USDC");

        usdcBalance[msg.sender] = 0;
        require(usdc.transfer(msg.sender, amount), "USDC transfer failed");

        emit EarningsWithdrawnUSDC(msg.sender, amount);
    }

    // ----------------------------------------
    // Access Primitives (INFRA)
    // ----------------------------------------

    /// @notice Canonical access check for apps, APIs, agents
    function hasActiveAccess(
        address user,
        uint256 planId
    ) public view returns (bool) {
        return subscriptions[user][planId].expiry >= block.timestamp;
    }

    /// @notice Machine-readable payment condition
    function getPaymentCondition(uint256 planId)
        external
        view
        returns (
            address paymentToken,
            uint256 amount,
            uint256 frequency
        )
    {
        SubscriptionPlan.Plan memory plan = planContract.getPlan(planId);
        return (address(usdc), plan.price, plan.frequency);
    }

    // ----------------------------------------
    // Existing Views (unchanged)
    // ----------------------------------------
    function isSubscribed(address user, uint256 planId)
        external
        view
        returns (bool)
    {
        return hasActiveAccess(user, planId);
    }

    function subscriptionExpiry(address user, uint256 planId)
        external
        view
        returns (uint256)
    {
        return subscriptions[user][planId].expiry;
    }

    function getSubscribers(uint256 planId)
        external
        view
        returns (address[] memory)
    {
        return planSubscribers[planId];
    }

    function getSubscriberJoinTime(uint256 planId, address user)
        external
        view
        returns (uint256)
    {
        return joinTimestamp[planId][user];
    }

    function getUserSubscribedPlans(address user)
        external
        view
        returns (uint256[] memory)
    {
        return userSubscribedPlans[user];
    }
}
