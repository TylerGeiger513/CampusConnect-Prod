// UserContext.jsx
import React, { createContext, useState, useEffect } from 'react';
import { api } from '../utils/api';

export const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        // Get the userId from the session endpoint
        const sessionResponse = await api.get('/auth/session');
        const userId = sessionResponse.data.userId;
        if (userId) {
          // Use the userId to fetch the profile details
          const profileResponse = await api.get('/auth/profile');
          // Set the user state to the profile information
          setUser(profileResponse.data);
          console.log('Profile data:', profileResponse.data);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, loading }}>
      {children}
    </UserContext.Provider>
  );
};
