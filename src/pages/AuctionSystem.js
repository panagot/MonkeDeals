import React, { useState, useEffect } from 'react';
import {
  Box, Heading, Text, VStack, HStack, SimpleGrid, Stat, StatLabel, StatNumber, StatHelpText, StatArrow, 
  Badge, Button, Table, Thead, Tbody, Tr, Th, Td, Tabs, TabList, TabPanels, Tab, TabPanel,
  Alert, AlertIcon, AlertTitle, AlertDescription, Code, Link, Spinner, Progress, Divider,
  Card, CardHeader, CardBody, CardFooter, Icon, Tooltip, useToast, Select, Input, InputGroup, InputLeftElement,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter,
  useDisclosure, FormControl, FormLabel, Textarea, Switch, Slider, SliderTrack, SliderFilledTrack, SliderThumb,
  NumberInput, NumberInputField, NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper
} from '@chakra-ui/react';
import { 
  ExternalLinkIcon, CheckCircleIcon, WarningIcon, ArrowUpIcon, ArrowDownIcon, 
  StarIcon, TimeIcon, DollarIcon, TrendingUpIcon, TrendingDownIcon, InfoIcon,
  SearchIcon, FilterIcon, DownloadIcon, RepeatIcon, SettingsIcon, ViewIcon,
  EditIcon, AddIcon, FireIcon
} from '@chakra-ui/icons';
import { useSolana } from '../hooks/useSolana';
import { AnimatePresence, motion as framerMotion } from 'framer-motion';

const MotionBox = framerMotion(Box);
const MotionCard = framerMotion(Card);

