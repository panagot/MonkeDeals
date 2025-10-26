import React from 'react';
import {
  Box, Text, Badge, VStack, HStack, Icon, Button, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, useToast, Progress, Image
} from '@chakra-ui/react';
import { TimeIcon, ViewIcon, ExternalLinkIcon } from '@chakra-ui/icons';
import { useWallet } from '@solana/wallet-adapter-react';
import GlassCard from './GlassCard';
import GradientButton from './GradientButton';
import QRRedemption from './QRRedemption';
import SocialFeatures from './SocialFeatures';

const DealCard = ({ deal, onPurchase }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { connected } = useWallet();
  const toast = useToast();
  
  // Debug: Log deal data to check image URL
  console.log('DealCard render - deal data:', deal);

  const getSavings = (originalPrice, discountPrice) => {
    const original = Number(originalPrice.toString().replace(/[^\d.]/g, ''));
    const discount = Number(discountPrice.toString().replace(/[^\d.]/g, ''));
    if (isNaN(original) || isNaN(discount)) return '—';
    return (original - discount).toLocaleString();
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

  const daysUntilExpiry = Math.ceil((new Date(deal.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));

  const handlePurchase = () => {
    if (!connected) {
      toast({
        title: 'Wallet Not Connected',
        description: 'Please connect your Solana wallet to purchase deals.',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    onPurchase(deal);
  };

  return (
    <>
      <GlassCard
        p={5}
        borderRadius="lg"
        boxShadow="sm"
        bg="white"
        borderColor="gray.200"
        _hover={{ boxShadow: 'md', bg: 'gray.50', borderColor: 'gray.300' }}
        cursor="pointer"
        onClick={onOpen}
      >
        <VStack spacing={3} align="start">
          {/* Deal Image */}
          {deal.imageUrl ? (
            <Box w="full" h="200px" borderRadius="md" overflow="hidden" bg="gray.100">
              <Image 
                src={deal.imageUrl} 
                alt={deal.dealTitle}
                objectFit="cover"
                w="full"
                h="full"
                onError={(e) => {
                  console.error('Image failed to load:', deal.imageUrl);
                  e.target.style.display = 'none';
                }}
              />
            </Box>
          ) : (
            <Box w="full" h="200px" borderRadius="md" bg="gray.100" display="flex" alignItems="center" justifyContent="center">
              <Text fontSize="sm" color="gray.400">No Image</Text>
            </Box>
          )}
          
          <HStack justify="space-between" w="full">
            <HStack spacing={2}>
              <Icon as={TimeIcon} color="gray.600" />
              <Text fontSize="sm" color="gray.600">Expires: {deal.expiryDate}</Text>
            </HStack>
            <Badge colorScheme={deal.status === 'Active' ? 'green' : 'red'} fontSize="0.8em">
              {deal.status}
            </Badge>
          </HStack>
          
          <Text fontSize="xl" fontWeight="bold" color="gray.800">{deal.dealTitle}</Text>
          <Text fontSize="md" color="gray.600">{deal.merchant}</Text>
          
          <HStack w="full" justify="space-between">
            <VStack align="start" spacing={0}>
              <Text fontSize="sm" color="gray.500" textDecoration="line-through">{deal.originalPrice}</Text>
              <Text fontSize="2xl" fontWeight="extrabold" color="teal.500">{deal.discountPrice}</Text>
            </VStack>
            <VStack align="end" spacing={0}>
              <Text fontSize="sm" color="gray.600">You Save</Text>
              <Text fontSize="lg" fontWeight="bold" color="green.500">
                {getSavings(deal.originalPrice, deal.discountPrice)} USDC
              </Text>
            </VStack>
          </HStack>

          <HStack w="full" justify="space-between">
            <Badge colorScheme={getCategoryColor(deal.category)} size="sm">
              {deal.category}
            </Badge>
            <Badge colorScheme="purple" size="sm">
              {deal.discountPercentage} OFF
            </Badge>
          </HStack>

          <Progress
            value={Math.max(0, Math.min(100, (daysUntilExpiry / 30) * 100))}
            colorScheme={daysUntilExpiry > 7 ? 'green' : daysUntilExpiry > 3 ? 'yellow' : 'red'}
            size="xs"
            borderRadius="full"
            w="full"
          />
          
          <Text fontSize="xs" color="gray.600" noOfLines={2}>
            {deal.description}
          </Text>

          <HStack w="full" justify="space-between">
            <Text fontSize="xs" color="gray.500">
              {deal.redemptionType} • {deal.location}
            </Text>
            <Text fontSize="xs" color="gray.500">
              {deal.maxRedemptions} available
            </Text>
          </HStack>

          <GradientButton
            w="full"
            onClick={(e) => {
              e.stopPropagation();
              onOpen();
            }}
          >
            <Icon as={ViewIcon} mr={2} />
            View Details
          </GradientButton>
        </VStack>
      </GlassCard>

      {/* Detail Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent bg="white" color="gray.800">
          <ModalHeader>{deal.dealTitle} - {deal.merchant}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={6} align="stretch">
              {/* Price and Savings */}
              <Box textAlign="center" p={4} bg="gray.50" borderRadius="lg" border="1px solid" borderColor="gray.200">
                <Text fontSize="sm" color="gray.500" textDecoration="line-through">
                  {deal.originalPrice}
                </Text>
                <Text fontSize="3xl" fontWeight="bold" color="gray.800">
                  {deal.discountPrice}
                </Text>
                <Text color="green.600" fontSize="lg" fontWeight="bold">
                  Save {getSavings(deal.originalPrice, deal.discountPrice)} USDC ({deal.discountPercentage})
                </Text>
              </Box>

              {/* Details Grid */}
              <Box display="grid" gridTemplateColumns="1fr 1fr" gap={4}>
                <Box>
                  <Text fontWeight="bold" color="gray.600">Expiry Date</Text>
                  <Text color="gray.800">{deal.expiryDate}</Text>
                </Box>
                <Box>
                  <Text fontWeight="bold" color="gray.600">Category</Text>
                  <Badge colorScheme={getCategoryColor(deal.category)}>{deal.category}</Badge>
                </Box>
                <Box>
                  <Text fontWeight="bold" color="gray.600">Location</Text>
                  <Text color="gray.800">{deal.location}</Text>
                </Box>
                <Box>
                  <Text fontWeight="bold" color="gray.600">Redemption Type</Text>
                  <Text color="gray.800">{deal.redemptionType}</Text>
                </Box>
                <Box>
                  <Text fontWeight="bold" color="gray.600">Days Until Expiry</Text>
                  <Text color={daysUntilExpiry > 7 ? 'green.600' : daysUntilExpiry > 3 ? 'yellow.600' : 'red.600'}>
                    {daysUntilExpiry} days
                  </Text>
                </Box>
                <Box>
                  <Text fontWeight="bold" color="gray.600">Available Redemptions</Text>
                  <Text color="gray.800">{deal.maxRedemptions}</Text>
                </Box>
              </Box>

              {/* Description */}
              <Box>
                <Text fontWeight="bold" color="gray.600" mb={2}>Description</Text>
                <Text color="gray.800">{deal.description}</Text>
              </Box>

              {/* Merchant Info */}
              <Box>
                <Text fontWeight="bold" color="gray.600" mb={2}>Merchant Information</Text>
                <VStack spacing={2} align="stretch">
                  <HStack>
                    <Text fontWeight="bold" color="gray.600">Website:</Text>
              <Button
                as="a"
                href={deal.merchantWebsite}
                target="_blank"
                size="sm"
                variant="link"
                colorScheme="teal"
                leftIcon={<ExternalLinkIcon />}
              >
                Visit Website
              </Button>
            </HStack>
            <HStack spacing={2} mt={4}>
              <QRRedemption deal={deal} />
                  </HStack>
                  
                  {/* Social Features */}
                  <Box mt={4}>
                    <SocialFeatures deal={deal} />
                  </Box>
                  <Text color="gray.800">
                    <strong>Location:</strong> {deal.location}
                  </Text>
                </VStack>
              </Box>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Close
            </Button>
            <GradientButton onClick={handlePurchase} isDisabled={!connected}>
              Purchase Deal NFT
            </GradientButton>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default DealCard;
