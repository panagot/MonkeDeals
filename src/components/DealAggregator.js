import React, { useState } from 'react';
import {
  Box, Heading, Text, Button, VStack, HStack, Icon, SimpleGrid, Badge, Image, useToast, Spinner, Alert, AlertIcon
} from '@chakra-ui/react';
import { ExternalLinkIcon, TimeIcon } from '@chakra-ui/icons';

const DealAggregator = () => {
  const [externalDeals, setExternalDeals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const toast = useToast();

  // Mock external API data (in real implementation, this would fetch from actual APIs)
  const mockExternalDeals = [
    {
      id: 'ext-1',
      dealTitle: '50% Off Flight to Paris',
      merchant: 'AirFrance',
      originalPrice: '800 USDC',
      discountPrice: '400 USDC',
      discountPercentage: '50%',
      expiryDate: '2025-09-15',
      category: 'Travel & Hotels',
      source: 'Skyscanner',
      sourceUrl: 'https://skyscanner.com',
      description: 'Amazing deal on flights to Paris! Limited time offer.',
      image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400',
      location: 'Paris, France'
    },
    {
      id: 'ext-2',
      dealTitle: '30% Off Hotel Booking',
      merchant: 'Booking.com',
      originalPrice: '200 USDC',
      discountPrice: '140 USDC',
      discountPercentage: '30%',
      expiryDate: '2025-08-30',
      category: 'Travel & Hotels',
      source: 'Booking.com',
      sourceUrl: 'https://booking.com',
      description: 'Great hotel deals worldwide. Book now and save!',
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400',
      location: 'Worldwide'
    },
    {
      id: 'ext-3',
      dealTitle: '40% Off Electronics',
      merchant: 'TechStore',
      originalPrice: '500 USDC',
      discountPrice: '300 USDC',
      discountPercentage: '40%',
      expiryDate: '2025-08-25',
      category: 'Shopping',
      source: 'Shopify',
      sourceUrl: 'https://shopify.com',
      description: 'Latest electronics at unbeatable prices!',
      image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400',
      location: 'Online'
    }
  ];

  const fetchExternalDeals = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In real implementation, this would be actual API calls:
      // const skyscannerDeals = await fetch('https://api.skyscanner.com/deals');
      // const bookingDeals = await fetch('https://api.booking.com/deals');
      // const shopifyDeals = await fetch('https://api.shopify.com/deals');
      
      setExternalDeals(mockExternalDeals);
      
      toast({
        title: 'External Deals Loaded!',
        description: `Found ${mockExternalDeals.length} deals from external sources.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      setError('Failed to load external deals. Please try again.');
      toast({
        title: 'Error Loading Deals',
        description: 'There was an error loading external deals.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImportDeal = (deal) => {
    // Import external deal to our marketplace
    const importedDeal = {
      ...deal,
      id: `imported-${deal.id}`,
      status: 'Active',
      maxRedemptions: 100,
      redemptionType: 'Code',
      merchantWebsite: deal.sourceUrl
    };
    
    // Save to localStorage
    const data = localStorage.getItem('marketplaceDeals');
    const deals = data ? JSON.parse(data) : [];
    deals.push(importedDeal);
    localStorage.setItem('marketplaceDeals', JSON.stringify(deals));
    
    toast({
      title: 'Deal Imported!',
      description: `${deal.dealTitle} has been added to the marketplace.`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Food & Dining': 'orange',
      'Travel & Hotels': 'blue',
      'Shopping': 'purple',
      'Entertainment': 'pink',
      'Health & Beauty': 'green',
      'Services': 'teal',
      'Other': 'gray'
    };
    return colors[category] || 'gray';
  };

  return (
    <Box p={6} bg="white" borderRadius="md" border="1px solid" borderColor="gray.200" boxShadow="md">
      <VStack spacing={6} align="stretch">
        <Box>
          <Heading size="lg" color="gray.800" mb={2}>
            Deal Aggregator Feed
          </Heading>
          <Text color="gray.600" mb={4}>
            Discover amazing deals from external sources like Skyscanner, Booking.com, and Shopify.
          </Text>
          <Button
            onClick={fetchExternalDeals}
            colorScheme="teal"
            leftIcon={<ExternalLinkIcon />}
            isLoading={loading}
            loadingText="Loading Deals..."
          >
            Load External Deals
          </Button>
        </Box>

        {error && (
          <Alert status="error">
            <AlertIcon />
            {error}
          </Alert>
        )}

        {loading && (
          <Box textAlign="center" py={8}>
            <Spinner size="xl" color="teal.500" />
            <Text mt={4} color="gray.600">Loading deals from external sources...</Text>
          </Box>
        )}

        {externalDeals.length > 0 && (
          <Box>
            <Heading size="md" color="gray.800" mb={4}>
              External Deals ({externalDeals.length})
            </Heading>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
              {externalDeals.map((deal) => (
                <Box
                  key={deal.id}
                  p={4}
                  bg="gray.50"
                  borderRadius="md"
                  border="1px solid"
                  borderColor="gray.200"
                  _hover={{ boxShadow: 'md', bg: 'white' }}
                >
                  <VStack spacing={3} align="stretch">
                    <Image
                      src={deal.image}
                      alt={deal.dealTitle}
                      borderRadius="md"
                      height="150px"
                      objectFit="cover"
                    />
                    
                    <VStack spacing={2} align="start">
                      <Heading size="sm" color="gray.800">{deal.dealTitle}</Heading>
                      <Text fontSize="sm" color="gray.600">{deal.merchant}</Text>
                      
                      <HStack spacing={2}>
                        <Badge colorScheme={getCategoryColor(deal.category)} size="sm">
                          {deal.category}
                        </Badge>
                        <Badge colorScheme="purple" size="sm">
                          {deal.source}
                        </Badge>
                      </HStack>
                      
                      <HStack justify="space-between" w="full">
                        <VStack align="start" spacing={0}>
                          <Text fontSize="xs" color="gray.500" textDecoration="line-through">
                            {deal.originalPrice}
                          </Text>
                          <Text fontSize="lg" fontWeight="bold" color="teal.600">
                            {deal.discountPrice}
                          </Text>
                        </VStack>
                        <Badge colorScheme="green" size="sm">
                          {deal.discountPercentage} OFF
                        </Badge>
                      </HStack>
                      
                      <Text fontSize="sm" color="gray.600" noOfLines={2}>
                        {deal.description}
                      </Text>
                      
                      <HStack justify="space-between" w="full">
                        <HStack spacing={1}>
                          <Icon as={TimeIcon} boxSize={3} color="gray.500" />
                          <Text fontSize="xs" color="gray.500">
                            Expires: {deal.expiryDate}
                          </Text>
                        </HStack>
                        <Text fontSize="xs" color="gray.500">
                          {deal.location}
                        </Text>
                      </HStack>
                      
                      <HStack spacing={2} w="full">
                        <Button
                          size="sm"
                          colorScheme="teal"
                          flex={1}
                          onClick={() => handleImportDeal(deal)}
                        >
                          Import to Marketplace
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          colorScheme="blue"
                          as="a"
                          href={deal.sourceUrl}
                          target="_blank"
                          leftIcon={<ExternalLinkIcon />}
                        >
                          View Source
                        </Button>
                      </HStack>
                    </VStack>
                  </VStack>
                </Box>
              ))}
            </SimpleGrid>
          </Box>
        )}
      </VStack>
    </Box>
  );
};

export default DealAggregator;