const AuctionSystem = () => {
  const { connected, publicKey, createAuction, placeBid, getActiveAuctions, getAuctionDetails, 
          endAuction, getUserBids, loading, error } = useSolana();
  
  const [auctions, setAuctions] = useState([]);
  const [userBids, setUserBids] = useState([]);
  const [selectedAuction, setSelectedAuction] = useState(null);
  const [bidAmount, setBidAmount] = useState('');
  const [filters, setFilters] = useState({});
  const [sortBy, setSortBy] = useState('endTime');
  const [sortOrder, setSortOrder] = useState('asc');
  const [bidResult, setBidResult] = useState(null);
  const [auctionResult, setAuctionResult] = useState(null);
  const [isBidding, setIsBidding] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isEnding, setIsEnding] = useState(false);
  
  const { isOpen: isBidModalOpen, onOpen: onBidModalOpen, onClose: onBidModalClose } = useDisclosure();
  const { isOpen: isCreateModalOpen, onOpen: onCreateModalOpen, onClose: onCreateModalClose } = useDisclosure();
  const { isOpen: isDetailModalOpen, onOpen: onDetailModalOpen, onClose: onDetailModalClose } = useDisclosure();
  
  const toast = useToast();

  // Load auctions and user bids when wallet connects
  useEffect(() => {
    const loadAuctionData = async () => {
      if (connected && publicKey) {
        try {
          // Load active auctions
          const auctionsResult = await getActiveAuctions(filters);
          if (auctionsResult.success) {
            setAuctions(auctionsResult.auctions);
          }
          
          // Load user bids
          const bidsResult = await getUserBids(publicKey.toString());
          if (bidsResult.success) {
            setUserBids(bidsResult.bids);
          }

        } catch (err) {
          console.error('Error loading auction data:', err);
          toast({
            title: 'Error Loading Auctions',
            description: 'Failed to load auction data. Please try again.',
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
        }
      }
    };

    loadAuctionData();
  }, [connected, publicKey, filters, getActiveAuctions, getUserBids, toast]);

  const handleBidClick = (auction) => {
    setSelectedAuction(auction);
    setBidAmount((auction.currentBid + auction.minimumIncrement).toString());
    onBidModalOpen();
  };

  const handlePlaceBid = async () => {
    if (!selectedAuction || !bidAmount) return;
    
    setIsBidding(true);
    setBidResult(null);

    try {
      const result = await placeBid(selectedAuction.id, parseFloat(bidAmount));
      
      if (result.success) {
        setBidResult(result.data);
        
        // Update local state
        setAuctions(prev => prev.map(auction => 
          auction.id === selectedAuction.id 
            ? { ...auction, currentBid: parseFloat(bidAmount), bidCount: auction.bidCount + 1 }
            : auction
        ));
        
        toast({
          title: 'Bid Placed Successfully! 🎉',
          description: `Your bid of $${bidAmount} has been placed on the blockchain.`,
          status: 'success',
          duration: 8000,
          isClosable: true,
        });

        // Keep modal open to show bid details
        setTimeout(() => {
          onBidModalClose();
        }, 3000);
      } else {
        throw new Error(result.error || 'Failed to place bid');
      }
    } catch (error) {
      toast({
        title: 'Bid Failed',
        description: error.message || 'There was an error placing your bid. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsBidding(false);
    }
  };

  const handleEndAuction = async (auctionId) => {
    setIsEnding(true);
    setAuctionResult(null);

    try {
      const result = await endAuction(auctionId);
      
      if (result.success) {
        setAuctionResult(result.data);
        
        // Update local state
        setAuctions(prev => prev.map(auction => 
          auction.id === auctionId 
            ? { ...auction, status: 'Ended' }
            : auction
        ));
        
        toast({
          title: 'Auction Ended! 🏆',
          description: 'The auction has been ended successfully.',
          status: 'success',
          duration: 8000,
          isClosable: true,
        });
      } else {
        throw new Error(result.error || 'Failed to end auction');
      }
    } catch (error) {
      toast({
        title: 'End Auction Failed',
        description: error.message || 'There was an error ending the auction. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsEnding(false);
    }
  };

  const handleAuctionClick = (auction) => {
    setSelectedAuction(auction);
    onDetailModalOpen();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'green';
      case 'Ended': return 'red';
      case 'Cancelled': return 'gray';
      default: return 'blue';
    }
  };

  const getAuctionTypeColor = (type) => {
    switch (type) {
      case 'English': return 'blue';
      case 'Dutch': return 'orange';
      case 'Sealed': return 'purple';
      default: return 'gray';
    }
  };

  const formatTimeRemaining = (endTime) => {
    const now = new Date();
    const end = new Date(endTime);
    const diff = end - now;
    
    if (diff <= 0) return 'Ended';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  if (!connected) {
    return (
      <Box p={6} bg="white" borderRadius="md" border="1px solid" borderColor="gray.200" boxShadow="md">
        <Alert status="warning" borderRadius="md">
          <AlertIcon />
          <AlertTitle>Wallet Not Connected!</AlertTitle>
          <AlertDescription>
            Please connect your Solana wallet to participate in auctions.
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
            🏆 Auction System
          </Heading>
          <Text color="gray.600" mb={4}>
            Bid on exclusive deals in real-time auctions powered by Solana blockchain.
          </Text>
          {publicKey && (
            <Code fontSize="sm" p={2} bg="gray.100" borderRadius="md">
              Wallet: {publicKey.toString().slice(0, 8)}...{publicKey.toString().slice(-8)}
            </Code>
          )}
        </Box>

        {/* Auction Overview Stats */}
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
              <StatLabel color="white" fontSize="sm">Active Auctions</StatLabel>
              <StatNumber fontSize="2xl">{auctions.length}</StatNumber>
              <StatHelpText color="white">
                <StatArrow type="increase" />
                Live now
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
              <StatLabel color="white" fontSize="sm">My Bids</StatLabel>
              <StatNumber fontSize="2xl">{userBids.length}</StatNumber>
              <StatHelpText color="white">
                {userBids.filter(bid => bid.isWinning).length} winning
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
              <StatLabel color="white" fontSize="sm">Total Bids</StatLabel>
              <StatNumber fontSize="2xl">{auctions.reduce((sum, auction) => sum + auction.bidCount, 0)}</StatNumber>
              <StatHelpText color="white">
                Across all auctions
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
              <StatLabel color="white" fontSize="sm">Avg Bid</StatLabel>
              <StatNumber fontSize="2xl">
                ${auctions.length > 0 ? (auctions.reduce((sum, auction) => sum + auction.currentBid, 0) / auctions.length).toFixed(0) : '0'}
              </StatNumber>
              <StatHelpText color="white">
                Current average
              </StatHelpText>
            </Stat>
          </MotionCard>
        </SimpleGrid>

        {/* Main Content Tabs */}
        <Tabs variant="enclosed" colorScheme="teal">
          <TabList>
            <Tab>🔥 Live Auctions</Tab>
            <Tab>💼 My Bids</Tab>
            <Tab>📊 Auction Analytics</Tab>
            <Tab>⚡ Quick Actions</Tab>
          </TabList>

          <TabPanels>
            {/* Live Auctions Tab */}
            <TabPanel>
              <VStack spacing={6} align="stretch">
                {/* Filters and Search */}
                <Box p={4} bg="gray.50" borderRadius="md">
                  <HStack spacing={4} wrap="wrap">
                    <InputGroup maxW="300px">
                      <InputLeftElement>
                        <Icon as={SearchIcon} color="gray.400" />
                      </InputLeftElement>
                      <Input placeholder="Search auctions..." />
                    </InputGroup>
                    <Select placeholder="Filter by category" maxW="200px" onChange={(e) => setFilters({...filters, category: e.target.value})}>
                      <option value="Food & Dining">Food & Dining</option>
                      <option value="Travel & Hotels">Travel & Hotels</option>
                      <option value="Entertainment">Entertainment</option>
                    </Select>
                    <Select placeholder="Filter by type" maxW="200px" onChange={(e) => setFilters({...filters, auctionType: e.target.value})}>
                      <option value="English">English</option>
                      <option value="Dutch">Dutch</option>
                      <option value="Sealed">Sealed</option>
                    </Select>
                    <Button leftIcon={<Icon as={RepeatIcon} />} onClick={() => window.location.reload()}>
                      Refresh
                    </Button>
                  </HStack>
                </Box>

                {/* Auctions Grid */}
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                  {auctions.map((auction, index) => (
                    <MotionCard
                      key={auction.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      p={6}
                      border="1px solid"
                      borderColor="gray.200"
                      borderRadius="lg"
                      _hover={{ boxShadow: 'lg', transform: 'translateY(-2px)' }}
                      cursor="pointer"
                      onClick={() => handleAuctionClick(auction)}
                    >
                      <VStack spacing={4} align="stretch">
                        {/* Header */}
                        <HStack justify="space-between">
                          <VStack align="start" spacing={1}>
                            <Heading size="md" color="gray.800">{auction.dealTitle}</Heading>
                            <Text fontSize="sm" color="gray.600">{auction.merchant}</Text>
                            <HStack spacing={2}>
                              <Badge colorScheme={getAuctionTypeColor(auction.auctionType)} size="sm">
                                {auction.auctionType}
                              </Badge>
                              <Badge colorScheme={getStatusColor(auction.status)} size="sm">
                                {auction.status}
                              </Badge>
                            </HStack>
                          </VStack>
                          <VStack align="end" spacing={1}>
                            <Text fontSize="xs" color="gray.500">Original</Text>
                            <Text fontSize="sm" textDecoration="line-through">${auction.originalPrice}</Text>
                          </VStack>
                        </HStack>

                        {/* Current Bid */}
                        <Box p={4} bg="teal.50" borderRadius="md" border="1px solid" borderColor="teal.200">
                          <VStack spacing={2}>
                            <HStack justify="space-between" w="full">
                              <Text fontSize="sm" color="teal.700" fontWeight="bold">Current Bid</Text>
                              <Text fontSize="lg" fontWeight="bold" color="teal.600">${auction.currentBid}</Text>
                            </HStack>
                            <HStack justify="space-between" w="full">
                              <Text fontSize="xs" color="teal.600">Start Price</Text>
                              <Text fontSize="sm" color="teal.600">${auction.startPrice}</Text>
                            </HStack>
                            <HStack justify="space-between" w="full">
                              <Text fontSize="xs" color="teal.600">Reserve</Text>
                              <Text fontSize="sm" color={auction.isReserveMet ? 'green.600' : 'orange.600'}>
                                ${auction.reservePrice} {auction.isReserveMet ? '✓' : '⚠️'}
                              </Text>
                            </HStack>
                          </VStack>
                        </Box>

                        {/* Time and Bids */}
                        <HStack justify="space-between">
                          <HStack spacing={1}>
                            <Icon as={TimeIcon} boxSize={4} color="red.500" />
                            <Text fontSize="sm" fontWeight="bold" color="red.500">
                              {formatTimeRemaining(auction.endTime)}
                            </Text>
                          </HStack>
                          <HStack spacing={1}>
                            <Icon as={EditIcon} boxSize={4} color="blue.500" />
                            <Text fontSize="sm" color="blue.500">{auction.bidCount} bids</Text>
                          </HStack>
                        </HStack>

                        {/* Category and Location */}
                        <HStack justify="space-between">
                          <Text fontSize="xs" color="gray.500">{auction.category}</Text>
                          <Text fontSize="xs" color="gray.500">{auction.location}</Text>
                        </HStack>

                        {/* Action Buttons */}
                        <HStack spacing={2}>
                          <Button
                            size="sm"
                            colorScheme="teal"
                              leftIcon={<Icon as={AddIcon} />}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleBidClick(auction);
                            }}
                            isDisabled={auction.status !== 'Active'}
                          >
                            Place Bid
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            leftIcon={<Icon as={ViewIcon} />}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAuctionClick(auction);
                            }}
                          >
                            Details
                          </Button>
                        </HStack>
                      </VStack>
                    </MotionCard>
                  ))}
                </SimpleGrid>
              </VStack>
            </TabPanel>

            {/* My Bids Tab */}
            <TabPanel>
              <VStack spacing={4} align="stretch">
                <Heading size="md">My Bidding Activity</Heading>
                {userBids.length === 0 ? (
                  <Box textAlign="center" py={8} bg="gray.50" borderRadius="md">
                    <Icon as={AddIcon} boxSize={12} color="gray.400" mb={4} />
                    <Text color="gray.500">No bids placed yet.</Text>
                    <Text fontSize="sm" color="gray.400" mt={2}>
                      Start bidding on auctions to see them here!
                    </Text>
                  </Box>
                ) : (
                  <Box overflowX="auto">
                    <Table variant="simple" size="sm">
                      <Thead>
                        <Tr>
                          <Th>Deal</Th>
                          <Th>Bid Amount</Th>
                          <Th>Status</Th>
                          <Th>Placed At</Th>
                          <Th>Ends At</Th>
                          <Th>Actions</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {userBids.map((bid, index) => (
                          <Tr key={bid.id}>
                            <Td>
                              <VStack align="start" spacing={1}>
                                <Text fontWeight="bold" fontSize="sm">{bid.dealTitle}</Text>
                                <Text fontSize="xs" color="gray.500">Auction #{bid.auctionId}</Text>
                              </VStack>
                            </Td>
                            <Td>
                              <Text fontWeight="bold" color="teal.600">${bid.bidAmount}</Text>
                            </Td>
                            <Td>
                              <Badge colorScheme={bid.isWinning ? 'green' : 'orange'} size="sm">
                                {bid.isWinning ? 'Winning' : bid.status}
                              </Badge>
                            </Td>
                            <Td>
                              <Text fontSize="sm">{new Date(bid.placedAt).toLocaleString()}</Text>
                            </Td>
                            <Td>
                              <Text fontSize="sm">{new Date(bid.auctionEndTime).toLocaleString()}</Text>
                            </Td>
                            <Td>
                              <HStack spacing={2}>
                                <Button size="xs" variant="outline">
                                  View
                                </Button>
                                {bid.isWinning && (
                                  <Button size="xs" colorScheme="green">
                                    Winning!
                                  </Button>
                                )}
                              </HStack>
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </Box>
                )}
              </VStack>
            </TabPanel>

            {/* Auction Analytics Tab */}
            <TabPanel>
              <VStack spacing={6} align="stretch">
                <Heading size="md">Auction Analytics</Heading>
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                  <Card p={6}>
                    <VStack spacing={3} align="stretch">
                      <Heading size="sm">Bidding Activity</Heading>
                      <HStack justify="space-between">
                        <Text>Total Bids:</Text>
                        <Text fontWeight="bold">{auctions.reduce((sum, auction) => sum + auction.bidCount, 0)}</Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text>Avg Bids per Auction:</Text>
                        <Text fontWeight="bold">
                          {auctions.length > 0 ? (auctions.reduce((sum, auction) => sum + auction.bidCount, 0) / auctions.length).toFixed(1) : '0'}
                        </Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text>Most Active:</Text>
                        <Text fontWeight="bold">
                          {auctions.length > 0 ? auctions.reduce((max, auction) => auction.bidCount > max.bidCount ? auction : max).dealTitle : 'N/A'}
                        </Text>
                      </HStack>
                    </VStack>
                  </Card>

                  <Card p={6}>
                    <VStack spacing={3} align="stretch">
                      <Heading size="sm">Price Analysis</Heading>
                      <HStack justify="space-between">
                        <Text>Highest Bid:</Text>
                        <Text fontWeight="bold" color="green.500">
                          ${auctions.length > 0 ? Math.max(...auctions.map(auction => auction.currentBid)) : '0'}
                        </Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text>Lowest Bid:</Text>
                        <Text fontWeight="bold" color="red.500">
                          ${auctions.length > 0 ? Math.min(...auctions.map(auction => auction.currentBid)) : '0'}
                        </Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text>Avg Bid:</Text>
                        <Text fontWeight="bold">
                          ${auctions.length > 0 ? (auctions.reduce((sum, auction) => sum + auction.currentBid, 0) / auctions.length).toFixed(2) : '0'}
                        </Text>
                      </HStack>
                    </VStack>
                  </Card>

                  <Card p={6}>
                    <VStack spacing={3} align="stretch">
                      <Heading size="sm">Auction Types</Heading>
                      <VStack spacing={2} align="stretch">
                        {['English', 'Dutch', 'Sealed'].map(type => {
                          const count = auctions.filter(auction => auction.auctionType === type).length;
                          return (
                            <HStack key={type} justify="space-between">
                              <Text>{type}:</Text>
                              <Text fontWeight="bold">{count}</Text>
                            </HStack>
                          );
                        })}
                      </VStack>
                    </VStack>
                  </Card>
                </SimpleGrid>
              </VStack>
            </TabPanel>

            {/* Quick Actions Tab */}
            <TabPanel>
              <VStack spacing={6} align="stretch">
                <Heading size="md">Quick Actions</Heading>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                  <Card p={6}>
                    <VStack spacing={4} align="stretch">
                      <Heading size="sm">Create New Auction</Heading>
                      <Text fontSize="sm" color="gray.600">
                        List your deal for auction and let bidders compete for the best price.
                      </Text>
                      <Button colorScheme="teal" leftIcon={<Icon as={EditIcon} />} onClick={onCreateModalOpen}>
                        Create Auction
                      </Button>
                    </VStack>
                  </Card>

                  <Card p={6}>
                    <VStack spacing={4} align="stretch">
                      <Heading size="sm">Manage Auctions</Heading>
                      <Text fontSize="sm" color="gray.600">
                        End auctions, view results, and manage your auction listings.
                      </Text>
                      <Button variant="outline" leftIcon={<Icon as={SettingsIcon} />}>
                        Manage Auctions
                      </Button>
                    </VStack>
                  </Card>
                </SimpleGrid>
              </VStack>
            </TabPanel>
          </TabPanels>
        </Tabs>

        {/* Bid Modal */}
        <Modal isOpen={isBidModalOpen} onClose={onBidModalClose} size="md">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Place Bid</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              {selectedAuction && (
                <VStack spacing={4} align="stretch">
                  <Box p={4} bg="gray.50" borderRadius="md">
                    <VStack spacing={2} align="stretch">
                      <Heading size="sm">{selectedAuction.dealTitle}</Heading>
                      <Text fontSize="sm" color="gray.600">{selectedAuction.merchant}</Text>
                      <HStack justify="space-between">
                        <Text fontSize="sm">Current Bid:</Text>
                        <Text fontWeight="bold" color="teal.600">${selectedAuction.currentBid}</Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text fontSize="sm">Minimum Increment:</Text>
                        <Text fontWeight="bold">${selectedAuction.minimumIncrement}</Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text fontSize="sm">Reserve Price:</Text>
                        <Text fontWeight="bold" color={selectedAuction.isReserveMet ? 'green.600' : 'orange.600'}>
                          ${selectedAuction.reservePrice}
                        </Text>
                      </HStack>
                    </VStack>
                  </Box>

                  <FormControl>
                    <FormLabel>Your Bid Amount</FormLabel>
                    <NumberInput value={bidAmount} onChange={(value) => setBidAmount(value)} min={selectedAuction.currentBid + selectedAuction.minimumIncrement}>
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>

                  {bidResult && (
                    <Alert status="success" borderRadius="md">
                      <AlertIcon />
                      <Box>
                        <AlertTitle>Bid Placed Successfully! 🎉</AlertTitle>
                        <AlertDescription>
                          <VStack spacing={2} align="stretch" mt={2}>
                            <HStack justify="space-between">
                              <Text fontSize="sm" color="gray.600">Bid Amount:</Text>
                              <Text fontWeight="bold">${bidResult.bidAmount}</Text>
                            </HStack>
                            <HStack justify="space-between">
                              <Text fontSize="sm" color="gray.600">Transaction:</Text>
                              <Link href={bidResult.explorerUrl} isExternal color="blue.500" fontSize="sm">
                                View on Explorer <Icon as={ExternalLinkIcon} ml={1} />
                              </Link>
                            </HStack>
                          </VStack>
                        </AlertDescription>
                      </Box>
                    </Alert>
                  )}
                </VStack>
              )}
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onBidModalClose}>
                Cancel
              </Button>
              <Button
                colorScheme="teal"
                onClick={handlePlaceBid}
                isLoading={isBidding}
                loadingText="Placing Bid..."
                isDisabled={!bidAmount || isBidding}
              >
                Place Bid
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Auction Detail Modal */}
        <Modal isOpen={isDetailModalOpen} onClose={onDetailModalClose} size="xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Auction Details</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              {selectedAuction && (
                <VStack spacing={6} align="stretch">
                  <HStack justify="space-between">
                    <VStack align="start" spacing={1}>
                      <Heading size="lg">{selectedAuction.dealTitle}</Heading>
                      <Text color="gray.600">{selectedAuction.merchant}</Text>
                      <HStack spacing={2}>
                        <Badge colorScheme={getAuctionTypeColor(selectedAuction.auctionType)}>
                          {selectedAuction.auctionType}
                        </Badge>
                        <Badge colorScheme={getStatusColor(selectedAuction.status)}>
                          {selectedAuction.status}
                        </Badge>
                      </HStack>
                    </VStack>
                    <VStack align="end" spacing={1}>
                      <Text fontSize="sm" color="gray.500">Original Price</Text>
                      <Text fontSize="lg" textDecoration="line-through">${selectedAuction.originalPrice}</Text>
                    </VStack>
                  </HStack>

                  <Divider />

                  <SimpleGrid columns={2} spacing={6}>
                    <Box>
                      <Heading size="md" mb={4}>Auction Info</Heading>
                      <VStack spacing={3} align="stretch">
                        <HStack justify="space-between">
                          <Text>Start Price:</Text>
                          <Text fontWeight="bold">${selectedAuction.startPrice}</Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text>Current Bid:</Text>
                          <Text fontWeight="bold" color="teal.600">${selectedAuction.currentBid}</Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text>Reserve Price:</Text>
                          <Text fontWeight="bold" color={selectedAuction.isReserveMet ? 'green.600' : 'orange.600'}>
                            ${selectedAuction.reservePrice}
                          </Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text>Bid Count:</Text>
                          <Text fontWeight="bold">{selectedAuction.bidCount}</Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text>Min Increment:</Text>
                          <Text fontWeight="bold">${selectedAuction.minimumIncrement}</Text>
                        </HStack>
                      </VStack>
                    </Box>

                    <Box>
                      <Heading size="md" mb={4}>Time & Location</Heading>
                      <VStack spacing={3} align="stretch">
                        <HStack justify="space-between">
                          <Text>Time Remaining:</Text>
                          <Text fontWeight="bold" color="red.500">
                            {formatTimeRemaining(selectedAuction.endTime)}
                          </Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text>Ends At:</Text>
                          <Text fontWeight="bold">{new Date(selectedAuction.endTime).toLocaleString()}</Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text>Category:</Text>
                          <Text fontWeight="bold">{selectedAuction.category}</Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text>Location:</Text>
                          <Text fontWeight="bold">{selectedAuction.location}</Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text>Created:</Text>
                          <Text fontWeight="bold">{new Date(selectedAuction.createdAt).toLocaleString()}</Text>
                        </HStack>
                      </VStack>
                    </Box>
                  </SimpleGrid>

                  <Box>
                    <Heading size="md" mb={4}>Description</Heading>
                    <Text color="gray.600">{selectedAuction.description}</Text>
                  </Box>
                </VStack>
              )}
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onDetailModalClose}>
                Close
              </Button>
              {selectedAuction?.status === 'Active' && (
                <Button colorScheme="teal" onClick={() => handleBidClick(selectedAuction)}>
                  Place Bid
                </Button>
              )}
            </ModalFooter>
          </ModalContent>
        </Modal>
      </VStack>
    </Box>
  );
};

export default AuctionSystem;
