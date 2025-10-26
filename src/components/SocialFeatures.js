import React, { useState, useEffect } from 'react';
import {
  Box, Heading, Text, Stack, Button, Badge, HStack, VStack, Icon, useToast, Textarea, Input,
  Divider, Avatar, Code, ScrollArea
} from '@chakra-ui/react';
import { StarIcon, ChatIcon, ExternalLinkIcon, EditIcon, DeleteIcon } from '@chakra-ui/icons';

const SocialFeatures = ({ deal }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [rating, setRating] = useState(0);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userAddress, setUserAddress] = useState('Anonymous');
  const toast = useToast();

  // Load comments and ratings from localStorage
  useEffect(() => {
    const storedComments = localStorage.getItem(`deal_comments_${deal.id}`);
    const storedRating = localStorage.getItem(`deal_rating_${deal.id}`);
    const storedLiked = localStorage.getItem(`deal_liked_${deal.id}`);
    const storedFavorite = localStorage.getItem(`deal_favorite_${deal.id}`);

    if (storedComments) {
      setComments(JSON.parse(storedComments));
    }
    if (storedRating) {
      setRating(parseInt(storedRating));
    }
    if (storedLiked) {
      setIsLiked(storedLiked === 'true');
    }
    if (storedFavorite) {
      setIsFavorited(storedFavorite === 'true');
    }
  }, [deal.id]);

  const handleLike = () => {
    setIsLiked(!isLiked);
    localStorage.setItem(`deal_liked_${deal.id}`, (!isLiked).toString());
    toast({
      title: !isLiked ? 'Liked!' : 'Unliked',
      description: !isLiked ? 'Added to your liked deals' : 'Removed from liked deals',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  const handleFavorite = () => {
    setIsFavorited(!isFavorited);
    localStorage.setItem(`deal_favorite_${deal.id}`, (!isFavorited).toString());
    toast({
      title: !isFavorited ? 'Favorited!' : 'Unfavorited',
      description: !isFavorited ? 'Added to favorites' : 'Removed from favorites',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  const handleShare = () => {
    const shareData = {
      title: deal.dealTitle,
      text: `Check out this amazing deal: ${deal.dealTitle} - Save ${deal.discountPercentage}!`,
      url: window.location.href
    };
    
    if (navigator.share) {
      navigator.share(shareData);
    } else {
      navigator.clipboard.writeText(shareData.url);
      toast({
        title: 'Link Copied!',
        description: 'Deal link copied to clipboard',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    }
  };

  const handleRate = (stars) => {
    setRating(stars);
    localStorage.setItem(`deal_rating_${deal.id}`, stars.toString());
    toast({
      title: 'Rating Submitted!',
      description: `You rated this deal ${stars} out of 5 stars`,
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) {
      toast({
        title: 'Empty Comment',
        description: 'Please enter a comment',
        status: 'warning',
        duration: 2000,
        isClosable: true,
      });
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const comment = {
      id: Date.now().toString(),
      text: newComment.trim(),
      author: userAddress,
      timestamp: new Date().toISOString(),
      rating: rating || 0
    };

    const updatedComments = [comment, ...comments];
    setComments(updatedComments);
    localStorage.setItem(`deal_comments_${deal.id}`, JSON.stringify(updatedComments));
    setNewComment('');
    setIsSubmitting(false);

    toast({
      title: 'Comment Added!',
      description: 'Your comment has been posted',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  const handleDeleteComment = (commentId) => {
    const updatedComments = comments.filter(c => c.id !== commentId);
    setComments(updatedComments);
    localStorage.setItem(`deal_comments_${deal.id}`, JSON.stringify(updatedComments));
    
    toast({
      title: 'Comment Deleted',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInSeconds = Math.floor((now - time) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const averageRating = comments.length > 0
    ? (comments.reduce((sum, c) => sum + c.rating, 0) / comments.length).toFixed(1)
    : rating > 0 ? rating.toFixed(1) : '0.0';

  return (
    <Box>
      <VStack spacing={4} align="stretch">
        {/* Rating Section */}
        <Box p={4} bg="gray.50" borderRadius="lg" border="1px solid" borderColor="gray.200">
          <Text fontSize="sm" fontWeight="bold" mb={2}>Rate this deal:</Text>
          <HStack spacing={1} mb={2}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Button
                key={star}
                size="md"
                variant="ghost"
                p={0}
                onClick={() => handleRate(star)}
                _hover={{ transform: 'scale(1.2)' }}
              >
                <Icon 
                  as={StarIcon} 
                  color={star <= rating ? "yellow.400" : "gray.300"} 
                  boxSize={6}
                />
              </Button>
            ))}
          </HStack>
          <Text fontSize="sm" color="gray.600">
            Average Rating: <strong>{averageRating}/5</strong> ({comments.length} reviews)
          </Text>
        </Box>

        {/* Social Actions */}
        <HStack spacing={4} justify="center">
          <Button
            size="sm"
            variant={isLiked ? "solid" : "outline"}
            colorScheme={isLiked ? "red" : "gray"}
            leftIcon={<Icon as={EditIcon} />}
            onClick={handleLike}
          >
            {isLiked ? 'Liked' : 'Like'}
          </Button>
          <Button
            size="sm"
            variant={isFavorited ? "solid" : "outline"}
            colorScheme={isFavorited ? "yellow" : "gray"}
            leftIcon={<Icon as={StarIcon} />}
            onClick={handleFavorite}
          >
            {isFavorited ? 'Saved' : 'Save'}
          </Button>
          <Button
            size="sm"
            variant="outline"
            colorScheme="blue"
            leftIcon={<Icon as={ExternalLinkIcon} />}
            onClick={handleShare}
          >
            Share
          </Button>
        </HStack>

        <Divider />

        {/* Comments Section */}
        <Box>
          <Heading size="sm" mb={3}>Comments & Reviews ({comments.length})</Heading>
          
          {/* Add Comment */}
          <VStack spacing={2} align="stretch" mb={4}>
            <Textarea
              placeholder="Share your experience with this deal..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={3}
            />
            <HStack>
              <Input
                placeholder="Your name (optional)"
                value={userAddress}
                onChange={(e) => setUserAddress(e.target.value)}
                size="sm"
                flex={1}
              />
              <Button
                colorScheme="teal"
                onClick={handleAddComment}
                isLoading={isSubmitting}
                loadingText="Posting..."
                size="sm"
              >
                Post Comment
              </Button>
            </HStack>
          </VStack>

          {/* Comments List */}
          {comments.length > 0 ? (
            <VStack spacing={3} align="stretch" maxH="400px" overflowY="auto">
              {comments.map((comment) => (
                <Box
                  key={comment.id}
                  p={3}
                  bg="gray.50"
                  borderRadius="md"
                  border="1px solid"
                  borderColor="gray.200"
                >
                  <HStack justify="space-between" mb={2}>
                    <HStack spacing={2}>
                      <Avatar size="sm" name={comment.author} />
                      <VStack align="start" spacing={0}>
                        <Text fontSize="sm" fontWeight="bold">{comment.author}</Text>
                        <Text fontSize="xs" color="gray.500">{getTimeAgo(comment.timestamp)}</Text>
                      </VStack>
                    </HStack>
                    <HStack spacing={1}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Icon
                          key={star}
                          as={StarIcon}
                          color={star <= comment.rating ? "yellow.400" : "gray.300"}
                          boxSize={3}
                        />
                      ))}
                    </HStack>
                  </HStack>
                  <Text fontSize="sm" color="gray.700">
                    {comment.text}
                  </Text>
                  {comment.author === userAddress && (
                    <Button
                      size="xs"
                      variant="ghost"
                      colorScheme="red"
                      leftIcon={<DeleteIcon />}
                      onClick={() => handleDeleteComment(comment.id)}
                      mt={2}
                    >
                      Delete
                    </Button>
                  )}
                </Box>
              ))}
            </VStack>
          ) : (
            <Box textAlign="center" py={8}>
              <Icon as={ChatIcon} boxSize={12} color="gray.300" mb={2} />
              <Text color="gray.500">No comments yet. Be the first to review!</Text>
            </Box>
          )}
        </Box>

        {/* Deal Stats */}
        <Divider />
        <HStack justify="space-between" fontSize="sm" color="gray.600">
          <Text>Views: {deal.views || 124}</Text>
          <Text>Likes: {(deal.likes || 0) + (isLiked ? 1 : 0)}</Text>
          <Text>Shares: {deal.shares || 8}</Text>
          <Text>Rating: {averageRating}/5</Text>
        </HStack>
      </VStack>
    </Box>
  );
};

export default SocialFeatures;
