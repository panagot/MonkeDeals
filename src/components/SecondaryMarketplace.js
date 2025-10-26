import React, { useState, useEffect } from 'react';
import {
  Box, Heading, Text, Button, VStack, HStack, Icon, SimpleGrid, Badge, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, useToast, Input, FormControl, FormLabel, Select, Alert, AlertIcon, AlertTitle, AlertDescription, Code, Link, Spinner, Progress, Stat, StatLabel, StatNumber, StatHelpText, StatArrow, Divider
} from '@chakra-ui/react';
import { TimeIcon, ExternalLinkIcon, CheckCircleIcon, WarningIcon, ArrowUpIcon, ArrowDownIcon } from '@chakra-ui/icons';
import { useSolana } from '../hooks/useSolana';

const SecondaryMarketplace = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [resalePrice, setResalePrice] = useState('');
  const [resaleReason, setResaleReason] = useState('');
  const [listingResult, setListingResult] = useState(null);
  const [purchaseResult, setPurchaseResult] = useState(null);
  const [isListing, setIsListing] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const toast = useToast();
  const { connected, publicKey, listForSale, buyFromSecondary, loading, error } = useSolana();

  // Get purchased deals that can be resold
  const getPurchasedDeals = () => {
    const data = localStorage.getItem('purchasedDeals');
    return data ? JSON.parse(data) : [];
  };

  const getResaleDeals = () => {
    const data = localStorage.getItem('resaleDeals');
    return data ? JSON.parse(data) : [];
  };

  const setResaleDeals = (deals) => {
    localStorage.setItem('resaleDeals', JSON.stringify(deals));
  };

  const purchasedDeals = getPurchasedDeals();
  const resaleDeals = getResaleDeals();

  const handleListForResale = (deal) => {
    setSelectedDeal(deal);
    setResalePrice(deal.discountPrice);
    onOpen();
  };

  const handleConfirmResale = async () => {
    if (!resalePrice || !resaleReason) return;
    
    if (!connected || !publicKey) {
      toast({
        title: 'Wallet Not Connected',
        description: 'Please connect your Solana wallet to list deals for sale.',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    setIsListing(true);
    setListingResult(null);

    try {
      // List NFT for sale on blockchain
      const result = await listForSale(selectedDeal, parseFloat(resalePrice));
      
      if (result.success) {
        setListingResult(result.data);
        
        // Also update localStorage for demo purposes
        const resaleDeal = {
          ...selectedDeal,
          id: `resale-${selectedDeal.id}-${Date.now()}`,
          originalPrice: selectedDeal.discountPrice,
          resalePrice: resalePrice,
          resaleReason: resaleReason,
          listedAt: new Date().toISOString(),
          status: 'For Sale',
          listingId: result.data.listingId,
          transactionSignature: result.data.transactionSignature,
          sellerAddress: result.data.sellerAddress
        };

        const updatedResaleDeals = [...resaleDeals, resaleDeal];
        setResaleDeals(updatedResaleDeals);

        toast({
          title: 'Deal Listed for Resale! 🎉',
          description: `${selectedDeal.dealTitle} has been listed on the blockchain marketplace.`,
          status: 'success',
          duration: 8000,
          isClosable: true,
        });

        // Keep modal open to show listing details
        setTimeout(() => {
          onClose();
        }, 3000);
      } else {
        throw new Error(result.error || 'Failed to list deal for sale');
      }
    } catch (error) {
      toast({
        title: 'Listing Failed',
        description: error.message || 'There was an error listing your deal. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsListing(false);
    }
  };

  const handlePurchaseResale = async (deal) => {
    if (!connected || !publicKey) {
      toast({
        title: 'Wallet Not Connected',
        description: 'Please connect your Solana wallet to purchase deals.',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    setIsPurchasing(true);
    setPurchaseResult(null);

    try {
      // Buy NFT from secondary marketplace on blockchain
      const listingData = {
        nftId: deal.id,
        sellerAddress: deal.sellerAddress || deal.originalOwner,
        salePrice: parseFloat(deal.resalePrice)
      };
      
      const result = await buyFromSecondary(listingData);
      
      if (result.success) {
        setPurchaseResult(result.data);
        
        // Remove from resale marketplace
        const updatedResaleDeals = resaleDeals.filter(d => d.id !== deal.id);
        setResaleDeals(updatedResaleDeals);

        // Add to purchased deals
        const purchasedDeals = getPurchasedDeals();
        const newPurchasedDeal = {
          ...deal,
          id: `purchased-${deal.id}-${Date.now()}`,
          purchaseDate: new Date().toISOString(),
          buyer: 'You',
          purchaseId: result.data.purchaseId,
          transactionSignature: result.data.transactionSignature,
          buyerAddress: result.data.buyerAddress
        };
        localStorage.setItem('purchasedDeals', JSON.stringify([...purchasedDeals, newPurchasedDeal]));

        toast({
          title: 'Deal Purchased Successfully! 🎉',
          description: `You have successfully purchased ${deal.dealTitle} from the blockchain marketplace.`,
          status: 'success',
          duration: 8000,
          isClosable: true,
        });
      } else {
        throw new Error(result.error || 'Failed to purchase deal');
      }
    } catch (error) {
      toast({
        title: 'Purchase Failed',
        description: error.message || 'There was an error purchasing the deal. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsPurchasing(false);
    }
  };

  const getSavings = (originalPrice, resalePrice) => {
    const original = Number(originalPrice.toString().replace(/[^\d.]/g, ''));
    const resale = Number(resalePrice.toString().replace(/[^\d.]/g, ''));
    if (isNaN(original) || isNaN(resale)) return '—';
    return (original - resale).toLocaleString();
  };

  return (
    <Box p={6} bg="white" borderRadius="md" border="1px solid" borderColor="gray.200" boxShadow="md">
      <VStack spacing={6} align="stretch">
        <Box>
          <Heading size="lg" color="gray.800" mb={2}>
            Secondary Marketplace
          </Heading>
          <Text color="gray.600" mb={4}>
            Buy and sell unused deal NFTs on the blockchain. Turn your unused coupons into cash or find great deals from other users.
          </Text>
        </Box>

        {/* Wallet Status */}
        {!connected && (
          <Alert status="warning" borderRadius="md">
            <AlertIcon />
            <AlertTitle>Wallet Not Connected!</AlertTitle>
            <AlertDescription>
              Please connect your Solana wallet to buy and sell deal NFTs.
            </AlertDescription>
          </Alert>
        )}
        
        {connected && (
          <Alert status="success" borderRadius="md">
            <AlertIcon />
            <AlertTitle>Wallet Connected!</AlertTitle>
            <AlertDescription>
              Ready to trade deal NFTs. Wallet: <Code fontSize="sm">{publicKey?.toString().slice(0, 8)}...</Code>
            </AlertDescription>
          </Alert>
        )}

        {/* Listing Result Display */}
        {listingResult && (
          <Alert status="success" borderRadius="md">
            <AlertIcon />
            <Box>
              <AlertTitle>Deal Listed Successfully! 🎉</AlertTitle>
              <AlertDescription>
                <VStack spacing={2} align="stretch" mt={2}>
                  <HStack justify="space-between">
                    <Text fontSize="sm" color="gray.600">Listing ID:</Text>
                    <Code fontSize="sm">{listingResult.listingId}</Code>
                  </HStack>
                  <HStack justify="space-between">
                    <Text fontSize="sm" color="gray.600">Transaction:</Text>
                    <Link href={listingResult.explorerUrl} isExternal color="blue.500" fontSize="sm">
                      View on Explorer <Icon as={ExternalLinkIcon} ml={1} />
                    </Link>
                  </HStack>
                  <HStack justify="space-between">
                    <Text fontSize="sm" color="gray.600">Listed At:</Text>
                    <Text fontSize="sm">{new Date(listingResult.listedAt).toLocaleString()}</Text>
                  </HStack>
                </VStack>
              </AlertDescription>
            </Box>
          </Alert>
        )}

        {/* Purchase Result Display */}
        {purchaseResult && (
          <Alert status="success" borderRadius="md">
            <AlertIcon />
            <Box>
              <AlertTitle>Deal Purchased Successfully! 🎉</AlertTitle>
              <AlertDescription>
                <VStack spacing={2} align="stretch" mt={2}>
                  <HStack justify="space-between">
                    <Text fontSize="sm" color="gray.600">Purchase ID:</Text>
                    <Code fontSize="sm">{purchaseResult.purchaseId}</Code>
                  </HStack>
                  <HStack justify="space-between">
                    <Text fontSize="sm" color="gray.600">Transaction:</Text>
                    <Link href={purchaseResult.explorerUrl} isExternal color="blue.500" fontSize="sm">
                      View on Explorer <Icon as={ExternalLinkIcon} ml={1} />
                    </Link>
                  </HStack>
                  <HStack justify="space-between">
                    <Text fontSize="sm" color="gray.600">Purchased At:</Text>
                    <Text fontSize="sm">{new Date(purchaseResult.purchasedAt).toLocaleString()}</Text>
                  </HStack>
                </VStack>
              </AlertDescription>
            </Box>
          </Alert>
        )}

        {/* My Deals for Resale */}
        {purchasedDeals.length > 0 && (
          <Box>
            <Heading size="md" color="gray.800" mb={4}>
              My Deals Available for Resale ({purchasedDeals.length})
            </Heading>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
              {purchasedDeals.map((deal) => (
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
                    <Heading size="sm" color="gray.800">{deal.dealTitle}</Heading>
                    <Text fontSize="sm" color="gray.600">{deal.merchant}</Text>
                    
                    <HStack justify="space-between">
                      <VStack align="start" spacing={0}>
                        <Text fontSize="xs" color="gray.500">Original Price</Text>
                        <Text fontSize="sm" fontWeight="bold" color="teal.600">
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
                    
                    <HStack justify="space-between">
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
                    
                    <Button
                      size="sm"
                      colorScheme="orange"
                      onClick={() => handleListForResale(deal)}
                      isDisabled={!connected}
                      leftIcon={!connected ? <Icon as={WarningIcon} /> : undefined}
                    >
                      {!connected ? 'Connect Wallet' : 'List for Resale'}
                    </Button>
                  </VStack>
                </Box>
              ))}
            </SimpleGrid>
          </Box>
        )}

        {/* Resale Marketplace */}
        <Box>
          <Heading size="md" color="gray.800" mb={4}>
            Deals for Sale ({resaleDeals.length})
          </Heading>
          {resaleDeals.length === 0 ? (
            <Box textAlign="center" py={8} bg="gray.50" borderRadius="md">
              <Text color="gray.500">No deals available for resale yet.</Text>
              <Text fontSize="sm" color="gray.400" mt={2}>
                List your unused deals to see them here!
              </Text>
            </Box>
          ) : (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
              {resaleDeals.map((deal) => (
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
                    
                    <HStack justify="space-between">
                      <VStack align="start" spacing={0}>
                        <Text fontSize="xs" color="gray.500" textDecoration="line-through">
                          {deal.originalPrice}
                        </Text>
                        <Text fontSize="lg" fontWeight="bold" color="teal.600">
                          {deal.resalePrice}
                        </Text>
                      </VStack>
                      <VStack align="end" spacing={0}>
                        <Text fontSize="xs" color="gray.500">You Save</Text>
                        <Text fontSize="sm" fontWeight="bold" color="green.500">
                          {getSavings(deal.originalPrice, deal.resalePrice)} USDC
                        </Text>
                      </VStack>
                    </HStack>
                    
                    <Badge colorScheme="blue" size="sm" w="fit-content">
                      {deal.resaleReason}
                    </Badge>
                    
                    <Text fontSize="sm" color="gray.600" noOfLines={2}>
                      {deal.description}
                    </Text>
                    
                    <HStack justify="space-between">
                      <HStack spacing={1}>
                        <Icon as={TimeIcon} boxSize={3} color="gray.500" />
                        <Text fontSize="xs" color="gray.500">
                          Expires: {deal.expiryDate}
                        </Text>
                      </HStack>
                      <Text fontSize="xs" color="gray.500">
                        Listed: {new Date(deal.listedAt).toLocaleDateString()}
                      </Text>
                    </HStack>
                    
                    {/* Blockchain Transaction Info */}
                    {deal.transactionSignature && (
                      <Box p={2} bg="blue.50" borderRadius="md" border="1px solid" borderColor="blue.200">
                        <VStack spacing={1} align="stretch">
                          <HStack justify="space-between">
                            <Text fontSize="xs" color="blue.700" fontWeight="bold">Blockchain Listed</Text>
                            <Link href={deal.transactionSignature.includes('http') ? deal.transactionSignature : `https://explorer.solana.com/tx/${deal.transactionSignature}?cluster=devnet`} isExternal color="blue.500" fontSize="xs">
                              View Tx <Icon as={ExternalLinkIcon} ml={1} />
                            </Link>
                          </HStack>
                          {deal.listingId && (
                            <Text fontSize="xs" color="blue.600">
                              Listing ID: <Code fontSize="xs">{deal.listingId}</Code>
                            </Text>
                          )}
                        </VStack>
                      </Box>
                    )}
                    
                    <Button
                      size="sm"
                      colorScheme="teal"
                      onClick={() => handlePurchaseResale(deal)}
                      isLoading={isPurchasing}
                      loadingText="Purchasing..."
                      isDisabled={!connected || isPurchasing}
                      leftIcon={isPurchasing ? <Spinner size="sm" /> : undefined}
                    >
                      {isPurchasing ? 'Purchasing NFT...' : 'Buy Deal NFT'}
                    </Button>
                  </VStack>
                </Box>
              ))}
            </SimpleGrid>
          )}
        </Box>
      </VStack>

      {/* Resale Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>List Deal for Resale</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              {selectedDeal && (
                <Box p={4} bg="gray.50" borderRadius="md" border="1px solid" borderColor="gray.200">
                  <VStack spacing={2} align="stretch">
                    <Heading size="sm" color="gray.800">{selectedDeal.dealTitle}</Heading>
                    <Text fontSize="sm" color="gray.600">{selectedDeal.merchant}</Text>
                    <HStack justify="space-between">
                      <Text fontSize="sm" color="gray.600">Original Price:</Text>
                      <Text fontSize="sm" fontWeight="bold" color="teal.600">
                        {selectedDeal.discountPrice}
                      </Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text fontSize="sm" color="gray.600">Expires:</Text>
                      <Text fontSize="sm">{selectedDeal.expiryDate}</Text>
                    </HStack>
                  </VStack>
                </Box>
              )}
              
              <FormControl>
                <FormLabel>Resale Price</FormLabel>
                <Input
                  value={resalePrice}
                  onChange={(e) => setResalePrice(e.target.value)}
                  placeholder="Enter your asking price"
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Reason for Selling</FormLabel>
                <Select
                  value={resaleReason}
                  onChange={(e) => setResaleReason(e.target.value)}
                  placeholder="Select reason"
                >
                  <option value="Change of plans">Change of plans</option>
                  <option value="Found better deal">Found better deal</option>
                  <option value="Won't be able to use">Won't be able to use</option>
                  <option value="Other">Other</option>
                </Select>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="teal"
              onClick={handleConfirmResale}
              isLoading={isListing || loading}
              loadingText={isListing ? "Listing on Blockchain..." : "Loading..."}
              isDisabled={!resalePrice || !resaleReason || !connected || isListing}
              leftIcon={isListing ? <Spinner size="sm" /> : undefined}
            >
              {isListing ? "Listing Deal NFT..." : "List for Resale"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default SecondaryMarketplace;

