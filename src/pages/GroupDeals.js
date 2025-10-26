import React, { useState, useEffect } from 'react';
import {
  Box, Heading, Text, VStack, HStack, SimpleGrid, Stat, StatLabel, StatNumber, StatHelpText, StatArrow, 
  Badge, Button, Table, Thead, Tbody, Tr, Th, Td, Tabs, TabList, TabPanels, Tab, TabPanel,
  Alert, AlertIcon, AlertTitle, AlertDescription, Code, Link, Spinner, Progress, Divider,
  Card, CardHeader, CardBody, CardFooter, Icon, Tooltip, useToast, Select, Input, InputGroup, InputLeftElement,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter,
  useDisclosure, FormControl, FormLabel, Textarea, Switch, Slider, SliderTrack, SliderFilledTrack, SliderThumb,
  NumberInput, NumberInputField, NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper,
  Progress as ChakraProgress, CircularProgress, CircularProgressLabel
} from '@chakra-ui/react';
import { 
  ExternalLinkIcon, CheckCircleIcon, WarningIcon, ArrowUpIcon, ArrowDownIcon, 
  StarIcon, TimeIcon, DollarIcon, TrendingUpIcon, TrendingDownIcon, InfoIcon,
  SearchIcon, FilterIcon, DownloadIcon, RepeatIcon, SettingsIcon, ViewIcon,
  AddIcon, FireIcon
} from '@chakra-ui/icons';
import { useSolana } from '../hooks/useSolana';
import { AnimatePresence, motion as framerMotion } from 'framer-motion';

const MotionBox = framerMotion(Box);
const MotionCard = framerMotion(Card);

