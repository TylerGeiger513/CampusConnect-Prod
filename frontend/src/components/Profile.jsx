import React, { useState, useEffect } from 'react';
import Header from './common/Header';
import SideNav from './dashboard/SideNav';
import ProfileCard from './profile/ProfileCard';
import UserInfoCard from './profile/UserInfoCard';
import FriendsList from './profile/ProfileFriendsList';
import useUser from '../hooks/useUser'; // Import useUser hook
import { updateProfile } from '../utils/authHandler'; // Import updateProfile
import FriendsSuggestionsComponent from './friends/FriendsSuggestionsComponent';
import '../styles/Profile.css';

const Profile = () => {
  const { user, setUser, loading } = useUser(); // Use the hook
  const [error, setError] = useState(null); // State for handling update errors

  // This function handles profile info updates via API call.
  const handleInfoUpdate = async (newInfo) => {
    setError(null); // Reset error state
    try {
      // Copy the payload received from UserInfoCard
      const updateData = { ...newInfo };

      // Rename campusId to campus for the backend API
      if (updateData.campusId) {
        updateData.campus = updateData.campusId;
        delete updateData.campusId;
      }

      // Clean up undefined values, but keep nulls and empty strings for now
      // Backend should handle validation of required fields or invalid combinations
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined) {
           delete updateData[key];
        }
      });

      // Log the final payload before sending
      console.log('Sending update payload to API:', JSON.stringify(updateData, null, 2));

      const response = await updateProfile(updateData); // Pass the cleaned data
      const updatedUser = response.user;
      setUser(updatedUser); // Update user context
      console.log('Profile updated successfully:', updatedUser);
    } catch (err) {
      console.error('Failed to update profile:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to update profile.';
      setError(errorMessage); 
    }
  };

  if (loading) {
    return <div>Loading profile...</div>; 
  }

  if (!user) {
    return <div>Please log in to view your profile.</div>;
  }


  const profileData = {
    profileImg: user.profileImg || null, // Use null if no image
    username: user.username, // Use username from backend
    fullName: user.fullName,
    email: user.email,
    campusName: user.campus?.name, // Safely access nested campus name
    major: user.major,
  };

  return (
    <div>
      <Header />
      <div className="profile-page-container">
        <div className="sidenav-column">
          <SideNav currentPage="profile" />
        </div>
        <div className="profile-content">
          <div className="left-column">
            <ProfileCard
              profileImg={profileData.profileImg}
              username={profileData.username}
              major={profileData.major || 'Student'} // Default if major is null/undefined
              campus={profileData.campusName} // Pass campus name
            />
          </div>
          <div className="right-column">
            <div className="user-info-friends">
              <div className="user-info-card-wrapper">
                {error && <div style={{ color: 'red', marginBottom: '10px' }}>Error: {error}</div>}
                <UserInfoCard
                  fullName={profileData.fullName}
                  username={profileData.username}
                  email={profileData.email}
                  campusName={profileData.campusName} // Pass campus name
                  major={profileData.major}
                  onUpdate={handleInfoUpdate} // Pass the API update handler
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
