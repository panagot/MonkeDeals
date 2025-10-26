import React, { useState } from 'react';
import { Box, Heading, Text, Stack, SimpleGrid, Button, Badge, Divider, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, useDisclosure, useToast, Input, Select, Checkbox, Tabs, TabList, TabPanels, Tab, TabPanel, Image, Flex, Skeleton, VStack, Alert, AlertIcon, AlertTitle, AlertDescription, Code, Link, HStack, Icon, Spinner } from '@chakra-ui/react';
import { useWallet } from '@solana/wallet-adapter-react';
import { AnimatePresence } from 'framer-motion';
import { ArrowUpIcon, EditIcon, ExternalLinkIcon } from '@chakra-ui/icons';
import { useSolana } from '../hooks/useSolana';
import DealCard from '../components/DealCard';
import AuctionSystem from '../components/AuctionSystem';
import PortfolioBuilder from '../components/PortfolioBuilder';
import DealAggregator from '../components/DealAggregator';
import SecondaryMarketplace from '../components/SecondaryMarketplace';
import GeoDiscovery from '../components/GeoDiscovery';
import GroupDeals from '../components/GroupDeals';
import ReputationSystem from '../components/ReputationSystem';
import StakingRewards from '../components/StakingRewards';
import OnChainTracking from '../components/OnChainTracking';

const dummyDeals = [
  {
    id: '1',
    dealTitle: '50% Off Pizza Night',
    merchant: "Joe's Pizza",
    originalPrice: '20 USDC',
    discountPrice: '10 USDC',
    discountPercentage: '50%',
    expiryDate: '2025-08-01',
    category: 'Food & Dining',
    status: 'Active',
    description: 'Get 50% off any large pizza order. Valid for dine-in or takeout. Cannot be combined with other offers.',
    location: '123 Main St, Downtown',
    maxRedemptions: 100,
    redemptionType: 'QR',
    merchantWebsite: 'https://joespizza.com',
  },
  {
    id: '2',
    dealTitle: '30% Off Hotel Stay',
    merchant: 'Grand Hotel',
    originalPrice: '200 USDC',
    discountPrice: '140 USDC',
    discountPercentage: '30%',
    expiryDate: '2025-08-15',
    category: 'Travel & Hotels',
    status: 'Active',
    description: 'Get 30% off any standard room booking. Valid for stays up to 7 nights. Blackout dates may apply.',
    location: '456 Resort Blvd, Beach City',
    maxRedemptions: 50,
    redemptionType: 'Code',
    merchantWebsite: 'https://grandhotel.com',
  },
  {
    id: '3',
    dealTitle: 'Buy 2 Get 1 Free Coffee',
    merchant: 'Brew & Bean',
    originalPrice: '15 USDC',
    discountPrice: '10 USDC',
    discountPercentage: '33%',
    expiryDate: '2025-09-01',
    category: 'Food & Dining',
    status: 'Active',
    description: 'Buy any 2 specialty drinks and get the third one free. Valid on all coffee drinks and teas.',
    location: '789 Coffee St, Arts District',
    maxRedemptions: 200,
    redemptionType: 'QR',
    merchantWebsite: 'https://brewandbean.com',
  },
];

function getPurchasedDeals() {
  const data = localStorage.getItem('purchasedDeals');
  return data ? JSON.parse(data) : [];
}

function setPurchasedDeals(deals) {
  localStorage.setItem('purchasedDeals', JSON.stringify(deals));
}

function getMarketplaceDeals() {
  const data = localStorage.getItem('marketplaceDeals');
  return data ? JSON.parse(data) : [];
}

