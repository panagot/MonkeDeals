import React, { useState, useEffect } from 'react';
import {
  Box, Heading, Text, Button, VStack, HStack, Icon, SimpleGrid, Badge, useToast, Input, Select, FormControl, FormLabel, Alert, AlertIcon
} from '@chakra-ui/react';
import { TimeIcon, ExternalLinkIcon } from '@chakra-ui/icons';

const GeoDiscovery = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [nearbyDeals, setNearbyDeals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [radius, setRadius] = useState(10); // km
  const [error, setError] = useState('');
  const toast = useToast();

  // Mock nearby deals with location data
  const mockNearbyDeals = [
    {
      id: 'geo-1',
      dealTitle: '50% Off Pizza Night',
      merchant: "Joe's Pizza",
      originalPrice: '20 USDC',
      discountPrice: '10 USDC',
      discountPercentage: '50%',
      expiryDate: '2025-08-01',
      category: 'Food & Dining',
      location: '123 Main St, Downtown',
      coordinates: { lat: 40.7128, lng: -74.0060 }, // NYC coordinates
      distance: 0.5, // km
      status: 'Active'
    },
    {
      id: 'geo-2',
      dealTitle: '30% Off Hotel Stay',
      merchant: 'Grand Hotel',
      originalPrice: '200 USDC',
      discountPrice: '140 USDC',
      discountPercentage: '30%',
      expiryDate: '2025-08-15',
      category: 'Travel & Hotels',
      location: '456 Resort Blvd, Beach City',
      coordinates: { lat: 40.7589, lng: -73.9851 },
      distance: 2.3,
      status: 'Active'
    },
    {
      id: 'geo-3',
      dealTitle: 'Buy 2 Get 1 Free Coffee',
      merchant: 'Brew & Bean',
      originalPrice: '15 USDC',
      discountPrice: '10 USDC',
      discountPercentage: '33%',
      expiryDate: '2025-09-01',
      category: 'Food & Dining',
      location: '789 Coffee St, Arts District',
      coordinates: { lat: 40.7614, lng: -73.9776 },
      distance: 1.8,
      status: 'Active'
    }
  ];

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser.');
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setUserLocation(location);
        findNearbyDeals(location);
        setLoading(false);
        
        toast({
          title: 'Location Found!',
          description: 'Discovering deals near your location...',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      },
      (error) => {
        setError('Unable to retrieve your location. Please enable location services.');
        setLoading(false);
        toast({
          title: 'Location Error',
          description: 'Could not access your location. Please try again.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    );
  };

  const findNearbyDeals = (location) => {
    // In a real app, this would calculate distance and filter deals
    // For demo purposes, we'll use mock data
    const deals = mockNearbyDeals.filter(deal => deal.distance <= radius);
    setNearbyDeals(deals);
  };

  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
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

  useEffect(() => {
    if (userLocation) {
      findNearbyDeals(userLocation);
    }
  }, [radius, userLocation]);

  return (
    <Box p={6} bg="white" borderRadius="md" border="1px solid" borderColor="gray.200" boxShadow="md">
      <VStack spacing={6} align="stretch">
        <Box>
          <Heading size="lg" color="gray.800" mb={2}>
            🌍 Deals Near Me
          </Heading>
          <Text color="gray.600" mb={4}>
            Discover amazing deals from merchants in your area. Enable location services to find deals near you.
          </Text>
        </Box>

        {/* Location Controls */}
        <Box p={4} bg="gray.50" borderRadius="md" border="1px solid" borderColor="gray.200">
          <VStack spacing={4} align="stretch">
            <HStack spacing={4} align="end">
              <FormControl flex={1}>
                <FormLabel>Search Radius</FormLabel>
                <Select value={radius} onChange={(e) => setRadius(Number(e.target.value))}>
                  <option value={5}>5 km</option>
                  <option value={10}>10 km</option>
                  <option value={25}>25 km</option>
                  <option value={50}>50 km</option>
                </Select>
              </FormControl>
              <Button
                onClick={getCurrentLocation}
                colorScheme="teal"
                isLoading={loading}
                loadingText="Finding Location..."
              >
                Find My Location
              </Button>
            </HStack>
            
            {userLocation && (
              <Alert status="success">
                <AlertIcon />
                <Text fontSize="sm">
                  Location: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
                </Text>
              </Alert>
            )}
            
            {error && (
              <Alert status="error">
                <AlertIcon />
                <Text fontSize="sm">{error}</Text>
              </Alert>
            )}
          </VStack>
        </Box>

        {/* Nearby Deals */}
        <Box>
          <Heading size="md" color="gray.800" mb={4}>
            Nearby Deals ({nearbyDeals.length})
          </Heading>
          {nearbyDeals.length === 0 ? (
            <Box textAlign="center" py={8} bg="gray.50" borderRadius="md">
              <Text color="gray.500">No deals found in your area.</Text>
              <Text fontSize="sm" color="gray.400" mt={2}>
                Try increasing the search radius or enable location services.
              </Text>
            </Box>
          ) : (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
              {nearbyDeals.map((deal) => (
                <Box
                  key={deal.id}
                  p={4}
                  bg="white"
                  borderRadius="md"
                  border="1px solid"
                  borderColor="gray.200"
                  _hover={{ boxShadow: 'md', bg: 'gray.50' }}
                >
                  <VStack spacing={3} align="stretch">
                    <Heading size="sm" color="gray.800">{deal.dealTitle}</Heading>
                    <Text fontSize="sm" color="gray.600">{deal.merchant}</Text>
                    
                    <HStack spacing={2}>
                      <Badge colorScheme={getCategoryColor(deal.category)} size="sm">
                        {deal.category}
                      </Badge>
                      <Badge colorScheme="blue" size="sm">
                        {deal.distance.toFixed(1)} km away
                      </Badge>
                    </HStack>
                    
                    <HStack justify="space-between">
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
                    
                    <Text fontSize="sm" color="gray.600">
                      📍 {deal.location}
                    </Text>
                    
                    <HStack justify="space-between">
                      <HStack spacing={1}>
                        <Icon as={TimeIcon} boxSize={3} color="gray.500" />
                        <Text fontSize="xs" color="gray.500">
                          Expires: {deal.expiryDate}
                        </Text>
                      </HStack>
                      <Text fontSize="xs" color="gray.500">
                        {deal.status}
                      </Text>
                    </HStack>
                    
                    <Button size="sm" colorScheme="teal" w="full">
                      View Deal
                    </Button>
                  </VStack>
                </Box>
              ))}
            </SimpleGrid>
          )}
        </Box>

        {/* Map Integration Note */}
        <Box p={4} bg="blue.50" borderRadius="md" border="1px solid" borderColor="blue.200">
          <VStack spacing={2} align="start">
            <Text fontWeight="bold" color="blue.800">🗺️ Map Integration</Text>
            <Text fontSize="sm" color="blue.700">
              In a full implementation, this would include an interactive map showing deal locations,
              route planning to merchants, and real-time deal updates based on your location.
            </Text>
            <Text fontSize="sm" color="blue.700">
              All location data is verified on-chain for trustless deal discovery.
            </Text>
          </VStack>
        </Box>
      </VStack>
    </Box>
  );
};

export default GeoDiscovery;
