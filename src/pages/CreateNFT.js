import React, { useState } from 'react';
import {
  Box, Heading, Text, FormControl, FormLabel, Input, Button, Stack, Select, Textarea, 
  FormErrorMessage, FormHelperText, Alert, AlertIcon, AlertTitle, AlertDescription, 
  Code, Spinner, VStack, HStack, Image, Link
} from '@chakra-ui/react';
import { CheckCircleIcon, ExternalLinkIcon } from '@chakra-ui/icons';
import { useWallet } from '@solana/wallet-adapter-react';
import { mintDealNFT } from '../utils/solanaClient';
import { useToast } from '@chakra-ui/react';

const CreateNFT = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    merchantName: '',
    originalPrice: '',
    dealPrice: '',
    discount: '',
    category: '',
    expiryDate: '',
    imageFile: null
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  
  const { wallet, connected, publicKey } = useWallet();
  const toast = useToast();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Auto-calculate discount
    if (name === 'originalPrice' || name === 'dealPrice') {
      const original = name === 'originalPrice' ? parseFloat(value) : parseFloat(formData.originalPrice);
      const deal = name === 'dealPrice' ? parseFloat(value) : parseFloat(formData.dealPrice);
      if (original > 0 && deal > 0 && deal < original) {
        const discountPercent = ((original - deal) / original * 100).toFixed(0);
        setFormData(prev => ({ ...prev, discount: discountPercent }));
      }
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, imageFile: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const calculateDiscount = () => {
    const original = parseFloat(formData.originalPrice);
    const deal = parseFloat(formData.dealPrice);
    if (original > 0 && deal > 0 && deal < original) {
      return ((original - deal) / original * 100).toFixed(0);
    }
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!connected || !wallet || !publicKey) {
      toast({
        title: 'Wallet Not Connected',
        description: 'Please connect your Solana wallet to mint NFTs',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      console.log('PublicKey:', publicKey.toString());
      
      const dealData = {
        title: formData.title,
        description: formData.description,
        merchantName: formData.merchantName,
        originalPrice: formData.originalPrice,
        dealPrice: formData.dealPrice,
        discount: formData.discount || calculateDiscount(),
        category: formData.category,
        expiryDate: formData.expiryDate,
        imageUrl: imagePreview || '',
      };

      console.log('Calling mintDealNFT with:', { wallet, publicKey, dealData });
      
      const walletWithPublicKey = { ...wallet, publicKey };
      const mintResult = await mintDealNFT(walletWithPublicKey, dealData);

      if (mintResult.success) {
        setResult(mintResult.data);
        
        // Save to marketplace
        const newDeal = {
          id: mintResult.data.dealId,
          dealTitle: formData.title,
          merchant: formData.merchantName,
          originalPrice: `${formData.originalPrice}`,
          discountPrice: `${formData.dealPrice}`,
          discountPercentage: `${formData.discount || calculateDiscount()}%`,
          expiryDate: formData.expiryDate,
          category: formData.category,
          status: 'Active',
          description: formData.description,
          imageUrl: imagePreview || '',
          nftMintAddress: mintResult.data.mintAddress,
          transactionSignature: mintResult.data.transactionSignature,
          explorerUrl: mintResult.data.explorerUrl,
        };
        
        const marketplaceDeals = JSON.parse(localStorage.getItem('marketplaceDeals') || '[]');
        marketplaceDeals.push(newDeal);
        localStorage.setItem('marketplaceDeals', JSON.stringify(marketplaceDeals));
        
        // Save to mintedDeals for Portfolio Dashboard
        const mintedDeals = JSON.parse(localStorage.getItem('mintedDeals') || '[]');
        mintedDeals.push(newDeal);
        localStorage.setItem('mintedDeals', JSON.stringify(mintedDeals));
        
        toast({
          title: 'NFT Created Successfully!',
          description: 'Your deal NFT has been minted on Solana devnet',
          status: 'success',
          duration: 10000,
          isClosable: true,
        });
      } else {
        throw new Error(mintResult.error || 'Failed to mint NFT');
      }
    } catch (error) {
      console.error('Error minting NFT:', error);
      toast({
        title: 'NFT Minting Failed',
        description: error.message || 'Please try again',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box maxW="4xl" mx="auto" mt={8} p={6}>
      <Heading mb={6} size="xl">Create Test NFT</Heading>

      <Box bg="white" p={6} borderRadius="md" boxShadow="md">
        {result ? (
          <VStack spacing={4} py={8}>
            <CheckCircleIcon boxSize={16} color="green.500" />
            <Heading size="lg" color="green.600">NFT Created Successfully! 🎉</Heading>
            
            <Box p={6} bg="green.50" borderRadius="md" border="2px solid" borderColor="green.200" w="full">
              <VStack spacing={4} align="stretch">
                <Text fontWeight="bold" fontSize="lg" color="green.800">NFT Details:</Text>
                
                <HStack justify="space-between">
                  <Text>Deal ID:</Text>
                  <Code>{result.dealId}</Code>
                </HStack>
                
                <HStack justify="space-between">
                  <Text>Mint Address:</Text>
                  <Code fontSize="sm">{result.mintAddress}</Code>
                </HStack>
                
                <Link href={result.explorerUrl} isExternal color="blue.500" fontWeight="bold" fontSize="lg">
                  <ExternalLinkIcon mr={2} />
                  View Transaction on Solana Explorer
                </Link>
              </VStack>
            </Box>

            <Button
              colorScheme="blue"
              onClick={() => {
                setFormData({
                  title: '',
                  description: '',
                  merchantName: '',
                  originalPrice: '',
                  dealPrice: '',
                  discount: '',
                  category: '',
                  expiryDate: '',
                  imageFile: null
                });
                setImagePreview(null);
                setResult(null);
              }}
            >
              Create Another NFT
            </Button>
          </VStack>
        ) : (
          <form onSubmit={handleSubmit}>
            <Stack spacing={6}>
              {!connected ? (
                <Alert status="warning">
                  <AlertIcon />
                  <AlertTitle>Wallet Not Connected</AlertTitle>
                  <AlertDescription>
                    Please connect your Solana wallet to create NFTs
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert status="success">
                  <AlertIcon />
                  <AlertTitle>Wallet Connected</AlertTitle>
                  <AlertDescription>
                    Ready to mint! Wallet: <Code fontSize="sm">{publicKey?.toString().slice(0, 8)}...</Code>
                  </AlertDescription>
                </Alert>
              )}

              <HStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Title</FormLabel>
                  <Input
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g., 50% Off Pizza"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Merchant Name</FormLabel>
                  <Input
                    name="merchantName"
                    value={formData.merchantName}
                    onChange={handleInputChange}
                    placeholder="e.g., Joe's Pizza"
                  />
                </FormControl>
              </HStack>

              <FormControl isRequired>
                <FormLabel>Description</FormLabel>
                <Textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe the deal..."
                  rows={3}
                />
              </FormControl>

              <HStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Original Price</FormLabel>
                  <Input
                    type="number"
                    name="originalPrice"
                    value={formData.originalPrice}
                    onChange={handleInputChange}
                    placeholder="100"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Deal Price</FormLabel>
                  <Input
                    type="number"
                    name="dealPrice"
                    value={formData.dealPrice}
                    onChange={handleInputChange}
                    placeholder="50"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Discount %</FormLabel>
                  <Input
                    name="discount"
                    value={calculateDiscount()}
                    isReadOnly
                    placeholder="Auto-calculated"
                    bg="gray.50"
                  />
                  <FormHelperText>Automatically calculated</FormHelperText>
                </FormControl>
              </HStack>

              <HStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Category</FormLabel>
                  <Select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    placeholder="Select category"
                  >
                    <option value="Food & Dining">Food & Dining</option>
                    <option value="Shopping">Shopping</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Travel">Travel</option>
                    <option value="Other">Other</option>
                  </Select>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Expiry Date</FormLabel>
                  <Input
                    type="date"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleInputChange}
                  />
                </FormControl>
              </HStack>

              <FormControl>
                <FormLabel>Deal Image</FormLabel>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                />
                <FormHelperText>Upload an image for this deal</FormHelperText>
              </FormControl>

              {imagePreview && (
                <Box>
                  <Image src={imagePreview} alt="Preview" maxH="200px" borderRadius="md" />
                </Box>
              )}

              <Button
                type="submit"
                colorScheme="blue"
                size="lg"
                width="full"
                isLoading={loading}
                loadingText="Minting NFT..."
                isDisabled={!connected || loading}
              >
                Mint NFT
              </Button>
            </Stack>
          </form>
        )}
      </Box>
    </Box>
  );
};

export default CreateNFT;
