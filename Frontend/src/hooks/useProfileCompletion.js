import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

export const useProfileCompletion = () => {
  const { user, isAuthenticated } = useAuth();
  const [needsCompletion, setNeedsCompletion] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      const isGoogleUser = user.authProvider === 'google';
      const hasRequiredFields = user.phone && user.dateOfBirth && user.gender && user.address;
      
      if (isGoogleUser && !hasRequiredFields) {
        setNeedsCompletion(true);
        setTimeout(() => {
          setShowModal(true);
        }, 1000);
      } else {
        setNeedsCompletion(false);
        setShowModal(false);
      }
    } else {
      setNeedsCompletion(false);
      setShowModal(false);
    }
  }, [isAuthenticated, user]);

  const handleProfileComplete = async (profileData) => {
    try {
      console.log('Starting profile completion with data:', profileData);
      
      const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${apiBaseUrl}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(profileData)
      });

      console.log('Profile update response status:', response.status);
      console.log('Profile update response ok:', response.ok);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Profile update failed:', errorData);
        throw new Error(errorData.message || 'Failed to update profile');
      }

      const data = await response.json();
      console.log('Profile update successful:', data);
      
      const updatedUser = { ...user, ...data.user };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      console.log('Updated user data stored in localStorage');
      
      window.location.reload();
      
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  };

  const closeModal = () => {
    setShowModal(false);
  };

  return {
    needsCompletion,
    showModal,
    closeModal,
    handleProfileComplete,
    user
  };
};
