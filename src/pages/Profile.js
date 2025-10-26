import React, { useState } from 'react';
import { Box, Heading, FormControl, FormLabel, Input, Button, Stack, Checkbox, useToast } from '@chakra-ui/react';

const Profile = () => {
  const [form, setForm] = useState({
    businessName: '',
    registration: '',
    website: '',
    email: '',
    notifyNewDeals: true,
    notifyExpiringDeals: true,
    notifyPurchaseConfirmation: true,
  });
  const toast = useToast();
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    toast({ title: 'Profile saved!', status: 'success', duration: 2000 });
  };
  return (
    <Box maxW="2xl" mx="auto" mt={10} p={6} bg="white" borderRadius="md" boxShadow="md">
      <Heading mb={4}>Profile & Settings</Heading>
      <form onSubmit={handleSubmit}>
        <Stack spacing={5}>
          <FormControl>
            <FormLabel>Business Name</FormLabel>
            <Input name="businessName" value={form.businessName} onChange={handleChange} />
          </FormControl>
          <FormControl>
            <FormLabel>Registration Number</FormLabel>
            <Input name="registration" value={form.registration} onChange={handleChange} />
          </FormControl>
          <FormControl>
            <FormLabel>Business Website</FormLabel>
            <Input name="website" value={form.website} onChange={handleChange} />
          </FormControl>
          <FormControl>
            <FormLabel>Email</FormLabel>
            <Input name="email" value={form.email} onChange={handleChange} />
          </FormControl>
          <FormControl>
            <FormLabel>Notification Preferences</FormLabel>
            <Stack spacing={2}>
              <Checkbox name="notifyNewDeals" isChecked={form.notifyNewDeals} onChange={handleChange}>
                Notify me about new deals in my area
              </Checkbox>
              <Checkbox name="notifyExpiringDeals" isChecked={form.notifyExpiringDeals} onChange={handleChange}>
                Remind me when deals I'm interested in are expiring soon
              </Checkbox>
              <Checkbox name="notifyPurchaseConfirmation" isChecked={form.notifyPurchaseConfirmation} onChange={handleChange}>
                Send purchase confirmation notifications
              </Checkbox>
            </Stack>
          </FormControl>
          <Button colorScheme="teal" type="submit">Save</Button>
        </Stack>
      </form>
    </Box>
  );
};

export default Profile; 