import React, { useState, useEffect } from 'react';
import { Box, Heading, Text, Stack, Table, Thead, Tbody, Tr, Th, Td, Badge, Button, Flex, Spacer, Alert, AlertIcon, useToast, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, IconButton, Tooltip, useDisclosure, Avatar, Menu, MenuButton, MenuList, MenuItem, Skeleton, SkeletonText, VStack, HStack, SimpleGrid, Stat, StatLabel, StatNumber, StatHelpText, StatArrow, Icon, Code, Link, Spinner, Progress, Divider } from '@chakra-ui/react';
import { useWallet } from '@solana/wallet-adapter-react';
import { BellIcon, SettingsIcon, StarIcon, ExternalLinkIcon, CheckCircleIcon, WarningIcon, ArrowUpIcon, ArrowDownIcon } from '@chakra-ui/icons';
import { useSolana } from '../hooks/useSolana';
import { AnimatePresence, motion as framerMotion } from 'framer-motion';
const MotionTr = framerMotion(Tr);

const initialDeals = [
  {
    dealId: 'DEAL-001',
    dealTitle: '50% Off Pizza Night',
    merchant: "Joe's Pizza",
    originalPrice: 20,
    discountPrice: 10,
    currency: 'USDC',
    discountPercentage: 50,
    expiryDate: '2025-08-01',
    category: 'Food & Dining',
    status: 'Active',
    totalPurchases: 47,
    totalRevenue: 470,
    location: '123 Main St, Downtown',
    maxRedemptions: 100,
    redemptions: 42,
    rating: 4.8,
    createdAt: '2025-07-15',
  },
  {
    dealId: 'DEAL-002',
    dealTitle: '30% Off Hotel Stay',
    merchant: 'Grand Hotel',
    originalPrice: 200,
    discountPrice: 140,
    currency: 'USDC',
    discountPercentage: 30,
    expiryDate: '2025-08-15',
    category: 'Travel & Hotels',
    status: 'Active',
    totalPurchases: 23,
    totalRevenue: 3220,
    location: '456 Resort Blvd, Beach City',
    maxRedemptions: 50,
    redemptions: 18,
    rating: 4.6,
    createdAt: '2025-07-20',
  },
  {
    dealId: 'DEAL-003',
    dealTitle: 'Buy 2 Get 1 Free Coffee',
    merchant: 'Brew & Bean',
    originalPrice: 15,
    discountPrice: 10,
    currency: 'USDC',
    discountPercentage: 33,
    expiryDate: '2025-09-01',
    category: 'Food & Dining',
    status: 'Expired',
    totalPurchases: 89,
    totalRevenue: 890,
    location: '789 Coffee St, Arts District',
    maxRedemptions: 200,
    redemptions: 89,
    rating: 4.9,
    createdAt: '2025-07-25',
  },
];

function isExpiringSoon(expiryDate) {
  const now = new Date();
  const expiry = new Date(expiryDate);
  const diff = (expiry - now) / (1000 * 60 * 60 * 24); // days
  return diff < 7 && diff > 0;
}

function daysUntilExpiry(expiryDate) {
  const now = new Date();
  const expiry = new Date(expiryDate);
  const diff = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
  return diff;
}

function toCSV(deals) {
  const header = ['Deal ID', 'Title', 'Merchant', 'Original Price', 'Discount Price', 'Discount %', 'Category', 'Status', 'Purchases', 'Revenue', 'Rating'];
  const rows = deals.map(d => [d.dealId, d.dealTitle, d.merchant, d.originalPrice, d.discountPrice, d.discountPercentage, d.category, d.status, d.totalPurchases, d.totalRevenue, d.rating]);
  return [header, ...rows].map(r => r.join(',')).join('\n');
}


