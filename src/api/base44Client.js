import { createClient } from '@base44/sdk';
// import { getAccessToken } from '@base44/sdk/utils/auth-utils';

// Create a client with authentication required
export const base44 = createClient({
  appId: "691dc40c1c0c3741329f9ad2", 
  requiresAuth: true // Ensure authentication is required for all operations
});
