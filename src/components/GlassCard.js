import React from 'react';
import { Box } from '@chakra-ui/react';

const GlassCard = ({ children, ...props }) => {
  return (
    <Box
      bg="rgba(255, 255, 255, 0.1)"
      backdropFilter="blur(10px)"
      border="1px solid"
      borderColor="rgba(255, 255, 255, 0.2)"
      borderRadius="lg"
      p={6}
      boxShadow="lg"
      {...props}
    >
      {children}
    </Box>
  );
};

export default GlassCard;
