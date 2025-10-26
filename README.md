# MonkeDeals - Web3 Deal Discovery & Loyalty Platform 🍌

A decentralized deal discovery platform built on Solana, enabling merchants to mint promotional coupons as NFTs and users to discover, trade, and redeem real-world savings transparently.

**Built for the MonkeDAO Hackathon**

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
- **🔌 RESTful API for Integrations:** Complete API layer allowing external applications to integrate MonkeDeals functionality. Visit `/api-integration` for full documentation and live testing.

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
   git clone https://github.com/panagot/MonkeDeals.git
   cd MonkeDeals
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

## 🔌 API Integration & Developer Resources

### Complete RESTful API
MonkeDeals provides a **comprehensive RESTful API** for third-party integrations. The API enables external applications to:

- **Access Deal Data**: Query deals, merchants, and market statistics
- **User Management**: Track portfolios, reputations, and user activity
- **Real-time Webhooks**: Receive notifications for deal events
- **Analytics**: Access comprehensive market analytics and insights
- **Social Integration**: Share deals, track social engagement, and viral campaigns

### 🎯 Access the API Documentation
1. **Navigate to API Integration**: Click "API Integration" in the main navigation bar
2. **Interactive Testing**: Use the live API testing panel to test endpoints
3. **Documentation**: View comprehensive API documentation with examples
4. **Integration Examples**: See real-world integration examples for:
   - Travel & Hospitality platforms
   - Restaurant discovery apps
   - E-commerce platforms
   - Events & Entertainment
   - Fitness & Wellness
   - Social Media platforms

### Key API Endpoints
- `GET /api/deals` - Get all available deals
- `GET /api/deals/{id}` - Get specific deal details
- `POST /api/deals/{id}/purchase` - Purchase a deal NFT
- `POST /api/deals/{id}/redeem` - Redeem a purchased deal
- `GET /api/users/{address}/portfolio` - Get user deal portfolio
- `GET /api/analytics/overview` - Get market analytics
- `POST /api/webhooks/register` - Register webhooks for real-time updates

### Developer-Friendly Features
- ✅ **API Key Authentication** - Secure access control
- ✅ **Rate Limiting** - Prevents API abuse
- ✅ **Comprehensive Documentation** - Detailed endpoint documentation
- ✅ **Multiple SDK Examples** - JavaScript, Python, PHP, Java, Go
- ✅ **Live Testing Panel** - Test endpoints directly in the UI
- ✅ **Real-world Examples** - 6+ integration patterns
- ✅ **Enterprise Features** - Webhooks, analytics, multi-region support

### Integration Use Cases
- **Travel Platforms**: Integrate hotel and flight deals
- **Restaurant Apps**: Show restaurant deals by location
- **E-commerce**: Embed deals into shopping carts
- **Social Media**: Share deals and track viral campaigns
- **Event Platforms**: Sell event tickets as NFTs
- **Fitness Apps**: Offer gym memberships and class passes

Visit `/api-integration` in the application to explore the complete API documentation and start integrating!

---

## 🗂️ Key Files & Components
- `src/pages/CreateDeal.js` — Create Deal NFT form & live preview
- `src/pages/DealMarketplace.js` — Deal marketplace (browse, purchase deals)
- `src/pages/BusinessDashboard.js` — Business dashboard (manage deals)
- `src/pages/InvestorDashboard.js` — Investor dashboard (portfolio tracking)
- `src/pages/Profile.js` — Profile/settings page
- `src/components/Header.js` — Navbar, wallet, avatar menu
- `src/components/DealCard.js` — Deal card component
- `src/utils/solanaClient.js` — Solana blockchain integration
- `src/index.js` — App entry, wallet/provider setup

---

## ✅ What Has Been Implemented
- NFT Deal Creation with real Solana blockchain minting
- Deal Marketplace with browsing and purchasing
- Business Dashboard for managing deals
- Investor/User Dashboard for tracking purchased deals
- Real-time NFT minting with transaction verification
- Wallet integration (Phantom, Solflare, etc.)
- QR Code redemption system
- Portfolio tracking
- Responsive, accessible UI with error handling
- Smart contract infrastructure (ready for deployment)
- **🔌 RESTful API for Third-Party Integrations** - Complete API layer with documentation, testing panel, and real-world examples

---

## 🔜 What Remains / Future Work
- **Full smart contract deployment:** Deploy Anchor program to mainnet
- **On-chain deal storage:** Replace demo data with blockchain queries
- **Metaplex metadata integration:** Full NFT metadata on-chain
- **Advanced features:** Auctions, Group Deals (currently in demo mode)
- **Reputation system:** NFT badges and on-chain reputation tracking
- **API Backend:** Connect API layer to real blockchain data (currently using mock data for demo)
- **Mobile app:** React Native version for iOS/Android
- **Audit & security:** Smart contract and frontend audits
- **Mainnet deployment:** Production deployment with full on-chain features

---

## 🙏 Credits & Acknowledgments
- Built with [Solana](https://solana.com/), [Chakra UI](https://chakra-ui.com/), [React](https://react.dev/), and [Solana Wallet Adapter](https://github.com/solana-labs/wallet-adapter).
- UI/UX inspired by leading DeFi and fintech platforms.
- Special thanks to the open source community and Solana dev ecosystem. 