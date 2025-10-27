import React, { useState, useEffect } from 'react';
import {
  Box, Heading, Text, Stack, Button, Badge, HStack, VStack, Icon, useToast, SimpleGrid, Card, CardBody, CardHeader, Progress, Spinner
} from '@chakra-ui/react';
import { StarIcon, TrendingUpIcon, TrendingDownIcon, LockIcon } from '@chakra-ui/icons';
import { useWallet } from '@solana/wallet-adapter-react';

const StakingRewards = () => {
  const [userStakes, setUserStakes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const { publicKey } = useWallet();

  // Load staking data from localStorage
  useEffect(() => {
    const stakes = localStorage.getItem('userStakes');
    if (stakes) {
      setUserStakes(JSON.parse(stakes));
    }
  }, []);

  // Load available NFT deals for staking
  const [availableDeals, setAvailableDeals] = useState([]);
  
  useEffect(() => {
    const loadAvailableDeals = () => {
      // Load minted NFT deals from localStorage
      const data = localStorage.getItem('mintedDeals');
      if (data) {
        setAvailableDeals(JSON.parse(data));
      }
    };
    loadAvailableDeals();
    
    // Listen for storage changes
    window.addEventListener('storage', loadAvailableDeals);
    return () => window.removeEventListener('storage', loadAvailableDeals);
  }, []);

  // Auto-calculate rewards periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setUserStakes(prevStakes => {
        return prevStakes.map(stake => {
          const hoursPassed = (Date.now() - new Date(stake.stakeTime).getTime()) / (1000 * 60 * 60);
          const rewardRate = 0.125 / 365 / 24; // 12.5% APY per hour
          // Calculate rewards based on 1 SOL per NFT (fixed rate)
          const stakeValue = 1; // 1 SOL equivalent per NFT
          const newRewards = stakeValue * hoursPassed * rewardRate;
          const newProgress = Math.min(((hoursPassed / stake.lockPeriodHours) * 100), 100);
          
          return {
            ...stake,
            rewards: stakeValue * rewardRate * hoursPassed,
            progress: newProgress
          };
        });
      });
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  // Save stakes to localStorage whenever they change
  useEffect(() => {
    if (userStakes.length > 0) {
      localStorage.setItem('userStakes', JSON.stringify(userStakes));
    }
  }, [userStakes]);

  // Stake NFT Deal
  const stakeToken = async (dealId) => {
    if (!publicKey) {
      throw new Error('Wallet not connected');
    }

    // Find the deal to stake
    const dealToStake = availableDeals.find(d => d.id === dealId);
    if (!dealToStake) {
      throw new Error('Deal not found');
    }

    try {
      // NOTE: This is a simplified demo implementation
      // In production, you'd lock the NFT in a staking smart contract
      // For demo purposes, we'll just record the stake locally and simulate the transaction
      
      // Simulate transaction - create a signature-like identifier
      const signature = `stake_nft_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      
      console.log('Staking NFT transaction simulated:', signature);
      console.log(`Staked NFT Deal: ${dealToStake.dealTitle} (demo mode)`);
      
      // In a real implementation, you would:
      // 1. Transfer NFT to a staking program/account
      // 2. Lock the NFT for the stake period
      // 3. Sign and send the transaction to the blockchain
      // 4. Wait for confirmation
      // 5. Store the on-chain transaction signature
      
      // For demo, we'll return a simulated success
      return {
        success: true,
        signature,
        explorerUrl: '#',
        deal: dealToStake
      };
    } catch (error) {
      console.error('Staking transaction error:', error);
      throw error;
    }
  };

  const handleStake = async (dealId) => {
    if (!publicKey) {
      toast({
        title: 'Wallet Not Connected',
        description: 'Please connect your wallet to stake NFT deals',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);

    try {
      // Execute stake transaction
      const result = await stakeToken(dealId);
      
      if (result.success) {
        const newStake = {
          id: Date.now(),
          dealId: dealId,
          dealTitle: result.deal.dealTitle,
          merchant: result.deal.merchant,
          dealValue: result.deal.discountPrice || result.deal.originalPrice,
          category: result.deal.category,
          rewards: 0,
          stakedDate: new Date().toLocaleDateString(),
          stakeTime: new Date().toISOString(),
          unlockDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(), // 30 days
          lockPeriodHours: 30 * 24,
          progress: 0,
          signature: result.signature,
          explorerUrl: result.explorerUrl
        };
        
        setUserStakes([...userStakes, newStake]);
        
        toast({
          title: 'NFT Staked Successfully! 🎉',
          description: `Staked "${result.deal.dealTitle}" for 30 days`,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Staking error:', error);
      toast({
        title: 'Staking Failed',
        description: error.message || 'Failed to stake NFT. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnstake = async (stakeId) => {
    const stake = userStakes.find(s => s.id === stakeId);
    if (!stake) return;

    if (!publicKey) {
      toast({
        title: 'Wallet Not Connected',
        description: 'Please connect your wallet to unstake tokens',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);

    try {
      // NOTE: This is a simplified demo implementation
      // In production, this would call a smart contract to withdraw staked SOL
      
      // Simulate unstaking transaction
      const signature = `unstake_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      
      const hoursPassed = (Date.now() - new Date(stake.stakeTime).getTime()) / (1000 * 60 * 60);
      const rewardRate = 0.125 / 365 / 24;
      const stakeValue = 1; // 1 SOL equivalent per NFT
      const totalRewards = stakeValue * hoursPassed * rewardRate;
      
      console.log('Unstaking transaction simulated:', signature);
      console.log(`Withdrew ${stake.amount} SOL + ${totalRewards.toFixed(4)} SOL rewards (demo mode)`);
      
      setUserStakes(userStakes.filter(s => s.id !== stakeId));
      
      toast({
        title: 'Unstaked Successfully! 💰',
        description: `You earned ${totalRewards.toFixed(4)} SOL in rewards`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Unstaking error:', error);
      toast({
        title: 'Unstaking Failed',
        description: error.message || 'Failed to unstake SOL. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const calculateRewards = () => {
    const stakes = userStakes || [];
    const totalStaked = stakes.length; // Number of staked NFTs
    const totalRewards = stakes.reduce((sum, stake) => sum + (stake.rewards || 0), 0);
    const apy = 12.5; // Example APY
    
    return {
      totalStaked,
      totalRewards,
      apy,
      dailyRewards: (totalStaked * apy) / 365 / 100
    };
  };

  const rewards = calculateRewards();

  return (
    <Box>
      <VStack spacing={6} align="stretch">
                 {/* Demo Mode Notice */}
         <Card bg="blue.50" borderColor="blue.200">
           <CardBody>
             <Text fontSize="sm" color="blue.800">
               <strong>Demo Mode:</strong> Staking NFT deals is currently simulated for demonstration purposes. Your wallet will connect, but NFTs will not be locked on-chain.
             </Text>
           </CardBody>
         </Card>

        {/* Staking Overview */}
        <Card>
          <CardHeader>
            <Heading size="md">Staking Overview</Heading>
          </CardHeader>
          <CardBody>
            <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
                             <Box textAlign="center">
                 <Text fontSize="2xl" fontWeight="bold" color="teal.600">
                   {rewards.totalStaked}
                 </Text>
                 <Text fontSize="sm" color="gray.600">NFTs Staked</Text>
               </Box>
              <Box textAlign="center">
                <Text fontSize="2xl" fontWeight="bold" color="green.600">
                  {rewards.totalRewards.toFixed(2)}
                </Text>
                <Text fontSize="sm" color="gray.600">Total Rewards</Text>
              </Box>
              <Box textAlign="center">
                <Text fontSize="2xl" fontWeight="bold" color="blue.600">
                  {rewards.apy}%
                </Text>
                <Text fontSize="sm" color="gray.600">APY</Text>
              </Box>
              <Box textAlign="center">
                <Text fontSize="2xl" fontWeight="bold" color="purple.600">
                  {rewards.dailyRewards.toFixed(2)}
                </Text>
                <Text fontSize="sm" color="gray.600">Daily Rewards</Text>
              </Box>
            </SimpleGrid>
          </CardBody>
        </Card>

                 {/* Staking Actions */}
         <Card>
           <CardHeader>
             <Heading size="md">Stake NFT Deals</Heading>
           </CardHeader>
           <CardBody>
             <VStack spacing={4}>
               <Text fontSize="sm" color="gray.600">
                 Select an NFT deal to stake and earn rewards
               </Text>
               
               {availableDeals.length === 0 ? (
                 <Text color="gray.500" textAlign="center" py={4}>
                   No NFT deals available to stake. Create or purchase deals first.
                 </Text>
               ) : (
                 <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="full">
                   {availableDeals.map((deal) => (
                     <Box
                       key={deal.id}
                       border="1px solid"
                       borderColor="gray.200"
                       borderRadius="lg"
                       p={4}
                     >
                       <VStack align="stretch" spacing={2}>
                         <Text fontWeight="bold" fontSize="sm">
                           {deal.dealTitle}
                         </Text>
                         <Text fontSize="xs" color="gray.600">
                           {deal.merchant}
                         </Text>
                         <Text fontSize="xs" color="gray.600">
                           {deal.discountPrice} | {deal.discountPercentage}
                         </Text>
                         <Button
                           colorScheme="teal"
                           size="sm"
                           onClick={() => handleStake(deal.id)}
                           isDisabled={isLoading}
                           isLoading={isLoading}
                         >
                           Stake NFT
                         </Button>
                       </VStack>
                     </Box>
                   ))}
                 </SimpleGrid>
               )}
             </VStack>
           </CardBody>
         </Card>

        {/* Active Stakes */}
        <Card>
          <CardHeader>
            <Heading size="md">Active Stakes</Heading>
          </CardHeader>
          <CardBody>
            {(userStakes || []).length === 0 ? (
              <Text color="gray.600" textAlign="center" py={8}>
                No active stakes. Start staking to earn rewards!
              </Text>
            ) : (
              <VStack spacing={4} align="stretch">
                {(userStakes || []).map((stake) => (
                  <Box
                    key={stake.id}
                    border="1px solid"
                    borderColor="gray.200"
                    borderRadius="lg"
                    p={4}
                  >
                    <VStack align="stretch" spacing={3}>
                                                                                         <HStack justify="space-between">
                         <Text fontWeight="bold">{stake.dealTitle || `Stake #${stake.id}`}</Text>
                         <Badge colorScheme="green">Active</Badge>
                       </HStack>
                       {stake.merchant && (
                         <Text fontSize="sm" color="gray.600">
                           {stake.merchant} | {stake.category}
                         </Text>
                       )}
                       <HStack justify="space-between">
                         <Text>Deal Value: {stake.dealValue}</Text>
                         <Text>Rewards: {stake.rewards.toFixed(4)} SOL</Text>
                       </HStack>
                      <HStack justify="space-between">
                        <Text>Staked: {stake.stakedDate}</Text>
                        <Text>Unlocks: {stake.unlockDate}</Text>
                      </HStack>
                      <Progress value={stake.progress} colorScheme="teal" />
                      <HStack justify="space-between">
                        <Text fontSize="sm" color="gray.600">
                          Progress: {stake.progress}%
                        </Text>
                        <Button
                          size="sm"
                          colorScheme="red"
                          variant="outline"
                          onClick={() => handleUnstake(stake.id)}
                          isDisabled={isLoading}
                          isLoading={isLoading}
                        >
                          {isLoading ? <Spinner size="sm" /> : 'Unstake'}
                        </Button>
                      </HStack>
                    </VStack>
                  </Box>
                ))}
              </VStack>
            )}
          </CardBody>
        </Card>

        {/* Rewards History */}
        <Card>
          <CardHeader>
            <Heading size="md">Rewards History</Heading>
          </CardHeader>
          <CardBody>
            <Text color="gray.600" textAlign="center" py={8}>
              Rewards history will be displayed here
            </Text>
          </CardBody>
        </Card>
      </VStack>
    </Box>
  );
};

export default StakingRewards;