const DealMarketplace = () => {
  const [selectedDeal, setSelectedDeal] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isAuctionOpen, onOpen: onAuctionOpen, onClose: onAuctionClose } = useDisclosure();
  const { isOpen: isPortfolioOpen, onOpen: onPortfolioOpen, onClose: onPortfolioClose } = useDisclosure();
  const [purchased, setPurchased] = useState(getPurchasedDeals());
  const [purchaseResult, setPurchaseResult] = useState(null);
  const [purchasing, setPurchasing] = useState(false);
  const toast = useToast();
  const { publicKey } = useWallet();
  const { connected, mintNFT, loading: solanaLoading, error: solanaError } = useSolana();
  const [search, setSearch] = useState('');
  const [filterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterAvailable, setFilterAvailable] = useState(false);
  const [sortBy, setSortBy] = useState('expiryDate');
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Merge dummy and localStorage deals
  const allDeals = [...getMarketplaceDeals(), ...dummyDeals];
  const purchasedIds = new Set(purchased.map(d => d.id));

  // Unique categories for filter
  const categories = Array.from(new Set(allDeals.map(d => d.category)));

  // Filtering
  let filtered = allDeals.filter(deal => {
    if (tab === 1 && (!publicKey || !purchasedIds.has(deal.id))) return false;
    if (filterStatus !== 'all' && deal.status !== filterStatus) return false;
    if (filterCategory !== 'all' && deal.category !== filterCategory) return false;
    if (filterAvailable && purchasedIds.has(deal.id)) return false;
    if (search && !(
      deal.dealTitle.toLowerCase().includes(search.toLowerCase()) ||
      deal.merchant.toLowerCase().includes(search.toLowerCase()) ||
      deal.category.toLowerCase().includes(search.toLowerCase())
    )) return false;
    return true;
  });

  // Sorting
  filtered = filtered.sort((a, b) => {
    if (sortBy === 'discount') {
      const aDisc = Number(a.discountPercentage.toString().replace(/[^\d.]/g, ''));
      const bDisc = Number(b.discountPercentage.toString().replace(/[^\d.]/g, ''));
      return bDisc - aDisc;
    }
    if (sortBy === 'expiryDate') {
      return new Date(a.expiryDate) - new Date(b.expiryDate);
    }
    if (sortBy === 'price') {
      const aPrice = Number(a.discountPrice.toString().replace(/[^\d.]/g, ''));
      const bPrice = Number(b.discountPrice.toString().replace(/[^\d.]/g, ''));
      return aPrice - bPrice;
    }
    return 0;
  });

  const handleOpen = (deal) => {
    setSelectedDeal(deal);
    onOpen();
  };

  const handlePurchase = async (deal) => {
    if (!connected || !publicKey) {
      setError('Connect your wallet to purchase deals.');
      toast({
        title: 'Wallet Not Connected',
        description: 'Please connect your Solana wallet to purchase deals.',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    setPurchasing(true);
    setPurchaseResult(null);
    setError('');

    try {
      // Create deal data for NFT minting
      const dealData = {
        title: deal.dealTitle,
        description: deal.description || 'Deal purchased from marketplace',
        merchantName: deal.merchant,
        originalPrice: deal.originalPrice?.toString().replace(/[^\d.]/g, '') || '0',
        dealPrice: deal.discountPrice?.toString().replace(/[^\d.]/g, '') || '0',
        discount: deal.discountPercentage?.toString().replace(/[^\d.]/g, '') || '0',
        category: deal.category,
        expiryDate: deal.expiryDate,
        imageUrl: deal.imageUrl || '',
        maxRedemptions: deal.maxRedemptions || '1',
        location: deal.location || '',
        terms: deal.terms || '',
        redemptionType: deal.redemptionType || 'QR',
        imageHash: deal.dealImageHash || '',
      };

      // Mint NFT for the purchased deal
      const result = await mintNFT(dealData);
      
      if (result.success) {
        setPurchaseResult(result.data);
        
        // Add to purchased deals with blockchain data
        const purchasedDeal = {
          ...deal,
          buyer: publicKey.toBase58(),
          purchaseDate: new Date().toISOString(),
          nftMintAddress: result.data.mintAddress,
          transactionSignature: result.data.transactionSignature,
          explorerUrl: result.data.explorerUrl,
          dealId: result.data.dealId,
        };
        
        const updatedPurchased = [...purchased, purchasedDeal];
        setPurchasedDeals(updatedPurchased);
        setPurchased(updatedPurchased);

        toast({
          title: 'Deal NFT Purchased Successfully! 🎉',
          description: `You have successfully purchased and minted the deal NFT: ${deal.dealTitle}.`,
          status: 'success',
          duration: 8000,
          isClosable: true,
        });
        
        // Keep modal open to show purchase details
        setTimeout(() => {
          onClose();
        }, 3000);
      } else {
        throw new Error(result.error || 'Failed to mint deal NFT');
      }
    } catch (err) {
      setError(`Failed to purchase deal: ${err.message}`);
      toast({
        title: 'Purchase Failed',
        description: `There was an error purchasing the deal: ${err.message}`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setPurchasing(false);
    }
  };

  return (
    <Box maxW="7xl" mx="auto" mt={10} p={6} bg="white" borderRadius="md" boxShadow="md">
      <Heading mb={6} color="gray.800" fontSize="2xl" fontWeight="bold">
        Deal Discovery Marketplace
      </Heading>
      
      {/* Wallet Status */}
      {!connected && (
        <Alert status="warning" borderRadius="md" mb={6}>
          <AlertIcon />
          <AlertTitle>Wallet Not Connected!</AlertTitle>
          <AlertDescription>
            Please connect your Solana wallet to purchase deal NFTs.
          </AlertDescription>
        </Alert>
      )}
      
      {connected && (
        <Alert status="success" borderRadius="md" mb={6}>
          <AlertIcon />
          <AlertTitle>Wallet Connected!</AlertTitle>
          <AlertDescription>
            Ready to purchase deal NFTs. Wallet: <Code fontSize="sm">{publicKey?.toString().slice(0, 8)}...</Code>
          </AlertDescription>
        </Alert>
      )}
      
      {error && (
        <Alert status="error" borderRadius="md" mb={6}>
          <AlertIcon />
          <AlertTitle>Error!</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Action Buttons */}
      <Flex gap={4} mb={6} wrap="wrap" align="center">
        <Button
          onClick={onPortfolioOpen}
          colorScheme="teal"
          leftIcon={<ArrowUpIcon />}
        >
          Build Portfolio
        </Button>
        <Button
          onClick={onAuctionOpen}
          colorScheme="blue"
          leftIcon={<EditIcon />}
          variant="outline"
        >
          View Auctions
        </Button>
      </Flex>

      <Tabs index={tab} onChange={setTab} mb={4} variant="enclosed">
        <TabList>
          <Tab>All Deals</Tab>
          <Tab>My Purchases</Tab>
          <Tab>External Deals</Tab>
          <Tab>Resale Market</Tab>
          <Tab>Deals Near Me</Tab>
          <Tab>Group Deals</Tab>
          <Tab>Reputation</Tab>
          <Tab>Staking</Tab>
          <Tab>On-Chain</Tab>
        </TabList>
        <TabPanels>
          <TabPanel px={0}>
            {/* Filters/Search/Sort */}
            <Flex gap={2} mb={4} wrap="wrap" align="center">
              <Input 
                placeholder="Search deals, merchants, or categories" 
                value={search} 
                onChange={e => setSearch(e.target.value)} 
                maxW="250px" 
              />
              <Select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} maxW="160px">
                <option value="all">All Categories</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </Select>
              <Select value={sortBy} onChange={e => setSortBy(e.target.value)} maxW="140px">
                <option value="expiryDate">Sort: Expiry</option>
                <option value="discount">Sort: Discount %</option>
                <option value="price">Sort: Price</option>
              </Select>
              <Checkbox 
                isChecked={filterAvailable} 
                onChange={e => setFilterAvailable(e.target.checked)}
              >
                Show Only Available
              </Checkbox>
            </Flex>

            {error && <Text color="red.500" mb={2}>{error}</Text>}

            {/* Deal Grid */}
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
              {loading ? Array(6).fill(0).map((_, i) => (
                <Skeleton key={i} height="400px" borderRadius="lg" />
              )) : (
                <AnimatePresence>
                  {filtered.map((deal) => (
                    <DealCard
                      key={deal.id}
                      deal={deal}
                      onPurchase={handlePurchase}
                    />
                  ))}
                </AnimatePresence>
              )}
            </SimpleGrid>
          </TabPanel>

          <TabPanel px={0}>
            {/* My Purchases Tab */}
            <SimpleGrid columns={[1, 1, 2]} spacing={6}>
              {purchased.filter(deal => publicKey).map((deal) => (
                <Box 
                  key={deal.id} 
                  p={5} 
                  borderWidth="1px" 
                  borderRadius="lg" 
                  boxShadow="sm" 
                  bg="white" 
                  borderColor="gray.200" 
                  cursor="pointer" 
                  onClick={() => handleOpen(deal)} 
                  _hover={{ boxShadow: 'md', bg: 'gray.50', borderColor: 'gray.300' }}
                >
                  <Stack spacing={2}>
                    <Flex align="center" gap={2}>
                      <Image src="https://placehold.co/40x40/319795/fff?text=DEAL" alt="Deal NFT" borderRadius="md" boxSize="40px" />
                      <Heading size="md">{deal.dealTitle}</Heading>
                    </Flex>
                    <Text><b>Merchant:</b> {deal.merchant}</Text>
                    <Text><b>Original Price:</b> {deal.originalPrice}</Text>
                    <Text><b>Your Price:</b> {deal.discountPrice}</Text>
                    <Text><b>Savings:</b> {deal.discountPercentage}</Text>
                    <Text><b>Expires:</b> {deal.expiryDate}</Text>
                    <Text><b>Location:</b> {deal.location}</Text>
                    <Badge colorScheme="blue" w="fit-content">Purchased</Badge>
                    <Text fontSize="sm" color="gray.600">{deal.description}</Text>
                  </Stack>
                </Box>
              ))}
            </SimpleGrid>
          </TabPanel>
          
          <TabPanel px={0}>
            <DealAggregator />
          </TabPanel>
          
          <TabPanel px={0}>
            <SecondaryMarketplace />
          </TabPanel>

          <TabPanel px={0}>
            <GeoDiscovery />
          </TabPanel>

          <TabPanel px={0}>
            <GroupDeals />
          </TabPanel>

          <TabPanel px={0}>
            <ReputationSystem />
          </TabPanel>

          <TabPanel px={0}>
            <StakingRewards />
          </TabPanel>

          <TabPanel px={0}>
            <OnChainTracking />
          </TabPanel>
        </TabPanels>
      </Tabs>

      <Divider my={6} />
      <Text fontSize="sm" color="gray.700" mt={4}>
        <b>How it works:</b> <br />
        1. Connect your Solana wallet.<br />
        2. Browse and discover amazing deals from local merchants.<br />
        3. Purchase deal NFTs to secure your discounts.<br />
        4. Redeem deals at participating locations or trade them with others.<br />
        5. All transactions are transparent and on-chain.
      </Text>

      {/* Modal for deal details */}
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="xl"
        isCentered
        motionPreset="slideInBottom"
      >
        <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px) hue-rotate(90deg)" />
        <ModalContent borderRadius="lg" overflow="hidden" bg="white" color="gray.800">
          <ModalHeader borderBottom="1px solid" borderColor="gray.200" pb={3}>
            {selectedDeal?.dealTitle} Details
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody p={6}>
            {selectedDeal ? (
              <Stack spacing={4}>
                {/* Purchase Result Display */}
                {purchaseResult && (
                  <Alert status="success" borderRadius="md">
                    <AlertIcon />
                    <Box>
                      <AlertTitle>Deal NFT Purchased Successfully! 🎉</AlertTitle>
                      <AlertDescription>
                        <VStack spacing={2} align="stretch" mt={2}>
                          <HStack justify="space-between">
                            <Text fontSize="sm" color="gray.600">NFT Mint Address:</Text>
                            <Code fontSize="sm">{purchaseResult.mintAddress}</Code>
                          </HStack>
                          <HStack justify="space-between">
                            <Text fontSize="sm" color="gray.600">Transaction:</Text>
                            <Link href={purchaseResult.explorerUrl} isExternal color="blue.500" fontSize="sm">
                              View on Explorer <Icon as={ExternalLinkIcon} ml={1} />
                            </Link>
                          </HStack>
                        </VStack>
                      </AlertDescription>
                    </Box>
                  </Alert>
                )}
                
                <Flex align="center" gap={3}>
                  <Image src="https://placehold.co/50x50/319795/fff?text=DEAL" alt="Deal NFT" borderRadius="md" boxSize="50px" />
                  <VStack align="start" spacing={0}>
                    <Heading size="lg">{selectedDeal.dealTitle}</Heading>
                    <Text fontSize="md" color="gray.600">{selectedDeal.merchant}</Text>
                  </VStack>
                </Flex>
                <Divider />
                <Stack spacing={3}>
                  <Flex justify="space-between">
                    <Text fontWeight="bold" color="gray.600">Original Price</Text>
                    <Text>{selectedDeal.originalPrice}</Text>
                  </Flex>
                  <Flex justify="space-between">
                    <Text fontWeight="bold" color="gray.600">Discount Price</Text>
                    <Text color="teal.600" fontWeight="bold">{selectedDeal.discountPrice}</Text>
                  </Flex>
                  <Flex justify="space-between">
                    <Text fontWeight="bold" color="gray.600">Savings</Text>
                    <Text color="green.600" fontWeight="bold">{selectedDeal.discountPercentage}</Text>
                  </Flex>
                  <Flex justify="space-between">
                    <Text fontWeight="bold" color="gray.600">Expires</Text>
                    <Text>{selectedDeal.expiryDate}</Text>
                  </Flex>
                  <Flex justify="space-between">
                    <Text fontWeight="bold" color="gray.600">Category</Text>
                    <Badge colorScheme="blue">{selectedDeal.category}</Badge>
                  </Flex>
                  <Flex justify="space-between">
                    <Text fontWeight="bold" color="gray.600">Location</Text>
                    <Text>{selectedDeal.location}</Text>
                  </Flex>
                  <Flex justify="space-between">
                    <Text fontWeight="bold" color="gray.600">Redemption Type</Text>
                    <Text>{selectedDeal.redemptionType}</Text>
                  </Flex>
                  <Box>
                    <Text fontWeight="bold" color="gray.600" mb={2}>Description</Text>
                    <Text>{selectedDeal.description}</Text>
                  </Box>
                </Stack>
              </Stack>
            ) : (
              <Text>No deal selected.</Text>
            )}
          </ModalBody>
          <ModalFooter borderTop="1px solid" borderColor="gray.200" pt={3}>
            <Button onClick={onClose} colorScheme="gray" mr={2}>
              Close
            </Button>
            {selectedDeal && !purchasedIds.has(selectedDeal.id) && (
              <Button 
                colorScheme="teal" 
                onClick={() => handlePurchase(selectedDeal)}
                isLoading={purchasing || solanaLoading}
                loadingText={purchasing ? "Minting NFT..." : "Loading..."}
                leftIcon={purchasing ? <Spinner size="sm" /> : undefined}
                isDisabled={!connected || purchasing}
              >
                {purchasing ? "Minting Deal NFT..." : "Purchase Deal NFT"}
              </Button>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Portfolio Builder Modal */}
      <PortfolioBuilder
        isOpen={isPortfolioOpen}
        onClose={onPortfolioClose}
        availableDeals={filtered}
      />

      {/* Auction System Modal */}
      <AuctionSystem
        deal={selectedDeal}
        isOpen={isAuctionOpen}
        onClose={onAuctionClose}
      />
    </Box>
  );
};

export default DealMarketplace;
