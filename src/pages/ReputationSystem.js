import React, { useState, useEffect } from 'react';
import {
  Box, Heading, Text, VStack, HStack, SimpleGrid, Stat, StatLabel, StatNumber, StatHelpText, StatArrow, 
  Badge, Button, Table, Thead, Tbody, Tr, Th, Td, Tabs, TabList, TabPanels, Tab, TabPanel,
  Alert, AlertIcon, AlertTitle, AlertDescription, Code, Link, Spinner, Progress, Divider,
  Card, CardHeader, CardBody, CardFooter, Icon, Tooltip, useToast, Select, Input, InputGroup, InputLeftElement,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter,
  useDisclosure, FormControl, FormLabel, Textarea, Switch, Slider, SliderTrack, SliderFilledTrack, SliderThumb,
  NumberInput, NumberInputField, NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper,
  Progress as ChakraProgress, CircularProgress, CircularProgressLabel, Avatar, AvatarGroup
} from '@chakra-ui/react';
import { 
  ExternalLinkIcon, CheckCircleIcon, WarningIcon, ArrowUpIcon, ArrowDownIcon, 
  StarIcon, TimeIcon, DollarIcon, TrendingUpIcon, TrendingDownIcon, InfoIcon,
  SearchIcon, FilterIcon, DownloadIcon, RefreshIcon, SettingsIcon, ViewIcon,
  StarIcon as StarIconChakra, FireIcon
} from '@chakra-ui/icons';
import { useSolana } from '../hooks/useSolana';
import { AnimatePresence, motion as framerMotion } from 'framer-motion';

const MotionBox = framerMotion(Box);
const MotionCard = framerMotion(Card);

