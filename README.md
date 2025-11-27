# SubHub

SubHub is a creator economy protocol built on Polygon that enables creators to launch NFT memberships, subscription plans, and gated content using trustless smart contracts, zero-knowledge proofs, and on-chain identity. Fans can subscribe, collect memberships, unlock exclusive content, and engage with creators across the Polygon ecosystem.

## Overview

SubHub provides on-chain primitives for modern creator monetization:

**NFT Memberships**: Resellable passes that unlock exclusive content and benefits, with creator royalties on secondary sales.

**Subscription Plans**: Trustless, automated recurring access controlled by smart contracts.

**Gated Content**: Creators can upload content stored on IPFS via Pinata, unlocked through NFT ownership or active subscription.

**Polygon-native Identity**: Optional DID, social verification, reputation, and zero-knowledge enabled privacy.

**Multi-chain Interoperability**: Access the platform from Polygon PoS, zkEVM, and connected L2s. Creators and fans can onboard using MATIC, USDC, or credit cards via supported payment partners.

## Features

### Creator Features

- Create an on-chain creator profile
- Launch NFT membership tiers
- Publish gated content
- Create private or public subscription plans
- Track analytics, subscribers, royalties, and earnings
- Withdraw earnings in MATIC or USDC
- Connect social accounts for verification

### Fan Features

- Discover creators across the ecosystem
- Subscribe using MATIC, USDC, or credit card
- Unlock gated posts, media, and premium content
- Hold or resell NFT memberships
- Build a cross-chain creator feed
- Manage subscriptions and access across devices

## Tech Stack

### Frontend

- Next.js (App Router)
- TypeScript
- Wagmi / Viem
- RainbowKit
- Shadcn/UI
- Tailwind CSS

### Smart Contracts

- Solidity
- Polygon PoS
- IPFS / Arweave storage
- ERC-721 membership contracts
- Subscription registry contracts

### Backend Integrations

- NFT metadata generation
- IPFS upload pipelines
- Webhooks for creator events
- Payment routing infrastructure

## Project Structure

```
SubHub/
├── next-app/               # Next.js frontend application
├── contracts/              # Solidity smart contracts
│   ├── ContentGating.sol
│   ├── CreatorProfile.sol
│   ├── MembershipNFT.sol
│   ├── PaymentManager.sol
│   └── SubscriptionPlan.sol
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
│   ├── useCreatorProfile.ts
│   └── useEvmWallet.ts
├── abis/                   # Contract ABI files
├── public/                 # Static assets
└── components/             # Shared UI components
```

## Deployed Contracts

SubHub is deployed on Polygon PoS mainnet with the following contract addresses:

| Contract | Address |
|----------|---------|
| Creator Profile | `0x00f1fE30eE80767ad7eb741C068C27ED9392621f` |
| Subscription Plan | `0x5D74e97d70afaF41586F3ccC75127AcAee9B37E1` |
| Payment Manager | `0x46f7Ed98FA786def8f539370d48EB6c08BD233A5` |
| Membership NFT | `0x5Ecc533FD2fB524c5DeDf4172556f753fBE563b2` |
| Content Gating | `0x141c41f1EbDB75206e58f44308cB5823ef682320` |
| USDC | `0x3c499c542cef5e3811e1192ce70d8cc03d5c3359` |

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm package manager

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

## Deployment

### Frontend Deployment

SubHub can be deployed to:

- Vercel
- Netlify
- Custom Docker infrastructure

### Smart Contract Deployment

Smart contracts should be deployed to:

- Polygon PoS mainnet
- Polygon Amoy testnet

## Roadmap

- AI-powered creator insights
- Zero-knowledge protected subscriber lists
- Multi-format gated content
- Cross-chain indexing
- Creator storefronts
- Partner integrations
- Decentralized discovery index
- Mobile app (PWA)

## Contributing

Pull requests, improvements, and contract audits are welcome. Please open an issue or discussion before submitting major changes.

## License

MIT License. See `LICENSE` for details.

## Support

For questions, feedback, or support, please open an issue in the repository or reach out to the development team.
