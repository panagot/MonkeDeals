import React, { useState } from 'react';
import {
  Box, Heading, Text, Stack, Button, Code, VStack, HStack, 
  Divider, Alert, AlertIcon, AlertTitle, AlertDescription,
  Badge, Card, CardBody, CardHeader, SimpleGrid, Icon,
  useToast, useDisclosure, Modal, ModalOverlay, ModalContent,
  ModalHeader, ModalCloseButton, ModalBody, ModalFooter,
  Textarea, Input, Select, FormControl, FormLabel
} from '@chakra-ui/react';
import { CopyIcon, ExternalLinkIcon, CheckIcon, InfoIcon } from '@chakra-ui/icons';
import DEXGroupAPI from './dexgroupAPI';

const APIIntegrationPanel = () => {
  const [apiKey, setApiKey] = useState('');
  const [testResults, setTestResults] = useState([]);
  const [isTesting, setIsTesting] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedExample, setSelectedExample] = useState('');
  const toast = useToast();

  const api = new DEXGroupAPI();

  const integrationExamples = [
    {
      name: 'Travel Booking App',
      description: 'Integrate travel deals for booking platforms',
      code: `
// Get travel deals for destination
const deals = await api.getDeals({
  category: 'travel',
  location: 'Paris',
  limit: 20
});

// Book a travel deal
const result = await api.purchaseDeal(dealId, userAddress);
      `,
      useCase: 'Perfect for travel booking platforms like Expedia, Booking.com'
    },
    {
      name: 'Restaurant Discovery',
      description: 'Find restaurant deals near user location',
      code: `
// Get nearby restaurant deals
const deals = await api.getDealsByLocation(lat, lng, radius);

// Filter for restaurant deals
const restaurantDeals = deals.filter(deal => 
  deal.category === 'restaurant'
);
      `,
      useCase: 'Great for food discovery apps like Yelp, OpenTable'
    },
    {
      name: 'E-commerce Integration',
      description: 'Apply deals to shopping carts',
      code: `
// Get shopping deals by category
const deals = await api.getDealsByCategory('electronics');

// Apply deal to cart
const discount = await api.applyDealToCart(dealId, cartItems);
      `,
      useCase: 'Ideal for e-commerce platforms like Shopify, WooCommerce'
    },
    {
      name: 'Social Media Sharing',
      description: 'Share deals on social platforms',
      code: `
// Share deal on social media
const result = await api.shareDeal(dealId, 'twitter', userAddress);

// Track sharing activity
await api.trackSharingActivity(dealId, platform, userAddress);
      `,
      useCase: 'Perfect for social media management tools'
    },
    {
      name: 'Analytics Dashboard',
      description: 'Get comprehensive analytics data',
      code: `
// Get analytics data
const analytics = await api.getAnalyticsData('30d');

// Get market statistics
const stats = await api.getMarketStats();
      `,
      useCase: 'Great for business intelligence and analytics platforms'
    },
    {
      name: 'Mobile App Integration',
      description: 'Personalized deals for mobile users',
      code: `
// Get personalized deals
const deals = await api.getPersonalizedDeals(userAddress, preferences);

// Get user portfolio
const portfolio = await api.getUserPortfolio(userAddress);
      `,
      useCase: 'Perfect for mobile apps and personalization engines'
    }
  ];

  const handleTestAPI = async () => {
    if (!apiKey) {
      toast({
        title: 'API Key Required',
        description: 'Please enter an API key to test the integration',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsTesting(true);
    setTestResults([]);
    api.setApiKey(apiKey);

    const tests = [
      { name: 'Get All Deals', test: () => api.getDeals() },
      { name: 'Get Deals by Category', test: () => api.getDealsByCategory('restaurant') },
      { name: 'Get Market Statistics', test: () => api.getMarketStats() },
      { name: 'Get Analytics', test: () => api.getAnalytics('overview') },
      { name: 'Get Active Auctions', test: () => api.getActiveAuctions() },
      { name: 'Get Group Deals', test: () => api.getGroupDeals() }
    ];

    for (const test of tests) {
      try {
        const startTime = Date.now();
        const result = await test.test();
        const endTime = Date.now();
        
        setTestResults(prev => [...prev, {
          name: test.name,
          status: 'success',
          duration: endTime - startTime,
          result: result
        }]);
      } catch (error) {
        setTestResults(prev => [...prev, {
          name: test.name,
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
      title: 'Copied to Clipboard',
      description: 'Code example copied to clipboard',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  return (
    <Box maxW="7xl" mx="auto" p={6}>
      <VStack spacing={8} align="stretch">
        {/* Header */}
        <Box textAlign="center">
          <Heading size="2xl" color="teal.600" mb={4}>
            DEXGroup API Integration
          </Heading>
          <Text fontSize="lg" color="gray.600" maxW="3xl" mx="auto">
            Integrate DEXGroup's deal discovery platform with your applications. 
            Our RESTful API provides comprehensive access to deals, users, and analytics.
          </Text>
        </Box>

        {/* API Key Setup */}
        <Card>
          <CardHeader>
            <Heading size="md">API Key Setup</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <FormControl>
                <FormLabel>API Key</FormLabel>
                <Input
                  placeholder="Enter your API key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
              </FormControl>
              <Button colorScheme="teal" onClick={handleTestAPI} isLoading={isTesting}>
                Test API Integration
              </Button>
            </VStack>
          </CardBody>
        </Card>

        {/* Test Results */}
        {testResults.length > 0 && (
          <Card>
            <CardHeader>
              <Heading size="md">API Test Results</Heading>
            </CardHeader>
            <CardBody>
              <VStack spacing={4} align="stretch">
                {testResults.map((result, index) => (
                  <Box key={index} p={4} border="1px solid" borderColor="gray.200" borderRadius="md">
                    <HStack justify="space-between" mb={2}>
                      <Text fontWeight="bold">{result.name}</Text>
                      <Badge colorScheme={result.status === 'success' ? 'green' : 'red'}>
                        {result.status}
                      </Badge>
                    </HStack>
                    {result.status === 'success' && (
                      <Text fontSize="sm" color="gray.600">
                        Duration: {result.duration}ms
                      </Text>
                    )}
                    {result.status === 'error' && (
                      <Text fontSize="sm" color="red.500">
                        Error: {result.error}
                      </Text>
                    )}
                  </Box>
                ))}
              </VStack>
            </CardBody>
          </Card>
        )}

        {/* Integration Examples */}
        <Box>
          <Heading size="lg" mb={6}>Integration Examples</Heading>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {integrationExamples.map((example, index) => (
              <Card key={index} cursor="pointer" onClick={() => {
                setSelectedExample(example);
                onOpen();
              }}>
                <CardHeader>
                  <Heading size="sm">{example.name}</Heading>
                </CardHeader>
                <CardBody>
                  <Text fontSize="sm" color="gray.600" mb={4}>
                    {example.description}
                  </Text>
                  <Text fontSize="xs" color="teal.600" fontWeight="bold">
                    {example.useCase}
                  </Text>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>
        </Box>

        {/* API Documentation */}
        <Card>
          <CardHeader>
            <Heading size="md">API Documentation</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <Alert status="info">
                <AlertIcon />
                <Box>
                  <AlertTitle>API Documentation Available!</AlertTitle>
                  <AlertDescription>
                    Complete API documentation with examples, endpoints, and integration guides.
                  </AlertDescription>
                </Box>
              </Alert>
              
              <HStack spacing={4}>
                <Button
                  leftIcon={<ExternalLinkIcon />}
                  colorScheme="teal"
                  variant="outline"
                  onClick={() => window.open('/api/README.md', '_blank')}
                >
                  View Documentation
                </Button>
                <Button
                  leftIcon={<CopyIcon />}
                  variant="outline"
                  onClick={() => copyToClipboard('npm install dexgroup-api')}
                >
                  Copy Install Command
                </Button>
              </HStack>
            </VStack>
          </CardBody>
        </Card>

        {/* Key Features */}
        <Card>
          <CardHeader>
            <Heading size="md">Key API Features</Heading>
          </CardHeader>
          <CardBody>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <VStack align="start" spacing={2}>
                <HStack>
                  <Icon as={CheckIcon} color="green.500" />
                  <Text>RESTful API with comprehensive endpoints</Text>
                </HStack>
                <HStack>
                  <Icon as={CheckIcon} color="green.500" />
                  <Text>Real-time deal data and analytics</Text>
                </HStack>
                <HStack>
                  <Icon as={CheckIcon} color="green.500" />
                  <Text>User portfolio and reputation tracking</Text>
                </HStack>
                <HStack>
                  <Icon as={CheckIcon} color="green.500" />
                  <Text>Geo-based deal discovery</Text>
                </HStack>
              </VStack>
              <VStack align="start" spacing={2}>
                <HStack>
                  <Icon as={CheckIcon} color="green.500" />
                  <Text>NFT ownership and transfer tracking</Text>
                </HStack>
                <HStack>
                  <Icon as={CheckIcon} color="green.500" />
                  <Text>Webhook support for real-time updates</Text>
                </HStack>
                <HStack>
                  <Icon as={CheckIcon} color="green.500" />
                  <Text>Rate limiting and authentication</Text>
                </HStack>
                <HStack>
                  <Icon as={CheckIcon} color="green.500" />
                  <Text>Multiple SDKs and integration examples</Text>
                </HStack>
              </VStack>
            </SimpleGrid>
          </CardBody>
        </Card>
      </VStack>

      {/* Example Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{selectedExample?.name}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <Text color="gray.600">{selectedExample?.description}</Text>
              <Text fontWeight="bold" color="teal.600">{selectedExample?.useCase}</Text>
              <Box>
                <Text fontWeight="bold" mb={2}>Code Example:</Text>
                <Code p={4} borderRadius="md" fontSize="sm" whiteSpace="pre-wrap">
                  {selectedExample?.code}
                </Code>
              </Box>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="teal" onClick={() => {
              copyToClipboard(selectedExample?.code);
              onClose();
            }}>
              Copy Code
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default APIIntegrationPanel;
