import React, { useState, useEffect } from 'react';
import {
  Box, Heading, Text, VStack, HStack, SimpleGrid, Stat, StatLabel, StatNumber, StatHelpText, StatArrow, 
  Badge, Button, Table, Thead, Tbody, Tr, Th, Td, Tabs, TabList, TabPanels, Tab, TabPanel,
  Alert, AlertIcon, AlertTitle, AlertDescription, Code, Link, Spinner, Progress, Divider,
  Card, CardHeader, CardBody, CardFooter, Icon, Tooltip, useToast, Select, Input, InputGroup, InputLeftElement,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter,
  useDisclosure, FormControl, FormLabel, Textarea, Switch, Slider, SliderTrack, SliderFilledTrack, SliderThumb,
  Image
} from '@chakra-ui/react';
import { 
  ExternalLinkIcon, CheckCircleIcon, WarningIcon, ArrowUpIcon, ArrowDownIcon, 
  StarIcon, TimeIcon, DollarIcon, TrendingUpIcon, TrendingDownIcon, InfoIcon,
  SearchIcon, FilterIcon, DownloadIcon, RepeatIcon, SettingsIcon, ViewIcon
} from '@chakra-ui/icons';
import { useSolana } from '../hooks/useSolana';
import { AnimatePresence, motion as framerMotion } from 'framer-motion';

const MotionBox = framerMotion(Box);
const MotionCard = framerMotion(Card);
const MotionTr = framerMotion(Tr);

