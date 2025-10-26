import React, { useState } from 'react';
import {
  Box, Heading, Text, Button, VStack, HStack, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, useDisclosure, useToast, Badge, Icon, Alert, AlertIcon, AlertTitle, AlertDescription, Code, Link, Spinner, Divider
} from '@chakra-ui/react';
import { CheckCircleIcon, CopyIcon, ExternalLinkIcon } from '@chakra-ui/icons';
import { useSolana } from '../hooks/useSolana';

const QRRedemption = ({ deal, onRedeem }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [qrCode, setQRCode] = useState('');
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [redeemed, setRedeemed] = useState(false);
  const [redemptionResult, setRedemptionResult] = useState(null);
  const [qrGenerated, setQrGenerated] = useState(false);
  const toast = useToast();
  const { connected, publicKey, redeemDeal, generateQR, loading, error } = useSolana();

  const generateQRCode = () => {
    if (!deal) return;
    
    try {
      // Generate QR code using blockchain data
      const qrResult = generateQR(deal);
      if (qrResult.success) {
        setQRCode(qrResult.qrData);
        setQrGenerated(true);
        
        toast({
          title: 'QR Code Generated!',
          description: 'Your redemption QR code has been generated with blockchain verification.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        throw new Error(qrResult.error);
      }
    } catch (err) {
      toast({
        title: 'QR Generation Failed',
        description: err.message || 'Failed to generate QR code',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleRedeem = async () => {
    if (!connected || !publicKey) {
      toast({
        title: 'Wallet Not Connected',
        description: 'Please connect your Solana wallet to redeem deals.',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    setIsRedeeming(true);
    setRedemptionResult(null);
    
    try {
      // Redeem deal on blockchain
      const result = await redeemDeal(deal);
      
      if (result.success) {
        setRedemptionResult(result.data);
        setRedeemed(true);
        
        // Update deal status
        if (onRedeem) {
          onRedeem(deal.id);
        }
        
        toast({
          title: 'Deal Redeemed Successfully! 🎉',
          description: `Your ${deal.dealTitle} has been redeemed on the blockchain and is no longer valid.`,
          status: 'success',
          duration: 8000,
          isClosable: true,
        });
        
        // Keep modal open to show redemption details
        setTimeout(() => {
          onClose();
        }, 3000);
      } else {
        throw new Error(result.error || 'Failed to redeem deal');
      }
    } catch (error) {
      toast({
        title: 'Redemption Failed',
        description: error.message || 'There was an error redeeming your deal. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsRedeeming(false);
    }
  };

  const copyQRCode = () => {
    navigator.clipboard.writeText(qrCode);
    toast({
      title: 'QR Code Copied!',
      description: 'QR code data has been copied to clipboard.',
      status: 'info',
      duration: 2000,
      isClosable: true,
    });
  };

  return (
    <>
      <Button
        onClick={onOpen}
        colorScheme="teal"
        size="sm"
        leftIcon={<Icon as={CheckCircleIcon} />}
        isDisabled={redeemed}
      >
        {redeemed ? 'Redeemed' : 'Redeem Deal'}
      </Button>

      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Redeem Deal: {deal?.dealTitle}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={6} align="stretch">
              {/* Wallet Status */}
              {!connected && (
                <Alert status="warning" borderRadius="md">
                  <AlertIcon />
                  <AlertTitle>Wallet Not Connected!</AlertTitle>
                  <AlertDescription>
                    Please connect your Solana wallet to redeem deals.
                  </AlertDescription>
                </Alert>
              )}
              
              {connected && (
                <Alert status="success" borderRadius="md">
                  <AlertIcon />
                  <AlertTitle>Wallet Connected!</AlertTitle>
                  <AlertDescription>
                    Ready to redeem deal NFTs. Wallet: <Code fontSize="sm">{publicKey?.toString().slice(0, 8)}...</Code>
                  </AlertDescription>
                </Alert>
              )}

              {/* Redemption Result Display */}
              {redemptionResult && (
                <Alert status="success" borderRadius="md">
                  <AlertIcon />
                  <Box>
                    <AlertTitle>Deal Redeemed Successfully! 🎉</AlertTitle>
                    <AlertDescription>
                      <VStack spacing={2} align="stretch" mt={2}>
                        <HStack justify="space-between">
                          <Text fontSize="sm" color="gray.600">Redemption ID:</Text>
                          <Code fontSize="sm">{redemptionResult.redemptionId}</Code>
                        </HStack>
                        <HStack justify="space-between">
                          <Text fontSize="sm" color="gray.600">Transaction:</Text>
                          <Link href={redemptionResult.explorerUrl} isExternal color="blue.500" fontSize="sm">
                            View on Explorer <Icon as={ExternalLinkIcon} ml={1} />
                          </Link>
                        </HStack>
                        <HStack justify="space-between">
                          <Text fontSize="sm" color="gray.600">Redeemed At:</Text>
                          <Text fontSize="sm">{new Date(redemptionResult.redeemedAt).toLocaleString()}</Text>
                        </HStack>
                      </VStack>
                    </AlertDescription>
                  </Box>
                </Alert>
              )}

              {!redeemed ? (
                <>
                  {/* Deal Information */}
                  <Box p={4} bg="gray.50" borderRadius="md" border="1px solid" borderColor="gray.200">
                    <VStack spacing={2} align="stretch">
                      <HStack justify="space-between">
                        <Text fontWeight="bold">Merchant:</Text>
                        <Text>{deal?.merchant}</Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text fontWeight="bold">Original Price:</Text>
                        <Text textDecoration="line-through">{deal?.originalPrice}</Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text fontWeight="bold">Your Price:</Text>
                        <Text color="teal.600" fontWeight="bold">{deal?.discountPrice}</Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text fontWeight="bold">Savings:</Text>
                        <Badge colorScheme="green">{deal?.discountPercentage}</Badge>
                      </HStack>
                      <HStack justify="space-between">
                        <Text fontWeight="bold">Expires:</Text>
                        <Text>{deal?.expiryDate}</Text>
                      </HStack>
                      {deal?.nftMintAddress && (
                        <HStack justify="space-between">
                          <Text fontWeight="bold">NFT Address:</Text>
                          <Code fontSize="sm">{deal.nftMintAddress}</Code>
                        </HStack>
                      )}
                    </VStack>
                  </Box>

                  {/* QR Code Generation */}
                  {!qrCode ? (
                    <Box textAlign="center" p={6}>
                      <Icon as={CheckCircleIcon} boxSize={12} color="teal.500" mb={4} />
                      <Text mb={4}>Generate QR Code for Redemption</Text>
                      <Button onClick={generateQRCode} colorScheme="teal">
                        Generate QR Code
                      </Button>
                    </Box>
                  ) : (
                    <Box>
                      <Alert status="info" mb={4}>
                        <AlertIcon />
                        <Box>
                          <AlertTitle>QR Code Generated!</AlertTitle>
                          <AlertDescription>
                            Show this QR code to the merchant for redemption.
                          </AlertDescription>
                        </Box>
                      </Alert>

                      {/* QR Code Display */}
                      <Box p={4} bg="white" borderRadius="md" border="2px dashed" borderColor="teal.300" textAlign="center">
                        <VStack spacing={3}>
                          <Box p={4} bg="black" borderRadius="md" color="white" fontFamily="monospace" fontSize="sm">
                            <Text>QR CODE</Text>
                            <Text fontSize="xs" color="gray.300">DEX{deal?.id}</Text>
                          </Box>
                          <Text fontSize="sm" color="gray.600">
                            Deal ID: {deal?.id}
                          </Text>
                          <Button size="sm" leftIcon={<CopyIcon />} onClick={copyQRCode}>
                            Copy QR Data
                          </Button>
                        </VStack>
                      </Box>

                      {/* Redemption Instructions */}
                      <Box mt={4} p={4} bg="blue.50" borderRadius="md" border="1px solid" borderColor="blue.200">
                        <VStack spacing={2} align="start">
                          <Text fontWeight="bold" color="blue.800">Redemption Instructions:</Text>
                          <Text fontSize="sm" color="blue.700">
                            1. Show the QR code to the merchant
                          </Text>
                          <Text fontSize="sm" color="blue.700">
                            2. Merchant will scan and verify the deal
                          </Text>
                          <Text fontSize="sm" color="blue.700">
                            3. Complete your purchase at the discounted price
                          </Text>
                          <Text fontSize="sm" color="blue.700">
                            4. The deal will be automatically marked as redeemed
                          </Text>
                        </VStack>
                      </Box>
                    </Box>
                  )}
                </>
              ) : (
                <Box textAlign="center" p={6}>
                  <Icon as={CheckCircleIcon} boxSize={12} color="green.500" mb={4} />
                  <Heading size="md" color="green.600" mb={2}>
                    Deal Redeemed Successfully!
                  </Heading>
                  <Text color="gray.600">
                    This deal has been redeemed and is no longer valid.
                  </Text>
                </Box>
              )}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              {redeemed ? 'Close' : 'Cancel'}
            </Button>
            {!redeemed && qrCode && (
              <Button
                colorScheme="teal"
                onClick={handleRedeem}
                isLoading={isRedeeming || loading}
                loadingText={isRedeeming ? "Redeeming on Blockchain..." : "Loading..."}
                leftIcon={isRedeeming ? <Spinner size="sm" /> : undefined}
                isDisabled={!connected || isRedeeming}
              >
                {isRedeeming ? "Redeeming Deal NFT..." : "Redeem Deal NFT"}
              </Button>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default QRRedemption;