const ReputationSystem = () => {
  const { connected, publicKey, getUserReputation, mintLoyaltyBadge, getLeaderboard, 
          getAvailableBadges, updateReputation, getReputationHistory, loading, error } = useSolana();
  
  const [userReputation, setUserReputation] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [availableBadges, setAvailableBadges] = useState([]);
  const [reputationHistory, setReputationHistory] = useState([]);
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [mintResult, setMintResult] = useState(null);
  const [isMinting, setIsMinting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  const { isOpen: isBadgeModalOpen, onOpen: onBadgeModalOpen, onClose: onBadgeModalClose } = useDisclosure();
  const { isOpen: isMintModalOpen, onOpen: onMintModalOpen, onClose: onMintModalClose } = useDisclosure();
  
  const toast = useToast();

  // Load reputation data when wallet connects
  useEffect(() => {
    const loadReputationData = async () => {
      if (connected && publicKey) {
        try {
          // Load user reputation
          const reputationResult = await getUserReputation(publicKey.toString());
          if (reputationResult.success) {
            setUserReputation(reputationResult.reputation);
          }
          
          // Load leaderboard
          const leaderboardResult = await getLeaderboard(selectedCategory, 50);
          if (leaderboardResult.success) {
            setLeaderboard(leaderboardResult.leaderboard);
          }
          
          // Load available badges
          const badgesResult = await getAvailableBadges();
          if (badgesResult.success) {
            setAvailableBadges(badgesResult.badges);
          }
          
          // Load reputation history
          const historyResult = await getReputationHistory(publicKey.toString(), 50);
          if (historyResult.success) {
            setReputationHistory(historyResult.history);
          }

        } catch (err) {
          console.error('Error loading reputation data:', err);
          toast({
            title: 'Error Loading Reputation',
            description: 'Failed to load reputation data. Please try again.',
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
        }
      }
    };

    loadReputationData();
  }, [connected, publicKey, selectedCategory, getUserReputation, getLeaderboard, getAvailableBadges, getReputationHistory, toast]);

  const handleBadgeClick = (badge) => {
    setSelectedBadge(badge);
    onBadgeModalOpen();
  };

  const handleMintBadge = async (badge) => {
    setIsMinting(true);
    setMintResult(null);

    try {
      const result = await mintLoyaltyBadge(badge);
      
      if (result.success) {
        setMintResult(result.data);
        
        toast({
          title: 'Badge Minted Successfully! 🎉',
          description: `Your ${badge.name} badge has been minted as an NFT on the blockchain.`,
          status: 'success',
          duration: 8000,
          isClosable: true,
        });

        // Keep modal open to show mint details
        setTimeout(() => {
          onMintModalClose();
        }, 3000);
      } else {
        throw new Error(result.error || 'Failed to mint badge');
      }
    } catch (error) {
      toast({
        title: 'Mint Failed',
        description: error.message || 'There was an error minting the badge. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsMinting(false);
    }
  };

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'Common': return 'gray';
      case 'Uncommon': return 'green';
      case 'Rare': return 'blue';
      case 'Epic': return 'purple';
      case 'Legendary': return 'orange';
      case 'Mythic': return 'red';
      default: return 'gray';
    }
  };

  const getLevelColor = (level) => {
    if (level >= 15) return 'red';
    if (level >= 10) return 'purple';
    if (level >= 5) return 'blue';
    return 'green';
  };

  const getTitleColor = (title) => {
    if (title.includes('Legend')) return 'red';
    if (title.includes('Master')) return 'purple';
    if (title.includes('Hero')) return 'orange';
    if (title.includes('Champion')) return 'blue';
    return 'green';
  };

  if (!connected) {
    return (
      <Box p={6} bg="white" borderRadius="md" border="1px solid" borderColor="gray.200" boxShadow="md">
        <Alert status="warning" borderRadius="md">
          <AlertIcon />
          <AlertTitle>Wallet Not Connected!</AlertTitle>
          <AlertDescription>
            Please connect your Solana wallet to view your reputation and badges.
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
            🏆 Reputation System
          </Heading>
          <Text color="gray.600" mb={4}>
            Earn reputation points, unlock loyalty badges, and climb the leaderboard through your deal activities.
          </Text>
          {publicKey && (
            <Code fontSize="sm" p={2} bg="gray.100" borderRadius="md">
              Wallet: {publicKey.toString().slice(0, 8)}...{publicKey.toString().slice(-8)}
            </Code>
          )}
        </Box>

        {/* User Reputation Overview */}
        {userReputation && (
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
                <StatLabel color="white" fontSize="sm">Total Score</StatLabel>
                <StatNumber fontSize="2xl">{userReputation.totalScore.toLocaleString()}</StatNumber>
                <StatHelpText color="white">
                  Level {userReputation.level}
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
                <StatLabel color="white" fontSize="sm">Badges Earned</StatLabel>
                <StatNumber fontSize="2xl">{userReputation.badges.length}</StatNumber>
                <StatHelpText color="white">
                  {userReputation.title}
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
                <StatLabel color="white" fontSize="sm">Total Savings</StatLabel>
                <StatNumber fontSize="2xl">${userReputation.stats.totalSavings.toLocaleString()}</StatNumber>
                <StatHelpText color="white">
                  {userReputation.stats.totalDeals} deals
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
                <StatLabel color="white" fontSize="sm">Leaderboard Rank</StatLabel>
                <StatNumber fontSize="2xl">#{userReputation.leaderboard.rank}</StatNumber>
                <StatHelpText color="white">
                  Top {userReputation.leaderboard.percentile}%
                </StatHelpText>
              </Stat>
            </MotionCard>
          </SimpleGrid>
        )}

        {/* Main Content Tabs */}
        <Tabs variant="enclosed" colorScheme="teal">
          <TabList>
            <Tab>🏆 My Reputation</Tab>
            <Tab>🎖️ Badges</Tab>
            <Tab>📊 Leaderboard</Tab>
            <Tab>📜 History</Tab>
          </TabList>

          <TabPanels>
            {/* My Reputation Tab */}
            <TabPanel>
              {userReputation && (
                <VStack spacing={6} align="stretch">
                  {/* Level Progress */}
                  <Card p={6}>
                    <VStack spacing={4} align="stretch">
                      <HStack justify="space-between">
                        <Heading size="md">Level Progress</Heading>
                        <Badge colorScheme={getLevelColor(userReputation.level)} size="lg">
                          Level {userReputation.level}
                        </Badge>
                      </HStack>
                      <Box>
                        <HStack justify="space-between" mb={2}>
                          <Text fontSize="sm" color="gray.600">Progress to Level {userReputation.level + 1}</Text>
                          <Text fontSize="sm" fontWeight="bold">
                            {userReputation.totalScore} / {((userReputation.level + 1) * 500).toLocaleString()}
                          </Text>
                        </HStack>
                        <ChakraProgress 
                          value={(userReputation.totalScore / ((userReputation.level + 1) * 500)) * 100} 
                          colorScheme="teal" 
                          size="lg" 
                          borderRadius="md"
                        />
                      </Box>
                    </VStack>
                  </Card>

                  {/* Stats Grid */}
                  <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                    <Card p={6}>
                      <VStack spacing={3} align="stretch">
                        <Heading size="sm">Deal Activity</Heading>
                        <HStack justify="space-between">
                          <Text>Total Deals:</Text>
                          <Text fontWeight="bold">{userReputation.stats.totalDeals}</Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text>Auctions Won:</Text>
                          <Text fontWeight="bold">{userReputation.stats.auctionsWon}</Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text>Group Deals:</Text>
                          <Text fontWeight="bold">{userReputation.stats.groupDealsOrganized + userReputation.stats.groupDealsJoined}</Text>
                        </HStack>
                      </VStack>
                    </Card>

                    <Card p={6}>
                      <VStack spacing={3} align="stretch">
                        <Heading size="sm">Financial Impact</Heading>
                        <HStack justify="space-between">
                          <Text>Total Spent:</Text>
                          <Text fontWeight="bold">${userReputation.stats.totalSpent.toLocaleString()}</Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text>Total Saved:</Text>
                          <Text fontWeight="bold" color="green.500">${userReputation.stats.totalSavings.toLocaleString()}</Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text>Savings Rate:</Text>
                          <Text fontWeight="bold" color="green.500">
                            {((userReputation.stats.totalSavings / userReputation.stats.totalSpent) * 100).toFixed(1)}%
                          </Text>
                        </HStack>
                      </VStack>
                    </Card>

                    <Card p={6}>
                      <VStack spacing={3} align="stretch">
                        <Heading size="sm">Social Impact</Heading>
                        <HStack justify="space-between">
                          <Text>Average Rating:</Text>
                          <Text fontWeight="bold" color="yellow.500">
                            {userReputation.stats.averageRating} ⭐
                          </Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text>Referrals:</Text>
                          <Text fontWeight="bold">{userReputation.stats.referralCount}</Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text>Streak:</Text>
                          <Text fontWeight="bold" color="orange.500">{userReputation.stats.streakDays} days</Text>
                        </HStack>
                      </VStack>
                    </Card>
                  </SimpleGrid>

                  {/* Achievements */}
                  <Card p={6}>
                    <Heading size="md" mb={4}>Achievements</Heading>
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                      {userReputation.achievements.map((achievement, index) => (
                        <Box key={achievement.id} p={4} bg={achievement.completed ? 'green.50' : 'gray.50'} borderRadius="md" border="1px solid" borderColor={achievement.completed ? 'green.200' : 'gray.200'}>
                          <HStack justify="space-between" mb={2}>
                            <Text fontWeight="bold">{achievement.name}</Text>
                            <Badge colorScheme={achievement.completed ? 'green' : 'gray'}>
                              {achievement.completed ? 'Completed' : 'In Progress'}
                            </Badge>
                          </HStack>
                          <Text fontSize="sm" color="gray.600" mb={2}>{achievement.description}</Text>
                          <HStack justify="space-between" mb={2}>
                            <Text fontSize="sm">Progress:</Text>
                            <Text fontSize="sm" fontWeight="bold">
                              {achievement.progress} / {achievement.target}
                            </Text>
                          </HStack>
                          <ChakraProgress 
                            value={(achievement.progress / achievement.target) * 100} 
                            colorScheme={achievement.completed ? 'green' : 'blue'} 
                            size="sm" 
                            borderRadius="md"
                          />
                          {achievement.completed && (
                            <Text fontSize="xs" color="green.600" mt={1}>✓ {achievement.reward}</Text>
                          )}
                        </Box>
                      ))}
                    </SimpleGrid>
                  </Card>
                </VStack>
              )}
            </TabPanel>

            {/* Badges Tab */}
            <TabPanel>
              <VStack spacing={6} align="stretch">
                <Heading size="md">Available Badges</Heading>
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                  {availableBadges.map((badge, index) => (
                    <MotionCard
                      key={badge.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      p={6}
                      border="1px solid"
                      borderColor={badge.isEarned ? 'green.200' : 'gray.200'}
                      borderRadius="lg"
                      bg={badge.isEarned ? 'green.50' : 'white'}
                      _hover={{ boxShadow: 'lg', transform: 'translateY(-2px)' }}
                      cursor="pointer"
                      onClick={() => handleBadgeClick(badge)}
                    >
                      <VStack spacing={4} align="stretch">
                        {/* Badge Header */}
                        <HStack justify="space-between">
                          <VStack align="start" spacing={1}>
                            <Text fontSize="4xl">{badge.icon}</Text>
                            <Heading size="sm">{badge.name}</Heading>
                            <Text fontSize="xs" color="gray.600">{badge.description}</Text>
                          </VStack>
                          <VStack align="end" spacing={1}>
                            <Badge colorScheme={getRarityColor(badge.rarity)} size="sm">
                              {badge.rarity}
                            </Badge>
                            <Badge colorScheme={badge.isEarned ? 'green' : 'gray'} size="sm">
                              {badge.isEarned ? 'Earned' : 'Available'}
                            </Badge>
                          </VStack>
                        </HStack>

                        {/* Requirements */}
                        <Box p={3} bg="blue.50" borderRadius="md" border="1px solid" borderColor="blue.200">
                          <Text fontSize="sm" fontWeight="bold" color="blue.700" mb={1}>Requirements</Text>
                          <Text fontSize="sm" color="blue.600">{badge.requirements.description}</Text>
                        </Box>

                        {/* Progress */}
                        {!badge.isEarned && (
                          <Box>
                            <HStack justify="space-between" mb={2}>
                              <Text fontSize="sm">Progress:</Text>
                              <Text fontSize="sm" fontWeight="bold">
                                {badge.progress} / {badge.target}
                              </Text>
                            </HStack>
                            <ChakraProgress 
                              value={(badge.progress / badge.target) * 100} 
                              colorScheme="blue" 
                              size="sm" 
                              borderRadius="md"
                            />
                          </Box>
                        )}

                        {/* Reward */}
                        <Box p={2} bg="yellow.50" borderRadius="md" border="1px solid" borderColor="yellow.200">
                          <Text fontSize="sm" fontWeight="bold" color="yellow.700">Reward</Text>
                          <Text fontSize="sm" color="yellow.600">
                            +{badge.reward.score} points, {badge.reward.title}
                          </Text>
                        </Box>

                        {/* Action Button */}
                        <Button
                          size="sm"
                          colorScheme={badge.isEarned ? 'green' : 'blue'}
                          leftIcon={<Icon as={badge.isEarned ? CheckCircleIcon : StarIcon} />}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (badge.isEarned) {
                              handleMintBadge(badge);
                            }
                          }}
                          isDisabled={!badge.isEarned}
                        >
                          {badge.isEarned ? 'Mint Badge NFT' : 'Not Earned'}
                        </Button>
                      </VStack>
                    </MotionCard>
                  ))}
                </SimpleGrid>
              </VStack>
            </TabPanel>

            {/* Leaderboard Tab */}
            <TabPanel>
              <VStack spacing={6} align="stretch">
                <HStack justify="space-between">
                  <Heading size="md">Leaderboard</Heading>
                  <Select placeholder="Filter by category" maxW="200px" onChange={(e) => setSelectedCategory(e.target.value)}>
                    <option value="all">All Users</option>
                    <option value="savings">Top Savers</option>
                    <option value="deals">Most Active</option>
                    <option value="badges">Badge Collectors</option>
                  </Select>
                </HStack>

                <Box overflowX="auto">
                  <Table variant="simple" size="sm">
                    <Thead>
                      <Tr>
                        <Th>Rank</Th>
                        <Th>User</Th>
                        <Th>Score</Th>
                        <Th>Level</Th>
                        <Th>Badges</Th>
                        <Th>Savings</Th>
                        <Th>Deals</Th>
                        <Th>Status</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {leaderboard.map((user, index) => (
                        <Tr key={user.rank}>
                          <Td>
                            <HStack spacing={2}>
                              <Text fontWeight="bold">#{user.rank}</Text>
                              {user.rank <= 3 && (
                                <Icon as={StarIcon} color={user.rank === 1 ? 'yellow.500' : user.rank === 2 ? 'gray.400' : 'orange.500'} />
                              )}
                            </HStack>
                          </Td>
                          <Td>
                            <HStack spacing={3}>
                              <Text fontSize="2xl">{user.avatar}</Text>
                              <VStack align="start" spacing={0}>
                                <Text fontWeight="bold" fontSize="sm">{user.username}</Text>
                                <Text fontSize="xs" color="gray.500">{user.walletAddress}</Text>
                              </VStack>
                              {user.isVerified && (
                                <Badge colorScheme="blue" size="sm">Verified</Badge>
                              )}
                            </HStack>
                          </Td>
                          <Td>
                            <Text fontWeight="bold" color="teal.600">{user.totalScore.toLocaleString()}</Text>
                          </Td>
                          <Td>
                            <Badge colorScheme={getLevelColor(user.level)} size="sm">
                              Level {user.level}
                            </Badge>
                          </Td>
                          <Td>
                            <Text fontWeight="bold">{user.badges}</Text>
                          </Td>
                          <Td>
                            <Text fontWeight="bold" color="green.500">${user.totalSavings.toLocaleString()}</Text>
                          </Td>
                          <Td>
                            <Text fontWeight="bold">{user.totalDeals}</Text>
                          </Td>
                          <Td>
                            <Badge colorScheme={getTitleColor(user.title)} size="sm">
                              {user.title}
                            </Badge>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>
              </VStack>
            </TabPanel>

            {/* History Tab */}
            <TabPanel>
              <VStack spacing={4} align="stretch">
                <Heading size="md">Reputation History</Heading>
                {reputationHistory.length === 0 ? (
                  <Box textAlign="center" py={8} bg="gray.50" borderRadius="md">
                    <Icon as={TimeIcon} boxSize={12} color="gray.400" mb={4} />
                    <Text color="gray.500">No reputation history yet.</Text>
                    <Text fontSize="sm" color="gray.400" mt={2}>
                      Start earning reputation points to see your history here!
                    </Text>
                  </Box>
                ) : (
                  <VStack spacing={3} align="stretch">
                    {reputationHistory.map((entry, index) => (
                      <Card key={entry.id} p={4} border="1px solid" borderColor="gray.200">
                        <HStack justify="space-between">
                          <VStack align="start" spacing={1}>
                            <Text fontWeight="bold" fontSize="sm">{entry.description}</Text>
                            <Text fontSize="xs" color="gray.500">
                              {new Date(entry.timestamp).toLocaleString()}
                            </Text>
                            {entry.badgesEarned.length > 0 && (
                              <HStack spacing={1}>
                                {entry.badgesEarned.map((badge, badgeIndex) => (
                                  <Badge key={badgeIndex} colorScheme="green" size="sm">
                                    {badge}
                                  </Badge>
                                ))}
                              </HStack>
                            )}
                          </VStack>
                          <VStack align="end" spacing={1}>
                            <Text fontWeight="bold" color="green.500">
                              +{entry.scoreChange} points
                            </Text>
                            <Link href={`https://explorer.solana.com/tx/${entry.transactionSignature}?cluster=devnet`} isExternal>
                              <Icon as={ExternalLinkIcon} boxSize={4} color="blue.500" />
                            </Link>
                          </VStack>
                        </HStack>
                      </Card>
                    ))}
                  </VStack>
                )}
              </VStack>
            </TabPanel>
          </TabPanels>
        </Tabs>

        {/* Badge Detail Modal */}
        <Modal isOpen={isBadgeModalOpen} onClose={onBadgeModalClose} size="md">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Badge Details</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              {selectedBadge && (
                <VStack spacing={4} align="stretch">
                  <Box textAlign="center">
                    <Text fontSize="6xl" mb={4}>{selectedBadge.icon}</Text>
                    <Heading size="lg" mb={2}>{selectedBadge.name}</Heading>
                    <Text color="gray.600" mb={4}>{selectedBadge.description}</Text>
                    <HStack justify="center" spacing={2}>
                      <Badge colorScheme={getRarityColor(selectedBadge.rarity)} size="lg">
                        {selectedBadge.rarity}
                      </Badge>
                      <Badge colorScheme={selectedBadge.isEarned ? 'green' : 'gray'} size="lg">
                        {selectedBadge.isEarned ? 'Earned' : 'Available'}
                      </Badge>
                    </HStack>
                  </Box>

                  <Divider />

                  <Box>
                    <Heading size="sm" mb={3}>Requirements</Heading>
                    <Box p={3} bg="blue.50" borderRadius="md" border="1px solid" borderColor="blue.200">
                      <Text fontSize="sm" color="blue.700">{selectedBadge.requirements.description}</Text>
                    </Box>
                  </Box>

                  <Box>
                    <Heading size="sm" mb={3}>Reward</Heading>
                    <Box p={3} bg="yellow.50" borderRadius="md" border="1px solid" borderColor="yellow.200">
                      <HStack justify="space-between">
                        <Text fontSize="sm" color="yellow.700">Score Points:</Text>
                        <Text fontWeight="bold" color="yellow.600">+{selectedBadge.reward.score}</Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text fontSize="sm" color="yellow.700">Title:</Text>
                        <Text fontWeight="bold" color="yellow.600">{selectedBadge.reward.title}</Text>
                      </HStack>
                    </Box>
                  </Box>

                  {!selectedBadge.isEarned && (
                    <Box>
                      <Heading size="sm" mb={3}>Progress</Heading>
                      <VStack spacing={2} align="stretch">
                        <HStack justify="space-between">
                          <Text fontSize="sm">Progress:</Text>
                          <Text fontWeight="bold">
                            {selectedBadge.progress} / {selectedBadge.target}
                          </Text>
                        </HStack>
                        <ChakraProgress 
                          value={(selectedBadge.progress / selectedBadge.target) * 100} 
                          colorScheme="blue" 
                          size="lg" 
                          borderRadius="md"
                        />
                      </VStack>
                    </Box>
                  )}
                </VStack>
              )}
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onBadgeModalClose}>
                Close
              </Button>
              {selectedBadge?.isEarned && (
                <Button colorScheme="teal" onClick={() => handleMintBadge(selectedBadge)}>
                  Mint Badge NFT
                </Button>
              )}
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Mint Badge Modal */}
        <Modal isOpen={isMintModalOpen} onClose={onMintModalClose} size="md">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Mint Badge NFT</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              {selectedBadge && (
                <VStack spacing={4} align="stretch">
                  <Box textAlign="center">
                    <Text fontSize="4xl" mb={4}>{selectedBadge.icon}</Text>
                    <Heading size="md" mb={2}>{selectedBadge.name}</Heading>
                    <Text color="gray.600" mb={4}>This badge will be minted as an NFT on the Solana blockchain.</Text>
                  </Box>

                  {mintResult && (
                    <Alert status="success" borderRadius="md">
                      <AlertIcon />
                      <Box>
                        <AlertTitle>Badge Minted Successfully! 🎉</AlertTitle>
                        <AlertDescription>
                          <VStack spacing={2} align="stretch" mt={2}>
                            <HStack justify="space-between">
                              <Text fontSize="sm" color="gray.600">Badge Name:</Text>
                              <Text fontWeight="bold">{mintResult.badgeName}</Text>
                            </HStack>
                            <HStack justify="space-between">
                              <Text fontSize="sm" color="gray.600">NFT Address:</Text>
                              <Code fontSize="sm">{mintResult.nftMintAddress}</Code>
                            </HStack>
                            <HStack justify="space-between">
                              <Text fontSize="sm" color="gray.600">Transaction:</Text>
                              <Link href={mintResult.explorerUrl} isExternal color="blue.500" fontSize="sm">
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
              <Button variant="ghost" mr={3} onClick={onMintModalClose}>
                Close
              </Button>
              <Button
                colorScheme="teal"
                onClick={() => handleMintBadge(selectedBadge)}
                isLoading={isMinting}
                loadingText="Minting..."
                isDisabled={!selectedBadge || isMinting}
              >
                Mint Badge NFT
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </VStack>
    </Box>
  );
};

export default ReputationSystem;
