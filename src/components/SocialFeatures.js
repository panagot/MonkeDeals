import React, { useState } from 'react';
import {
  Box, Heading, Text, Stack, Button, Badge, HStack, VStack, Icon, useToast
} from '@chakra-ui/react';
import { StarIcon, ChatIcon, ExternalLinkIcon, AddIcon } from '@chakra-ui/icons';

const SocialFeatures = ({ deal, onShare, onRate, onComment }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const toast = useToast();

  const handleLike = () => {
    setIsLiked(!isLiked);
    toast({
      title: isLiked ? 'Unliked' : 'Liked',
      description: isLiked ? 'Removed from liked deals' : 'Added to liked deals',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  const handleFavorite = () => {
    setIsFavorited(!isFavorited);
    toast({
      title: isFavorited ? 'Unfavorited' : 'Favorited',
      description: isFavorited ? 'Removed from favorites' : 'Added to favorites',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  const handleShare = () => {
    if (onShare) {
      onShare(deal);
    }
    toast({
      title: 'Shared',
      description: 'Deal shared successfully',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  const handleRate = (rating) => {
    if (onRate) {
      onRate(deal, rating);
    }
    toast({
      title: 'Rated',
      description: `Rated ${rating} stars`,
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  const handleComment = () => {
    if (onComment) {
      onComment(deal);
    }
    toast({
      title: 'Comment',
      description: 'Comment feature coming soon',
      status: 'info',
      duration: 2000,
      isClosable: true,
    });
  };

  return (
    <Box>
      <VStack spacing={4} align="stretch">
        {/* Rating */}
        <Box>
          <Text fontSize="sm" fontWeight="bold" mb={2}>Rate this deal:</Text>
          <HStack spacing={1}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Button
                key={star}
                size="sm"
                variant="ghost"
                p={0}
                onClick={() => handleRate(star)}
              >
                <Icon as={StarIcon} color="yellow.400" />
              </Button>
            ))}
          </HStack>
        </Box>

        {/* Social Actions */}
        <HStack spacing={4} justify="center">
          <Button
            size="sm"
            variant="ghost"
            leftIcon={<Icon as={AddIcon} color={isLiked ? "red.500" : "gray.400"} />}
            onClick={handleLike}
          >
            Like
          </Button>
          <Button
            size="sm"
            variant="ghost"
            leftIcon={<Icon as={StarIcon} color={isFavorited ? "yellow.400" : "gray.400"} />}
            onClick={handleFavorite}
          >
            Favorite
          </Button>
          <Button
            size="sm"
            variant="ghost"
            leftIcon={<Icon as={ChatIcon} color="gray.400" />}
            onClick={handleComment}
          >
            Comment
          </Button>
          <Button
            size="sm"
            variant="ghost"
            leftIcon={<Icon as={ExternalLinkIcon} color="gray.400" />}
            onClick={handleShare}
          >
            Share
          </Button>
        </HStack>

        {/* Deal Stats */}
        <HStack justify="space-between" fontSize="sm" color="gray.600">
          <Text>Views: {deal.views || 0}</Text>
          <Text>Likes: {deal.likes || 0}</Text>
          <Text>Shares: {deal.shares || 0}</Text>
        </HStack>
      </VStack>
    </Box>
  );
};

export default SocialFeatures;
