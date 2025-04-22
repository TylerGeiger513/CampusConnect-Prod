// src/components/DashboardContent.jsx
import React from 'react';
import ChatChannel from './ChatChannel';
import '../../styles/DashboardContent.css';
import UniversitySocialFeed from './UniversitySocialFeed';

const DashboardContent = ({ activeChannel, messages, newMessage, setNewMessage, sendMessage }) => {
  return (
    <div className="dashboard-content">
      <UniversitySocialFeed />
    </div>
  );
};

export default DashboardContent;
