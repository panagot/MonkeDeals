import React, { useState } from 'react';
import {
  Box, Heading, Text, FormControl, FormLabel, Input, Button, Stack, Select, Textarea, FormErrorMessage, FormHelperText, Divider, Tooltip, VStack, Icon, HStack, Badge, Alert, AlertIcon, AlertTitle, AlertDescription, Link, Code, Spinner
} from '@chakra-ui/react';
import { InfoOutlineIcon, CheckCircleIcon, StarIcon, ExternalLinkIcon } from '@chakra-ui/icons';
import { useWallet } from '@solana/wallet-adapter-react';
import { mintDealNFT } from '../utils/solanaClient';

const initialState = {
  dealTitle: '',
  originalPrice: '',
  discountPrice: '',
  discountPercentage: '',
  currency: 'USDC',
  expiryDate: '',
  category: '',
  merchantName: '',
  merchantWebsite: '',
  dealDescription: '',
  terms: '',
  maxRedemptions: '',
  location: '',
  dealImage: null,
  dealImageHash: '',
  dealImageDataUrl: '', // Add data URL for persistent storage
  redemptionType: 'QR',
  merchantId: '',
};

function arrayBufferToHex(buffer) {
  return Array.prototype.map.call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2)).join('');
}

const saveDealToMarketplace = (deal) => {
  const data = localStorage.getItem('marketplaceDeals');
  const deals = data ? JSON.parse(data) : [];
  deals.push(deal);
  localStorage.setItem('marketplaceDeals', JSON.stringify(deals));
};

