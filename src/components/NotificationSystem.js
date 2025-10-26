import React, { useState, useEffect } from 'react';
import {
  Box, VStack, HStack, Text, IconButton, Badge, Drawer, DrawerOverlay, DrawerContent,
  DrawerHeader, DrawerCloseButton, DrawerBody, useDisclosure, Button, Divider, Avatar
} from '@chakra-ui/react';
import { BellIcon, CheckIcon, CloseIcon } from '@chakra-ui/icons';

const NotificationSystem = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Mock notifications - in real app, these would come from WebSocket or API
  useEffect(() => {
    const mockNotifications = [
      {
        id: 1,
        type: 'success',
        title: 'Deal Redeemed Successfully!',
        message: 'Your 50% Off Pizza Night deal has been redeemed at Joe\'s Pizza',
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        read: false,
        avatar: '🎉'
      },
      {
        id: 2,
        type: 'info',
        title: 'New Deal Available',
        message: 'Amazing 30% off hotel stays at Grand Hotel - Limited time offer!',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        read: false,
        avatar: '🏨'
      },
      {
        id: 3,
        type: 'warning',
        title: 'Deal Expiring Soon',
        message: 'Your Buy 2 Get 1 Free Coffee deal expires in 2 days',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
        read: true,
        avatar: '⏰'
      },
      {
        id: 4,
        type: 'success',
        title: 'Deal Sold!',
        message: 'You sold your 40% Off Electronics deal for 25 USDC profit',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
        read: true,
        avatar: '💸'
      },
      {
        id: 5,
        type: 'info',
        title: 'External Deal Imported',
        message: 'New travel deals from Skyscanner have been added to marketplace',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
        read: false,
        avatar: '✈️'
      }
    ];

    setNotifications(mockNotifications);
    setUnreadCount(mockNotifications.filter(n => !n.read).length);
  }, []);

  // Listen for new minted deals and add notifications
  useEffect(() => {
    const handleStorageChange = () => {
      const mintedDeals = JSON.parse(localStorage.getItem('mintedDeals') || '[]');
      const lastNotificationId = parseInt(localStorage.getItem('lastNotificationId') || '100', 10);
      const lastNotifiedDealId = localStorage.getItem('lastNotifiedDealId') || '';

      // Find the most recent deal that hasn't been notified yet
      const newestDeal = mintedDeals[mintedDeals.length - 1];
      
      if (newestDeal && newestDeal.id !== lastNotifiedDealId) {
        const newNotification = {
          id: lastNotificationId + 1,
          type: 'success',
          title: '🎨 New Deal NFT Minted!',
          message: `Successfully minted "${newestDeal.dealTitle}" deal NFT with ${newestDeal.discountPercentage} discount`,
          timestamp: new Date(),
          read: false,
          avatar: '🎨'
        };

        setNotifications(prev => [newNotification, ...prev]);
        setUnreadCount(prev => prev + 1);
        
        // Update last notified deal ID and notification ID
        localStorage.setItem('lastNotifiedDealId', newestDeal.id);
        localStorage.setItem('lastNotificationId', String(lastNotificationId + 1));
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
  }, []);

  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
    setUnreadCount(0);
  };

  const deleteNotification = (id) => {
    const notification = notifications.find(n => n.id === id);
    if (notification && !notification.read) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'success': return 'green.500';
      case 'warning': return 'yellow.500';
      case 'error': return 'red.500';
      default: return 'blue.500';
    }
  };

  const formatTime = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <>
      <Box position="relative">
        <IconButton
          aria-label="Notifications"
          icon={<BellIcon />}
          size="lg"
          variant="ghost"
          color="white"
          onClick={onOpen}
          _hover={{ bg: 'rgba(255, 255, 255, 0.1)' }}
        />
        {unreadCount > 0 && (
          <Badge
            position="absolute"
            top="-1"
            right="-1"
            bg="red.500"
            color="white"
            borderRadius="full"
            minW="20px"
            h="20px"
            fontSize="xs"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            {unreadCount}
          </Badge>
        )}
      </Box>

      <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="md">
        <DrawerOverlay />
        <DrawerContent bg="gray.800" color="white">
          <DrawerHeader borderBottom="1px solid" borderColor="gray.600">
            <HStack justify="space-between">
              <Text fontSize="xl" fontWeight="bold">Notifications</Text>
              <HStack spacing={2}>
                {unreadCount > 0 && (
                  <Button size="sm" variant="ghost" onClick={markAllAsRead}>
                    Mark all read
                  </Button>
                )}
                <DrawerCloseButton position="relative" />
              </HStack>
            </HStack>
          </DrawerHeader>
          
          <DrawerBody p={0}>
            <VStack spacing={0} align="stretch">
              {notifications.length === 0 ? (
                <Box p={8} textAlign="center">
                  <Text color="gray.400">No notifications yet</Text>
                </Box>
              ) : (
                notifications.map((notification, index) => (
                  <Box key={notification.id}>
                    <HStack
                      p={4}
                      spacing={3}
                      _hover={{ bg: 'gray.700' }}
                      cursor="pointer"
                      opacity={notification.read ? 0.7 : 1}
                    >
                      <Avatar size="sm" bg={getTypeColor(notification.type)}>
                        {notification.avatar}
                      </Avatar>
                      
                      <VStack align="start" spacing={1} flex={1}>
                        <HStack justify="space-between" w="full">
                          <Text fontWeight={notification.read ? 'normal' : 'bold'} fontSize="sm">
                            {notification.title}
                          </Text>
                          <Text fontSize="xs" color="gray.400">
                            {formatTime(notification.timestamp)}
                          </Text>
                        </HStack>
                        <Text fontSize="xs" color="gray.300" noOfLines={2}>
                          {notification.message}
                        </Text>
                      </VStack>
                      
                      <HStack spacing={1}>
                        {!notification.read && (
                          <IconButton
                            size="sm"
                            icon={<CheckIcon />}
                            variant="ghost"
                            onClick={() => markAsRead(notification.id)}
                            aria-label="Mark as read"
                          />
                        )}
                        <IconButton
                          size="sm"
                          icon={<CloseIcon />}
                          variant="ghost"
                          onClick={() => deleteNotification(notification.id)}
                          aria-label="Delete notification"
                        />
                      </HStack>
                    </HStack>
                    {index < notifications.length - 1 && <Divider borderColor="gray.600" />}
                  </Box>
                ))
              )}
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default NotificationSystem;
