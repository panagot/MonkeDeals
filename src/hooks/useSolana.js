import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { 
  getConnection, 
  getProgram, 
  initializeContract, 
  getProgramInfo,
  getWalletBalance,
  testContract,
  mintDealNFT,
  getNFTMetadata,
  redeemDealNFT,
  generateRedemptionQR,
  verifyRedemptionQR,
  transferDealNFT,
  listNFTForSale,
  buyNFTFromSecondary,
  getNFTOwnership,
  getBusinessDeals,
  getDealAnalytics,
  updateDealStatus,
  getBusinessRevenue,
  getDealRedemptions,
  getPortfolioOverview,
  getPortfolioDeals,
  getPortfolioAnalytics,
  getPortfolioPerformance,
  getPortfolioHistory,
  getPortfolioInsights,
  createAuction,
  placeBid,
  getActiveAuctions,
  getAuctionDetails,
  endAuction,
  getUserBids,
  createGroupDeal,
  joinGroupDeal,
  getActiveGroupDeals,
  getGroupDealDetails,
  leaveGroupDeal,
  getUserGroupDeals,
  getUserReputation,
  mintLoyaltyBadge,
  getLeaderboard,
  getAvailableBadges,
  updateReputation,
  getReputationHistory,
  PROGRAM_ID 
} from '../utils/solanaClient';

