import React from 'react';
import { Box, Heading, Text, Stack, Divider, Button, VStack, HStack, Icon, SimpleGrid } from '@chakra-ui/react';
import { ArrowForwardIcon, StarIcon, LockIcon, ExternalLinkIcon, ArrowUpIcon } from '@chakra-ui/icons';
import { Link as RouterLink } from 'react-router-dom';

const Home = () => (
  <Box maxW="7xl" mx="auto" mt={10} p={6} bg="white" borderRadius="md" boxShadow="md">
    <Stack spacing={8} align="center">
      <Heading textAlign="center" color="gray.800" fontSize="4xl" fontWeight="bold">
        Welcome to MonkeDeals
      </Heading>
      <Text fontSize="xl" textAlign="center" color="gray.600" fontWeight="500">
        Discover deals. Trade savings. Own your discounts.
      </Text>
      <Text fontSize="md" textAlign="center" color="gray.600" maxW="4xl">
        MonkeDeals is a decentralized marketplace that connects merchants with deal-seekers worldwide. 
        Using the power of Solana and NFT technology, merchants can mint promotional coupons as NFTs, verify them securely, and offer them to customers.
      </Text>
      <Text fontSize="md" textAlign="center" color="gray.600" maxW="4xl">
        Users can discover, purchase, trade, and redeem these discount NFTs for real-world savings. 
        All deals are transparent, transferable, and secure, with ownership tracked on-chain and redemption verified instantly.
      </Text>
      
      <Box w="full" mt={6} textAlign="center">
        <HStack spacing={4} justify="center" wrap="wrap">
          <Button 
            as={RouterLink} 
            to="/mint" 
            colorScheme="teal" 
            size="lg" 
            px={10} 
            py={6} 
            fontWeight="bold" 
            fontSize="xl"
            borderRadius="md"
          >
            Create Deal NFT
          </Button>
          <Button 
            as={RouterLink} 
            to="/marketplace" 
            colorScheme="blue" 
            size="lg" 
            px={10} 
            py={6} 
            fontWeight="bold" 
            fontSize="xl"
            borderRadius="md"
            variant="outline"
          >
            Discover Deals
          </Button>
          <Button 
            as={RouterLink} 
            to="/smart-contract" 
            colorScheme="purple" 
            size="lg" 
            px={10} 
            py={6} 
            fontWeight="bold" 
            fontSize="xl"
            borderRadius="md"
            variant="outline"
          >
            🚀 Smart Contract
          </Button>
          <Button 
            as={RouterLink} 
            to="/test" 
            colorScheme="orange" 
            size="lg" 
            px={10} 
            py={6} 
            fontWeight="bold" 
            fontSize="xl"
            borderRadius="md"
            variant="outline"
          >
            🧪 Test Suite
          </Button>
        </HStack>
      </Box>

      {/* Key Features */}
      <Box w="full" mt={8}>
        <Heading size="lg" mb={6} color="gray.800" textAlign="center">
          🎯 Key Features
        </Heading>
        <VStack spacing={6} align="stretch">
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
            <Box p={6} bg="teal.50" borderRadius="md" border="1px solid" borderColor="teal.200">
              <VStack spacing={3} align="start">
                <HStack spacing={3}>
                  <Icon as={StarIcon} boxSize={6} color="teal.500" />
                  <Text fontWeight="bold" color="gray.800" fontSize="lg">NFT Deals & Coupons</Text>
                </HStack>
                <Text color="gray.600">
                  Mint promotional deals as NFTs with metadata, expiry dates, and redemption rules.
                </Text>
              </VStack>
            </Box>
            
            <Box p={6} bg="blue.50" borderRadius="md" border="1px solid" borderColor="blue.200">
              <VStack spacing={3} align="start">
                <HStack spacing={3}>
                  <Icon as={ExternalLinkIcon} boxSize={6} color="blue.500" />
                  <Text fontWeight="bold" color="gray.800" fontSize="lg">Global Deal Discovery</Text>
                </HStack>
                <Text color="gray.600">
                  Discover amazing deals from merchants worldwide, 24/7.
                </Text>
              </VStack>
            </Box>
            
            <Box p={6} bg="green.50" borderRadius="md" border="1px solid" borderColor="green.200">
              <VStack spacing={3} align="start">
                <HStack spacing={3}>
                  <Icon as={LockIcon} boxSize={6} color="green.500" />
                  <Text fontWeight="bold" color="gray.800" fontSize="lg">Secure & Transparent</Text>
                </HStack>
                <Text color="gray.600">
                  All deals tracked on-chain with verifiable redemption and ownership.
                </Text>
              </VStack>
            </Box>
            
            <Box p={6} bg="purple.50" borderRadius="md" border="1px solid" borderColor="purple.200">
              <VStack spacing={3} align="start">
                <HStack spacing={3}>
                  <Icon as={ArrowUpIcon} boxSize={6} color="purple.500" />
                  <Text fontWeight="bold" color="gray.800" fontSize="lg">Tradeable Deals</Text>
                </HStack>
                <Text color="gray.600">
                  Buy, sell, and trade deal NFTs on secondary markets for maximum flexibility.
                </Text>
              </VStack>
            </Box>
          </SimpleGrid>
        </VStack>
      </Box>

      <Divider my={8} />

      {/* How It Works */}
      <Box w="full">
        <Heading size="lg" mb={6} color="gray.800" textAlign="center">
          How It Works
        </Heading>
        <VStack spacing={8} align="stretch">
          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
            <Box p={6} bg="gray.50" borderRadius="md" border="1px solid" borderColor="gray.200">
              <VStack spacing={4} align="stretch">
                <Heading size="md" color="teal.600" textAlign="center">For Businesses</Heading>
                <VStack spacing={3} align="stretch">
                  <HStack spacing={3}>
                    <Icon as={ArrowForwardIcon} color="teal.500" boxSize={5} />
                    <Text color="gray.700">Connect your Solana wallet</Text>
                  </HStack>
                  <HStack spacing={3}>
                    <Icon as={ArrowForwardIcon} color="teal.500" boxSize={5} />
                    <Text color="gray.700">Create and mint promotional deal NFTs</Text>
                  </HStack>
                  <HStack spacing={3}>
                    <Icon as={ArrowForwardIcon} color="teal.500" boxSize={5} />
                    <Text color="gray.700">Set discounts, expiry dates, and terms</Text>
                  </HStack>
                  <HStack spacing={3}>
                    <Icon as={ArrowForwardIcon} color="teal.500" boxSize={5} />
                    <Text color="gray.700">Track sales and customer engagement</Text>
                  </HStack>
                </VStack>
              </VStack>
            </Box>
            
            <Box p={6} bg="gray.50" borderRadius="md" border="1px solid" borderColor="gray.200">
              <VStack spacing={4} align="stretch">
                <Heading size="md" color="blue.600" textAlign="center">For Deal Seekers</Heading>
                <VStack spacing={3} align="stretch">
                  <HStack spacing={3}>
                    <Icon as={ArrowForwardIcon} color="blue.500" boxSize={5} />
                    <Text color="gray.700">Browse exclusive deals and coupons</Text>
                  </HStack>
                  <HStack spacing={3}>
                    <Icon as={ArrowForwardIcon} color="blue.500" boxSize={5} />
                    <Text color="gray.700">Purchase discount NFTs instantly</Text>
                  </HStack>
                  <HStack spacing={3}>
                    <Icon as={ArrowForwardIcon} color="blue.500" boxSize={5} />
                    <Text color="gray.700">Trade deals on secondary markets</Text>
                  </HStack>
                  <HStack spacing={3}>
                    <Icon as={ArrowForwardIcon} color="blue.500" boxSize={5} />
                    <Text color="gray.700">Redeem your savings at merchants</Text>
                  </HStack>
                </VStack>
              </VStack>
            </Box>
          </SimpleGrid>
        </VStack>
      </Box>
    </Stack>
  </Box>
);

export default Home;