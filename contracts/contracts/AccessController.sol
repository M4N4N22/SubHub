// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IPaymentManager {
    function hasActiveAccess(address user, uint256 planId)
        external
        view
        returns (bool);
}

contract AccessController {
    IPaymentManager public paymentManager;

    constructor(address paymentManagerAddr) {
        paymentManager = IPaymentManager(paymentManagerAddr);
    }

    /// @notice Canonical access check via on-chain payments
    function canAccess(
        address user,
        uint256 planId
    ) external view returns (bool) {
        return paymentManager.hasActiveAccess(user, planId);
    }

    /// @notice ZK-compatible access check (proof optional)
    /// @dev Proof verification can be added without touching PaymentManager
    function canAccessWithProof(
        address user,
        uint256 planId,
        bytes calldata /* proof */
    ) external view returns (bool) {
        // For now, fallback to direct payment check
        // Future: verify proof here (Polygon ID / ZK verifier)
        return paymentManager.hasActiveAccess(user, planId);
    }
}
