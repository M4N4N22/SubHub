# SubHub

SubHub is a Polygon-native protocol for programmable payments and payment-gated access. It treats USDC stablecoin payments as the primary onchain money rail, deriving access rights directly from verified payment state—without custodians, backend auth servers, or off-chain entitlements.

## Overview

SubHub provides onchain primitives for payment-derived access control:

**USDC-first Payment Rails**: Stablecoins as the default payment primitive with MATIC fallback for Polygon-native money infrastructure.

**Payments as State**: Subscriptions tracked as durable onchain state (subscriptions[user][planId].expiry >= block.timestamp), not transient events.

**Payment-Derived Access**: Access rights verified purely from PaymentManager state with zero backend auth, sessions, or cookies.

**Non-Custodial Payouts**: Direct creator withdrawals with no escrow, no custody, no delays.

**General-Purpose Primitive**: Reusable across creators, SaaS, APIs, communities, and gated digital services—not just creator monetization.

**Instant Finality**: Polygon PoS settlement enables immediate unlock UX with low fees and high throughput.

## Features

### Creator/Service Provider Features

- Create onchain creator profiles
- Launch subscription plans (USDC-denominated recurring payments)
- Publish gated content with payment-derived access control
- Issue ERC-721 membership NFTs (transferable, resellable access tokens)
- Withdraw earnings directly in USDC or MATIC (no custody)
- Track subscribers and earnings via onchain state reads

### Subscriber/User Features

- Subscribe using USDC (primary) or MATIC (fallback)
- Unlock gated content instantly via payment verification
- Hold, transfer, or resell membership NFTs
- Manage subscriptions with zero off-chain auth
- Access across any protocol consuming SubHub's payment primitives

## Tech Stack

### Frontend

- Next.js (App Router)
- TypeScript
- Wagmi / Viem (1:1 contract call mappings)
- RainbowKit
- Shadcn/UI
- Tailwind CSS

### Smart Contracts

- Solidity
- Polygon PoS
- USDC as primary payment rail
- ERC-721 membership tokens
- Composable access control contracts

### Architecture Principles

- Payment-derived access (no backend permissions)
- Zero custody, zero escrow
- USDC-first UX with explicit MATIC fallback
- Instant finality on Polygon PoS
- Composable contracts separating payments, access, and content

## Project Structure

```
SubHub/
├── next-app/               # Next.js frontend application
├── contracts/              # Solidity smart contracts
│   ├── PaymentManager.sol      # Core payment primitive (USDC-first)
│   ├── SubscriptionPlan.sol    # Recurring payment parameters
│   ├── AccessController.sol    # Payment → access bridge
│   ├── ContentGating.sol       # Access enforcement layer
│   ├── CreatorProfile.sol      # Creator identity
│   └── MembershipNFT.sol       # ERC-721 access tokens
├── hooks/                  # Web3 and data hooks
│   ├── content/
│   │   └── useCreatorContent.ts
│   ├── membership/
│   │   ├── callCreateTier.ts
│   │   ├── useCreatorTiers.ts
│   │   └── useTierHolders.ts
│   ├── monetization/
│   │   ├── useCreatorEarnings.ts
│   │   ├── usePlanSubscribers.ts
│   │   ├── useWithdrawMATIC.ts
│   │   └── useWithdrawUSDC.ts
│   ├── subscriptions/
│   │   └── useMySubscriptions.ts
│   ├── user/
│   │   ├── useMintTier.ts
│   │   ├── useSubscribe.ts
│   │   ├── useViewCreatorPlans.ts
│   │   └── useViewCreatorTiers.ts
│   ├── useCreatePlan.ts
│   ├── useCreatorInsights.ts
│   ├── useCreatorPlans.ts
│   └── useCreatorProfile.ts
├── abis/                   # Contract ABI files
├── public/                 # Static assets
└── components/             # Shared UI components
```

## Deployed Contracts (Polygon Amoy)

| Contract | Address |
|----------|---------|
| CreatorProfile | `0x00f1fE30eE80767ad7eb741C068C27ED9392621f` |
| SubscriptionPlan | `0x5D74e97d70afaF41586F3ccC75127AcAee9B37E1` |
| PaymentManager (USDC-first) | `0x7Bb3BD54B1fBbd264ae3caAf21f58c7f9803C771` |
| MembershipNFT | `0x5Ecc533FD2fB524c5DeDf4172556f753fBE563b2` |
| ContentGating | `0xeDf08B9b467Aad2cC4c98E667577cea9A7374420` |
| AccessController | `0x3EE26CE9bB2148ff5D7F16FA72dCf9a484D19bca` |

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or pnpm package manager

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/subhub.git
cd subhub
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the project root:

```env
NEXT_PUBLIC_PROJECT_ID=
NEXT_PUBLIC_RPC_URL=
NEXT_PUBLIC_POLYGONSCAN_API_KEY=
IPFS_API_KEY=
IPFS_API_SECRET=
```

4. Start the development server:

```bash
pnpm dev
```

The application will run at `http://localhost:3000`

## Core Architecture

### PaymentManager (Core Primitive)
- Handles USDC and MATIC (USDC primary)
- Tracks active subscriptions, expiry windows, subscriber → plan mappings
- Accumulates creator earnings without escrow
- Exposes access state as pure onchain reads

### SubscriptionPlan
- Defines recurring payment parameters: price (USDC), frequency, creator recipient
- Decoupled from payment execution for extensibility
- Enables future automation (agents, schedulers, paymasters)

### AccessController
- Minimal adapter converting payment state to boolean access rights
- canAccess(user, planId) → bool
- Makes SubHub usable beyond creators (SaaS, APIs, dashboards)

### ContentGating
- Enforces access via PaymentManager (subscriptions) and MembershipNFT ownership
- No backend permissions or centralized allowlists
- Supports: PUBLIC, SUBSCRIPTION, NFT_ANY, NFT_TIER, SUB_OR_NFT

### MembershipNFT
- ERC-721 access tokens
- Transferable, resellable access rights
- Tier-aware gating for differentiated privileges

## Key Technical Value

- **Payments as onchain access state**, not off-chain permissions
- **USDC-native recurring payments** aligned with Polygon's money rails
- **Zero custody, zero escrow, zero auth servers**
- **Immediate finality** → instant UX
- **General-purpose primitive** reusable across verticals

## Why Polygon

- Treats Polygon as money infrastructure, not just execution
- Optimized for stablecoins, not speculative assets
- Built for high-throughput, low-fee, real-world payments
- Ready for: AI payment agents, gasless onboarding, programmable money flows

## Roadmap

- zk-backed private access proofs (subscriber anonymity)
- Delegated/agent-based recurring payments
- ERC-4337 + paymaster integrations
- Cross-app access composition
- Non-creator verticals (SaaS, APIs, communities)
- Programmable money flows and conditional payments

## Contributing

Pull requests, improvements, and contract audits are welcome. Please open an issue or discussion before submitting major changes.

## License

MIT License.

## Support

For questions, feedback, or support, please open an issue in the repository or reach out to the development team.