const PortfolioTracking = () => {
  const { connected, publicKey, getPortfolioOverview, getPortfolioDeals, getPortfolioAnalytics, 
          getPortfolioPerformance, getPortfolioHistory, getPortfolioInsights, loading, error } = useSolana();
  
  const [portfolioData, setPortfolioData] = useState(null);
  const [dealsData, setDealsData] = useState([]);
  const [mintedDeals, setMintedDeals] = useState([]);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [performanceData, setPerformanceData] = useState(null);
  const [historyData, setHistoryData] = useState([]);
  const [insightsData, setInsightsData] = useState(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState('30d');
  const [filters, setFilters] = useState({});
  const [sortBy, setSortBy] = useState('purchaseDate');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedDeal, setSelectedDeal] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  // Load minted deals from localStorage
  useEffect(() => {
    const loadMintedDeals = () => {
      const data = localStorage.getItem('mintedDeals');
      if (data) {
        setMintedDeals(JSON.parse(data));
      }
    };
    loadMintedDeals();
    
    // Also listen for storage changes (if user mints a new NFT in another tab)
    window.addEventListener('storage', loadMintedDeals);
    return () => window.removeEventListener('storage', loadMintedDeals);
  }, []);

  // Load portfolio data when wallet connects
  useEffect(() => {
    const loadPortfolioData = async () => {
      if (connected && publicKey) {
        try {
          // Load all portfolio data
          const [overview, deals, analytics, performance, history, insights] = await Promise.all([
            getPortfolioOverview(publicKey.toString()),
            getPortfolioDeals(publicKey.toString(), filters),
            getPortfolioAnalytics(publicKey.toString(), selectedTimeframe),
            getPortfolioPerformance(publicKey.toString()),
            getPortfolioHistory(publicKey.toString(), 50),
            getPortfolioInsights(publicKey.toString())
          ]);

          if (overview.success) setPortfolioData(overview.portfolio);
          if (deals.success) setDealsData(deals.deals);
          if (analytics.success) setAnalyticsData(analytics.analytics);
          if (performance.success) setPerformanceData(performance.performance);
          if (history.success) setHistoryData(history.history);
          if (insights.success) setInsightsData(insights.insights);

        } catch (err) {
          console.error('Error loading portfolio data:', err);
          toast({
            title: 'Error Loading Portfolio',
            description: 'Failed to load portfolio data. Please try again.',
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
        }
      }
    };

    loadPortfolioData();
  }, [connected, publicKey, selectedTimeframe, filters, getPortfolioOverview, getPortfolioDeals, getPortfolioAnalytics, getPortfolioPerformance, getPortfolioHistory, getPortfolioInsights, toast]);

  const handleDealClick = (deal) => {
    setSelectedDeal(deal);
    onOpen();
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'green';
      case 'Redeemed': return 'blue';
      case 'Expired': return 'red';
      default: return 'gray';
    }
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'Low': return 'green';
      case 'Medium': return 'yellow';
      case 'High': return 'red';
      default: return 'gray';
    }
  };

  if (!connected) {
    return (
      <Box p={6} bg="white" borderRadius="md" border="1px solid" borderColor="gray.200" boxShadow="md">
        <Alert status="warning" borderRadius="md">
          <AlertIcon />
          <AlertTitle>Wallet Not Connected!</AlertTitle>
          <AlertDescription>
            Please connect your Solana wallet to view your portfolio.
          </AlertDescription>
        </Alert>
      </Box>
    );
  }

  return (
    <Box p={6} bg="white" borderRadius="md" border="1px solid" borderColor="gray.200" boxShadow="md">
      <VStack spacing={8} align="stretch">
        {/* Header */}
        <Box>
          <Heading size="xl" color="gray.800" mb={2}>
            📊 Portfolio Dashboard
          </Heading>
          <Text color="gray.600" mb={4}>
            Track your deal NFT investments, performance, and savings on the Solana blockchain.
          </Text>
          {publicKey && (
            <Code fontSize="sm" p={2} bg="gray.100" borderRadius="md">
              Wallet: {publicKey.toString().slice(0, 8)}...{publicKey.toString().slice(-8)}
            </Code>
          )}
        </Box>

        {/* Portfolio Overview Cards */}
        {portfolioData && (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
            <MotionCard
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              p={6}
              bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
              color="white"
              borderRadius="lg"
              boxShadow="lg"
            >
              <Stat>
                <StatLabel color="white" fontSize="sm">Total Portfolio Value</StatLabel>
                <StatNumber fontSize="2xl">${portfolioData.totalValue.toLocaleString()}</StatNumber>
                <StatHelpText color="white">
                  <StatArrow type="increase" />
                  {portfolioData.portfolioGrowth}% growth
                </StatHelpText>
              </Stat>
            </MotionCard>

            <MotionCard
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              p={6}
              bg="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
              color="white"
              borderRadius="lg"
              boxShadow="lg"
            >
              <Stat>
                <StatLabel color="white" fontSize="sm">Total Savings</StatLabel>
                <StatNumber fontSize="2xl">${portfolioData.totalSavings.toLocaleString()}</StatNumber>
                <StatHelpText color="white">
                  {portfolioData.averageDiscount}% avg discount
                </StatHelpText>
              </Stat>
            </MotionCard>

            <MotionCard
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              p={6}
              bg="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
              color="white"
              borderRadius="lg"
              boxShadow="lg"
            >
              <Stat>
                <StatLabel color="white" fontSize="sm">Active Deals</StatLabel>
                <StatNumber fontSize="2xl">{portfolioData.activeDeals}</StatNumber>
                <StatHelpText color="white">
                  {portfolioData.totalDeals} total deals
                </StatHelpText>
              </Stat>
            </MotionCard>

            <MotionCard
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              p={6}
              bg="linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
              color="white"
              borderRadius="lg"
              boxShadow="lg"
            >
              <Stat>
                <StatLabel color="white" fontSize="sm">Redeemed Deals</StatLabel>
                <StatNumber fontSize="2xl">{portfolioData.redeemedDeals}</StatNumber>
                <StatHelpText color="white">
                  {portfolioData.expiredDeals} expired
                </StatHelpText>
              </Stat>
            </MotionCard>
          </SimpleGrid>
        )}

        {/* Main Content Tabs */}
        <Tabs variant="enclosed" colorScheme="teal">
          <TabList>
            <Tab>📈 Portfolio Overview</Tab>
            <Tab>💼 My Deals</Tab>
            <Tab>📊 Analytics</Tab>
            <Tab>🎯 Performance</Tab>
            <Tab>📜 History</Tab>
            <Tab>💡 Insights</Tab>
          </TabList>

          <TabPanels>
            {/* Portfolio Overview Tab */}
            <TabPanel>
              <VStack spacing={6} align="stretch">
                {portfolioData?.recentActivity && (
                  <Box>
                    <Heading size="md" mb={4}>Recent Activity</Heading>
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                      {portfolioData.recentActivity.map((activity, index) => (
                        <MotionCard
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          p={4}
                          border="1px solid"
                          borderColor="gray.200"
                          borderRadius="md"
                        >
                          <HStack justify="space-between">
                            <VStack align="start" spacing={1}>
                              <Text fontWeight="bold" fontSize="sm">
                                {activity.type === 'purchase' ? '🛒 Purchased' : '🎉 Redeemed'}
                              </Text>
                              <Text fontSize="sm" color="gray.600">
                                {activity.dealTitle}
                              </Text>
                              <Text fontSize="xs" color="gray.500">
                                {new Date(activity.timestamp).toLocaleString()}
                              </Text>
                            </VStack>
                            <VStack align="end" spacing={1}>
                              <Text fontWeight="bold" color={activity.type === 'purchase' ? 'red.500' : 'green.500'}>
                                {activity.type === 'purchase' ? `-$${activity.amount}` : `+$${activity.savings}`}
                              </Text>
                              <Link href={`https://explorer.solana.com/tx/${activity.transactionSignature}?cluster=devnet`} isExternal>
                                <Icon as={ExternalLinkIcon} boxSize={3} color="blue.500" />
                              </Link>
                            </VStack>
                          </HStack>
                        </MotionCard>
                      ))}
                    </SimpleGrid>
                  </Box>
                )}

                {portfolioData?.topPerformingDeal && (
                  <Box>
                    <Heading size="md" mb={4}>Top Performing Deal</Heading>
                    <Card p={4} bg="green.50" border="1px solid" borderColor="green.200">
                      <HStack justify="space-between">
                        <VStack align="start" spacing={1}>
                          <Text fontWeight="bold">{portfolioData.topPerformingDeal.title}</Text>
                          <Text fontSize="sm" color="gray.600">
                            Return: {portfolioData.topPerformingDeal.return}%
                          </Text>
                        </VStack>
                        <VStack align="end" spacing={1}>
                          <Text fontWeight="bold" color="green.500" fontSize="lg">
                            +${portfolioData.topPerformingDeal.savings}
                          </Text>
                          <Badge colorScheme="green">Best Performer</Badge>
                        </VStack>
                      </HStack>
                    </Card>
                  </Box>
                )}

                {/* My Minted NFTs Section */}
                {mintedDeals.length > 0 && (
                  <Box>
                    <Heading size="md" mb={4}>🎨 My Minted Deal NFTs</Heading>
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                      {mintedDeals.map((deal, index) => (
                        <MotionCard
                          key={deal.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          p={4}
                          border="1px solid"
                          borderColor="blue.200"
                          borderRadius="md"
                          bg="blue.50"
                        >
                          <HStack spacing={4} align="start">
                            {/* NFT Image */}
                            {deal.imageUrl && (
                              <Box flexShrink={0}>
                                <Image
                                  src={deal.imageUrl}
                                  alt={deal.dealTitle}
                                  width="120px"
                                  height="120px"
                                  objectFit="cover"
                                  borderRadius="md"
                                  fallback={
                                    <Box
                                      width="120px"
                                      height="120px"
                                      bg="gray.200"
                                      borderRadius="md"
                                      display="flex"
                                      alignItems="center"
                                      justifyContent="center"
                                    >
                                      <Text fontSize="xs" color="gray.400">No Image</Text>
                                    </Box>
                                  }
                                />
                              </Box>
                            )}
                            
                            <VStack align="start" spacing={2} flex={1}>
                              <HStack justify="space-between" w="full">
                                <Text fontWeight="bold" fontSize="md">{deal.dealTitle}</Text>
                                <Badge colorScheme="blue">Minted</Badge>
                              </HStack>
                              <Text fontSize="sm" color="gray.600">{deal.merchant}</Text>
                              <HStack spacing={2}>
                                <Text fontSize="sm" color="gray.600">Discount:</Text>
                                <Text fontWeight="bold" color="green.500">{deal.discountPercentage}</Text>
                              </HStack>
                              <Divider />
                              <HStack spacing={4} fontSize="xs" color="gray.500" w="full">
                                <HStack>
                                  <Text>Deal ID:</Text>
                                  <Code fontSize="xs">{deal.id}</Code>
                                </HStack>
                                {deal.explorerUrl && (
                                  <Link href={deal.explorerUrl} isExternal>
                                    <Icon as={ExternalLinkIcon} boxSize={3} color="blue.500" />
                                  </Link>
                                )}
                              </HStack>
                            </VStack>
                          </HStack>
                        </MotionCard>
                      ))}
                    </SimpleGrid>
                  </Box>
                )}
              </VStack>
            </TabPanel>

            {/* My Deals Tab */}
            <TabPanel>
              <VStack spacing={6} align="stretch">
                {/* Filters and Search */}
                <Box p={4} bg="gray.50" borderRadius="md">
                  <HStack spacing={4} wrap="wrap">
                    <InputGroup maxW="300px">
                      <InputLeftElement>
                        <Icon as={SearchIcon} color="gray.400" />
                      </InputLeftElement>
                      <Input placeholder="Search deals..." />
                    </InputGroup>
                    <Select placeholder="Filter by status" maxW="200px" onChange={(e) => handleFilterChange('status', e.target.value)}>
                      <option value="Active">Active</option>
                      <option value="Redeemed">Redeemed</option>
                      <option value="Expired">Expired</option>
                    </Select>
                    <Select placeholder="Filter by category" maxW="200px" onChange={(e) => handleFilterChange('category', e.target.value)}>
                      <option value="Food & Dining">Food & Dining</option>
                      <option value="Travel & Hotels">Travel & Hotels</option>
                      <option value="Entertainment">Entertainment</option>
                    </Select>
                    <Button leftIcon={<Icon as={RepeatIcon} />} onClick={() => window.location.reload()}>
                      Refresh
                    </Button>
                  </HStack>
                </Box>

                {/* Deals Table */}
                <Box overflowX="auto">
                  <Table variant="simple" size="sm">
                    <Thead>
                      <Tr>
                        <Th cursor="pointer" onClick={() => handleSort('title')}>
                          Deal <Icon as={sortBy === 'title' ? (sortOrder === 'asc' ? ArrowUpIcon : ArrowDownIcon) : ViewIcon} ml={1} />
                        </Th>
                        <Th cursor="pointer" onClick={() => handleSort('status')}>
                          Status <Icon as={sortBy === 'status' ? (sortOrder === 'asc' ? ArrowUpIcon : ArrowDownIcon) : ViewIcon} ml={1} />
                        </Th>
                        <Th cursor="pointer" onClick={() => handleSort('currentValue')}>
                          Value <Icon as={sortBy === 'currentValue' ? (sortOrder === 'asc' ? ArrowUpIcon : ArrowDownIcon) : ViewIcon} ml={1} />
                        </Th>
                        <Th cursor="pointer" onClick={() => handleSort('potentialSavings')}>
                          Savings <Icon as={sortBy === 'potentialSavings' ? (sortOrder === 'asc' ? ArrowUpIcon : ArrowDownIcon) : ViewIcon} ml={1} />
                        </Th>
                        <Th cursor="pointer" onClick={() => handleSort('timeToExpiry')}>
                          Expires <Icon as={sortBy === 'timeToExpiry' ? (sortOrder === 'asc' ? ArrowUpIcon : ArrowDownIcon) : ViewIcon} ml={1} />
                        </Th>
                        <Th>Risk</Th>
                        <Th>Actions</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {dealsData.map((deal, index) => (
                        <MotionTr
                          key={deal.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          _hover={{ bg: 'gray.50' }}
                          cursor="pointer"
                          onClick={() => handleDealClick(deal)}
                        >
                          <Td>
                            <VStack align="start" spacing={1}>
                              <Text fontWeight="bold" fontSize="sm">{deal.title}</Text>
                              <Text fontSize="xs" color="gray.500">{deal.merchant}</Text>
                              <Text fontSize="xs" color="gray.400">{deal.category}</Text>
                            </VStack>
                          </Td>
                          <Td>
                            <Badge colorScheme={getStatusColor(deal.status)} size="sm">
                              {deal.status}
                            </Badge>
                          </Td>
                          <Td>
                            <Text fontWeight="bold">${deal.currentValue}</Text>
                            <Text fontSize="xs" color="gray.500">
                              {deal.discountPercentage}% off
                            </Text>
                          </Td>
                          <Td>
                            <Text fontWeight="bold" color="green.500">
                              ${deal.potentialSavings || deal.actualSavings || 0}
                            </Text>
                            {deal.returnOnInvestment > 0 && (
                              <Text fontSize="xs" color="green.500">
                                {deal.returnOnInvestment}% ROI
                              </Text>
                            )}
                          </Td>
                          <Td>
                            <HStack spacing={1}>
                              <Icon as={TimeIcon} boxSize={3} color="gray.400" />
                              <Text fontSize="sm">{deal.timeToExpiry}</Text>
                            </HStack>
                          </Td>
                          <Td>
                            <Badge colorScheme={getRiskColor(deal.riskLevel)} size="sm">
                              {deal.riskLevel}
                            </Badge>
                          </Td>
                          <Td>
                            <HStack spacing={2}>
                              {deal.isRedeemable && (
                                <Button size="xs" colorScheme="green">
                                  Redeem
                                </Button>
                              )}
                              <Button size="xs" variant="outline">
                                View
                              </Button>
                            </HStack>
                          </Td>
                        </MotionTr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>
              </VStack>
            </TabPanel>

            {/* Analytics Tab */}
            <TabPanel>
              {analyticsData && (
                <VStack spacing={6} align="stretch">
                  <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
                    <Stat p={4} bg="blue.50" borderRadius="md" border="1px solid" borderColor="blue.200">
                      <StatLabel>Total Spent</StatLabel>
                      <StatNumber color="blue.600">${analyticsData.totalSpent}</StatNumber>
                      <StatHelpText>
                        <StatArrow type="increase" />
                        {analyticsData.dealsPurchased} deals
                      </StatHelpText>
                    </Stat>

                    <Stat p={4} bg="green.50" borderRadius="md" border="1px solid" borderColor="green.200">
                      <StatLabel>Total Savings</StatLabel>
                      <StatNumber color="green.600">${analyticsData.totalSavings}</StatNumber>
                      <StatHelpText>
                        <StatArrow type="increase" />
                        {analyticsData.roi}% ROI
                      </StatHelpText>
                    </Stat>

                    <Stat p={4} bg="purple.50" borderRadius="md" border="1px solid" borderColor="purple.200">
                      <StatLabel>Redemption Rate</StatLabel>
                      <StatNumber color="purple.600">{analyticsData.redemptionRate}%</StatNumber>
                      <StatHelpText>
                        {analyticsData.dealsRedeemed} of {analyticsData.dealsPurchased} deals
                      </StatHelpText>
                    </Stat>

                    <Stat p={4} bg="orange.50" borderRadius="md" border="1px solid" borderColor="orange.200">
                      <StatLabel>Avg Deal Value</StatLabel>
                      <StatNumber color="orange.600">${analyticsData.averageDealValue}</StatNumber>
                      <StatHelpText>
                        Top: {analyticsData.topCategory}
                      </StatHelpText>
                    </Stat>
                  </SimpleGrid>

                  <Box>
                    <Heading size="md" mb={4}>Timeframe Analysis</Heading>
                    <HStack spacing={4} mb={4}>
                      {['7d', '30d', '90d'].map((timeframe) => (
                        <Button
                          key={timeframe}
                          size="sm"
                          colorScheme={selectedTimeframe === timeframe ? 'teal' : 'gray'}
                          variant={selectedTimeframe === timeframe ? 'solid' : 'outline'}
                          onClick={() => setSelectedTimeframe(timeframe)}
                        >
                          {timeframe}
                        </Button>
                      ))}
                    </HStack>
                  </Box>
                </VStack>
              )}
            </TabPanel>

            {/* Performance Tab */}
            <TabPanel>
              {performanceData && (
                <VStack spacing={6} align="stretch">
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                    <Card p={6}>
                      <VStack spacing={4} align="stretch">
                        <Heading size="md">Performance Metrics</Heading>
                        <HStack justify="space-between">
                          <Text>Total Return:</Text>
                          <Text fontWeight="bold" color="green.500">{performanceData.totalReturn}%</Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text>Total Savings:</Text>
                          <Text fontWeight="bold" color="green.500">${performanceData.totalSavings}</Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text>Best Deal:</Text>
                          <Text fontWeight="bold">{performanceData.bestPerformingDeal.title}</Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text>Best Return:</Text>
                          <Text fontWeight="bold" color="green.500">{performanceData.bestPerformingDeal.return}%</Text>
                        </HStack>
                      </VStack>
                    </Card>

                    <Card p={6}>
                      <VStack spacing={4} align="stretch">
                        <Heading size="md">Risk Metrics</Heading>
                        <HStack justify="space-between">
                          <Text>Volatility:</Text>
                          <Text fontWeight="bold">{performanceData.riskMetrics.volatility}%</Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text>Sharpe Ratio:</Text>
                          <Text fontWeight="bold">{performanceData.riskMetrics.sharpeRatio}</Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text>Max Drawdown:</Text>
                          <Text fontWeight="bold" color="red.500">{performanceData.riskMetrics.maxDrawdown}%</Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text>Beta:</Text>
                          <Text fontWeight="bold">{performanceData.riskMetrics.beta}</Text>
                        </HStack>
                      </VStack>
                    </Card>
                  </SimpleGrid>

                  <Box>
                    <Heading size="md" mb={4}>Category Performance</Heading>
                    <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                      {Object.entries(performanceData.categoryPerformance).map(([category, data]) => (
                        <Card key={category} p={4} border="1px solid" borderColor="gray.200">
                          <VStack spacing={2} align="stretch">
                            <Text fontWeight="bold">{category}</Text>
                            <Text fontSize="sm" color="gray.600">{data.count} deals</Text>
                            <Text fontWeight="bold" color="green.500">${data.totalSavings} saved</Text>
                            <Text fontSize="sm" color="blue.500">{data.avgReturn}% avg return</Text>
                          </VStack>
                        </Card>
                      ))}
                    </SimpleGrid>
                  </Box>
                </VStack>
              )}
            </TabPanel>

            {/* History Tab */}
            <TabPanel>
              <VStack spacing={4} align="stretch">
                <Heading size="md">Transaction History</Heading>
                <Box overflowX="auto">
                  <Table variant="simple" size="sm">
                    <Thead>
                      <Tr>
                        <Th>Type</Th>
                        <Th>Deal</Th>
                        <Th>Amount</Th>
                        <Th>Timestamp</Th>
                        <Th>Status</Th>
                        <Th>Actions</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {historyData.map((tx, index) => (
                        <Tr key={tx.id}>
                          <Td>
                            <Badge colorScheme={tx.type === 'purchase' ? 'blue' : tx.type === 'redemption' ? 'green' : 'purple'}>
                              {tx.type}
                            </Badge>
                          </Td>
                          <Td>
                            <Text fontSize="sm" fontWeight="bold">{tx.dealTitle}</Text>
                          </Td>
                          <Td>
                            <Text fontWeight="bold" color={tx.type === 'purchase' ? 'red.500' : 'green.500'}>
                              {tx.type === 'purchase' ? `-$${tx.amount}` : `+$${tx.savings}`}
                            </Text>
                          </Td>
                          <Td>
                            <Text fontSize="sm">{new Date(tx.timestamp).toLocaleString()}</Text>
                          </Td>
                          <Td>
                            <Badge colorScheme="green" size="sm">{tx.status}</Badge>
                          </Td>
                          <Td>
                            <Link href={`https://explorer.solana.com/tx/${tx.transactionSignature}?cluster=devnet`} isExternal>
                              <Icon as={ExternalLinkIcon} boxSize={4} color="blue.500" />
                            </Link>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>
              </VStack>
            </TabPanel>

            {/* Insights Tab */}
            <TabPanel>
              {insightsData && (
                <VStack spacing={6} align="stretch">
                  <Box>
                    <Heading size="md" mb={4}>AI Recommendations</Heading>
                    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                      {insightsData.recommendations.map((rec, index) => (
                        <Card key={index} p={4} border="1px solid" borderColor={rec.priority === 'high' ? 'red.200' : rec.priority === 'medium' ? 'yellow.200' : 'green.200'}>
                          <VStack spacing={2} align="stretch">
                            <HStack justify="space-between">
                              <Text fontWeight="bold" fontSize="sm">{rec.title}</Text>
                              <Badge colorScheme={rec.priority === 'high' ? 'red' : rec.priority === 'medium' ? 'yellow' : 'green'} size="sm">
                                {rec.priority}
                              </Badge>
                            </HStack>
                            <Text fontSize="sm" color="gray.600">{rec.description}</Text>
                            <Button size="sm" colorScheme="teal" variant="outline">
                              {rec.action}
                            </Button>
                          </VStack>
                        </Card>
                      ))}
                    </SimpleGrid>
                  </Box>

                  <Box>
                    <Heading size="md" mb={4}>Trends & Opportunities</Heading>
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                      <Card p={4}>
                        <VStack spacing={3} align="stretch">
                          <Heading size="sm">Your Trends</Heading>
                          <HStack justify="space-between">
                            <Text>Spending Pattern:</Text>
                            <Text fontWeight="bold">{insightsData.trends.spendingPattern}</Text>
                          </HStack>
                          <HStack justify="space-between">
                            <Text>Favorite Category:</Text>
                            <Text fontWeight="bold">{insightsData.trends.favoriteCategory}</Text>
                          </HStack>
                          <HStack justify="space-between">
                            <Text>Best Time to Buy:</Text>
                            <Text fontWeight="bold">{insightsData.trends.bestTimeToBuy}</Text>
                          </HStack>
                          <HStack justify="space-between">
                            <Text>Avg Deal Value:</Text>
                            <Text fontWeight="bold">${insightsData.trends.averageDealValue}</Text>
                          </HStack>
                        </VStack>
                      </Card>

                      <Card p={4}>
                        <VStack spacing={3} align="stretch">
                          <Heading size="sm">Opportunities</Heading>
                          {insightsData.opportunities.map((opp, index) => (
                            <HStack key={index} justify="space-between">
                              <VStack align="start" spacing={0}>
                                <Text fontWeight="bold">{opp.category}</Text>
                                <Text fontSize="sm" color="gray.600">Potential: ${opp.potentialSavings}</Text>
                              </VStack>
                              <VStack align="end" spacing={0}>
                                <Text fontWeight="bold" color="green.500">{opp.confidence}%</Text>
                                <Text fontSize="xs" color="gray.500">confidence</Text>
                              </VStack>
                            </HStack>
                          ))}
                        </VStack>
                      </Card>
                    </SimpleGrid>
                  </Box>
                </VStack>
              )}
            </TabPanel>
          </TabPanels>
        </Tabs>

        {/* Deal Detail Modal */}
        <Modal isOpen={isOpen} onClose={onClose} size="xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Deal Details</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              {selectedDeal && (
                <VStack spacing={4} align="stretch">
                  <HStack justify="space-between">
                    <VStack align="start" spacing={1}>
                      <Heading size="md">{selectedDeal.title}</Heading>
                      <Text color="gray.600">{selectedDeal.merchant}</Text>
                      <Badge colorScheme={getStatusColor(selectedDeal.status)}>{selectedDeal.status}</Badge>
                    </VStack>
                    <VStack align="end" spacing={1}>
                      <Text fontWeight="bold" fontSize="lg">${selectedDeal.currentValue}</Text>
                      <Text fontSize="sm" color="gray.500">{selectedDeal.discountPercentage}% off</Text>
                    </VStack>
                  </HStack>

                  <Divider />

                  <SimpleGrid columns={2} spacing={4}>
                    <Box>
                      <Text fontWeight="bold" mb={2}>Investment Details</Text>
                      <VStack spacing={2} align="stretch">
                        <HStack justify="space-between">
                          <Text>Purchase Price:</Text>
                          <Text fontWeight="bold">${selectedDeal.purchasePrice}</Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text>Original Price:</Text>
                          <Text>${selectedDeal.originalPrice}</Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text>Potential Savings:</Text>
                          <Text fontWeight="bold" color="green.500">${selectedDeal.potentialSavings || 0}</Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text>ROI:</Text>
                          <Text fontWeight="bold" color={selectedDeal.returnOnInvestment > 0 ? 'green.500' : 'gray.500'}>
                            {selectedDeal.returnOnInvestment}%
                          </Text>
                        </HStack>
                      </VStack>
                    </Box>

                    <Box>
                      <Text fontWeight="bold" mb={2}>Deal Info</Text>
                      <VStack spacing={2} align="stretch">
                        <HStack justify="space-between">
                          <Text>Category:</Text>
                          <Text>{selectedDeal.category}</Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text>Location:</Text>
                          <Text>{selectedDeal.location}</Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text>Risk Level:</Text>
                          <Badge colorScheme={getRiskColor(selectedDeal.riskLevel)} size="sm">
                            {selectedDeal.riskLevel}
                          </Badge>
                        </HStack>
                        <HStack justify="space-between">
                          <Text>Expires:</Text>
                          <Text>{selectedDeal.timeToExpiry}</Text>
                        </HStack>
                      </VStack>
                    </Box>
                  </SimpleGrid>

                  {selectedDeal.nftMintAddress && (
                    <Box p={3} bg="blue.50" borderRadius="md" border="1px solid" borderColor="blue.200">
                      <Text fontWeight="bold" mb={2}>Blockchain Info</Text>
                      <VStack spacing={1} align="stretch">
                        <HStack justify="space-between">
                          <Text fontSize="sm">NFT Address:</Text>
                          <Code fontSize="xs">{selectedDeal.nftMintAddress}</Code>
                        </HStack>
                        <HStack justify="space-between">
                          <Text fontSize="sm">Transaction:</Text>
                          <Link href={`https://explorer.solana.com/tx/${selectedDeal.transactionSignature}?cluster=devnet`} isExternal>
                            <Icon as={ExternalLinkIcon} boxSize={3} color="blue.500" />
                          </Link>
                        </HStack>
                      </VStack>
                    </Box>
                  )}
                </VStack>
              )}
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onClose}>
                Close
              </Button>
              {selectedDeal?.isRedeemable && (
                <Button colorScheme="green">
                  Redeem Deal
                </Button>
              )}
            </ModalFooter>
          </ModalContent>
        </Modal>
      </VStack>
    </Box>
  );
};

export default PortfolioTracking;
