// src/components/Dashboard.jsx
import React, { useState } from 'react';
import ClassList from './SideNav';
import ChannelList from './ChannelList';
import DashboardContent from './DashboardContent';
import FriendsList from './FriendsList';
import Header from '../common/Header';
import '../../styles/Dashboard.css';
import useChannel from '../../hooks/useChannel';
import SideNav from './SideNav';

const Dashboard = () => {
  const [isFriendsCollapsed, setIsFriendsCollapsed] = useState(false);
  const {
    activeChannel,
    messages,
    newMessage,
    setNewMessage,
    sendMessage,
    toggleFriendChannel,
  } = useChannel();

  return (
    <>
      <Header />
      <div className="dashboard-container">
        <SideNav currentPage="dashboard" />
        <DashboardContent
          activeChannel={activeChannel}
          messages={messages}
          newMessage={newMessage}
          setNewMessage={setNewMessage}
          sendMessage={sendMessage}
        />
        {/* <FriendsList
          isCollapsed={isFriendsCollapsed}
          toggleCollapse={() => setIsFriendsCollapsed(!isFriendsCollapsed)}
          toggleFriendChannel={toggleFriendChannel}
          activeChannel={activeChannel}
        /> */}
      </div>
    </>
  );
};

export default Dashboard;
