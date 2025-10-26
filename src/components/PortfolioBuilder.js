import React, { useState } from 'react';
import {
  Box, Heading, Text, Stack, Button, Badge, HStack, VStack, Icon, useToast, SimpleGrid, Card, CardBody, CardHeader
} from '@chakra-ui/react';
import { StarIcon, TrendingUpIcon, TrendingDownIcon } from '@chakra-ui/icons';

const PortfolioBuilder = ({ deals, onAddToPortfolio, onRemoveFromPortfolio }) => {
  const [selectedDeals, setSelectedDeals] = useState([]);
  const toast = useToast();

  const handleAddToPortfolio = (deal) => {
    if (selectedDeals.includes(deal.id)) {
      setSelectedDeals(selectedDeals.filter(id => id !== deal.id));
      if (onRemoveFromPortfolio) {
        onRemoveFromPortfolio(deal);
      }
    } else {
      setSelectedDeals([...selectedDeals, deal.id]);
      if (onAddToPortfolio) {
        onAddToPortfolio(deal);
      }
    }
  };

  const calculatePortfolioMetrics = () => {
    const dealsArray = deals || [];
    const selectedDealsData = dealsArray.filter(deal => selectedDeals.includes(deal.id));
    const totalValue = selectedDealsData.reduce((sum, deal) => sum + (deal.price || 0), 0);
    const averageDiscount = selectedDealsData.length > 0 ? selectedDealsData.reduce((sum, deal) => sum + (deal.discount || 0), 0) / selectedDealsData.length : 0;
    const riskScore = selectedDealsData.length > 0 ? selectedDealsData.reduce((sum, deal) => sum + (deal.riskScore || 0), 0) / selectedDealsData.length : 0;

    return {
      totalValue,
      averageDiscount,
      riskScore,
      dealCount: selectedDealsData.length
    };
  };

  const metrics = calculatePortfolioMetrics();

  return (
    <Box>
      <VStack spacing={6} align="stretch">
        {/* Portfolio Metrics */}
        <Card>
          <CardHeader>
            <Heading size="md">Portfolio Metrics</Heading>
          </CardHeader>
          <CardBody>
            <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
              <Box textAlign="center">
                <Text fontSize="2xl" fontWeight="bold" color="teal.600">
                  {metrics.dealCount}
                </Text>
                <Text fontSize="sm" color="gray.600">Selected Deals</Text>
              </Box>
              <Box textAlign="center">
                <Text fontSize="2xl" fontWeight="bold" color="blue.600">
                  ${metrics.totalValue}
                </Text>
                <Text fontSize="sm" color="gray.600">Total Value</Text>
              </Box>
              <Box textAlign="center">
                <Text fontSize="2xl" fontWeight="bold" color="green.600">
                  {metrics.averageDiscount.toFixed(1)}%
                </Text>
                <Text fontSize="sm" color="gray.600">Avg Discount</Text>
              </Box>
              <Box textAlign="center">
                <Text fontSize="2xl" fontWeight="bold" color="orange.600">
                  {metrics.riskScore.toFixed(1)}
                </Text>
                <Text fontSize="sm" color="gray.600">Risk Score</Text>
              </Box>
            </SimpleGrid>
          </CardBody>
        </Card>

        {/* Deal Selection */}
        <Card>
          <CardHeader>
            <Heading size="md">Select Deals for Portfolio</Heading>
          </CardHeader>
          <CardBody>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
              {(deals || []).map((deal) => (
                <Box
                  key={deal.id}
                  border="2px solid"
                  borderColor={selectedDeals.includes(deal.id) ? "teal.500" : "gray.200"}
                  borderRadius="lg"
                  p={4}
                  cursor="pointer"
                  onClick={() => handleAddToPortfolio(deal)}
                  _hover={{ borderColor: "teal.300" }}
                >
                  <VStack align="stretch" spacing={3}>
                    <Text fontWeight="bold" fontSize="sm">{deal.title}</Text>
                    <Text fontSize="sm" color="gray.600">{deal.merchant}</Text>
                    <HStack justify="space-between">
                      <Badge colorScheme="green">{deal.discount}% off</Badge>
                      <Text fontSize="sm" fontWeight="bold">${deal.price}</Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text fontSize="xs" color="gray.500">Risk: {deal.riskScore}/10</Text>
                      <Text fontSize="xs" color="gray.500">Expires: {deal.expiryDate}</Text>
                    </HStack>
                  </VStack>
                </Box>
              ))}
            </SimpleGrid>
          </CardBody>
        </Card>

        {/* Portfolio Actions */}
        <Card>
          <CardBody>
            <HStack justify="center" spacing={4}>
              <Button colorScheme="teal" size="lg">
                Build Portfolio
              </Button>
              <Button variant="outline" size="lg">
                Save Portfolio
              </Button>
              <Button variant="ghost" size="lg">
                Clear Selection
              </Button>
            </HStack>
          </CardBody>
        </Card>
      </VStack>
    </Box>
  );
};

export default PortfolioBuilder;