const CreateDeal = () => {
  const [form, setForm] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [hashing, setHashing] = useState(false);
  const [nftResult, setNftResult] = useState(null);
  const [minting, setMinting] = useState(false);
  
  const { wallet, connected, publicKey } = useWallet();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Update the form with the new value
    setForm((prev) => {
      const updatedForm = { ...prev, [name]: type === 'checkbox' ? checked : value };
      
      // Auto-calculate discount percentage when original price or discount price changes
      if (name === 'originalPrice' || name === 'discountPrice') {
        // First update the changed field, then calculate
        let originalPrice, discountPrice;
        
        if (name === 'originalPrice') {
          originalPrice = parseFloat(value);
          discountPrice = parseFloat(prev.discountPrice);
        } else {
          originalPrice = parseFloat(prev.originalPrice);
          discountPrice = parseFloat(value);
        }
        
        // Only calculate if both values are valid numbers
        if (!isNaN(originalPrice) && !isNaN(discountPrice) && originalPrice > 0 && discountPrice > 0) {
          if (discountPrice <= originalPrice) {
            const discountAmount = originalPrice - discountPrice;
            const discountPercentage = Math.round((discountAmount / originalPrice) * 100);
            updatedForm.discountPercentage = discountPercentage.toString();
            console.log('Auto-calculated:', { originalPrice, discountPrice, discountPercentage });
          } else {
            // Discount price is higher than original - invalid
            updatedForm.discountPercentage = '';
          }
        } else {
          // Clear percentage if values are invalid
          updatedForm.discountPercentage = '';
        }
      }
      
      return updatedForm;
    });
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setHashing(true);
      const arrayBuffer = await file.arrayBuffer();
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', arrayBuffer);
      const hashHex = arrayBufferToHex(hashBuffer);
      
      // Convert file to base64 data URL for persistent storage
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target.result;
        setForm((prev) => ({ 
          ...prev, 
          dealImage: file, 
          dealImageHash: hashHex,
          dealImageDataUrl: dataUrl // Store as base64 data URL
        }));
      };
      reader.readAsDataURL(file);
      
      setHashing(false);
    } else {
      setForm((prev) => ({ 
        ...prev, 
        dealImage: null, 
        dealImageHash: '',
        dealImageDataUrl: ''
      }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!form.dealTitle) newErrors.dealTitle = 'Required';
    if (!form.originalPrice) newErrors.originalPrice = 'Required';
    else if (isNaN(form.originalPrice) || Number(form.originalPrice) < 1) newErrors.originalPrice = 'Must be a number greater than 0';
    if (!form.discountPrice) newErrors.discountPrice = 'Required';
    else if (isNaN(form.discountPrice) || Number(form.discountPrice) < 1) newErrors.discountPrice = 'Must be a number greater than 0';
    if (!form.discountPercentage) newErrors.discountPercentage = 'Required';
    else if (isNaN(form.discountPercentage) || form.discountPercentage < 1 || form.discountPercentage > 99) newErrors.discountPercentage = 'Must be 1-99%';
    if (!form.expiryDate) newErrors.expiryDate = 'Required';
    else if (new Date(form.expiryDate) <= new Date()) newErrors.expiryDate = 'Expiry date must be in the future';
    if (!form.category) newErrors.category = 'Required';
    if (!form.merchantName) newErrors.merchantName = 'Required';
    if (!form.merchantWebsite) newErrors.merchantWebsite = 'Required';
    else if (!/^https?:\/\//.test(form.merchantWebsite)) newErrors.merchantWebsite = 'Must be a valid URL';
    if (!form.dealDescription) newErrors.dealDescription = 'Required';
    if (!form.maxRedemptions) newErrors.maxRedemptions = 'Required';
    else if (isNaN(form.maxRedemptions) || Number(form.maxRedemptions) < 1) newErrors.maxRedemptions = 'Must be at least 1';
    return newErrors;
  };


  const fieldTooltips = {
    dealTitle: 'A catchy title that will attract customers to your deal.',
    originalPrice: 'The regular price before discount.',
    discountPrice: 'The discounted price customers will pay.',
    discountPercentage: 'The percentage discount (automatically calculated).',
    expiryDate: 'When this deal expires and can no longer be redeemed.',
    category: 'The type of deal (food, travel, shopping, etc.).',
    merchantName: 'Your business or store name.',
    merchantWebsite: 'Your website for customer verification.',
    dealDescription: 'Detailed description of what the deal includes.',
    maxRedemptions: 'Maximum number of times this deal can be redeemed.',
    location: 'Where customers can redeem this deal.',
    terms: 'Terms and conditions for this deal.',
    dealImage: 'Upload an image representing your deal.'
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length === 0) {
      if (!connected) {
        setErrors({ general: 'Please connect your wallet to mint NFT' });
        return;
      }
      
      setMinting(true);
      setNftResult(null);
      
      try {
        const dealData = {
          title: form.dealTitle,
          description: form.dealDescription,
          merchantName: form.merchantName,
          originalPrice: form.originalPrice,
          dealPrice: form.discountPrice,
          discount: form.discountPercentage,
          category: form.category,
          expiryDate: form.expiryDate,
          imageUrl: form.dealImage ? URL.createObjectURL(form.dealImage) : '',
          maxRedemptions: form.maxRedemptions,
          location: form.location,
          terms: form.terms,
          redemptionType: form.redemptionType,
          imageHash: form.dealImageHash,
        };
        
        // Pass wallet object with publicKey property attached
        const walletWithPublicKey = { ...wallet, publicKey };
        const result = await mintDealNFT(walletWithPublicKey, dealData);
        
        if (result.success) {
          setNftResult(result.data);
          setSubmitted(true);
          
          // Also save to localStorage for demo purposes
          const newDeal = {
            id: result.data.dealId,
            dealTitle: form.dealTitle,
            merchant: form.merchantName,
            originalPrice: `${form.originalPrice} ${form.currency}`,
            discountPrice: `${form.discountPrice} ${form.currency}`,
            discountPercentage: `${form.discountPercentage}%`,
            expiryDate: form.expiryDate,
            category: form.category,
            status: 'Active',
            description: form.dealDescription,
            maxRedemptions: form.maxRedemptions,
            location: form.location,
            terms: form.terms,
            redemptionType: form.redemptionType,
            dealImageHash: form.dealImageHash,
            imageUrl: form.dealImageDataUrl || '', // Save as persistent data URL
            nftMintAddress: result.data.mintAddress,
            transactionSignature: result.data.transactionSignature,
            explorerUrl: result.data.explorerUrl,
          };
          saveDealToMarketplace(newDeal);
          
          // Also save to mintedDeals for Portfolio Dashboard
          const mintedDeals = JSON.parse(localStorage.getItem('mintedDeals') || '[]');
          mintedDeals.push(newDeal);
          localStorage.setItem('mintedDeals', JSON.stringify(mintedDeals));
          
          // Don't auto-reset - let the user see the success message and transaction details
        } else {
          setErrors({ general: result.error || 'Failed to mint NFT' });
        }
      } catch (err) {
        setErrors({ general: err.message || 'Failed to mint NFT' });
      } finally {
        setMinting(false);
      }
    }
  };

  const handleQuickMint = async () => {
    if (!connected) {
      setErrors({ general: 'Please connect your wallet to mint NFT' });
      return;
    }
    
    setMinting(true);
    setNftResult(null);
    setErrors({});
    
    try {
      const testDealData = {
        title: 'Test NFT Deal - ' + new Date().toLocaleTimeString(),
        description: 'This is a test NFT created for debugging purposes',
        merchantName: 'Test Merchant',
        originalPrice: '100',
        dealPrice: '50',
        discount: '50',
        category: 'Food & Dining',
        expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        imageUrl: '',
      };
      
      // Pass wallet object with publicKey property attached
      const walletWithPublicKey = { ...wallet, publicKey };
      const result = await mintDealNFT(walletWithPublicKey, testDealData);
      
      if (result.success) {
        setNftResult(result.data);
        setSubmitted(true);
        
        console.log('✅ NFT Minted Successfully!');
        console.log('Mint Address:', result.data.mintAddress);
        console.log('Transaction:', result.data.transactionSignature);
        
        // Also save to localStorage
        const newDeal = {
          id: result.data.dealId,
          dealTitle: testDealData.title,
          merchant: testDealData.merchantName,
          originalPrice: `${testDealData.originalPrice} USDC`,
          discountPrice: `${testDealData.dealPrice} USDC`,
          discountPercentage: `${testDealData.discount}%`,
          expiryDate: testDealData.expiryDate,
          category: testDealData.category,
          status: 'Active',
          description: testDealData.description,
          nftMintAddress: result.data.mintAddress,
          transactionSignature: result.data.transactionSignature,
          explorerUrl: result.data.explorerUrl,
        };
        
        // Save to marketplace deals
        const deals = JSON.parse(localStorage.getItem('marketplaceDeals') || '[]');
        deals.push(newDeal);
        localStorage.setItem('marketplaceDeals', JSON.stringify(deals));
        
        // Save to minted deals
        const mintedDeals = JSON.parse(localStorage.getItem('mintedDeals') || '[]');
        mintedDeals.push(newDeal);
        localStorage.setItem('mintedDeals', JSON.stringify(mintedDeals));
      } else {
        setErrors({ general: result.error || 'Failed to mint NFT' });
      }
    } catch (err) {
      console.error('Quick mint error:', err);
      setErrors({ general: err.message || 'Failed to mint NFT' });
    } finally {
      setMinting(false);
    }
  };

  return (
    <Box maxW="6xl" mx="auto" mt={10} p={6} bg="white" borderRadius="md" boxShadow="md">
      <Heading mb={6} color="gray.800" fontSize="2xl" fontWeight="bold">
        Create Deal NFT
      </Heading>

      <Stack direction={{ base: 'column', lg: 'row' }} spacing={8} align="flex-start">
        <Box flex="2" w="full" p={6} bg="gray.50" borderRadius="md" border="1px solid" borderColor="gray.200">
          {submitted ? (
            <VStack spacing={6} py={8}>
              <Icon as={CheckCircleIcon} boxSize={12} color="green.500" />
              <Text color="green.600" fontWeight="bold" fontSize="lg">
                Deal NFT Minted Successfully! 🎉
              </Text>
              <Text color="gray.600" textAlign="center">
                Your deal NFT has been minted on the Solana blockchain and added to the marketplace.
              </Text>
              
              {nftResult && (
                <Box p={4} bg="green.50" borderRadius="md" border="1px solid" borderColor="green.200" w="full">
                  <VStack spacing={3} align="stretch">
                    <Text fontWeight="bold" color="green.800">🎉 NFT Created Successfully!</Text>
                    <HStack justify="space-between">
                      <Text fontSize="sm" color="gray.600">Deal ID:</Text>
                      <Code fontSize="sm">{nftResult.dealId}</Code>
                    </HStack>
                    <HStack justify="space-between">
                      <Text fontSize="sm" color="gray.600">Mint Address:</Text>
                      <Code fontSize="sm">{nftResult.mintAddress}</Code>
                    </HStack>
                    <Link href={nftResult.explorerUrl} isExternal color="blue.500" fontWeight="medium">
                      <Icon as={ExternalLinkIcon} mr={1} />
                      View Transaction on Solana Explorer
                    </Link>
                    <Text fontSize="xs" color="gray.500" mt={2}>
                      Transaction: <Code fontSize="xs">{nftResult.transactionSignature}</Code>
                    </Text>
                  </VStack>
                </Box>
              )}
              <Button
                colorScheme="teal"
                onClick={() => {
                  setForm(initialState);
                  setSubmitted(false);
                  setNftResult(null);
                  setErrors({});
                }}
              >
                Create Another NFT
              </Button>
            </VStack>
          ) : (
            <form onSubmit={handleSubmit}>
              <Stack spacing={6}>
                {/* Quick Mint Button */}
                <Box p={4} bg="yellow.50" borderRadius="md" border="1px solid" borderColor="yellow.200">
                  <VStack spacing={3}>
                    <Text fontWeight="bold" color="yellow.800">⚡ Quick Test NFT Mint</Text>
                    <Text fontSize="sm" color="yellow.700">
                      Click this button to quickly mint a test NFT with predefined data. Useful for debugging.
                    </Text>
                    <Button
                      colorScheme="yellow"
                      size="md"
                      onClick={handleQuickMint}
                      isLoading={minting}
                      loadingText="Minting..."
                      isDisabled={!connected || minting}
                    >
                      {minting ? "Minting..." : "Quick Mint Test NFT"}
                    </Button>
                  </VStack>
                </Box>
                
                <Divider />
                
                {/* Wallet Status */}
                {!connected && (
                  <Alert status="warning" borderRadius="md">
                    <AlertIcon />
                    <AlertTitle>Wallet Not Connected!</AlertTitle>
                    <AlertDescription>
                      Please connect your Solana wallet to mint deal NFTs.
                    </AlertDescription>
                  </Alert>
                )}
                
                {connected && (
                  <Alert status="success" borderRadius="md">
                    <AlertIcon />
                    <AlertTitle>Wallet Connected!</AlertTitle>
                    <AlertDescription>
                      Ready to mint deal NFTs. Wallet: <Code fontSize="sm">{publicKey?.toString().slice(0, 8)}...</Code>
                    </AlertDescription>
                  </Alert>
                )}
                
                {errors.general && (
                  <Alert status="error" borderRadius="md">
                    <AlertIcon />
                    <AlertTitle>Error!</AlertTitle>
                    <AlertDescription>{errors.general}</AlertDescription>
                  </Alert>
                )}
                
                {/* Deal Details */}
                <Box>
                  <Heading size="md" mb={4}>Deal Information</Heading>
                  <Stack spacing={4}>
                    <FormControl isInvalid={errors.dealTitle}>
                      <FormLabel>Deal Title</FormLabel>
                      <Input name="dealTitle" value={form.dealTitle} onChange={handleChange} placeholder="e.g., 50% Off Pizza Night" />
                      <FormHelperText>
                        <Tooltip label={fieldTooltips.dealTitle} placement="right">
                          <InfoOutlineIcon mr={1} />
                        </Tooltip>
                        Eye-catching title for your promotional deal.
                      </FormHelperText>
                      <FormErrorMessage>{errors.dealTitle}</FormErrorMessage>
                    </FormControl>

                    <HStack spacing={4}>
                      <FormControl isInvalid={errors.originalPrice}>
                        <FormLabel>Original Price</FormLabel>
                        <Input type="number" name="originalPrice" value={form.originalPrice} onChange={handleChange} placeholder="100" />
                        <FormHelperText>
                          <Tooltip label={fieldTooltips.originalPrice} placement="right">
                            <InfoOutlineIcon mr={1} />
                          </Tooltip>
                          Regular price before discount.
                        </FormHelperText>
                        <FormErrorMessage>{errors.originalPrice}</FormErrorMessage>
                      </FormControl>
                      <FormControl isInvalid={errors.discountPrice}>
                        <FormLabel>Discount Price</FormLabel>
                        <Input type="number" name="discountPrice" value={form.discountPrice} onChange={handleChange} placeholder="50" />
                        <FormHelperText>
                          <Tooltip label={fieldTooltips.discountPrice} placement="right">
                            <InfoOutlineIcon mr={1} />
                          </Tooltip>
                          Price customers will pay.
                        </FormHelperText>
                        <FormErrorMessage>{errors.discountPrice}</FormErrorMessage>
                      </FormControl>
                    </HStack>

                    <HStack spacing={4}>
                      <FormControl isInvalid={errors.discountPercentage}>
                        <FormLabel>Discount Percentage</FormLabel>
                        <Input 
                          type="number" 
                          name="discountPercentage" 
                          value={form.discountPercentage} 
                          onChange={handleChange} 
                          placeholder="Auto-calculated" 
                          readOnly
                          bg="gray.50"
                          cursor="not-allowed"
                        />
                        <FormHelperText>
                          <Tooltip label={fieldTooltips.discountPercentage} placement="right">
                            <InfoOutlineIcon mr={1} />
                          </Tooltip>
                          Automatically calculated from prices above.
                        </FormHelperText>
                        <FormErrorMessage>{errors.discountPercentage}</FormErrorMessage>
                      </FormControl>
                      <FormControl>
                        <FormLabel>Currency</FormLabel>
                        <Select name="currency" value={form.currency} onChange={handleChange}>
                          <option value="USDC">USDC</option>
                          <option value="SOL">SOL</option>
                          <option value="USD">USD</option>
                        </Select>
                      </FormControl>
                    </HStack>

                    <HStack spacing={4}>
                      <FormControl isInvalid={errors.expiryDate}>
                        <FormLabel>Expiry Date</FormLabel>
                        <Input type="date" name="expiryDate" value={form.expiryDate} onChange={handleChange} />
                        <FormHelperText>
                          <Tooltip label={fieldTooltips.expiryDate} placement="right">
                            <InfoOutlineIcon mr={1} />
                          </Tooltip>
                          When this deal expires.
                        </FormHelperText>
                        <FormErrorMessage>{errors.expiryDate}</FormErrorMessage>
                      </FormControl>
                      <FormControl isInvalid={errors.category}>
                        <FormLabel>Category</FormLabel>
                        <Select name="category" value={form.category} onChange={handleChange}>
                          <option value="">Select Category</option>
                          <option value="Food & Dining">Food & Dining</option>
                          <option value="Travel & Hotels">Travel & Hotels</option>
                          <option value="Shopping">Shopping</option>
                          <option value="Entertainment">Entertainment</option>
                          <option value="Health & Beauty">Health & Beauty</option>
                          <option value="Services">Services</option>
                          <option value="Other">Other</option>
                        </Select>
                        <FormHelperText>
                          <Tooltip label={fieldTooltips.category} placement="right">
                            <InfoOutlineIcon mr={1} />
                          </Tooltip>
                          Type of deal.
                        </FormHelperText>
                        <FormErrorMessage>{errors.category}</FormErrorMessage>
                      </FormControl>
                    </HStack>

                    <FormControl isInvalid={errors.dealDescription}>
                      <FormLabel>Deal Description</FormLabel>
                      <Textarea name="dealDescription" value={form.dealDescription} onChange={handleChange} placeholder="Describe what this deal includes..." />
                      <FormHelperText>
                        <Tooltip label={fieldTooltips.dealDescription} placement="right">
                          <InfoOutlineIcon mr={1} />
                        </Tooltip>
                        Detailed description of your deal.
                      </FormHelperText>
                      <FormErrorMessage>{errors.dealDescription}</FormErrorMessage>
                    </FormControl>

                    <FormControl isInvalid={errors.location}>
                      <FormLabel>Redemption Location</FormLabel>
                      <Input name="location" value={form.location} onChange={handleChange} placeholder="e.g., 123 Main St, City, State" />
                      <FormHelperText>
                        <Tooltip label={fieldTooltips.location} placement="right">
                          <InfoOutlineIcon mr={1} />
                        </Tooltip>
                        Where customers can redeem this deal.
                      </FormHelperText>
                      <FormErrorMessage>{errors.location}</FormErrorMessage>
                    </FormControl>
                  </Stack>
                </Box>

                <Divider />

                {/* Merchant Details */}
                <Box>
                  <Heading size="md" mb={4}>Merchant Information</Heading>
                  <Stack spacing={4}>
                    <FormControl isInvalid={errors.merchantName}>
                      <FormLabel>Merchant Name</FormLabel>
                      <Input name="merchantName" value={form.merchantName} onChange={handleChange} placeholder="e.g., Joe's Pizza" />
                      <FormHelperText>
                        <Tooltip label={fieldTooltips.merchantName} placement="right">
                          <InfoOutlineIcon mr={1} />
                        </Tooltip>
                        Your business or store name.
                      </FormHelperText>
                      <FormErrorMessage>{errors.merchantName}</FormErrorMessage>
                    </FormControl>

                    <FormControl isInvalid={errors.merchantWebsite}>
                      <FormLabel>Merchant Website</FormLabel>
                      <Input name="merchantWebsite" value={form.merchantWebsite} onChange={handleChange} placeholder="https://www.yourbusiness.com" />
                      <FormHelperText>
                        <Tooltip label={fieldTooltips.merchantWebsite} placement="right">
                          <InfoOutlineIcon mr={1} />
                        </Tooltip>
                        Your website for customer verification.
                      </FormHelperText>
                      <FormErrorMessage>{errors.merchantWebsite}</FormErrorMessage>
                    </FormControl>

                    <HStack spacing={4}>
                      <FormControl isInvalid={errors.maxRedemptions}>
                        <FormLabel>Max Redemptions</FormLabel>
                        <Input type="number" name="maxRedemptions" value={form.maxRedemptions} onChange={handleChange} placeholder="100" />
                        <FormHelperText>
                          <Tooltip label={fieldTooltips.maxRedemptions} placement="right">
                            <InfoOutlineIcon mr={1} />
                          </Tooltip>
                          Maximum number of redemptions.
                        </FormHelperText>
                        <FormErrorMessage>{errors.maxRedemptions}</FormErrorMessage>
                      </FormControl>
                      <FormControl>
                        <FormLabel>Redemption Type</FormLabel>
                        <Select name="redemptionType" value={form.redemptionType} onChange={handleChange}>
                          <option value="QR">QR Code</option>
                          <option value="Code">Promo Code</option>
                          <option value="Physical">Physical Card</option>
                        </Select>
                      </FormControl>
                    </HStack>

                    <FormControl>
                      <FormLabel>Terms & Conditions</FormLabel>
                      <Textarea name="terms" value={form.terms} onChange={handleChange} placeholder="Terms and conditions for this deal..." />
                      <FormHelperText>Any special terms or restrictions for this deal.</FormHelperText>
                    </FormControl>

                    <FormControl isInvalid={errors.dealImageHash}>
                      <FormLabel>Deal Image</FormLabel>
                      <Input type="file" name="dealImage" onChange={handleFileChange} p={1} />
                      <FormHelperText>
                        <Tooltip label={fieldTooltips.dealImage} placement="right">
                          <InfoOutlineIcon mr={1} />
                        </Tooltip>
                        Upload an image representing your deal.
                        {hashing && <Text>Processing image...</Text>}
                        {form.dealImageHash && <Text>Image Hash: {form.dealImageHash.substring(0, 10)}...</Text>}
                      </FormHelperText>
                      <FormErrorMessage>{errors.dealImageHash}</FormErrorMessage>
                    </FormControl>
                  </Stack>
                </Box>

                <Button 
                  type="submit" 
                  colorScheme="teal" 
                  size="lg" 
                  w="full" 
                  leftIcon={minting ? <Spinner size="sm" /> : <StarIcon />}
                  isLoading={minting}
                  loadingText="Minting NFT..."
                  isDisabled={!connected || minting}
                >
                  {minting ? "Minting Deal NFT..." : "Create Deal NFT"}
                </Button>
              </Stack>
            </form>
          )}
        </Box>

        {/* Deal Preview Sidebar */}
        <Box flex="1">
          <Box p={6} bg="white" borderRadius="md" border="1px solid" borderColor="gray.200" boxShadow="md">
            <VStack spacing={4} align="stretch">
              <Heading size="md" color="gray.800">Deal Preview</Heading>
              <Box p={4} bg="gray.50" borderRadius="md" border="1px solid" borderColor="gray.200">
                <VStack spacing={3} align="start">
                  <Text fontSize="lg" fontWeight="bold" color="gray.800">
                    {form.dealTitle || "Deal Title"}
                  </Text>
                  <Text color="gray.600">
                    {form.merchantName || "Merchant Name"}
                  </Text>
                  <HStack spacing={2}>
                    <Text color="gray.500" textDecoration="line-through">
                      {form.originalPrice ? `${form.originalPrice} ${form.currency}` : "Original Price"}
                    </Text>
                    <Text color="teal.600" fontWeight="bold">
                      {form.discountPrice ? `${form.discountPrice} ${form.currency}` : "Discount Price"}
                    </Text>
                  </HStack>
                  <Badge colorScheme="green" w="fit-content">
                    {form.discountPercentage ? `${form.discountPercentage}% OFF` : "Discount %"}
                  </Badge>
                  <Text fontSize="sm" color="gray.600">
                    Expires: {form.expiryDate || "Select Date"}
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    Category: {form.category || "Select Category"}
                  </Text>
                </VStack>
              </Box>
              <Text fontSize="sm" color="gray.600" textAlign="center">
                This is how your deal will appear in the marketplace
              </Text>
            </VStack>
          </Box>
        </Box>
      </Stack>
    </Box>
  );
};

export default CreateDeal;