const GroupDeals = () => {
  const { connected, publicKey, createGroupDeal, joinGroupDeal, getActiveGroupDeals, getGroupDealDetails, 
          leaveGroupDeal, getUserGroupDeals, loading, error } = useSolana();
  
  const [groupDeals, setGroupDeals] = useState([]);
  const [userGroupDeals, setUserGroupDeals] = useState([]);
  const [selectedGroupDeal, setSelectedGroupDeal] = useState(null);
  const [joinQuantity, setJoinQuantity] = useState(1);
  const [filters, setFilters] = useState({});
  const [sortBy, setSortBy] = useState('endTime');
  const [sortOrder, setSortOrder] = useState('asc');
  const [joinResult, setJoinResult] = useState(null);
  const [leaveResult, setLeaveResult] = useState(null);
  const [isJoining, setIsJoining] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  
  const { isOpen: isJoinModalOpen, onOpen: onJoinModalOpen, onClose: onJoinModalClose } = useDisclosure();
  const { isOpen: isCreateModalOpen, onOpen: onCreateModalOpen, onClose: onCreateModalClose } = useDisclosure();
  const { isOpen: isDetailModalOpen, onOpen: onDetailModalOpen, onClose: onDetailModalClose } = useDisclosure();
  
  const toast = useToast();

  // Load group deals and user deals when wallet connects
  useEffect(() => {
    const loadGroupDealData = async () => {
      if (connected && publicKey) {
        try {
          // Load active group deals
          const groupDealsResult = await getActiveGroupDeals(filters);
          if (groupDealsResult.success) {
            setGroupDeals(groupDealsResult.groupDeals);
          }
          
          // Load user group deals
          const userDealsResult = await getUserGroupDeals(publicKey.toString());
          if (userDealsResult.success) {
            setUserGroupDeals(userDealsResult.groupDeals);
          }

        } catch (err) {
          console.error('Error loading group deal data:', err);
          toast({
            title: 'Error Loading Group Deals',
            description: 'Failed to load group deal data. Please try again.',
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
        }
      }
    };

    loadGroupDealData();
  }, [connected, publicKey, filters, getActiveGroupDeals, getUserGroupDeals, toast]);

  const handleJoinClick = (groupDeal) => {
    setSelectedGroupDeal(groupDeal);
    setJoinQuantity(1);
    onJoinModalOpen();
  };

  const handleJoinGroupDeal = async () => {
    if (!selectedGroupDeal || !joinQuantity) return;
    
    setIsJoining(true);
    setJoinResult(null);

    try {
      const result = await joinGroupDeal(selectedGroupDeal.id, { quantity: joinQuantity });
      
      if (result.success) {
        setJoinResult(result.data);
        
        // Update local state
        setGroupDeals(prev => prev.map(deal => 
          deal.id === selectedGroupDeal.id 
            ? { ...deal, currentParticipants: deal.currentParticipants + 1, totalQuantity: deal.totalQuantity + joinQuantity }
            : deal
        ));
        
        toast({
          title: 'Joined Group Deal! 🎉',
          description: `You've successfully joined the group deal for ${selectedGroupDeal.dealTitle}.`,
          status: 'success',
          duration: 8000,
          isClosable: true,
        });

        // Keep modal open to show join details
        setTimeout(() => {
          onJoinModalClose();
        }, 3000);
      } else {
        throw new Error(result.error || 'Failed to join group deal');
      }
    } catch (error) {
      toast({
        title: 'Join Failed',
        description: error.message || 'There was an error joining the group deal. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsJoining(false);
    }
  };

  const handleLeaveGroupDeal = async (groupDealId) => {
    setIsLeaving(true);
    setLeaveResult(null);

    try {
      const result = await leaveGroupDeal(groupDealId);
      
      if (result.success) {
        setLeaveResult(result.data);
        
        // Update local state
        setGroupDeals(prev => prev.map(deal => 
          deal.id === groupDealId 
            ? { ...deal, currentParticipants: deal.currentParticipants - 1 }
            : deal
        ));
        
        toast({
          title: 'Left Group Deal',
          description: 'You have successfully left the group deal.',
          status: 'info',
          duration: 5000,
          isClosable: true,
        });
      } else {
        throw new Error(result.error || 'Failed to leave group deal');
      }
    } catch (error) {
      toast({
        title: 'Leave Failed',
        description: error.message || 'There was an error leaving the group deal. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLeaving(false);
    }
  };

  const handleGroupDealClick = (groupDeal) => {
    setSelectedGroupDeal(groupDeal);
    onDetailModalOpen();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'green';
      case 'Completed': return 'blue';
      case 'Cancelled': return 'red';
      case 'Expired': return 'gray';
      default: return 'blue';
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

  const getCurrentPrice = (groupDeal) => {
    const currentTier = groupDeal.discountTiers.find(tier => tier.participants <= groupDeal.currentParticipants);
    return currentTier ? currentTier.price : groupDeal.originalPrice;
  };

  const getNextTierInfo = (groupDeal) => {
    const nextTier = groupDeal.discountTiers.find(tier => tier.participants > groupDeal.currentParticipants);
    if (!nextTier) return null;
    
    const participantsNeeded = nextTier.participants - groupDeal.currentParticipants;
    return {
      ...nextTier,
      participantsNeeded
    };
  };

  if (!connected) {
    return (
      <Box p={6} bg="white" borderRadius="md" border="1px solid" borderColor="gray.200" boxShadow="md">
        <Alert status="warning" borderRadius="md">
          <AlertIcon />
          <AlertTitle>Wallet Not Connected!</AlertTitle>
          <AlertDescription>
            Please connect your Solana wallet to participate in group deals.
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
            👥 Group Deals
          </Heading>
          <Text color="gray.600" mb={4}>
            Join forces with others to unlock bigger discounts! The more people join, the better the deal.
          </Text>
          {publicKey && (
            <Code fontSize="sm" p={2} bg="gray.100" borderRadius="md">
              Wallet: {publicKey.toString().slice(0, 8)}...{publicKey.toString().slice(-8)}
            </Code>
          )}
        </Box>

        {/* Group Deals Overview Stats */}
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
              <StatLabel color="white" fontSize="sm">Active Group Deals</StatLabel>
              <StatNumber fontSize="2xl">{groupDeals.length}</StatNumber>
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
              <StatLabel color="white" fontSize="sm">My Group Deals</StatLabel>
              <StatNumber fontSize="2xl">{userGroupDeals.length}</StatNumber>
              <StatHelpText color="white">
                {userGroupDeals.reduce((sum, deal) => sum + deal.savings, 0).toFixed(2)} saved
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
              <StatLabel color="white" fontSize="sm">Total Participants</StatLabel>
              <StatNumber fontSize="2xl">{groupDeals.reduce((sum, deal) => sum + deal.currentParticipants, 0)}</StatNumber>
              <StatHelpText color="white">
                Across all deals
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
              <StatLabel color="white" fontSize="sm">Avg Discount</StatLabel>
              <StatNumber fontSize="2xl">
                {groupDeals.length > 0 ? (groupDeals.reduce((sum, deal) => sum + deal.currentDiscount, 0) / groupDeals.length).toFixed(0) : '0'}%
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
            <Tab>🔥 Live Group Deals</Tab>
            <Tab>👥 My Group Deals</Tab>
            <Tab>📊 Group Analytics</Tab>
            <Tab>⚡ Quick Actions</Tab>
          </TabList>

          <TabPanels>
            {/* Live Group Deals Tab */}
            <TabPanel>
              <VStack spacing={6} align="stretch">
                {/* Filters and Search */}
                <Box p={4} bg="gray.50" borderRadius="md">
                  <HStack spacing={4} wrap="wrap">
                    <InputGroup maxW="300px">
                      <InputLeftElement>
                        <Icon as={SearchIcon} color="gray.400" />
                      </InputLeftElement>
                      <Input placeholder="Search group deals..." />
                    </InputGroup>
                    <Select placeholder="Filter by category" maxW="200px" onChange={(e) => setFilters({...filters, category: e.target.value})}>
                      <option value="Food & Dining">Food & Dining</option>
                      <option value="Travel & Hotels">Travel & Hotels</option>
                      <option value="Entertainment">Entertainment</option>
                    </Select>
                    <Select placeholder="Filter by discount" maxW="200px" onChange={(e) => setFilters({...filters, minDiscount: e.target.value})}>
                      <option value="10">10%+ Discount</option>
                      <option value="20">20%+ Discount</option>
                      <option value="30">30%+ Discount</option>
                    </Select>
                    <Button leftIcon={<Icon as={RepeatIcon} />} onClick={() => window.location.reload()}>
                      Refresh
                    </Button>
                  </HStack>
                </Box>

                {/* Group Deals Grid */}
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                  {groupDeals.map((deal, index) => {
                    const currentPrice = getCurrentPrice(deal);
                    const nextTier = getNextTierInfo(deal);
                    const progress = (deal.currentParticipants / deal.maxParticipants) * 100;
                    
                    return (
                      <MotionCard
                        key={deal.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        p={6}
                        border="1px solid"
                        borderColor="gray.200"
                        borderRadius="lg"
                        _hover={{ boxShadow: 'lg', transform: 'translateY(-2px)' }}
                        cursor="pointer"
                        onClick={() => handleGroupDealClick(deal)}
                      >
                        <VStack spacing={4} align="stretch">
                          {/* Header */}
                          <HStack justify="space-between">
                            <VStack align="start" spacing={1}>
                              <Heading size="md" color="gray.800">{deal.dealTitle}</Heading>
                              <Text fontSize="sm" color="gray.600">{deal.merchant}</Text>
                              <HStack spacing={2}>
                                <Badge colorScheme={getStatusColor(deal.status)} size="sm">
                                  {deal.status}
                                </Badge>
                                <Badge colorScheme="blue" size="sm">
                                  {deal.currentDiscount}% OFF
                                </Badge>
                              </HStack>
                            </VStack>
                            <VStack align="end" spacing={1}>
                              <Text fontSize="xs" color="gray.500">Original</Text>
                              <Text fontSize="sm" textDecoration="line-through">${deal.originalPrice}</Text>
                            </VStack>
                          </HStack>

                          {/* Current Price */}
                          <Box p={4} bg="teal.50" borderRadius="md" border="1px solid" borderColor="teal.200">
                            <VStack spacing={2}>
                              <HStack justify="space-between" w="full">
                                <Text fontSize="sm" color="teal.700" fontWeight="bold">Current Price</Text>
                                <Text fontSize="lg" fontWeight="bold" color="teal.600">${currentPrice}</Text>
                              </HStack>
                              <HStack justify="space-between" w="full">
                                <Text fontSize="xs" color="teal.600">You Save</Text>
                                <Text fontSize="sm" color="green.600" fontWeight="bold">
                                  ${(deal.originalPrice - currentPrice).toFixed(2)}
                                </Text>
                              </HStack>
                            </VStack>
                          </Box>

                          {/* Progress Bar */}
                          <Box>
                            <HStack justify="space-between" mb={2}>
                              <Text fontSize="sm" fontWeight="bold">Progress</Text>
                              <Text fontSize="sm" color="gray.600">
                                {deal.currentParticipants}/{deal.maxParticipants}
                              </Text>
                            </HStack>
                            <ChakraProgress 
                              value={progress} 
                              colorScheme="teal" 
                              size="sm" 
                              borderRadius="md"
                            />
                            <Text fontSize="xs" color="gray.500" mt={1}>
                              {deal.nextTierParticipants} more needed for next tier
                            </Text>
                          </Box>

                          {/* Time and Location */}
                          <HStack justify="space-between">
                            <HStack spacing={1}>
                              <Icon as={TimeIcon} boxSize={4} color="red.500" />
                              <Text fontSize="sm" fontWeight="bold" color="red.500">
                                {formatTimeRemaining(deal.endTime)}
                              </Text>
                            </HStack>
                            <HStack spacing={1}>
                              <Icon as={StarIcon} boxSize={4} color="blue.500" />
                              <Text fontSize="sm" color="blue.500">{deal.currentParticipants} joined</Text>
                            </HStack>
                          </HStack>

                          {/* Category and Location */}
                          <HStack justify="space-between">
                            <Text fontSize="xs" color="gray.500">{deal.category}</Text>
                            <Text fontSize="xs" color="gray.500">{deal.location}</Text>
                          </HStack>

                          {/* Action Buttons */}
                          <HStack spacing={2}>
                            <Button
                              size="sm"
                              colorScheme="teal"
                              leftIcon={<Icon as={AddIcon} />}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleJoinClick(deal);
                              }}
                              isDisabled={deal.status !== 'Active' || deal.currentParticipants >= deal.maxParticipants}
                            >
                              Join Group
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              leftIcon={<Icon as={ViewIcon} />}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleGroupDealClick(deal);
                              }}
                            >
                              Details
                            </Button>
                          </HStack>
                        </VStack>
                      </MotionCard>
                    );
                  })}
                </SimpleGrid>
              </VStack>
            </TabPanel>

            {/* My Group Deals Tab */}
            <TabPanel>
              <VStack spacing={4} align="stretch">
                <Heading size="md">My Group Deal Participation</Heading>
                {userGroupDeals.length === 0 ? (
                  <Box textAlign="center" py={8} bg="gray.50" borderRadius="md">
                                <Icon as={StarIcon} boxSize={12} color="gray.400" mb={4} />
                    <Text color="gray.500">No group deals joined yet.</Text>
                    <Text fontSize="sm" color="gray.400" mt={2}>
                      Join group deals to see them here!
                    </Text>
                  </Box>
                ) : (
                  <Box overflowX="auto">
                    <Table variant="simple" size="sm">
                      <Thead>
                        <Tr>
                          <Th>Deal</Th>
                          <Th>Quantity</Th>
                          <Th>Original Price</Th>
                          <Th>Current Price</Th>
                          <Th>Savings</Th>
                          <Th>Status</Th>
                          <Th>Ends At</Th>
                          <Th>Actions</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {userGroupDeals.map((deal, index) => (
                          <Tr key={deal.id}>
                            <Td>
                              <VStack align="start" spacing={1}>
                                <Text fontWeight="bold" fontSize="sm">{deal.dealTitle}</Text>
                                <Text fontSize="xs" color="gray.500">{deal.merchant}</Text>
                              </VStack>
                            </Td>
                            <Td>
                              <Text fontWeight="bold">{deal.quantity}</Text>
                            </Td>
                            <Td>
                              <Text fontSize="sm" textDecoration="line-through">${deal.originalPrice}</Text>
                            </Td>
                            <Td>
                              <Text fontWeight="bold" color="teal.600">${deal.currentPrice}</Text>
                            </Td>
                            <Td>
                              <Text fontWeight="bold" color="green.500">${deal.savings}</Text>
                            </Td>
                            <Td>
                              <Badge colorScheme={getStatusColor(deal.status)} size="sm">
                                {deal.status}
                              </Badge>
                            </Td>
                            <Td>
                              <Text fontSize="sm">{new Date(deal.endTime).toLocaleString()}</Text>
                            </Td>
                            <Td>
                              <HStack spacing={2}>
                                <Button size="xs" variant="outline">
                                  View
                                </Button>
                                {deal.status === 'Active' && (
                                  <Button size="xs" colorScheme="red" onClick={() => handleLeaveGroupDeal(deal.id)}>
                                    Leave
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

            {/* Group Analytics Tab */}
            <TabPanel>
              <VStack spacing={6} align="stretch">
                <Heading size="md">Group Deal Analytics</Heading>
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                  <Card p={6}>
                    <VStack spacing={3} align="stretch">
                      <Heading size="sm">Participation Stats</Heading>
                      <HStack justify="space-between">
                        <Text>Total Participants:</Text>
                        <Text fontWeight="bold">{groupDeals.reduce((sum, deal) => sum + deal.currentParticipants, 0)}</Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text>Avg per Deal:</Text>
                        <Text fontWeight="bold">
                          {groupDeals.length > 0 ? (groupDeals.reduce((sum, deal) => sum + deal.currentParticipants, 0) / groupDeals.length).toFixed(1) : '0'}
                        </Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text>Most Popular:</Text>
                        <Text fontWeight="bold">
                          {groupDeals.length > 0 ? groupDeals.reduce((max, deal) => deal.currentParticipants > max.currentParticipants ? deal : max).dealTitle : 'N/A'}
                        </Text>
                      </HStack>
                    </VStack>
                  </Card>

                  <Card p={6}>
                    <VStack spacing={3} align="stretch">
                      <Heading size="sm">Discount Analysis</Heading>
                      <HStack justify="space-between">
                        <Text>Highest Discount:</Text>
                        <Text fontWeight="bold" color="green.500">
                          {groupDeals.length > 0 ? Math.max(...groupDeals.map(deal => deal.currentDiscount)) : '0'}%
                        </Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text>Lowest Discount:</Text>
                        <Text fontWeight="bold" color="red.500">
                          {groupDeals.length > 0 ? Math.min(...groupDeals.map(deal => deal.currentDiscount)) : '0'}%
                        </Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text>Avg Discount:</Text>
                        <Text fontWeight="bold">
                          {groupDeals.length > 0 ? (groupDeals.reduce((sum, deal) => sum + deal.currentDiscount, 0) / groupDeals.length).toFixed(1) : '0'}%
                        </Text>
                      </HStack>
                    </VStack>
                  </Card>

                  <Card p={6}>
                    <VStack spacing={3} align="stretch">
                      <Heading size="sm">Savings Impact</Heading>
                      <HStack justify="space-between">
                        <Text>Total Savings:</Text>
                        <Text fontWeight="bold" color="green.500">
                          ${groupDeals.reduce((sum, deal) => sum + deal.savings, 0).toFixed(2)}
                        </Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text>Avg per Deal:</Text>
                        <Text fontWeight="bold">
                          ${groupDeals.length > 0 ? (groupDeals.reduce((sum, deal) => sum + deal.savings, 0) / groupDeals.length).toFixed(2) : '0'}
                        </Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text>Best Value:</Text>
                        <Text fontWeight="bold">
                          {groupDeals.length > 0 ? groupDeals.reduce((max, deal) => deal.savings > max.savings ? deal : max).dealTitle : 'N/A'}
                        </Text>
                      </HStack>
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
                      <Heading size="sm">Create Group Deal</Heading>
                      <Text fontSize="sm" color="gray.600">
                        Start a new group deal and let others join for better discounts.
                      </Text>
                      <Button colorScheme="teal" leftIcon={<Icon as={AddIcon} />} onClick={onCreateModalOpen}>
                        Create Group Deal
                      </Button>
                    </VStack>
                  </Card>

                  <Card p={6}>
                    <VStack spacing={4} align="stretch">
                      <Heading size="sm">Share Group Deal</Heading>
                      <Text fontSize="sm" color="gray.600">
                        Share group deals with friends to reach discount tiers faster.
                      </Text>
                      <Button variant="outline" leftIcon={<Icon as={StarIcon} />}>
                        Share Deals
                      </Button>
                    </VStack>
                  </Card>
                </SimpleGrid>
              </VStack>
            </TabPanel>
          </TabPanels>
        </Tabs>

        {/* Join Group Deal Modal */}
        <Modal isOpen={isJoinModalOpen} onClose={onJoinModalClose} size="md">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Join Group Deal</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              {selectedGroupDeal && (
                <VStack spacing={4} align="stretch">
                  <Box p={4} bg="gray.50" borderRadius="md">
                    <VStack spacing={2} align="stretch">
                      <Heading size="sm">{selectedGroupDeal.dealTitle}</Heading>
                      <Text fontSize="sm" color="gray.600">{selectedGroupDeal.merchant}</Text>
                      <HStack justify="space-between">
                        <Text fontSize="sm">Current Price:</Text>
                        <Text fontWeight="bold" color="teal.600">${getCurrentPrice(selectedGroupDeal)}</Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text fontSize="sm">Original Price:</Text>
                        <Text fontSize="sm" textDecoration="line-through">${selectedGroupDeal.originalPrice}</Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text fontSize="sm">Current Discount:</Text>
                        <Text fontWeight="bold" color="green.500">{selectedGroupDeal.currentDiscount}%</Text>
                      </HStack>
                    </VStack>
                  </Box>

                  <FormControl>
                    <FormLabel>Quantity</FormLabel>
                    <NumberInput value={joinQuantity} onChange={(value) => setJoinQuantity(value)} min={1} max={10}>
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>

                  <Box p={3} bg="blue.50" borderRadius="md" border="1px solid" borderColor="blue.200">
                    <Text fontSize="sm" color="blue.700" fontWeight="bold">Total Cost</Text>
                    <Text fontSize="lg" fontWeight="bold" color="blue.600">
                      ${(getCurrentPrice(selectedGroupDeal) * joinQuantity).toFixed(2)}
                    </Text>
                    <Text fontSize="xs" color="blue.600">
                      You save: ${((selectedGroupDeal.originalPrice - getCurrentPrice(selectedGroupDeal)) * joinQuantity).toFixed(2)}
                    </Text>
                  </Box>

                  {joinResult && (
                    <Alert status="success" borderRadius="md">
                      <AlertIcon />
                      <Box>
                        <AlertTitle>Joined Successfully! 🎉</AlertTitle>
                        <AlertDescription>
                          <VStack spacing={2} align="stretch" mt={2}>
                            <HStack justify="space-between">
                              <Text fontSize="sm" color="gray.600">Quantity:</Text>
                              <Text fontWeight="bold">{joinResult.quantity}</Text>
                            </HStack>
                            <HStack justify="space-between">
                              <Text fontSize="sm" color="gray.600">Transaction:</Text>
                              <Link href={joinResult.explorerUrl} isExternal color="blue.500" fontSize="sm">
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
              <Button variant="ghost" mr={3} onClick={onJoinModalClose}>
                Cancel
              </Button>
              <Button
                colorScheme="teal"
                onClick={handleJoinGroupDeal}
                isLoading={isJoining}
                loadingText="Joining..."
                isDisabled={!joinQuantity || isJoining}
              >
                Join Group Deal
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Group Deal Detail Modal */}
        <Modal isOpen={isDetailModalOpen} onClose={onDetailModalClose} size="xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Group Deal Details</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              {selectedGroupDeal && (
                <VStack spacing={6} align="stretch">
                  <HStack justify="space-between">
                    <VStack align="start" spacing={1}>
                      <Heading size="lg">{selectedGroupDeal.dealTitle}</Heading>
                      <Text color="gray.600">{selectedGroupDeal.merchant}</Text>
                      <HStack spacing={2}>
                        <Badge colorScheme={getStatusColor(selectedGroupDeal.status)}>
                          {selectedGroupDeal.status}
                        </Badge>
                        <Badge colorScheme="blue">
                          {selectedGroupDeal.currentDiscount}% OFF
                        </Badge>
                      </HStack>
                    </VStack>
                    <VStack align="end" spacing={1}>
                      <Text fontSize="sm" color="gray.500">Original Price</Text>
                      <Text fontSize="lg" textDecoration="line-through">${selectedGroupDeal.originalPrice}</Text>
                    </VStack>
                  </HStack>

                  <Divider />

                  <SimpleGrid columns={2} spacing={6}>
                    <Box>
                      <Heading size="md" mb={4}>Deal Info</Heading>
                      <VStack spacing={3} align="stretch">
                        <HStack justify="space-between">
                          <Text>Current Price:</Text>
                          <Text fontWeight="bold" color="teal.600">${getCurrentPrice(selectedGroupDeal)}</Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text>Participants:</Text>
                          <Text fontWeight="bold">{selectedGroupDeal.currentParticipants}/{selectedGroupDeal.maxParticipants}</Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text>Time Remaining:</Text>
                          <Text fontWeight="bold" color="red.500">
                            {formatTimeRemaining(selectedGroupDeal.endTime)}
                          </Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text>Category:</Text>
                          <Text fontWeight="bold">{selectedGroupDeal.category}</Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text>Location:</Text>
                          <Text fontWeight="bold">{selectedGroupDeal.location}</Text>
                        </HStack>
                      </VStack>
                    </Box>

                    <Box>
                      <Heading size="md" mb={4}>Discount Tiers</Heading>
                      <VStack spacing={2} align="stretch">
                        {selectedGroupDeal.discountTiers.map((tier, index) => (
                          <Box key={index} p={3} bg={tier.participants <= selectedGroupDeal.currentParticipants ? 'green.50' : 'gray.50'} borderRadius="md" border="1px solid" borderColor={tier.participants <= selectedGroupDeal.currentParticipants ? 'green.200' : 'gray.200'}>
                            <HStack justify="space-between">
                              <Text fontSize="sm" fontWeight="bold">{tier.participants} people</Text>
                              <Text fontSize="sm" fontWeight="bold" color={tier.participants <= selectedGroupDeal.currentParticipants ? 'green.600' : 'gray.600'}>
                                {tier.discount}% off - ${tier.price}
                              </Text>
                            </HStack>
                            {tier.participants <= selectedGroupDeal.currentParticipants && (
                              <Text fontSize="xs" color="green.600">✓ Current Tier</Text>
                            )}
                          </Box>
                        ))}
                      </VStack>
                    </Box>
                  </SimpleGrid>

                  <Box>
                    <Heading size="md" mb={4}>Description</Heading>
                    <Text color="gray.600">{selectedGroupDeal.description}</Text>
                  </Box>

                  <Box>
                    <Heading size="md" mb={4}>Participants</Heading>
                    <VStack spacing={2} align="stretch">
                      {selectedGroupDeal.participants.map((participant, index) => (
                        <HStack key={index} justify="space-between" p={2} bg="gray.50" borderRadius="md">
                          <Text fontSize="sm" fontWeight="bold">{participant.address}</Text>
                          <Text fontSize="sm" color="gray.600">Qty: {participant.quantity}</Text>
                          <Text fontSize="xs" color="gray.500">
                            {new Date(participant.joinedAt).toLocaleString()}
                          </Text>
                        </HStack>
                      ))}
                    </VStack>
                  </Box>
                </VStack>
              )}
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onDetailModalClose}>
                Close
              </Button>
              {selectedGroupDeal?.status === 'Active' && (
                <Button colorScheme="teal" onClick={() => handleJoinClick(selectedGroupDeal)}>
                  Join Group Deal
                </Button>
              )}
            </ModalFooter>
          </ModalContent>
        </Modal>
      </VStack>
    </Box>
  );
};

export default GroupDeals;