export const useSolana = () => {
  const { connected, publicKey, wallet } = useWallet();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [programInfo, setProgramInfo] = useState(null);
  const [walletBalance, setWalletBalance] = useState('0.0000');

  // Load program info when component mounts
  useEffect(() => {
    const loadProgramInfo = async () => {
      try {
        const result = await getProgramInfo();
        if (result.success) {
          setProgramInfo(result.programInfo);
        } else {
          setError(result.error);
        }
      } catch (err) {
        setError('Failed to load program info');
      }
    };

    loadProgramInfo();
  }, []);

  // Update wallet balance when wallet connects
  useEffect(() => {
    const updateBalance = async () => {
      if (connected && publicKey) {
        try {
          const balance = await getWalletBalance(publicKey);
          setWalletBalance(balance);
        } catch (err) {
          console.error('Error updating wallet balance:', err);
        }
      } else {
        setWalletBalance('0.0000');
      }
    };

    updateBalance();
    // Update balance every 30 seconds when connected
    const interval = connected ? setInterval(updateBalance, 30000) : null;
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [connected, publicKey]);

  // Initialize smart contract
  const initializeContractCall = useCallback(async () => {
    if (!connected || !wallet) {
      throw new Error('Wallet not connected');
    }

    setLoading(true);
    setError(null);

    try {
      const result = await initializeContract({ ...wallet, publicKey });
      if (result.success) {
        return result;
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to initialize contract';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [connected, wallet, publicKey]);

  // Test function to call the smart contract
  const testContractCall = useCallback(async () => {
    if (!connected || !wallet) {
      throw new Error('Wallet not connected');
    }

    setLoading(true);
    setError(null);

    try {
      const result = await testContract({ ...wallet, publicKey });
      if (result.success) {
        return result;
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      const errorMessage = err.message || 'Smart contract test failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [connected, wallet, publicKey]);

  // Mint Deal NFT
  const mintNFT = useCallback(async (dealData) => {
    if (!connected || !wallet) {
      throw new Error('Wallet not connected');
    }

    setLoading(true);
    setError(null);

    try {
      const result = await mintDealNFT({ ...wallet, publicKey }, dealData);
      if (result.success) {
        return result;
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to mint deal NFT';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [connected, wallet, publicKey]);

  // Get NFT Metadata
  const getNFT = useCallback(async (mintAddress) => {
    try {
      const result = await getNFTMetadata(mintAddress);
      if (result.success) {
        return result;
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to get NFT metadata';
      setError(errorMessage);
      throw err;
    }
  }, []);

  // Redeem Deal NFT
  const redeemDeal = useCallback(async (dealData) => {
    if (!connected || !wallet) {
      throw new Error('Wallet not connected');
    }

    setLoading(true);
    setError(null);

    try {
      const result = await redeemDealNFT({ ...wallet, publicKey }, dealData);
      if (result.success) {
        return result;
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to redeem deal';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [connected, wallet, publicKey]);

  // Generate QR Code for redemption
  const generateQR = useCallback((dealData) => {
    try {
      const result = generateRedemptionQR(dealData);
      return result;
    } catch (err) {
      const errorMessage = err.message || 'Failed to generate QR code';
      setError(errorMessage);
      throw err;
    }
  }, []);

  // Verify QR Code
  const verifyQR = useCallback(async (qrData) => {
    try {
      const result = await verifyRedemptionQR(qrData);
      if (result.success) {
        return result;
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to verify QR code';
      setError(errorMessage);
      throw err;
    }
  }, []);

  // Transfer Deal NFT
  const transferNFT = useCallback(async (nftData, buyerPublicKey) => {
    if (!connected || !wallet) {
      throw new Error('Wallet not connected');
    }

    setLoading(true);
    setError(null);

    try {
      const result = await transferDealNFT({ ...wallet, publicKey }, nftData, buyerPublicKey);
      if (result.success) {
        return result;
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to transfer deal NFT';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [connected, wallet, publicKey]);

  // List NFT for Sale
  const listForSale = useCallback(async (nftData, salePrice) => {
    if (!connected || !wallet) {
      throw new Error('Wallet not connected');
    }

    setLoading(true);
    setError(null);

    try {
      const result = await listNFTForSale({ ...wallet, publicKey }, nftData, salePrice);
      if (result.success) {
        return result;
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to list deal NFT for sale';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [connected, wallet, publicKey]);

  // Buy NFT from Secondary Market
  const buyFromSecondary = useCallback(async (listingData) => {
    if (!connected || !wallet) {
      throw new Error('Wallet not connected');
    }

    setLoading(true);
    setError(null);

    try {
      const result = await buyNFTFromSecondary({ ...wallet, publicKey }, listingData);
      if (result.success) {
        return result;
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to buy deal NFT';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [connected, wallet, publicKey]);

  // Get NFT Ownership
  const getOwnership = useCallback(async (nftId) => {
    try {
      const result = await getNFTOwnership(nftId);
      if (result.success) {
        return result;
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to get NFT ownership';
      setError(errorMessage);
      throw err;
    }
  }, []);

  // Business Dashboard Functions
  const getBusinessDealsData = useCallback(async (merchantAddress) => {
    try {
      const result = await getBusinessDeals(merchantAddress);
      if (result.success) {
        return result;
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to get business deals';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const getDealAnalyticsData = useCallback(async (dealId) => {
    try {
      const result = await getDealAnalytics(dealId);
      if (result.success) {
        return result;
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to get deal analytics';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const updateDealStatusData = useCallback(async (dealId, newStatus) => {
    if (!connected || !wallet) {
      throw new Error('Wallet not connected');
    }

    setLoading(true);
    setError(null);

    try {
      const result = await updateDealStatus({ ...wallet, publicKey }, dealId, newStatus);
      if (result.success) {
        return result;
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to update deal status';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [connected, wallet, publicKey]);

  const getBusinessRevenueData = useCallback(async (merchantAddress, timeframe) => {
    try {
      const result = await getBusinessRevenue(merchantAddress, timeframe);
      if (result.success) {
        return result;
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to get business revenue';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const getDealRedemptionsData = useCallback(async (dealId) => {
    try {
      const result = await getDealRedemptions(dealId);
      if (result.success) {
        return result;
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to get deal redemptions';
      setError(errorMessage);
      throw err;
    }
  }, []);

  // Portfolio Tracking Functions
  const getPortfolioOverviewData = useCallback(async (walletAddress) => {
    try {
      const result = await getPortfolioOverview(walletAddress);
      if (result.success) {
        return result;
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to get portfolio overview';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const getPortfolioDealsData = useCallback(async (walletAddress, filters) => {
    try {
      const result = await getPortfolioDeals(walletAddress, filters);
      if (result.success) {
        return result;
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to get portfolio deals';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const getPortfolioAnalyticsData = useCallback(async (walletAddress, timeframe) => {
    try {
      const result = await getPortfolioAnalytics(walletAddress, timeframe);
      if (result.success) {
        return result;
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to get portfolio analytics';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const getPortfolioPerformanceData = useCallback(async (walletAddress) => {
    try {
      const result = await getPortfolioPerformance(walletAddress);
      if (result.success) {
        return result;
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to get portfolio performance';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const getPortfolioHistoryData = useCallback(async (walletAddress, limit) => {
    try {
      const result = await getPortfolioHistory(walletAddress, limit);
      if (result.success) {
        return result;
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to get portfolio history';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const getPortfolioInsightsData = useCallback(async (walletAddress) => {
    try {
      const result = await getPortfolioInsights(walletAddress);
      if (result.success) {
        return result;
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to get portfolio insights';
      setError(errorMessage);
      throw err;
    }
  }, []);

  // Auction System Functions
  const createAuctionData = useCallback(async (dealData, auctionData) => {
    if (!connected || !wallet) {
      throw new Error('Wallet not connected');
    }

    setLoading(true);
    setError(null);

    try {
      const result = await createAuction({ ...wallet, publicKey }, dealData, auctionData);
      if (result.success) {
        return result;
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to create auction';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [connected, wallet, publicKey]);

  const placeBidData = useCallback(async (auctionId, bidAmount) => {
    if (!connected || !wallet) {
      throw new Error('Wallet not connected');
    }

    setLoading(true);
    setError(null);

    try {
      const result = await placeBid({ ...wallet, publicKey }, auctionId, bidAmount);
      if (result.success) {
        return result;
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to place bid';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [connected, wallet, publicKey]);

  const getActiveAuctionsData = useCallback(async (filters) => {
    try {
      const result = await getActiveAuctions(filters);
      if (result.success) {
        return result;
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to get active auctions';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const getAuctionDetailsData = useCallback(async (auctionId) => {
    try {
      const result = await getAuctionDetails(auctionId);
      if (result.success) {
        return result;
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to get auction details';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const endAuctionData = useCallback(async (auctionId) => {
    if (!connected || !wallet) {
      throw new Error('Wallet not connected');
    }

    setLoading(true);
    setError(null);

    try {
      const result = await endAuction({ ...wallet, publicKey }, auctionId);
      if (result.success) {
        return result;
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to end auction';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [connected, wallet, publicKey]);

  const getUserBidsData = useCallback(async (walletAddress) => {
    try {
      const result = await getUserBids(walletAddress);
      if (result.success) {
        return result;
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to get user bids';
      setError(errorMessage);
      throw err;
    }
  }, []);

  // Group Deals System Functions
  const createGroupDealData = useCallback(async (dealData, groupData) => {
    if (!connected || !wallet) {
      throw new Error('Wallet not connected');
    }

    setLoading(true);
    setError(null);

    try {
      const result = await createGroupDeal({ ...wallet, publicKey }, dealData, groupData);
      if (result.success) {
        return result;
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to create group deal';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [connected, wallet, publicKey]);

  const joinGroupDealData = useCallback(async (groupDealId, participantData) => {
    if (!connected || !wallet) {
      throw new Error('Wallet not connected');
    }

    setLoading(true);
    setError(null);

    try {
      const result = await joinGroupDeal({ ...wallet, publicKey }, groupDealId, participantData);
      if (result.success) {
        return result;
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to join group deal';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [connected, wallet, publicKey]);

  const getActiveGroupDealsData = useCallback(async (filters) => {
    try {
      const result = await getActiveGroupDeals(filters);
      if (result.success) {
        return result;
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to get active group deals';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const getGroupDealDetailsData = useCallback(async (groupDealId) => {
    try {
      const result = await getGroupDealDetails(groupDealId);
      if (result.success) {
        return result;
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to get group deal details';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const leaveGroupDealData = useCallback(async (groupDealId) => {
    if (!connected || !wallet) {
      throw new Error('Wallet not connected');
    }

    setLoading(true);
    setError(null);

    try {
      const result = await leaveGroupDeal({ ...wallet, publicKey }, groupDealId);
      if (result.success) {
        return result;
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to leave group deal';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [connected, wallet, publicKey]);

  const getUserGroupDealsData = useCallback(async (walletAddress) => {
    try {
      const result = await getUserGroupDeals(walletAddress);
      if (result.success) {
        return result;
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to get user group deals';
      setError(errorMessage);
      throw err;
    }
  }, []);

  // Reputation System Functions
  const getUserReputationData = useCallback(async (walletAddress) => {
    try {
      const result = await getUserReputation(walletAddress);
      if (result.success) {
        return result;
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to get user reputation';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const mintLoyaltyBadgeData = useCallback(async (badgeData) => {
    if (!connected || !wallet) {
      throw new Error('Wallet not connected');
    }

    setLoading(true);
    setError(null);

    try {
      const result = await mintLoyaltyBadge({ ...wallet, publicKey }, badgeData);
      if (result.success) {
        return result;
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to mint loyalty badge';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [connected, wallet, publicKey]);

  const getLeaderboardData = useCallback(async (category, limit) => {
    try {
      const result = await getLeaderboard(category, limit);
      if (result.success) {
        return result;
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to get leaderboard';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const getAvailableBadgesData = useCallback(async () => {
    try {
      const result = await getAvailableBadges();
      if (result.success) {
        return result;
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to get available badges';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const updateReputationData = useCallback(async (action, data) => {
    if (!connected || !wallet) {
      throw new Error('Wallet not connected');
    }

    setLoading(true);
    setError(null);

    try {
      const result = await updateReputation({ ...wallet, publicKey }, action, data);
      if (result.success) {
        return result;
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to update reputation';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [connected, wallet, publicKey]);

  const getReputationHistoryData = useCallback(async (walletAddress, limit) => {
    try {
      const result = await getReputationHistory(walletAddress, limit);
      if (result.success) {
        return result;
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to get reputation history';
      setError(errorMessage);
      throw err;
    }
  }, []);

  return {
    // State
    connected,
    publicKey,
    loading,
    error,
    programInfo,
    walletBalance,
    
    // Actions
    initializeContract: initializeContractCall,
    testContract: testContractCall,
    mintNFT,
    getNFT,
    redeemDeal,
    generateQR,
    verifyQR,
    transferNFT,
    listForSale,
    buyFromSecondary,
    getOwnership,
    
    // Business Dashboard Actions
    getBusinessDeals: getBusinessDealsData,
    getDealAnalytics: getDealAnalyticsData,
    updateDealStatus: updateDealStatusData,
    getBusinessRevenue: getBusinessRevenueData,
    getDealRedemptions: getDealRedemptionsData,
    
    // Portfolio Tracking Actions
    getPortfolioOverview: getPortfolioOverviewData,
    getPortfolioDeals: getPortfolioDealsData,
    getPortfolioAnalytics: getPortfolioAnalyticsData,
    getPortfolioPerformance: getPortfolioPerformanceData,
    getPortfolioHistory: getPortfolioHistoryData,
    getPortfolioInsights: getPortfolioInsightsData,
    
    // Auction System Actions
    createAuction: createAuctionData,
    placeBid: placeBidData,
    getActiveAuctions: getActiveAuctionsData,
    getAuctionDetails: getAuctionDetailsData,
    endAuction: endAuctionData,
    getUserBids: getUserBidsData,
    
    // Group Deals System Actions
    createGroupDeal: createGroupDealData,
    joinGroupDeal: joinGroupDealData,
    getActiveGroupDeals: getActiveGroupDealsData,
    getGroupDealDetails: getGroupDealDetailsData,
    leaveGroupDeal: leaveGroupDealData,
    getUserGroupDeals: getUserGroupDealsData,
    
    // Reputation System Actions
    getUserReputation: getUserReputationData,
    mintLoyaltyBadge: mintLoyaltyBadgeData,
    getLeaderboard: getLeaderboardData,
    getAvailableBadges: getAvailableBadgesData,
    updateReputation: updateReputationData,
    getReputationHistory: getReputationHistoryData,
    
    // Utils
    programId: PROGRAM_ID.toString(),
    connection: getConnection(),
  };
};
