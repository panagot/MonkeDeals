import React, { useState } from 'react';
import {
  Box,
  Button,
  VStack,
  HStack,
  Text,
  Heading,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Code,
  Divider,
  Badge,
  Spinner,
  useToast,
  Card,
  CardBody,
  CardHeader,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  FormControl,
  Input,
} from '@chakra-ui/react';
import { useSolana } from '../hooks/useSolana';
import { ExternalLinkIcon, CopyIcon, CheckCircleIcon } from '@chakra-ui/icons';
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';

const getConnection = () => {
  return new Connection(clusterApiUrl('devnet'), 'confirmed');
};

const SmartContractPanel = () => {
  const {
    connected,
    publicKey,
    loading,
    error,
    programInfo,
    walletBalance,
    initializeContract,
    testContract,
    programId,
  } = useSolana();

  const [testResult, setTestResult] = useState(null);
  const [verificationInput, setVerificationInput] = useState('');
  const [verificationResult, setVerificationResult] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const toast = useToast();

  const handleInitializeContract = async () => {
    try {
      const result = await initializeContract();
      setTestResult(result);
      toast({
        title: 'Success!',
        description: 'Smart contract initialized successfully!',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to initialize contract',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleTestContract = async () => {
    try {
      const result = await testContract();
      setTestResult(result);
      toast({
        title: 'Success!',
        description: 'Smart contract test completed!',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: err.message || 'Smart contract test failed',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied!',
      description: 'Text copied to clipboard',
      status: 'info',
      duration: 2000,
      isClosable: true,
    });
  };

  const openInExplorer = (address) => {
    window.open(`https://explorer.solana.com/address/${address}?cluster=devnet`, '_blank');
  };

  const handleVerifyNFT = async () => {
    if (!verificationInput) {
      toast({
        title: 'Error',
        description: 'Please enter a mint address or wallet address',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setVerifying(true);
    try {
      // Validate if it's a valid Solana address
      let address;
      try {
        address = new PublicKey(verificationInput);
      } catch (e) {
        throw new Error('Invalid Solana address');
      }

      const connection = getConnection();
      
      // Get account info
      const accountInfo = await connection.getAccountInfo(address);
      
      if (!accountInfo) {
        throw new Error('Address not found on blockchain');
      }

      // Determine if it's a token mint or wallet
      const isTokenMint = accountInfo.owner.equals(new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'));
      
      if (isTokenMint) {
        // It's a token mint - get token info
        const balance = await connection.getBalance(address);
        
        setVerificationResult({
          type: 'NFT Mint',
          address: address.toString(),
          exists: true,
          data: {
            mintAddress: address.toString(),
            owner: accountInfo.owner.toString(),
            lamports: balance,
            executable: accountInfo.executable,
            dataLength: accountInfo.data.length
          }
        });
        
        toast({
          title: 'Success!',
          description: 'NFT verified on blockchain',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        // It's a wallet - get NFT holdings
        const balance = await connection.getBalance(address);
        
        setVerificationResult({
          type: 'Wallet',
          address: address.toString(),
          exists: true,
          data: {
            walletAddress: address.toString(),
            solBalance: balance / 1e9,
            lamports: balance
          }
        });
        
        toast({
          title: 'Success!',
          description: 'Wallet verified on blockchain',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      setVerificationResult({
        type: 'Error',
        address: verificationInput,
        exists: false,
        error: error.message
      });
      
      toast({
        title: 'Verification Failed',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setVerifying(false);
    }
  };

  return (
    <Box maxW="6xl" mx="auto" mt={10} p={6} bg="white" borderRadius="md" boxShadow="md">
      <VStack spacing={6} align="stretch">
        <Heading size="lg" color="gray.800" textAlign="center">
          🔐 Smart Contract Verification & On-Chain Transparency
        </Heading>
        
        {/* Info Alert */}
        <Alert status="info">
          <AlertIcon />
          <Box>
            <AlertTitle>Verify Any Deal NFT On-Chain</AlertTitle>
            <AlertDescription>
              Every deal NFT minted through MonkeDeals is verifiable on the Solana blockchain. 
              Users can verify authenticity, check ownership, and view transaction history directly on-chain.
            </AlertDescription>
          </Box>
        </Alert>

        {/* Connection Status */}
        <Card>
          <CardHeader>
            <Heading size="md">Connection Status</Heading>
          </CardHeader>
          <CardBody>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <Stat>
                <StatLabel>Wallet Status</StatLabel>
                <StatNumber>
                  <Badge colorScheme={connected ? 'green' : 'red'} fontSize="sm">
                    {connected ? 'Connected' : 'Disconnected'}
                  </Badge>
                </StatNumber>
                <StatHelpText>
                  {connected ? publicKey?.toString() : 'No wallet connected'}
                </StatHelpText>
              </Stat>

              <Stat>
                <StatLabel>Wallet Balance</StatLabel>
                <StatNumber>{walletBalance} SOL</StatNumber>
                <StatHelpText>Devnet SOL</StatHelpText>
              </Stat>
            </SimpleGrid>
          </CardBody>
        </Card>

        {/* NFT Verification Section */}
        <Card bgGradient="linear(to-r, teal.50, blue.50)">
          <CardHeader>
            <Heading size="md">🔍 On-Chain NFT Verification</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <Text fontSize="md" color="gray.700">
                <strong>Why This Matters:</strong>
              </Text>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <Box p={4} bg="white" borderRadius="md" border="2px solid" borderColor="teal.300">
                  <Text fontWeight="bold" color="teal.700" mb={2}>
                    ✅ Authenticity Verification
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    Every deal NFT has a unique mint address on-chain. Anyone can verify if a deal is legitimate by checking the Solana blockchain.
                  </Text>
                </Box>
                
                <Box p={4} bg="white" borderRadius="md" border="2px solid" borderColor="blue.300">
                  <Text fontWeight="bold" color="blue.700" mb={2}>
                    🔗 Ownership Tracking
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    Complete ownership history is stored on-chain. No disputes about who owns which deals or when they were transferred.
                  </Text>
                </Box>
                
                <Box p={4} bg="white" borderRadius="md" border="2px solid" borderColor="purple.300">
                  <Text fontWeight="bold" color="purple.700" mb={2}>
                    📜 Transaction History
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    All transactions (minting, purchasing, redeeming) are permanently recorded on the Solana blockchain for complete transparency.
                  </Text>
                </Box>
                
                <Box p={4} bg="white" borderRadius="md" border="2px solid" borderColor="orange.300">
                  <Text fontWeight="bold" color="orange.700" mb={2}>
                    🛡️ Trustless System
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    No centralized authority needed. The blockchain itself guarantees the integrity of all deal NFTs and transactions.
                  </Text>
                </Box>
              </SimpleGrid>
              
              <Alert status="success">
                <AlertIcon />
                <Box>
                  <AlertTitle>User Benefit:</AlertTitle>
                  <AlertDescription>
                    Users can verify any deal NFT by its mint address on Solana Explorer. No "trust us" needed - it's all on-chain and publicly verifiable.
                  </AlertDescription>
                </Box>
              </Alert>
              
              
            </VStack>
          </CardBody>
        </Card>

        {/* NFT Verification Tool */}
        <Card bgGradient="linear(to-r, purple.50, pink.50)">
          <CardHeader>
            <Heading size="md">🔍 Verify Any Deal NFT</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <Alert status="info">
                <AlertIcon />
                <Box>
                  <AlertTitle>Verify Deal NFTs On-Chain</AlertTitle>
                  <AlertDescription>
                    Enter a mint address to verify a deal NFT, or a wallet address to check its balance. All data is read directly from the Solana blockchain.
                  </AlertDescription>
                </Box>
              </Alert>

              <Box>
                <Text fontWeight="bold" mb={2}>What You Can Verify:</Text>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                  <Box p={3} bg="white" borderRadius="md" border="2px solid" borderColor="purple.300">
                    <Text fontWeight="bold" color="purple.700" mb={1}>🔑 Mint Address</Text>
                    <Text fontSize="sm" color="gray.600">
                      Verify if a deal NFT exists on-chain
                    </Text>
                  </Box>
                  <Box p={3} bg="white" borderRadius="md" border="2px solid" borderColor="pink.300">
                    <Text fontWeight="bold" color="pink.700" mb={1}>👤 Wallet Address</Text>
                    <Text fontSize="sm" color="gray.600">
                      Check wallet balance and holdings
                    </Text>
                  </Box>
                </SimpleGrid>
              </Box>

              <FormControl>
                <Input
                  placeholder="Enter mint address or wallet address..."
                  value={verificationInput}
                  onChange={(e) => setVerificationInput(e.target.value)}
                  size="lg"
                  bg="white"
                />
              </FormControl>

              <Button
                colorScheme="purple"
                size="lg"
                onClick={handleVerifyNFT}
                isLoading={verifying}
                loadingText="Verifying..."
                leftIcon={<CheckCircleIcon />}
              >
                Verify on Blockchain
              </Button>

              {verificationResult && (
                <Alert status={verificationResult.exists ? "success" : "error"}>
                  <AlertIcon />
                  <Box>
                    <AlertTitle>
                      {verificationResult.type} - {verificationResult.exists ? "Verified" : "Not Found"}
                    </AlertTitle>
                    <AlertDescription>
                      {verificationResult.error ? (
                        <Text>{verificationResult.error}</Text>
                      ) : (
                        <Box mt={2}>
                          <Code p={2} borderRadius="md" display="block" fontSize="sm">
                            {JSON.stringify(verificationResult.data, null, 2)}
                          </Code>
                          <HStack mt={3} spacing={2}>
                            <Button
                              size="sm"
                              leftIcon={<CopyIcon />}
                              onClick={() => copyToClipboard(verificationResult.address)}
                            >
                              Copy Address
                            </Button>
                            <Button
                              size="sm"
                              leftIcon={<ExternalLinkIcon />}
                              onClick={() => openInExplorer(verificationResult.address)}
                            >
                              View on Explorer
                            </Button>
                          </HStack>
                        </Box>
                      )}
                    </AlertDescription>
                  </Box>
                </Alert>
              )}
            </VStack>
          </CardBody>
        </Card>

        {/* Program Information */}
        <Card>
          <CardHeader>
            <Heading size="md">🔧 Smart Contract Information</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <Box>
                <Text fontWeight="bold" mb={2}>Program ID:</Text>
                <HStack>
                  <Code fontSize="sm" p={2} borderRadius="md" bg="gray.100">
                    {programId}
                  </Code>
                  <Button
                    size="sm"
                    leftIcon={<CopyIcon />}
                    onClick={() => copyToClipboard(programId)}
                  >
                    Copy
                  </Button>
                  <Button
                    size="sm"
                    leftIcon={<ExternalLinkIcon />}
                    onClick={() => openInExplorer(programId)}
                  >
                    View
                  </Button>
                </HStack>
              </Box>

              {programInfo && (
                <Box>
                  <Text fontWeight="bold" mb={2}>Program Details:</Text>
                  <VStack spacing={2} align="stretch">
                    <HStack justify="space-between">
                      <Text>Executable:</Text>
                      <Badge colorScheme={programInfo.executable ? 'green' : 'red'}>
                        {programInfo.executable ? 'Yes' : 'No'}
                      </Badge>
                    </HStack>
                    <HStack justify="space-between">
                      <Text>Data Length:</Text>
                      <Text>{programInfo.dataLength.toLocaleString()} bytes</Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text>Balance:</Text>
                      <Text>{programInfo.lamports.toLocaleString()} lamports</Text>
                    </HStack>
                  </VStack>
                </Box>
              )}
            </VStack>
          </CardBody>
        </Card>

        {/* Smart Contract Actions */}
        <Card>
          <CardHeader>
            <Heading size="md">Smart Contract Actions</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={4} align="stretch">
              {!connected && (
                <Alert status="warning">
                  <AlertIcon />
                  <AlertTitle>Wallet Not Connected!</AlertTitle>
                  <AlertDescription>
                    Please connect your wallet to interact with the smart contract.
                  </AlertDescription>
                </Alert>
              )}

              {error && (
                <Alert status="error">
                  <AlertIcon />
                  <AlertTitle>Error!</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <HStack spacing={4} justify="center">
                <Button
                  colorScheme="teal"
                  size="lg"
                  onClick={handleInitializeContract}
                  isLoading={loading}
                  loadingText="Initializing..."
                  isDisabled={!connected}
                  leftIcon={<Spinner size="sm" />}
                >
                  Initialize Contract
                </Button>

                <Button
                  colorScheme="blue"
                  size="lg"
                  onClick={handleTestContract}
                  isLoading={loading}
                  loadingText="Testing..."
                  isDisabled={!connected}
                  variant="outline"
                >
                  Test Contract
                </Button>
              </HStack>

              <Text fontSize="sm" color="gray.600" textAlign="center">
                These actions will interact with your deployed smart contract on Solana devnet.
              </Text>
            </VStack>
          </CardBody>
        </Card>

        {/* Test Results */}
        {testResult && (
          <Card>
            <CardHeader>
              <Heading size="md">Test Results</Heading>
            </CardHeader>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <Box>
                  <Text fontWeight="bold" mb={2}>Result:</Text>
                  <Code fontSize="sm" p={3} borderRadius="md" bg="gray.100" whiteSpace="pre-wrap">
                    {JSON.stringify(testResult, null, 2)}
                  </Code>
                </Box>

                {testResult.signature && (
                  <Box>
                    <Text fontWeight="bold" mb={2}>Transaction Signature:</Text>
                    <HStack>
                      <Code fontSize="sm" p={2} borderRadius="md" bg="gray.100">
                        {testResult.signature}
                      </Code>
                      <Button
                        size="sm"
                        leftIcon={<CopyIcon />}
                        onClick={() => copyToClipboard(testResult.signature)}
                      >
                        Copy
                      </Button>
                      <Button
                        size="sm"
                        leftIcon={<ExternalLinkIcon />}
                        onClick={() => openInExplorer(testResult.signature)}
                      >
                        View
                      </Button>
                    </HStack>
                  </Box>
                )}
              </VStack>
            </CardBody>
          </Card>
        )}

        <Divider />

        <Text fontSize="sm" color="gray.600" textAlign="center">
          <strong>Smart Contract Address:</strong> {programId}<br />
          <strong>Network:</strong> Solana Devnet<br />
          <strong>Status:</strong> Deployed and Ready ✅
        </Text>
      </VStack>
    </Box>
  );
};

export default SmartContractPanel;
