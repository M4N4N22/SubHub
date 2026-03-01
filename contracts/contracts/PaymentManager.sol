// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./SubscriptionPlan.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Permit.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface IPermit2 {
    function permitTransferFrom(
        PermitTransferFrom calldata permit,
        SignatureTransferDetails calldata transferDetails,
        address owner,
        bytes calldata signature
    ) external;

    struct PermitTransferFrom {
        TokenPermissions permitted;
        uint256 nonce;
        uint256 deadline;
    }

    struct TokenPermissions {
        address token;
        uint256 amount;
    }

    struct SignatureTransferDetails {
        address to;
        uint256 requestedAmount;
    }
}

contract PaymentManager is ReentrancyGuard {
    SubscriptionPlan public planContract;
    IERC20 public usdc;
    IPermit2 public permit2;

    struct SubscriptionInfo {
        uint256 expiry;
        uint256 lastPaid;
        bool usingUSDC;
    }

    mapping(address => mapping(uint256 => SubscriptionInfo))
        public subscriptions;

    mapping(address => uint256) public maticBalance;
    mapping(address => uint256) public usdcBalance;

    mapping(uint256 => address[]) private planSubscribers;
    mapping(uint256 => mapping(address => bool)) private hasSubscribedBefore;
    mapping(uint256 => mapping(address => uint256)) private joinTimestamp;

    mapping(address => uint256[]) private userSubscribedPlans;
    mapping(address => mapping(uint256 => bool)) private userPlanAdded;

    event Subscribed(
        address indexed user,
        uint256 indexed planId,
        uint256 expiry,
        bool isUSDC
    );

    event AccessGranted(
        address indexed user,
        uint256 indexed planId,
        uint256 expiry,
        address paymentToken
    );

    event EarningsWithdrawnUSDC(address indexed creator, uint256 amount);
    event EarningsWithdrawnMATIC(address indexed creator, uint256 amount);

    constructor(
        address planContractAddr,
        address usdcAddress,
        address permit2Address
    ) {
        planContract = SubscriptionPlan(planContractAddr);
        usdc = IERC20(usdcAddress);
        permit2 = IPermit2(permit2Address);
    }

    // =========================================================
    // INTERNAL CORE LOGIC
    // =========================================================

    function _validatePlan(
        uint256 planId
    ) internal view returns (SubscriptionPlan.Plan memory) {
        SubscriptionPlan.Plan memory plan = planContract.getPlan(planId);

        require(plan.active, "Plan inactive");
        require(plan.price > 0, "Invalid price");
        require(plan.frequency > 0, "Invalid frequency");

        return plan;
    }

    function _applySubscription(
        address payer,
        address beneficiary,
        uint256 planId,
        SubscriptionPlan.Plan memory plan
    ) internal {
        require(
            usdc.transferFrom(payer, address(this), plan.price),
            "USDC payment failed"
        );

        SubscriptionInfo storage sub = subscriptions[beneficiary][planId];

        uint256 newExpiry = block.timestamp > sub.expiry
            ? block.timestamp + plan.frequency
            : sub.expiry + plan.frequency;

        sub.expiry = newExpiry;
        sub.lastPaid = block.timestamp;
        sub.usingUSDC = true;

        _trackSubscriber(planId, beneficiary);

        usdcBalance[plan.creator] += plan.price;

        emit Subscribed(beneficiary, planId, newExpiry, true);
        emit AccessGranted(beneficiary, planId, newExpiry, address(usdc));
    }

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

    // =========================================================
    // STANDARD SUBSCRIBE (2 TX FLOW)
    // =========================================================

    function subscribeUSDC(uint256 planId) external nonReentrant {
        SubscriptionPlan.Plan memory plan = _validatePlan(planId);
        _applySubscription(msg.sender, msg.sender, planId, plan);
    }

    // =========================================================
    // SUBSCRIBE FOR (AGENT / TREASURY SUPPORT)
    // =========================================================

    function subscribeFor(address user, uint256 planId) external nonReentrant {
        require(user != address(0), "Invalid user");

        SubscriptionPlan.Plan memory plan = _validatePlan(planId);
        _applySubscription(msg.sender, user, planId, plan);
    }

    // =========================================================
    // PERMIT-BASED GAS-OPTIMIZED SUBSCRIPTION (1 TX FLOW)
    // =========================================================

    function subscribeWithPermit2(
        uint256 planId,
        IPermit2.PermitTransferFrom calldata permit,
        IPermit2.SignatureTransferDetails calldata transferDetails,
        bytes calldata signature
    ) external nonReentrant {
        SubscriptionPlan.Plan memory plan = _validatePlan(planId);

        require(permit.permitted.token == address(usdc), "Invalid token");

        require(
            permit.permitted.amount == plan.price,
            "Incorrect permit amount"
        );

        require(
            transferDetails.requestedAmount == plan.price,
            "Invalid requested amount"
        );

        // Pull tokens using Permit2
        permit2.permitTransferFrom(
            permit,
            transferDetails,
            msg.sender,
            signature
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

    // =========================================================
    // ACCESS PRIMITIVES
    // =========================================================

    function hasActiveAccess(
        address user,
        uint256 planId
    ) public view returns (bool) {
        return subscriptions[user][planId].expiry >= block.timestamp;
    }

    function subscriptionExpiry(
        address user,
        uint256 planId
    ) external view returns (uint256) {
        return subscriptions[user][planId].expiry;
    }

    function getPaymentCondition(
        uint256 planId
    )
        external
        view
        returns (address paymentToken, uint256 amount, uint256 frequency)
    {
        SubscriptionPlan.Plan memory plan = planContract.getPlan(planId);
        return (address(usdc), plan.price, plan.frequency);
    }

    // =========================================================
    // WITHDRAWALS
    // =========================================================

    function withdrawUSDC() external nonReentrant {
        uint256 amount = usdcBalance[msg.sender];
        require(amount > 0, "No USDC");

        usdcBalance[msg.sender] = 0;
        require(usdc.transfer(msg.sender, amount), "Transfer failed");

        emit EarningsWithdrawnUSDC(msg.sender, amount);
    }

    function withdrawMATIC() external nonReentrant {
        uint256 amount = maticBalance[msg.sender];
        require(amount > 0, "No MATIC");

        maticBalance[msg.sender] = 0;
        payable(msg.sender).transfer(amount);

        emit EarningsWithdrawnMATIC(msg.sender, amount);
    }

    // ----------------------------------------
    // Existing Views (unchanged)
    // ----------------------------------------
    function isSubscribed(
        address user,
        uint256 planId
    ) external view returns (bool) {
        return hasActiveAccess(user, planId);
    }

    function getSubscribers(
        uint256 planId
    ) external view returns (address[] memory) {
        return planSubscribers[planId];
    }

    function getSubscriberJoinTime(
        uint256 planId,
        address user
    ) external view returns (uint256) {
        return joinTimestamp[planId][user];
    }

    function getUserSubscribedPlans(
        address user
    ) external view returns (uint256[] memory) {
        return userSubscribedPlans[user];
    }
}
