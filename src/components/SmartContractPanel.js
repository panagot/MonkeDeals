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
} from '@chakra-ui/react';
import { useSolana } from '../hooks/useSolana';
import { ExternalLinkIcon, CopyIcon } from '@chakra-ui/icons';

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

  return (
    <Box maxW="6xl" mx="auto" mt={10} p={6} bg="white" borderRadius="md" boxShadow="md">
      <VStack spacing={6} align="stretch">
        <Heading size="lg" color="gray.800" textAlign="center">
          🚀 Smart Contract Integration Panel
        </Heading>

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

        {/* Program Information */}
        <Card>
          <CardHeader>
            <Heading size="md">Smart Contract Information</Heading>
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
