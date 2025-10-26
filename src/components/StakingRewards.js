import React, { useState } from 'react';
import {
  Box, Heading, Text, Stack, Button, Badge, HStack, VStack, Icon, useToast, SimpleGrid, Card, CardBody, CardHeader, Progress
} from '@chakra-ui/react';
import { StarIcon, TrendingUpIcon, TrendingDownIcon, LockIcon } from '@chakra-ui/icons';

const StakingRewards = ({ userStakes, onStake, onUnstake }) => {
  const [stakeAmount, setStakeAmount] = useState(0);
  const toast = useToast();

  const handleStake = () => {
    if (stakeAmount > 0) {
      if (onStake) {
        onStake(stakeAmount);
      }
      toast({
        title: 'Staked',
        description: `Staked ${stakeAmount} tokens successfully`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleUnstake = (stakeId) => {
    if (onUnstake) {
      onUnstake(stakeId);
    }
    toast({
      title: 'Unstaked',
      description: 'Tokens unstaked successfully',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
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
                isDisabled={stakeAmount <= 0}
              >
                Stake Tokens
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
                        >
                          Unstake
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
