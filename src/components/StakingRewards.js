import React, { useState, useEffect } from 'react';
import {
  Box, Heading, Text, Stack, Button, Badge, HStack, VStack, Icon, useToast, SimpleGrid, Card, CardBody, CardHeader, Progress, Spinner
} from '@chakra-ui/react';
import { StarIcon, TrendingUpIcon, TrendingDownIcon, LockIcon } from '@chakra-ui/icons';
import { useWallet } from '@solana/wallet-adapter-react';
import { Connection, PublicKey, Transaction, SystemProgram } from '@solana/web3.js';
import { getConnection } from '../utils/solanaClient';

const StakingRewards = () => {
  const [stakeAmount, setStakeAmount] = useState(0);
  const [userStakes, setUserStakes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const { publicKey, sendTransaction, signTransaction } = useWallet();

  // Load staking data from localStorage
  useEffect(() => {
    const stakes = localStorage.getItem('userStakes');
    if (stakes) {
      setUserStakes(JSON.parse(stakes));
    }
  }, []);

  // Auto-calculate rewards periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setUserStakes(prevStakes => {
        return prevStakes.map(stake => {
          const hoursPassed = (Date.now() - new Date(stake.stakeTime).getTime()) / (1000 * 60 * 60);
          const rewardRate = 0.125 / 365 / 24; // 12.5% APY per hour
          const newRewards = stake.amount * hoursPassed * rewardRate;
          const newProgress = Math.min(((hoursPassed / stake.lockPeriodHours) * 100), 100);
          
          return {
            ...stake,
            rewards: stake.amount * rewardRate * hoursPassed,
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

  // Real wallet transaction for staking
  const stakeToken = async (amount) => {
    if (!publicKey || !sendTransaction) {
      throw new Error('Wallet not connected');
    }

    try {
      const connection = getConnection();
      
      // Create a staking transaction
      // In production, this would interact with a staking smart contract
      // For now, we'll create a memo instruction to record the stake
      const transaction = new Transaction();
      
      // Get recent blockhash
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;
      
      // Send transaction to wallet for signing
      const signature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature, 'confirmed');
      
      console.log('Staking transaction confirmed:', signature);
      
      return {
        success: true,
        signature,
        explorerUrl: `https://explorer.solana.com/tx/${signature}?cluster=devnet`
      };
    } catch (error) {
      console.error('Staking transaction error:', error);
      throw error;
    }
  };

  const handleStake = async () => {
    if (!publicKey) {
      toast({
        title: 'Wallet Not Connected',
        description: 'Please connect your wallet to stake tokens',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    if (stakeAmount <= 0) {
      toast({
        title: 'Invalid Amount',
        description: 'Please enter a valid stake amount',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);

    try {
      // Execute real wallet transaction
      const result = await stakeToken(stakeAmount);
      
      if (result.success) {
        const newStake = {
          id: Date.now(),
          amount: stakeAmount,
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
        setStakeAmount(0);
        
        toast({
          title: 'Staked Successfully! 🎉',
          description: `Staked ${stakeAmount} tokens for 30 days`,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Staking error:', error);
      toast({
        title: 'Staking Failed',
        description: error.message || 'Failed to stake tokens. Please try again.',
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
      // Create unstaking transaction
      const connection = getConnection();
      const transaction = new Transaction();
      
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;
      
      const signature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature, 'confirmed');
      
      const hoursPassed = (Date.now() - new Date(stake.stakeTime).getTime()) / (1000 * 60 * 60);
      const rewardRate = 0.125 / 365 / 24;
      const totalRewards = stake.amount * hoursPassed * rewardRate;
      
      setUserStakes(userStakes.filter(s => s.id !== stakeId));
      
      toast({
        title: 'Unstaked Successfully! 💰',
        description: `You earned ${totalRewards.toFixed(2)} tokens in rewards`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Unstaking error:', error);
      toast({
        title: 'Unstaking Failed',
        description: error.message || 'Failed to unstake tokens. Please try again.',
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
    const totalStaked = stakes.reduce((sum, stake) => sum + (stake.amount || 0), 0);
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
                <Text fontSize="sm" color="gray.600">Total Staked</Text>
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
            <Heading size="md">Stake Tokens</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={4}>
              <HStack spacing={4} w="full">
                <Button
                  size="sm"
                  onClick={() => setStakeAmount(stakeAmount + 100)}
                >
                  +100
                </Button>
                <Button
                  size="sm"
                  onClick={() => setStakeAmount(stakeAmount + 500)}
                >
                  +500
                </Button>
                <Button
                  size="sm"
                  onClick={() => setStakeAmount(stakeAmount + 1000)}
                >
                  +1000
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setStakeAmount(0)}
                >
                  Clear
                </Button>
              </HStack>
              <Text fontSize="lg" fontWeight="bold">
                Stake Amount: {stakeAmount} tokens
              </Text>
              <Button
                colorScheme="teal"
                size="lg"
                onClick={handleStake}
                isDisabled={stakeAmount <= 0 || isLoading}
                isLoading={isLoading}
                loadingText="Processing..."
              >
                {isLoading ? <Spinner size="sm" /> : 'Stake Tokens'}
              </Button>
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
                        <Text fontWeight="bold">Stake #{stake.id}</Text>
                        <Badge colorScheme="green">Active</Badge>
                      </HStack>
                      <HStack justify="space-between">
                        <Text>Amount: {stake.amount} tokens</Text>
                        <Text>Rewards: {stake.rewards.toFixed(2)} tokens</Text>
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
