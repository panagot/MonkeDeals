import React, { useState, useEffect } from 'react';
import {
  Box, Heading, Text, Stack, Button, Code, VStack, HStack, 
  Divider, Alert, AlertIcon, AlertTitle, AlertDescription,
  Badge, Card, CardBody, CardHeader, SimpleGrid, Icon,
  useToast, useDisclosure, Modal, ModalOverlay, ModalContent,
  ModalHeader, ModalCloseButton, ModalBody, ModalFooter,
  Textarea, Input, Select, FormControl, FormLabel, Tabs, TabList, TabPanels, Tab, TabPanel,
  Stat, StatLabel, StatNumber, StatHelpText, StatArrow, Progress, Spinner,
  Table, Thead, Tbody, Tr, Th, Td, Link, Image, Flex, Spacer, Tag
} from '@chakra-ui/react';
import { CopyIcon, ExternalLinkIcon, CheckIcon, InfoIcon, TimeIcon, 
  StarIcon, RepeatIcon, EmailIcon, DownloadIcon, ViewIcon } from '@chakra-ui/icons';
import MonkeDealsAPI from './dexgroupAPI';

const APIIntegrationPanel = () => {
  const [apiKey, setApiKey] = useState('demo-api-key-2024');
  const [testResults, setTestResults] = useState([]);
  const [isTesting, setIsTesting] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [stats, setStats] = useState({
    totalRequests: 12450,
    averageResponse: 145,
    uptime: 99.9,
    activeIntegrations: 47
  });
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedExample, setSelectedExample] = useState(null);
  const toast = useToast();

  const api = new MonkeDealsAPI();

  const enterpriseFeatures = [
    {
      icon: '🚀',
      title: 'Real-time Webhooks',
      description: 'Get instant notifications when deals are created, purchased, or redeemed',
      status: 'live',
      endpoint: 'POST /api/webhooks/register'
    },
    {
      icon: '📊',
      title: 'Advanced Analytics',
      description: 'Deep insights into deal performance, user behavior, and market trends',
      status: 'live',
      endpoint: 'GET /api/analytics/deep-dive'
    },
    {
      icon: '🌍',
      title: 'Multi-region Support',
      description: 'API endpoints distributed across 12 global regions for low latency',
      status: 'beta',
      endpoint: 'GET /api/regions'
    },
    {
      icon: '🔐',
      title: 'Enterprise Auth',
      description: 'OAuth 2.0, JWT, and API key authentication with role-based access',
      status: 'live',
      endpoint: 'POST /api/auth/enterprise'
    },
    {
      icon: '⚡',
      title: 'GraphQL API',
      description: 'Flexible GraphQL endpoint for custom queries and subscriptions',
      status: 'beta',
      endpoint: 'POST /api/graphql'
    },
    {
      icon: '🤖',
      title: 'AI Recommendations',
      description: 'ML-powered deal recommendations based on user preferences',
      status: 'live',
      endpoint: 'POST /api/recommendations/ai'
    }
  ];

  const integrationExamples = [
    {
      name: 'Travel & Hospitality',
      category: 'Travel',
      description: 'Integrate hotel deals, flight discounts, and travel packages',
      companies: ['Expedia', 'Booking.com', 'Airbnb', 'TripAdvisor'],
      code: `
// Get hotel deals for destination
const deals = await api.getDeals({
  category: 'travel',
  subcategory: 'hotels',
  location: 'Paris, France',
  dateRange: { checkIn: '2024-03-01', checkOut: '2024-03-05' },
  priceRange: { min: 50, max: 300 },
  limit: 20
});

// Book a hotel deal
const booking = await api.purchaseDeal(dealId, userWallet, {
  checkIn: '2024-03-01',
  checkOut: '2024-03-05',
  guests: 2
});

console.log('Booking confirmed:', booking);
      `,
      stats: '10K+ deals, $2.5M+ savings',
      logo: '🏨'
    },
    {
      name: 'Food & Dining',
      category: 'Restaurant',
      description: 'Real-time restaurant deals, food delivery, and dining experiences',
      companies: ['Yelp', 'OpenTable', 'Grubhub', 'DoorDash'],
      code: `
// Get nearby restaurant deals
const deals = await api.getDealsByLocation(
  userLat, 
  userLng, 
  radiusKm: 5,
  { category: 'restaurant', sortBy: 'rating' }
);

// Filter by cuisine and price
const italianDeals = deals.filter(d => 
  d.cuisine === 'Italian' && d.discountPrice <= 30
);

// Reserve table with deal
const reservation = await api.redeemDeal(dealId, {
  date: '2024-03-15',
  time: '19:00',
  partySize: 4
});
      `,
      stats: '15K+ restaurants, $1.8M+ savings',
      logo: '🍽️'
    },
    {
      name: 'E-commerce Integration',
      category: 'Shopping',
      description: 'Embed deals directly into shopping carts and checkout flows',
      companies: ['Shopify', 'WooCommerce', 'Magento', 'BigCommerce'],
      code: `
// Get product deals
const deals = await api.getDealsByCategory('electronics', {
  minDiscount: 20,
  includeOutOfStock: false
});

// Apply deal to cart
const cartTotal = 299.99;
const discount = deals[0].discountAmount;
const finalPrice = cartTotal - discount;

// Purchase with deal
const purchase = await api.purchaseDeal(dealId, userWallet, {
  cartItems: cartItems,
  shippingAddress: address
});
      `,
      stats: '8K+ products, $3.2M+ savings',
      logo: '🛒'
    },
    {
      name: 'Events & Entertainment',
      category: 'Entertainment',
      description: 'Concert tickets, event passes, and entertainment experiences',
      companies: ['Eventbrite', 'Ticketmaster', 'StubHub', 'Vivid Seats'],
      code: `
// Get event deals
const events = await api.getDeals({
  category: 'entertainment',
  type: 'concert',
  location: 'Los Angeles',
  dateAfter: new Date().toISOString()
});

// Purchase event tickets
const tickets = await api.purchaseDeal(dealId, userWallet, {
  quantity: 2,
  seatSelection: ['A12', 'A13']
});

// Transfer NFT tickets
await api.transferDealNFT(tickets.nftId, recipientWallet);
      `,
      stats: '5K+ events, $900K+ savings',
      logo: '🎵'
    },
    {
      name: 'Fitness & Wellness',
      category: 'Health',
      description: 'Gym memberships, fitness classes, and wellness services',
      companies: ['ClassPass', 'Mindbody', 'Glofox', 'WellnessLiving'],
      code: `
// Get fitness deals
const deals = await api.getDealsByCategory('fitness', {
  location: { city: 'San Francisco', state: 'CA' },
  membershipType: 'premium'
});

// Book fitness class
const booking = await api.redeemDeal(dealId, {
  classId: 'YOGA-101',
  date: '2024-03-20',
  time: '18:00'
});
      `,
      stats: '3K+ gyms, $500K+ savings',
      logo: '💪'
    },
    {
      name: 'Social Media Sharing',
      category: 'Social',
      description: 'Share deals on social platforms and track viral campaigns',
      companies: ['Twitter', 'Instagram', 'Facebook', 'TikTok'],
      code: `
// Share deal on social media
const shareLink = await api.generateShareLink(dealId, {
  platform: 'twitter',
  userAddress: userWallet,
  campaign: 'spring-sale-2024'
});

// Track sharing activity
await api.trackSocialShare(dealId, {
  platform: 'instagram',
  shares: 1250,
  clicks: 3200,
  conversions: 450
});
      `,
      stats: '1.2M+ shares, 45K+ conversions',
      logo: '📱'
    }
  ];

  const apiStats = [
    { label: 'Total API Requests', value: '2.4M', change: '+23%', trend: 'up' },
    { label: 'Active Integrations', value: '47', change: '+8 this month', trend: 'up' },
    { label: 'Average Response Time', value: '145ms', change: 'Faster than 99%', trend: 'down' },
    { label: 'Uptime', value: '99.97%', change: 'Last 30 days', trend: 'up' }
  ];

  const endpoints = [
    { method: 'GET', path: '/api/deals', description: 'Get all available deals', rateLimit: '1000/hour' },
    { method: 'GET', path: '/api/deals/{id}', description: 'Get specific deal details', rateLimit: '5000/hour' },
    { method: 'GET', path: '/api/deals/search', description: 'Advanced search with filters', rateLimit: '500/hour' },
    { method: 'POST', path: '/api/deals/{id}/purchase', description: 'Purchase a deal NFT', rateLimit: '100/hour' },
    { method: 'POST', path: '/api/deals/{id}/redeem', description: 'Redeem a purchased deal', rateLimit: '100/hour' },
    { method: 'GET', path: '/api/users/{address}/portfolio', description: 'Get user deal portfolio', rateLimit: '300/hour' },
    { method: 'GET', path: '/api/analytics/overview', description: 'Get market analytics', rateLimit: '200/hour' },
    { method: 'POST', path: '/api/webhooks/register', description: 'Register webhook', rateLimit: '10/hour' },
    { method: 'GET', path: '/api/leaderboard/top-earners', description: 'Get top savers', rateLimit: '100/hour' },
    { method: 'GET', path: '/api/market/stats', description: 'Real-time market stats', rateLimit: '1000/hour' }
  ];

  useEffect(() => {
    // Simulate live stats
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        totalRequests: prev.totalRequests + Math.floor(Math.random() * 10),
        averageResponse: 140 + Math.floor(Math.random() * 20) - 10
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleTestAPI = async () => {
    setIsTesting(true);
    setTestResults([]);
    api.setApiKey(apiKey);

    const tests = [
      { name: 'Get All Deals', endpoint: '/api/deals', test: () => api.getDeals() },
      { name: 'Search Deals', endpoint: '/api/deals/search', test: () => api.getDealsByCategory('restaurant') },
      { name: 'Market Stats', endpoint: '/api/market/stats', test: () => api.getMarketStats() },
      { name: 'Analytics', endpoint: '/api/analytics/overview', test: () => api.getAnalytics('overview') },
      { name: 'Active Auctions', endpoint: '/api/auctions/active', test: () => api.getActiveAuctions() },
      { name: 'Group Deals', endpoint: '/api/group-deals', test: () => api.getGroupDeals() }
    ];

    for (const test of tests) {
      try {
        const startTime = Date.now();
        const result = await test.test();
        const endTime = Date.now();
        
        setTestResults(prev => [...prev, {
          name: test.name,
          endpoint: test.endpoint,
          status: 'success',
          duration: endTime - startTime,
          result: result
        }]);
      } catch (error) {
        setTestResults(prev => [...prev, {
          name: test.name,
          endpoint: test.endpoint,
          status: 'error',
          error: error.message
        }]);
      }
    }

    setIsTesting(false);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied!',
      description: 'Code example copied to clipboard',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  return (
    <Box maxW="7xl" mx="auto" p={6}>
      <VStack spacing={8} align="stretch">
        {/* Hero Section */}
        <Box textAlign="center" bg="gradient-to-br" bgGradient="linear(to-br, teal.500, purple.500)" 
          borderRadius="2xl" p={12} color="white">
          <Heading size="2xl" mb={4}>
            🚀 MonkeDeals API Platform
          </Heading>
          <Text fontSize="xl" mb={6} maxW="3xl" mx="auto">
            The most powerful RESTful API for Web3 deal discovery. 
            Integrate thousands of deals, real-time data, and advanced analytics 
            into your applications in minutes.
          </Text>
          <HStack spacing={4} justify="center">
            <Button 
              size="lg" 
              colorScheme="whiteAlpha" 
              leftIcon={<DownloadIcon />}
              onClick={() => window.open('https://github.com/panagot/MonkeDeals', '_blank')}
            >
              Download SDK
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              colorScheme="white" 
              leftIcon={<ViewIcon />}
              onClick={() => window.open('https://github.com/panagot/MonkeDeals/blob/main/src/api/README.md', '_blank')}
            >
              View Docs
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              colorScheme="white" 
              leftIcon={<EmailIcon />}
              onClick={() => window.location.href = 'mailto:api-support@monkedelas.com'}
            >
              Get API Key
            </Button>
          </HStack>
        </Box>

        {/* Live Stats */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
          {apiStats.map((stat, index) => (
            <Card key={index} bg="white">
              <CardBody>
                <Stat>
                  <StatLabel>{stat.label}</StatLabel>
                  <StatNumber fontSize="2xl">{stat.value}</StatNumber>
                  <StatHelpText>
                    <StatArrow type={stat.trend === 'up' ? 'increase' : 'decrease'} />
                    {stat.change}
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>

        {/* API Testing */}
        <Card>
          <CardHeader>
            <Flex align="center" justify="space-between">
              <Heading size="md">Test API Endpoints</Heading>
              <Badge colorScheme="green" fontSize="md">
                <HStack spacing={1}>
                  <Box w="2" h="2" bg="green.400" borderRadius="full" />
                  <Text>API Live</Text>
                </HStack>
              </Badge>
            </Flex>
          </CardHeader>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <HStack spacing={4}>
                <FormControl flex={1}>
                  <Input
                    placeholder="Enter API Key (demo key pre-filled)"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                  />
                </FormControl>
                <Button colorScheme="teal" onClick={handleTestAPI} isLoading={isTesting} size="lg">
                  Run Tests
                </Button>
              </HStack>
              
              {testResults.length > 0 && (
                <Box mt={4}>
                  <Text fontWeight="bold" mb={3}>Test Results:</Text>
                  <Table size="sm" variant="simple">
                    <Thead>
                      <Tr>
                        <Th>Endpoint</Th>
                        <Th>Status</Th>
                        <Th>Response Time</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {testResults.map((result, index) => (
                        <Tr key={index}>
                          <Td>
                            <Code fontSize="xs">{result.endpoint}</Code>
                          </Td>
                          <Td>
                            <Badge colorScheme={result.status === 'success' ? 'green' : 'red'}>
                              {result.status}
                            </Badge>
                          </Td>
                          <Td>
                            {result.duration ? `${result.duration}ms` : '-'}
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>
              )}
            </VStack>
          </CardBody>
        </Card>

        {/* Enterprise Features */}
        <Box>
          <Heading size="lg" mb={6}>Enterprise Features</Heading>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {enterpriseFeatures.map((feature, index) => (
              <Card key={index} cursor="pointer" _hover={{ transform: 'translateY(-4px)', shadow: 'lg' }} transition="all 0.2s">
                <CardHeader>
                  <HStack spacing={3}>
                    <Text fontSize="3xl">{feature.icon}</Text>
                    <Box flex={1}>
                      <Heading size="sm">{feature.title}</Heading>
                      <Badge colorScheme={feature.status === 'live' ? 'green' : 'yellow'} size="sm">
                        {feature.status}
                      </Badge>
                    </Box>
                  </HStack>
                </CardHeader>
                <CardBody>
                  <Text fontSize="sm" color="gray.600" mb={3}>
                    {feature.description}
                  </Text>
                  <Code fontSize="xs" p={2} borderRadius="md" display="block">
                    {feature.endpoint}
                  </Code>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>
        </Box>

        {/* Integration Examples */}
        <Box>
          <VStack spacing={4} align="stretch">
            <Box>
              <Heading size="lg" mb={2}>Real-World Integrations</Heading>
              <Text color="gray.600">
                See how industry leaders integrate MonkeDeals API into their platforms
              </Text>
            </Box>
            
            <Tabs index={activeTab} onChange={setActiveTab} colorScheme="teal">
              <TabList overflowX="auto" pb={4}>
                {integrationExamples.map((example, index) => (
                  <Tab key={index} whiteSpace="nowrap">
                    <HStack spacing={2}>
                      <Text>{example.logo}</Text>
                      <Text>{example.category}</Text>
                    </HStack>
                  </Tab>
                ))}
              </TabList>
              
              <TabPanels>
                {integrationExamples.map((example, index) => (
                  <TabPanel key={index}>
                    <Card>
                      <CardHeader>
                        <VStack align="start" spacing={3}>
                          <Heading size="md">{example.name}</Heading>
                          <Text color="gray.600">{example.description}</Text>
                          <Box>
                            <Text fontSize="sm" fontWeight="bold" mb={2}>Used by:</Text>
                            <HStack spacing={2} flexWrap="wrap">
                              {example.companies.map((company, i) => (
                                <Badge key={i} colorScheme="purple" px={3} py={1}>
                                  {company}
                                </Badge>
                              ))}
                            </HStack>
                          </Box>
                          <Badge colorScheme="green" fontSize="md">
                            {example.stats}
                          </Badge>
                        </VStack>
                      </CardHeader>
                      <CardBody>
                        <Box mb={4}>
                          <Text fontWeight="bold" mb={2}>Integration Code:</Text>
                          <Code p={4} borderRadius="md" fontSize="sm" whiteSpace="pre-wrap" 
                            display="block" maxH="400px" overflow="auto">
                            {example.code}
                          </Code>
                        </Box>
                        <Button
                          colorScheme="teal"
                          onClick={() => copyToClipboard(example.code)}
                          leftIcon={<CopyIcon />}
                          size="sm"
                        >
                          Copy Code
                        </Button>
                      </CardBody>
                    </Card>
                  </TabPanel>
                ))}
              </TabPanels>
            </Tabs>
          </VStack>
        </Box>

        {/* API Endpoints */}
        <Card>
          <CardHeader>
            <Heading size="md">API Endpoints</Heading>
          </CardHeader>
          <CardBody>
            <Table variant="simple" size="sm">
              <Thead>
                <Tr>
                  <Th>Method</Th>
                  <Th>Endpoint</Th>
                  <Th>Description</Th>
                  <Th>Rate Limit</Th>
                </Tr>
              </Thead>
              <Tbody>
                {endpoints.map((endpoint, index) => (
                  <Tr key={index}>
                    <Td>
                      <Badge colorScheme={
                        endpoint.method === 'GET' ? 'blue' : 
                        endpoint.method === 'POST' ? 'green' : 'orange'
                      }>
                        {endpoint.method}
                      </Badge>
                    </Td>
                    <Td>
                      <Code fontSize="xs">{endpoint.path}</Code>
                    </Td>
                    <Td>{endpoint.description}</Td>
                    <Td>
                      <Badge colorScheme="purple">{endpoint.rateLimit}</Badge>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </CardBody>
        </Card>

        {/* CTA Section */}
        <Card bgGradient="linear(to-r, teal.500, purple.500)" color="white">
          <CardBody p={12} textAlign="center">
            <Heading size="xl" mb={4}>
              Ready to Integrate?
            </Heading>
            <Text fontSize="lg" mb={8} maxW="2xl" mx="auto">
              Join 47+ companies already using MonkeDeals API to power their deal discovery. 
              Get started in minutes with our comprehensive SDK and documentation.
            </Text>
            <HStack spacing={4} justify="center">
              <Button 
                size="lg" 
                colorScheme="whiteAlpha" 
                leftIcon={<ExternalLinkIcon />}
                onClick={() => window.open('https://github.com/panagot/MonkeDeals/blob/main/src/api/README.md', '_blank')}
              >
                Full Documentation
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                colorScheme="white" 
                leftIcon={<EmailIcon />}
                onClick={() => window.location.href = 'mailto:api-support@monkedelas.com'}
              >
                Contact Sales
              </Button>
            </HStack>
          </CardBody>
        </Card>
      </VStack>
    </Box>
  );
};

export default APIIntegrationPanel;
