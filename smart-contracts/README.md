# DEXGroup Smart Contracts

This directory contains the Solana smart contracts for the DEXGroup NFT deal marketplace platform.

## Overview

The DEXGroup program is built using the Anchor framework and provides comprehensive functionality for a Web3 deal discovery and loyalty platform:

### Core Features
- **Deal NFT Creation**: Merchants can create promotional deal NFTs with metadata
- **Deal Purchase**: Users can purchase deal NFTs with SOL or SPL tokens
- **Deal Redemption**: Secure redemption process with on-chain verification
- **Deal Transfer**: Transfer deal NFTs between users
- **Reputation Badges**: NFT badges for user achievements and loyalty

### Advanced Features
- **Group Deals**: Collective purchasing with tiered discounts
- **Staking Rewards**: Token staking pools with APY rewards
- **Merchant Profiles**: Verified merchant profiles with ratings
- **Rating System**: On-chain merchant rating and review system
- **SPL Token Support**: Support for Solana Program Library tokens

## Smart Contract Architecture

### Core Accounts

1. **Deal Account**: Stores deal information and metadata
2. **Purchase Account**: Tracks individual purchases and ownership
3. **Badge Account**: Stores reputation badges and achievements

### Key Features

- **Program Derived Addresses (PDAs)**: Secure account addressing
- **Event Emission**: Comprehensive event logging for frontend integration
- **Error Handling**: Robust error handling with custom error codes
- **Validation**: Input validation and business logic enforcement

## Development Setup

### Prerequisites

- Rust (latest stable version)
- Solana CLI tools
- Anchor framework
- Node.js and npm

### Installation

1. Install Solana CLI:
```bash
sh -c "$(curl -sSfL https://release.solana.com/v1.18.4/install)"
```

2. Install Anchor:
```bash
npm install -g @coral-xyz/anchor-cli
```

3. Install dependencies:
```bash
cd smart-contracts
npm install
```

### Building the Program

```bash
anchor build
```

### Testing

```bash
anchor test
```

### Deployment

#### Deploy to Devnet
```bash
anchor deploy --provider.cluster devnet
```

#### Deploy to Mainnet
```bash
anchor deploy --provider.cluster mainnet
```

## Program Instructions

### 1. Create Deal
Creates a new deal NFT with specified parameters.

**Accounts:**
- `deal`: Deal account (PDA)
- `merchant`: Merchant wallet (signer)
- `system_program`: System program

**Parameters:**
- `deal_id`: Unique identifier for the deal
- `deal_title`: Title of the deal
- `merchant_name`: Name of the merchant
- `original_price`: Original price in lamports
- `discount_price`: Discounted price in lamports
- `expiry_timestamp`: Unix timestamp when deal expires
- `max_redemptions`: Maximum number of redemptions
- `category`: Deal category
- `location`: Deal location
- `redemption_type`: Type of redemption (QR, signature, etc.)
- `deal_image_hash`: Hash of the deal image
- `terms`: Terms and conditions

### 2. Purchase Deal
Purchases a deal NFT from the marketplace.

**Accounts:**
- `deal`: Deal account (mutable)
- `purchase`: Purchase account (PDA, init)
- `buyer`: Buyer wallet (signer)
- `merchant`: Merchant wallet
- `system_program`: System program

**Parameters:**
- `purchase_id`: Unique identifier for the purchase

### 3. Redeem Deal
Redeems a purchased deal NFT.

**Accounts:**
- `purchase`: Purchase account (mutable)
- `buyer`: Buyer wallet (signer)

**Parameters:**
- `redemption_proof`: Proof of redemption (QR code, signature, etc.)

### 4. Transfer Deal
Transfers a deal NFT to another user.

**Accounts:**
- `purchase`: Purchase account (mutable)
- `seller`: Current owner (signer)
- `new_owner`: New owner account

### 5. Create Badge
Creates a reputation badge NFT.

**Accounts:**
- `badge`: Badge account (PDA, init)
- `user`: User wallet (signer)
- `system_program`: System program

**Parameters:**
- `badge_id`: Unique identifier for the badge
- `badge_name`: Name of the badge
- `badge_type`: Type of badge
- `requirements`: Requirements to earn the badge

## Events

The program emits the following events:

- `DealCreated`: Emitted when a new deal is created
- `DealPurchased`: Emitted when a deal is purchased
- `DealRedeemed`: Emitted when a deal is redeemed
- `DealTransferred`: Emitted when a deal is transferred
- `BadgeCreated`: Emitted when a badge is created

## Error Codes

- `6000`: InvalidPricing - Discount price must be less than original price
- `6001`: ExpiredDeal - Deal has expired
- `6002`: InvalidRedemptions - Invalid redemption count
- `6003`: DealNotActive - Deal is not active
- `6004`: DealSoldOut - Deal has sold out
- `6005`: PurchaseNotActive - Purchase is not active

## Integration

The smart contracts are integrated with the frontend through:

1. **TypeScript Client**: `src/utils/solana.ts`
2. **React Hooks**: `src/hooks/useSolana.ts`
3. **Type Definitions**: `src/utils/types/dexgroup_program.ts`

## Security Considerations

- All accounts use Program Derived Addresses (PDAs) for security
- Input validation is performed on all parameters
- Business logic is enforced at the program level
- Events provide comprehensive audit trails

## Future Enhancements

- Multi-signature support for merchant accounts
- Escrow functionality for disputed redemptions
- Automated expiry handling
- Integration with external price feeds
- Advanced reputation algorithms

## License

MIT License - see LICENSE file for details.
