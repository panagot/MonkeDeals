# MonkeDeals - Web3 Deal Discovery & Loyalty Platform

A decentralized deal discovery platform built on Solana, enabling merchants to mint promotional coupons as NFTs and users to discover, trade, and redeem real-world savings transparently.

---

## 🚀 Features
- **Mint Promotional NFT Coupons:** Merchants can create promotional NFTs with detailed metadata, expiry dates, and redemption rules.
- **Deal Marketplace:** Users can browse, purchase, and claim discount NFTs.
- **Merchant Dashboard:** User-friendly interface for merchants to manage their deals.
- **User Wallet Integration:** Seamless connection with Solana wallets for transactions.
- **QR Code Redemption:** Secure, on-chain verifiable redemption process.
- **Social Discovery:** Share, rate, and comment on deals.
- **External Deal Aggregation:** Integrate with APIs like Skyscanner, Booking.com, Shopify.
- **Secondary Marketplace:** Resell unused coupon NFTs.
- **Group Deals & Tiered Discounts:** Collective purchasing for better savings.
- **Geo-based Discovery:** Find deals near your location.
- **Reputation System:** Earn NFT badges for user loyalty and achievements.
- **Staking Rewards:** Stake tokens for passive income and rewards.
- **On-chain Tracking:** Complete transaction history and verification.

---

## 🛠️ Tech Stack
- **Frontend:** React.js, Chakra UI, React Router
- **Blockchain:** Solana Devnet/Mainnet (Pure Web3)
- **Smart Contracts:** Anchor framework, Rust
- **Wallet Integration:** @solana/wallet-adapter-react, @solana/wallet-adapter-react-ui
- **Payments:** Solana SOL and SPL tokens only
- **State/Storage:** React state, Solana blockchain, localStorage (for demo)
- **Other:** CRACO (for Webpack polyfills), Framer Motion (animations)

---

## ⚡ Setup Instructions
1. **Clone the repo:**
   ```bash
   git clone <your-repo-url>
   cd invoice-finance-mvp
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Start the app:**
   ```bash
   npm start
   ```
4. **Open in browser:**
   Visit [http://localhost:3000](http://localhost:3000)

---

## 📝 Usage Guide

### Getting Started - Get Test SOL
1. **Get Test SOL from the Faucet:**
   - Visit [Solana Faucet](https://faucet.solana.com/)
   - Connect your Phantom or Solflare wallet
   - Request test SOL (you need at least 0.001 SOL for transaction fees)
   - Make sure you're on Solana Devnet

### For Businesses
1. Connect your Solana wallet (Phantom or Solflare).
2. Ensure your wallet has test SOL from the faucet.
3. Go to **Create Deal** and fill out the form.
4. Submit to mint your deal NFT (real Solana transaction!).
5. Track your deals in the marketplace.

### For Deal Seekers
1. Connect your Solana wallet (Phantom or Solflare).
2. Ensure your wallet has test SOL from the faucet.
3. Browse the **Marketplace** for available deals.
4. Purchase deals to get discount NFTs.
5. Redeem your deals using QR codes.
6. Trade deals on the secondary marketplace.

---

## 🧪 Demo Mode Notice

### ⚠️ Current Implementation Status

**REAL BLOCKCHAIN FUNCTIONALITY:**
- ✅ **NFT Minting**: Creates actual SPL token NFTs on Solana devnet
- ✅ **Real Transactions**: All NFT minting uses real Solana blockchain transactions
- ✅ **Transaction Verification**: All transactions can be verified on Solana Explorer

**DEMO MODE (Simulated Data):**
- ⚠️ **Business Deals**: Returns mock data for demonstration
- ⚠️ **Portfolio Overview**: Uses simulated data
- ⚠️ **Auctions**: Demo implementation with simulated data
- ⚠️ **Group Deals**: Demo implementation
- ⚠️ **localStorage**: NFT metadata stored in browser localStorage for demo purposes

**PRODUCTION READINESS:**
- 🚀 **Smart Contract**: Ready for deployment (Anchor framework)
- 🚀 **Full Blockchain**: Can be upgraded to 100% on-chain with smart contract deployment
- 🚀 **Real-World Ready**: Production-ready architecture

## 🔧 Smart Contract Integration

### Current Status
- ✅ **Smart Contracts Implemented:** Complete Anchor program with all required functionality
- ✅ **Frontend Integration:** TypeScript client and React hooks ready
- ✅ **Demo Mode:** Currently using localStorage for demonstration
- ✅ **Production Ready:** Can be deployed to Solana mainnet

### Smart Contract Features
- **Deal NFT Creation:** Merchants can mint promotional deal NFTs
- **Secure Purchases:** On-chain payment processing with SOL
- **Redemption Verification:** QR code and signature-based redemption
- **NFT Transfers:** Transfer deal NFTs between users
- **Reputation System:** NFT badges for user achievements
- **Event Logging:** Comprehensive on-chain event tracking

### Deployment Options

#### Option 1: Demo Mode (Current)
- Uses localStorage for demonstration
- No blockchain interaction required
- Perfect for testing and development

#### Option 2: Full Blockchain Mode
- Deploy smart contracts to Solana
- Real NFT minting and transactions
- Production-ready for mainnet deployment

---

## 🗂️ Key Files & Components
- `src/pages/MintInvoice.js` — Mint Invoice NFT form & live preview
- `src/pages/Marketplace.js` — Invoice marketplace (filter, sort, buy, modal)
- `src/pages/BusinessDashboard.js` — Business dashboard (table, bulk actions, notifications)
- `src/pages/InvestorDashboard.js` — Investor dashboard (summary, table, sell)
- `src/pages/Profile.js` — Profile/settings page
- `src/components/Header.js` — Navbar, wallet, avatar menu
- `src/pages/InvestorYield.js` — Investor yield & secondary market summary
- `src/index.js` — App entry, wallet/provider setup

---

## ✅ What Has Been Implemented
- Full business and investor flows (mint, buy, repay, relist)
- Marketplace with advanced filtering, sorting, and yield display
- Live invoice NFT preview
- Responsive, accessible UI with error handling and loaders
- Profile/settings and notification preferences
- Investor dashboard and yield summary
- Robust handling of malformed data and runtime errors

---

## 🔜 What Remains / Future Work
- **Blockchain integration:** Write/read invoice NFTs and transactions on Solana
- **Backend/API:** For invoice verification, KYC, and off-chain data
- **Real payments:** Integrate with stablecoins or payment rails
- **Advanced notifications:** Email, push, or on-chain reminders
- **Investor analytics:** IRR, risk scoring, portfolio management
- **Multi-user support:** Real authentication and user management
- **Audit & security:** Smart contract and frontend audits
- **Production deployment:** Hosting, CI/CD, environment configs

---

## 🙏 Credits & Acknowledgments
- Built with [Solana](https://solana.com/), [Chakra UI](https://chakra-ui.com/), [React](https://react.dev/), and [Solana Wallet Adapter](https://github.com/solana-labs/wallet-adapter).
- UI/UX inspired by leading DeFi and fintech platforms.
- Special thanks to the open source community and Solana dev ecosystem. 