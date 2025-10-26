import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Box, Alert, AlertIcon } from '@chakra-ui/react';
import Header from './components/Header';
import Home from './pages/Home';
import CreateDeal from './pages/CreateDeal';
import DealMarketplace from './pages/DealMarketplace';
import BusinessDashboard from './pages/BusinessDashboard';
import Profile from './pages/Profile';
import InvestorDashboard from './pages/InvestorDashboard';
import InvestorYield from './pages/InvestorYield';
import PortfolioTracking from './pages/PortfolioTracking'; // New import
import AuctionSystem from './pages/AuctionSystem'; // New import
import GroupDeals from './pages/GroupDeals'; // New import
import ReputationSystem from './pages/ReputationSystem'; // New import
import SmartContractPanel from './components/SmartContractPanel';
import APIIntegrationPanel from './api/APIIntegrationPanel';

function App() {
  return (
    <Router>
      <Header />
      <Alert status="info" variant="subtle" fontSize="sm" textAlign="center">
        <AlertIcon />
        <Box flex="1" textAlign="center">
          <strong>DEMO MODE:</strong> NFT minting uses real Solana blockchain transactions. Advanced features (auctions, group deals, reputation) use simulated data for demonstration purposes.
        </Box>
      </Alert>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/mint" element={<CreateDeal />} />
        <Route path="/marketplace" element={<DealMarketplace />} />
        <Route path="/dashboard" element={<BusinessDashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/investor" element={<InvestorDashboard />} />
        <Route path="/investor/yield" element={<InvestorYield />} />
        <Route path="/portfolio" element={<PortfolioTracking />} />
        <Route path="/auctions" element={<AuctionSystem />} />
        <Route path="/group-deals" element={<GroupDeals />} />
        <Route path="/reputation" element={<ReputationSystem />} />
        <Route path="/smart-contract" element={<SmartContractPanel />} />
        <Route path="/api-integration" element={<APIIntegrationPanel />} />
      </Routes>
    </Router>
  );
}

export default App;
