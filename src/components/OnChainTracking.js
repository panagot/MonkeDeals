import React, { useState } from 'react';
import {
  Box, Heading, Text, Stack, Button, Badge, HStack, VStack, Icon, useToast, SimpleGrid, Card, CardBody, CardHeader, Code
} from '@chakra-ui/react';
import { ExternalLinkIcon, CheckCircleIcon, TimeIcon, WarningIcon } from '@chakra-ui/icons';

const OnChainTracking = ({ transactions, onTrackTransaction }) => {
  const [trackingAddress, setTrackingAddress] = useState('');
  const toast = useToast();

  const handleTrackTransaction = () => {
    if (trackingAddress) {
      if (onTrackTransaction) {
        onTrackTransaction(trackingAddress);
      }
      toast({
        title: 'Tracking',
        description: 'Transaction tracking started',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const getTransactionStatus = (status) => {
    switch (status) {
      case 'confirmed':
        return { color: 'green', icon: CheckCircleIcon, text: 'Confirmed' };
      case 'pending':
        return { color: 'yellow', icon: TimeIcon, text: 'Pending' };
      case 'failed':
        return { color: 'red', icon: WarningIcon, text: 'Failed' };
      default:
        return { color: 'gray', icon: TimeIcon, text: 'Unknown' };
    }
  };

  return (
    <Box>
      <VStack spacing={6} align="stretch">
        {/* Transaction Tracking */}
        <Card>
          <CardHeader>
            <Heading size="md">Track Transaction</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={4}>
              <HStack spacing={4} w="full">
                <Code p={2} borderRadius="md" flex={1}>
                  {trackingAddress || 'Enter transaction hash...'}
                </Code>
                <Button
                  colorScheme="teal"
                  onClick={handleTrackTransaction}
                  isDisabled={!trackingAddress}
                >
                  Track
                </Button>
              </HStack>
              <Text fontSize="sm" color="gray.600">
                Enter a transaction hash to track its status on the blockchain
              </Text>
            </VStack>
          </CardBody>
        </Card>

        {/* Transaction History */}
        <Card>
          <CardHeader>
            <Heading size="md">Transaction History</Heading>
          </CardHeader>
          <CardBody>
            {(transactions || []).length === 0 ? (
              <Text color="gray.600" textAlign="center" py={8}>
                No transactions found. Start tracking transactions to see their status.
              </Text>
            ) : (
              <VStack spacing={4} align="stretch">
                {(transactions || []).map((tx) => {
                  const statusInfo = getTransactionStatus(tx.status);
                  return (
                    <Box
                      key={tx.id}
                      border="1px solid"
                      borderColor="gray.200"
                      borderRadius="lg"
                      p={4}
                    >
                      <VStack align="stretch" spacing={3}>
                        <HStack justify="space-between">
                          <Text fontWeight="bold">Transaction #{tx.id}</Text>
                          <Badge colorScheme={statusInfo.color}>
                            <Icon as={statusInfo.icon} mr={1} />
                            {statusInfo.text}
                          </Badge>
                        </HStack>
                        <HStack justify="space-between">
                          <Text fontSize="sm" color="gray.600">
                            Hash: {tx.hash.substring(0, 20)}...
                          </Text>
                          <Text fontSize="sm" color="gray.600">
                            Block: {tx.block}
                          </Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text fontSize="sm" color="gray.600">
                            From: {tx.from.substring(0, 20)}...
                          </Text>
                          <Text fontSize="sm" color="gray.600">
                            To: {tx.to.substring(0, 20)}...
                          </Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text fontSize="sm" color="gray.600">
                            Amount: {tx.amount} SOL
                          </Text>
                          <Text fontSize="sm" color="gray.600">
                            Fee: {tx.fee} SOL
                          </Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text fontSize="sm" color="gray.600">
                            Time: {tx.timestamp}
                          </Text>
                          <Button
                            size="sm"
                            variant="outline"
                            leftIcon={<Icon as={ExternalLinkIcon} />}
                            onClick={() => window.open(`https://solscan.io/tx/${tx.hash}`, '_blank')}
                          >
                            View on Solscan
                          </Button>
                        </HStack>
                      </VStack>
                    </Box>
                  );
                })}
              </VStack>
            )}
          </CardBody>
        </Card>

        {/* Blockchain Stats */}
        <Card>
          <CardHeader>
            <Heading size="md">Blockchain Stats</Heading>
          </CardHeader>
          <CardBody>
            <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
              <Box textAlign="center">
                <Text fontSize="2xl" fontWeight="bold" color="teal.600">
                  {(transactions || []).length}
                </Text>
                <Text fontSize="sm" color="gray.600">Total Transactions</Text>
              </Box>
              <Box textAlign="center">
                <Text fontSize="2xl" fontWeight="bold" color="green.600">
                  {(transactions || []).filter(tx => tx.status === 'confirmed').length}
                </Text>
                <Text fontSize="sm" color="gray.600">Confirmed</Text>
              </Box>
              <Box textAlign="center">
                <Text fontSize="2xl" fontWeight="bold" color="yellow.600">
                  {(transactions || []).filter(tx => tx.status === 'pending').length}
                </Text>
                <Text fontSize="sm" color="gray.600">Pending</Text>
              </Box>
              <Box textAlign="center">
                <Text fontSize="2xl" fontWeight="bold" color="red.600">
                  {(transactions || []).filter(tx => tx.status === 'failed').length}
                </Text>
                <Text fontSize="sm" color="gray.600">Failed</Text>
              </Box>
            </SimpleGrid>
          </CardBody>
        </Card>
      </VStack>
    </Box>
  );
};

export default OnChainTracking;
