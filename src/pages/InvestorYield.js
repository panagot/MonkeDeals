import React, { useState, useEffect } from 'react';
import {
  Box, Heading, Text, Stack, SimpleGrid, Button, Badge, Divider, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, useDisclosure, useToast, Input, Select, Checkbox, Tabs, TabList, TabPanels, Tab, TabPanel, Image, Flex, Skeleton, VStack, Alert, AlertIcon, AlertTitle, AlertDescription, Code, Link, HStack, Icon, Spinner
} from '@chakra-ui/react';
import { useWallet } from '@solana/wallet-adapter-react';
import { AnimatePresence } from 'framer-motion';
import { ArrowUpIcon, EditIcon, ExternalLinkIcon } from '@chakra-ui/icons';
import { useSolana } from '../hooks/useSolana';

const InvestorYield = () => {
  const { connected, publicKey } = useWallet();
  const { getPortfolioOverview, getPortfolioAnalytics } = useSolana();
  const [portfolioData, setPortfolioData] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (connected && publicKey) {
      loadYieldData();
    }
  }, [connected, publicKey]);

  const loadYieldData = async () => {
    setLoading(true);
    try {
      const [portfolio, portfolioAnalytics] = await Promise.all([
        getPortfolioOverview(),
        getPortfolioAnalytics()
      ]);
      
      setPortfolioData(portfolio);
      setAnalytics(portfolioAnalytics);
    } catch (error) {
      console.error('Failed to load yield data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load yield data',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  if (!connected) {
    return (
      <Box maxW="7xl" mx="auto" mt={10} p={6}>
        <Alert status="info">
          <AlertIcon />
          <AlertTitle>Wallet Not Connected</AlertTitle>
          <AlertDescription>
            Please connect your wallet to view your deal savings.
          </AlertDescription>
        </Alert>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box maxW="7xl" mx="auto" mt={10} p={6}>
        <VStack spacing={4}>
          <Spinner size="xl" color="teal.500" />
          <Text>Loading deal savings data...</Text>
        </VStack>
      </Box>
    );
  }

  return (
    <Box maxW="7xl" mx="auto" mt={10} p={6}>
      <VStack spacing={8} align="stretch">
        {/* Header */}
        <Box textAlign="center">
          <Heading size="2xl" color="teal.600" mb={4}>
            Deal Savings Dashboard
          </Heading>
          <Text fontSize="lg" color="gray.600">
            Track your savings and deal statistics
          </Text>
        </Box>

        {/* Yield Overview */}
        {portfolioData && (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
            <Box bg="white" p={6} borderRadius="lg" boxShadow="md">
              <Text fontSize="sm" color="gray.600" mb={2}>Total Savings</Text>
              <Text fontSize="2xl" fontWeight="bold" color="green.600">
                {portfolioData.totalYield || 0}%
              </Text>
            </Box>
            <Box bg="white" p={6} borderRadius="lg" boxShadow="md">
              <Text fontSize="sm" color="gray.600" mb={2}>Avg Discount</Text>
              <Text fontSize="2xl" fontWeight="bold" color="blue.600">
                {portfolioData.annualYield || 0}%
              </Text>
            </Box>
            <Box bg="white" p={6} borderRadius="lg" boxShadow="md">
              <Text fontSize="sm" color="gray.600" mb={2}>Monthly Yield</Text>
              <Text fontSize="2xl" fontWeight="bold" color="purple.600">
                {portfolioData.monthlyYield || 0}%
              </Text>
            </Box>
            <Box bg="white" p={6} borderRadius="lg" boxShadow="md">
              <Text fontSize="sm" color="gray.600" mb={2}>Yield Rate</Text>
              <Text fontSize="2xl" fontWeight="bold" color="teal.600">
                {portfolioData.yieldRate || 0}%
              </Text>
            </Box>
          </SimpleGrid>
        )}

        {/* Yield Analytics */}
        {analytics && (
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
            <Box bg="white" p={6} borderRadius="lg" boxShadow="md">
              <Heading size="md" mb={4}>Yield Performance</Heading>
              <VStack align="stretch" spacing={4}>
                <HStack justify="space-between">
                  <Text>Total Return</Text>
                  <Text fontWeight="bold" color="green.600">{analytics.totalReturn}%</Text>
                </HStack>
                <HStack justify="space-between">
                  <Text>Average Return</Text>
                  <Text fontWeight="bold" color="blue.600">{analytics.averageReturn}%</Text>
                </HStack>
                <HStack justify="space-between">
                  <Text>Best Performer</Text>
                  <Text fontWeight="bold" color="purple.600">{analytics.bestPerformer}%</Text>
                </HStack>
                <HStack justify="space-between">
                  <Text>Yield Growth</Text>
                  <Text fontWeight="bold" color="teal.600">{analytics.yieldGrowth}%</Text>
                </HStack>
              </VStack>
            </Box>

            <Box bg="white" p={6} borderRadius="lg" boxShadow="md">
              <Heading size="md" mb={4}>Yield Metrics</Heading>
              <VStack align="stretch" spacing={4}>
                <HStack justify="space-between">
                  <Text>Yield Stability</Text>
                  <Text fontWeight="bold" color="orange.600">{analytics.yieldStability}/10</Text>
                </HStack>
                <HStack justify="space-between">
                  <Text>Yield Consistency</Text>
                  <Text fontWeight="bold" color="cyan.600">{analytics.yieldConsistency}%</Text>
                </HStack>
                <HStack justify="space-between">
                  <Text>Yield Volatility</Text>
                  <Text fontWeight="bold" color="red.600">{analytics.yieldVolatility}%</Text>
                </HStack>
                <HStack justify="space-between">
                  <Text>Yield Trend</Text>
                  <Text fontWeight="bold" color="green.600">{analytics.yieldTrend}</Text>
                </HStack>
              </VStack>
            </Box>
          </SimpleGrid>
        )}

        {/* Yield History */}
        <Box bg="white" p={6} borderRadius="lg" boxShadow="md">
          <Heading size="md" mb={4}>Yield History</Heading>
          <Text color="gray.600" textAlign="center" py={8}>
            Yield history chart will be displayed here
          </Text>
        </Box>

        {/* Yield Recommendations */}
        <Box bg="white" p={6} borderRadius="lg" boxShadow="md">
          <Heading size="md" mb={4}>Yield Recommendations</Heading>
          <VStack align="stretch" spacing={4}>
            <Alert status="info">
              <AlertIcon />
              <AlertTitle>Optimize Your Yield</AlertTitle>
              <AlertDescription>
                Consider diversifying your portfolio to improve yield stability and reduce risk.
              </AlertDescription>
            </Alert>
            <Alert status="success">
              <AlertIcon />
              <AlertTitle>High Performing Deals</AlertTitle>
              <AlertDescription>
                Your restaurant deals are performing exceptionally well. Consider increasing your allocation.
              </AlertDescription>
            </Alert>
          </VStack>
        </Box>
      </VStack>
    </Box>
  );
};

export default InvestorYield;