const BusinessDashboard = () => {
  const { connected, publicKey } = useWallet();
  const [deals, setDeals] = useState([]);
  const [blockchainDeals, setBlockchainDeals] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [revenue, setRevenue] = useState(null);
  const [statusUpdateResult, setStatusUpdateResult] = useState(null);
  const toast = useToast();
  const [modalDeal, setModalDeal] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'expiringSoon', message: 'Deal DEAL-001 expires in 3 days.' },
    { id: 2, type: 'newPurchase', message: 'New purchase for Deal DEAL-002!' },
    { id: 3, type: 'highRating', message: 'Deal DEAL-003 received a 5-star rating!' },
  ]);
  const [showNotif, setShowNotif] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { getBusinessDeals, getDealAnalytics, updateDealStatus, getBusinessRevenue, loading: blockchainLoading, error: blockchainError } = useSolana();

  // Load blockchain data when wallet connects
  useEffect(() => {
    const loadBlockchainData = async () => {
      if (connected && publicKey) {
        try {
          setLoading(true);
          
          // Load business deals from blockchain
          const dealsResult = await getBusinessDeals(publicKey.toString());
          if (dealsResult.success) {
            setBlockchainDeals(dealsResult.deals);
            setAnalytics(dealsResult.analytics);
          }
          
          // Load revenue data
          const revenueResult = await getBusinessRevenue(publicKey.toString(), '30d');
          if (revenueResult.success) {
            setRevenue(revenueResult.revenue);
          }
          
        } catch (err) {
          console.error('Error loading blockchain data:', err);
          setError('Failed to load blockchain data');
        } finally {
          setLoading(false);
        }
      } else {
        // Fallback to local data when not connected
        setDeals(initialDeals);
      }
    };

    loadBlockchainData();
  }, [connected, publicKey, getBusinessDeals, getBusinessRevenue]);

  // Listen for new minted deals and add notifications
  useEffect(() => {
    const handleStorageChange = () => {
      const mintedDeals = JSON.parse(localStorage.getItem('mintedDeals') || '[]');
      const lastNotifiedDealId = localStorage.getItem('businessDashboard_lastNotifiedDealId') || '';

      // Find the most recent deal that hasn't been notified yet
      const newestDeal = mintedDeals[mintedDeals.length - 1];
      
      if (newestDeal && newestDeal.id !== lastNotifiedDealId && mintedDeals.length > 0) {
        const newNotification = {
          id: Date.now(),
          type: 'newDeal',
          message: `🎨 New deal "${newestDeal.dealTitle}" minted successfully! ${newestDeal.discountPercentage} off.`,
        };

        setNotifications(prev => [newNotification, ...prev]);
        
        // Update last notified deal ID
        localStorage.setItem('businessDashboard_lastNotifiedDealId', newestDeal.id);
        
        // Show toast notification
        toast({
          title: 'New Deal NFT Minted!',
          description: `Your "${newestDeal.dealTitle}" deal has been minted on Solana blockchain`,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      }
    };

    // Check immediately and listen for changes
    handleStorageChange();
    window.addEventListener('storage', handleStorageChange);
    
    // Also check periodically for same-tab changes
    const interval = setInterval(handleStorageChange, 2000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [toast]);

  // Summary stats - use blockchain data if available, otherwise local data
  const displayDeals = blockchainDeals.length > 0 ? blockchainDeals : deals;
  const totalRevenue = analytics?.totalRevenue || deals.reduce((sum, d) => sum + d.totalRevenue, 0);
  const totalDeals = analytics?.totalDeals || deals.length;
  const activeDeals = displayDeals.filter(d => d.status === 'Active').length;
  const totalPurchases = analytics?.totalSold || deals.reduce((sum, d) => sum + d.totalPurchases, 0);
  const averageRating = deals.length > 0 ? (deals.reduce((sum, d) => sum + d.rating, 0) / deals.length).toFixed(1) : 0;

  const handleDealStatusChange = async (dealId, newStatus) => {
    if (!connected || !publicKey) {
      toast({
        title: 'Wallet Not Connected',
        description: 'Please connect your Solana wallet to update deal status.',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);
    setStatusUpdateResult(null);
    
    try {
      // Update deal status on blockchain
      const result = await updateDealStatus(dealId, newStatus);
      
      if (result.success) {
        setStatusUpdateResult(result.data);
        
        // Update local state
        setDeals(prev => prev.map(d => d.dealId === dealId ? { ...d, status: newStatus } : d));
        setBlockchainDeals(prev => prev.map(d => d.id === dealId ? { ...d, status: newStatus } : d));
        
        toast({
          title: 'Deal Status Updated! 🎉',
          description: `Deal status updated to ${newStatus} on the blockchain.`,
          status: 'success',
          duration: 8000,
          isClosable: true,
        });
      } else {
        throw new Error(result.error || 'Failed to update deal status');
      }
    } catch (error) {
      setError(error.message || 'Failed to update deal status');
      toast({
        title: 'Status Update Failed',
        description: error.message || 'There was an error updating the deal status. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    const csv = toCSV(deals);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'deals-analytics.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleRowClick = (deal) => {
    setModalDeal(deal);
    onOpen();
  };

  const handleNotifClick = () => setShowNotif(!showNotif);

  if (!connected) {
    return (
        <Box maxW="2xl" mx="auto" mt={10} p={6} bg="white" borderRadius="md" boxShadow="md">
        <Alert status="info" mb={4}>
          <AlertIcon />
          Please connect your Solana wallet to view your business dashboard.
        </Alert>
      </Box>
    );
  }

  return (
    <Box maxW="100%" mx="auto" mt={10} p={6} bg="white" borderRadius="md" boxShadow="md">
      <Flex align="center" mb={6}>
        <Heading>Business Dashboard</Heading>
        <Spacer />
        <Tooltip label="Notifications">
          <Box position="relative">
            <IconButton icon={<BellIcon />} onClick={handleNotifClick} variant="ghost" colorScheme="teal" aria-label="Notifications" />
            {notifications.length > 0 && (
              <Badge colorScheme="red" position="absolute" top="-1" right="-1" borderRadius="full" fontSize="0.7em">{notifications.length}</Badge>
            )}
            {showNotif && (
              <Box position="absolute" right={0} mt={2} bg="white" boxShadow="md" borderRadius="md" zIndex={20} minW="220px" p={2}>
                <Stack spacing={2}>
                  {notifications.map(n => (
                    <Box key={n.id} fontSize="sm">{n.message}</Box>
                  ))}
                  {notifications.length === 0 && <Text fontSize="sm">No notifications</Text>}
                </Stack>
              </Box>
            )}
          </Box>
        </Tooltip>
        <Menu>
          <MenuButton as={IconButton} icon={<SettingsIcon />} variant="ghost" colorScheme="teal" ml={2} aria-label="Settings" />
          <MenuList>
            <MenuItem icon={<Avatar size="xs" mr={2} />}>Profile / Settings (coming soon)</MenuItem>
          </MenuList>
        </Menu>
        <Text fontSize="sm" color="gray.500" ml={4}>Wallet: {publicKey?.toBase58().slice(0, 4)}...{publicKey?.toBase58().slice(-4)}</Text>
      </Flex>
      
      {/* Business Stats */}
      <SimpleGrid columns={{ base: 2, md: 4 }} spacing={6} mb={8}>
        <Stat>
          <StatLabel>Total Revenue</StatLabel>
          <StatNumber color="teal.600">${totalRevenue.toLocaleString()}</StatNumber>
          <StatHelpText>
            <StatArrow type="increase" />
            From all deals
          </StatHelpText>
        </Stat>
        <Stat>
          <StatLabel>Active Deals</StatLabel>
          <StatNumber color="blue.600">{activeDeals}</StatNumber>
          <StatHelpText>
            Out of {totalDeals} total
          </StatHelpText>
        </Stat>
        <Stat>
          <StatLabel>Total Purchases</StatLabel>
          <StatNumber color="green.600">{totalPurchases}</StatNumber>
          <StatHelpText>
            Across all deals
          </StatHelpText>
        </Stat>
        <Stat>
          <StatLabel>Average Rating</StatLabel>
          <StatNumber color="orange.600">{averageRating} ⭐</StatNumber>
          <StatHelpText>
            Customer satisfaction
          </StatHelpText>
        </Stat>
      </SimpleGrid>
      <Flex mb={4} align="center" gap={2}>
        <Heading size="md">Your Deals</Heading>
        <Spacer />
        <Button colorScheme="teal" size="sm" onClick={handleExportCSV}>Export Analytics</Button>
      </Flex>
      {error && <Text color="red.500" aria-live="assertive" mb={2}>{error}</Text>}
      <Box overflowX="auto">
        {loading ? (
          <Skeleton height="320px" borderRadius="md" />
        ) : (
          <Table variant="simple" size="md">
            <Thead>
              <Tr>
                <Th>Deal ID</Th>
                <Th>Deal Title</Th>
                <Th>Category</Th>
                <Th>Original Price</Th>
                <Th>Discount Price</Th>
                <Th>Discount %</Th>
                <Th>Purchases</Th>
                <Th>Revenue</Th>
                <Th>Rating</Th>
                <Th>Expiry</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              <AnimatePresence>
                {deals.filter(Boolean).map((deal) => {
                  if (!deal || !deal.dealId) return null;
                  const expiringSoon = isExpiringSoon(deal.expiryDate);
                  const days = daysUntilExpiry(deal.expiryDate);
                  let expiryColor = 'green';
                  if (days <= 7 && days > 0) expiryColor = 'orange';
                  if (days <= 0) expiryColor = 'red';
                  return (
                    <MotionTr
                      key={deal.dealId}
                      bg={expiringSoon ? 'orange.50' : undefined}
                      cursor="pointer"
                      onClick={e => { if (e.target.tagName !== 'BUTTON') handleRowClick(deal); }}
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.15 }}
                      aria-label={`View details for deal ${deal.dealId}`}
                    >
                      <Td>{deal.dealId}</Td>
                      <Td>
                        <VStack align="start" spacing={0}>
                          <Text fontWeight="bold" fontSize="sm">{deal.dealTitle}</Text>
                          <Text fontSize="xs" color="gray.500">{deal.merchant}</Text>
                        </VStack>
                      </Td>
                      <Td>
                        <Badge colorScheme="blue" size="sm">{deal.category}</Badge>
                      </Td>
                      <Td>${deal.originalPrice}</Td>
                      <Td>${deal.discountPrice}</Td>
                      <Td>
                        <Badge colorScheme="green" size="sm">{deal.discountPercentage}% OFF</Badge>
                      </Td>
                      <Td>{deal.totalPurchases}</Td>
                      <Td>${deal.totalRevenue}</Td>
                      <Td>
                        <HStack spacing={1}>
                          <Icon as={StarIcon} color="yellow.400" boxSize={3} />
                          <Text fontSize="sm">{deal.rating}</Text>
                        </HStack>
                      </Td>
                      <Td>
                        <Tooltip label="Days until expiry" fontSize="sm">
                          <Badge colorScheme={expiryColor}>{days > 0 ? `${days} days` : 'Expired'}</Badge>
                        </Tooltip>
                      </Td>
                      <Td>
                        <Badge colorScheme={deal.status === 'Active' ? 'green' : deal.status === 'Expired' ? 'red' : 'yellow'}>{deal.status}</Badge>
                      </Td>
                      <Td>
                        <Flex justify="flex-end" gap={2}>
                          {deal.status === 'Active' && (
                            <Button colorScheme="red" size="sm" onClick={e => { e.stopPropagation(); handleDealStatusChange(deal.dealId, 'Expired'); }}>Expire Deal</Button>
                          )}
                          {deal.status === 'Expired' && (
                            <Button colorScheme="green" size="sm" onClick={e => { e.stopPropagation(); handleDealStatusChange(deal.dealId, 'Active'); }}>Reactivate</Button>
                          )}
                        </Flex>
                      </Td>
                    </MotionTr>
                  );
                })}
              </AnimatePresence>
            </Tbody>
          </Table>
        )}
      </Box>
      {/* Deal Details Modal */}
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="lg"
        isCentered
        motionPreset="scale"
        aria-label="Deal details modal"
      >
        <ModalOverlay />
        <ModalContent>
          {loading ? (
            <SkeletonText mt="4" noOfLines={8} spacing="4" />
          ) : (
            modalDeal && (
              <Box>
                <ModalHeader>
                  <VStack align="start" spacing={1}>
                    <Text fontSize="lg" fontWeight="bold">{modalDeal.dealTitle}</Text>
                    <Text fontSize="sm" color="gray.600">{modalDeal.merchant}</Text>
                  </VStack>
                </ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                  <VStack spacing={4} align="stretch">
                    <SimpleGrid columns={2} spacing={4}>
                      <Box>
                        <Text fontSize="sm" fontWeight="bold" color="gray.600">Deal ID</Text>
                        <Text>{modalDeal.dealId}</Text>
                      </Box>
                      <Box>
                        <Text fontSize="sm" fontWeight="bold" color="gray.600">Category</Text>
                        <Badge colorScheme="blue">{modalDeal.category}</Badge>
                      </Box>
                      <Box>
                        <Text fontSize="sm" fontWeight="bold" color="gray.600">Original Price</Text>
                        <Text>${modalDeal.originalPrice}</Text>
                      </Box>
                      <Box>
                        <Text fontSize="sm" fontWeight="bold" color="gray.600">Discount Price</Text>
                        <Text color="green.600" fontWeight="bold">${modalDeal.discountPrice}</Text>
                      </Box>
                      <Box>
                        <Text fontSize="sm" fontWeight="bold" color="gray.600">Discount Percentage</Text>
                        <Badge colorScheme="green">{modalDeal.discountPercentage}% OFF</Badge>
                      </Box>
                      <Box>
                        <Text fontSize="sm" fontWeight="bold" color="gray.600">Total Purchases</Text>
                        <Text>{modalDeal.totalPurchases}</Text>
                      </Box>
                      <Box>
                        <Text fontSize="sm" fontWeight="bold" color="gray.600">Total Revenue</Text>
                        <Text color="teal.600" fontWeight="bold">${modalDeal.totalRevenue}</Text>
                      </Box>
                      <Box>
                        <Text fontSize="sm" fontWeight="bold" color="gray.600">Rating</Text>
                        <HStack spacing={1}>
                          <Icon as={StarIcon} color="yellow.400" boxSize={4} />
                          <Text fontWeight="bold">{modalDeal.rating}</Text>
                        </HStack>
                      </Box>
                      <Box>
                        <Text fontSize="sm" fontWeight="bold" color="gray.600">Expiry Date</Text>
                        <Text>{modalDeal.expiryDate}</Text>
                      </Box>
                      <Box>
                        <Text fontSize="sm" fontWeight="bold" color="gray.600">Status</Text>
                        <Badge colorScheme={modalDeal.status === 'Active' ? 'green' : 'red'}>{modalDeal.status}</Badge>
                      </Box>
                      <Box>
                        <Text fontSize="sm" fontWeight="bold" color="gray.600">Location</Text>
                        <Text fontSize="sm">{modalDeal.location}</Text>
                      </Box>
                      <Box>
                        <Text fontSize="sm" fontWeight="bold" color="gray.600">Redemptions</Text>
                        <Text>{modalDeal.redemptions}/{modalDeal.maxRedemptions}</Text>
                      </Box>
                    </SimpleGrid>
                    
                    <Box>
                      <Text fontSize="sm" fontWeight="bold" color="gray.600" mb={2}>Performance Metrics</Text>
                      <SimpleGrid columns={3} spacing={4}>
                        <Box textAlign="center" p={3} bg="blue.50" borderRadius="md">
                          <Text fontSize="2xl" fontWeight="bold" color="blue.600">{modalDeal.totalPurchases}</Text>
                          <Text fontSize="sm" color="blue.600">Total Purchases</Text>
                        </Box>
                        <Box textAlign="center" p={3} bg="green.50" borderRadius="md">
                          <Text fontSize="2xl" fontWeight="bold" color="green.600">${modalDeal.totalRevenue}</Text>
                          <Text fontSize="sm" color="green.600">Total Revenue</Text>
                        </Box>
                        <Box textAlign="center" p={3} bg="orange.50" borderRadius="md">
                          <Text fontSize="2xl" fontWeight="bold" color="orange.600">{modalDeal.rating}⭐</Text>
                          <Text fontSize="sm" color="orange.600">Average Rating</Text>
                        </Box>
                      </SimpleGrid>
                    </Box>
                  </VStack>
                </ModalBody>
                <ModalFooter>
                  <Button variant="ghost" mr={3} onClick={onClose}>
                    Close
                  </Button>
                  {modalDeal.status === 'Active' && (
                    <Button colorScheme="red" onClick={() => handleDealStatusChange(modalDeal.dealId, 'Expired')}>
                      Expire Deal
                    </Button>
                  )}
                  {modalDeal.status === 'Expired' && (
                    <Button colorScheme="green" onClick={() => handleDealStatusChange(modalDeal.dealId, 'Active')}>
                      Reactivate Deal
                    </Button>
                  )}
                </ModalFooter>
              </Box>
            )
          )}
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default BusinessDashboard; 