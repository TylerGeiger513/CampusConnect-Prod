import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './common/Header';
import SideNav from './dashboard/SideNav';
import { logout } from '../utils/authHandler';
import '../styles/SettingsPage.css'; // Import the CSS

const SettingsPage = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      // Redirect to landing page after successful logout
      navigate('/');
      // Optionally, force a reload to clear all state if context isn't updating properly
      // window.location.reload();
    } catch (error) {
      console.error('Logout failed:', error);
      // Handle logout error (e.g., show a message)
    }
  };

  return (
    <div className="settings-page-container">
      <Header />
      <div className="settings-layout">
        <SideNav currentPage="settings" />
        <div className="settings-content">
          <h2>Settings</h2>
          <button className="logout-button" onClick={handleLogout}>
            Log Out
          </button>
          {/* Add other settings options here later */}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
