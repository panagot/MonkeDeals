import React from 'react';
import { Button } from '@chakra-ui/react';

const GradientButton = ({ children, gradient, ...props }) => {
  const defaultGradient = gradient || 'linear(to-r, teal.400, blue.500)';
  
  return (
    <Button
      bgGradient={defaultGradient}
      color="white"
      _hover={{
        bgGradient: defaultGradient,
        transform: 'translateY(-2px)',
        boxShadow: 'lg'
      }}
      _active={{
        transform: 'translateY(0px)'
      }}
      transition="all 0.2s"
      {...props}
    >
      {children}
    </Button>
  );
};

export default GradientButton;
