import React, { useState, useEffect } from 'react';
import {
  Box, Heading, Text, Stack, SimpleGrid, Button, Badge, Divider, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, useDisclosure, useToast, Input, Select, Checkbox, Tabs, TabList, TabPanels, Tab, TabPanel, Image, Flex, Skeleton, VStack, Alert, AlertIcon, AlertTitle, AlertDescription, Code, Link, HStack, Icon, Spinner
} from '@chakra-ui/react';
import { useWallet } from '@solana/wallet-adapter-react';
import { AnimatePresence } from 'framer-motion';
import { ArrowUpIcon, EditIcon, ExternalLinkIcon } from '@chakra-ui/icons';
import { useSolana } from '../hooks/useSolana';

const InvestorDashboard = () => {
  const { connected, publicKey } = useWallet();
  const { getPortfolioOverview, getPortfolioDeals, getPortfolioAnalytics } = useSolana();
  const [portfolioData, setPortfolioData] = useState(null);
  const [deals, setDeals] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedDeal, setSelectedDeal] = useState(null);
  const toast = useToast();

  useEffect(() => {
    if (connected && publicKey) {
      loadPortfolioData();
    }
  }, [connected, publicKey]);

  const loadPortfolioData = async () => {
    setLoading(true);
    try {
      const [portfolio, portfolioDeals, portfolioAnalytics] = await Promise.all([
        getPortfolioOverview(),
        getPortfolioDeals(),
        getPortfolioAnalytics()
      ]);
      
      setPortfolioData(portfolio);
      setDeals(portfolioDeals);
      setAnalytics(portfolioAnalytics);
    } catch (error) {
      console.error('Failed to load portfolio data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load portfolio data',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSellDeal = (deal) => {
    setSelectedDeal(deal);
    onOpen();
  };

  const confirmSell = async () => {
    try {
      // Implement sell functionality
      toast({
        title: 'Success',
        description: 'Deal listed for sale successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onClose();
      loadPortfolioData();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to list deal for sale',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  if (!connected) {
    return (
      <Box maxW="7xl" mx="auto" mt={10} p={6}>
        <Alert status="info">
          <AlertIcon />
          <AlertTitle>Wallet Not Connected</AlertTitle>
          <AlertDescription>
            Please connect your wallet to view your investment portfolio.
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
          <Text>Loading portfolio data...</Text>
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
            Investor Dashboard
          </Heading>
          <Text fontSize="lg" color="gray.600">
            Track your deal investments and portfolio performance
          </Text>
        </Box>

        {/* Portfolio Overview */}
        {portfolioData && (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
            <Box bg="white" p={6} borderRadius="lg" boxShadow="md">
              <Text fontSize="sm" color="gray.600" mb={2}>Total Investments</Text>
              <Text fontSize="2xl" fontWeight="bold" color="teal.600">
                {portfolioData.totalInvestments || 0}
              </Text>
            </Box>
            <Box bg="white" p={6} borderRadius="lg" boxShadow="md">
              <Text fontSize="sm" color="gray.600" mb={2}>Active Deals</Text>
              <Text fontSize="2xl" fontWeight="bold" color="blue.600">
                {portfolioData.activeDeals || 0}
              </Text>
            </Box>
            <Box bg="white" p={6} borderRadius="lg" boxShadow="md">
              <Text fontSize="sm" color="gray.600" mb={2}>Total Value</Text>
              <Text fontSize="2xl" fontWeight="bold" color="green.600">
                ${portfolioData.totalValue || 0}
              </Text>
            </Box>
            <Box bg="white" p={6} borderRadius="lg" boxShadow="md">
              <Text fontSize="sm" color="gray.600" mb={2}>Returns</Text>
              <Text fontSize="2xl" fontWeight="bold" color="purple.600">
                {portfolioData.returns || 0}%
              </Text>
            </Box>
          </SimpleGrid>
        )}

        {/* Deals Table */}
        <Box bg="white" p={6} borderRadius="lg" boxShadow="md">
          <Heading size="md" mb={4}>Your Deals</Heading>
          {deals.length === 0 ? (
            <Text color="gray.600" textAlign="center" py={8}>
              No deals found. Start investing in deals from the marketplace.
            </Text>
          ) : (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
              {deals.map((deal) => (
                <Box key={deal.id} border="1px solid" borderColor="gray.200" p={4} borderRadius="md">
                  <VStack align="stretch" spacing={3}>
                    <Image src={deal.image} alt={deal.title} borderRadius="md" h="150px" objectFit="cover" />
                    <Heading size="sm">{deal.title}</Heading>
                    <Text fontSize="sm" color="gray.600">{deal.merchant}</Text>
                    <Text fontSize="sm"><strong>Investment:</strong> ${deal.investment}</Text>
                    <Text fontSize="sm"><strong>Current Value:</strong> ${deal.currentValue}</Text>
                    <Text fontSize="sm"><strong>Status:</strong> {deal.status}</Text>
                    <Button size="sm" colorScheme="teal" onClick={() => handleSellDeal(deal)}>
                      Sell Deal
                    </Button>
                  </VStack>
                </Box>
              ))}
            </SimpleGrid>
          )}
        </Box>

        {/* Analytics */}
        {analytics && (
          <Box bg="white" p={6} borderRadius="lg" boxShadow="md">
            <Heading size="md" mb={4}>Portfolio Analytics</Heading>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              <Box>
                <Text fontSize="sm" color="gray.600" mb={2}>Performance Metrics</Text>
                <VStack align="stretch" spacing={2}>
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
                </VStack>
              </Box>
              <Box>
                <Text fontSize="sm" color="gray.600" mb={2}>Risk Metrics</Text>
                <VStack align="stretch" spacing={2}>
                  <HStack justify="space-between">
                    <Text>Risk Score</Text>
                    <Text fontWeight="bold" color="orange.600">{analytics.riskScore}/10</Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text>Diversification</Text>
                    <Text fontWeight="bold" color="teal.600">{analytics.diversification}%</Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text>Volatility</Text>
                    <Text fontWeight="bold" color="red.600">{analytics.volatility}%</Text>
                  </HStack>
                </VStack>
              </Box>
            </SimpleGrid>
          </Box>
        )}
      </VStack>

      {/* Sell Deal Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Sell Deal</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedDeal && (
              <VStack spacing={4}>
                <Text><strong>Deal:</strong> {selectedDeal.title}</Text>
                <Text><strong>Current Value:</strong> ${selectedDeal.currentValue}</Text>
                <Text><strong>Investment:</strong> ${selectedDeal.investment}</Text>
                <Text><strong>Profit/Loss:</strong> ${selectedDeal.currentValue - selectedDeal.investment}</Text>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="red" onClick={confirmSell}>
              Confirm Sale
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default InvestorDashboard;
