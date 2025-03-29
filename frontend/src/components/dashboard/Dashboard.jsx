// src/components/Dashboard.jsx
import React, { useState } from 'react';
import ClassList from './ClassList';
import ChannelList from './ChannelList';
import DashboardContent from './DashboardContent';
import FriendsList from './FriendsList';
import Header from '../common/Header';
import '../../styles/Dashboard.css';
import useChannel from '../../hooks/useChannel';

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
        <ClassList />
        <ChannelList />
        <DashboardContent
          activeChannel={activeChannel}
          messages={messages}
          newMessage={newMessage}
          setNewMessage={setNewMessage}
          sendMessage={sendMessage}
        />
        <FriendsList
          isCollapsed={isFriendsCollapsed}
          toggleCollapse={() => setIsFriendsCollapsed(!isFriendsCollapsed)}
          toggleFriendChannel={toggleFriendChannel}
          activeChannel={activeChannel}
        />
      </div>
    </>
  );
};

export default Dashboard;
