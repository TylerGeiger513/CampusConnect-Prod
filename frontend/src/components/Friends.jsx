import React, { useState } from 'react';
import Header from './common/Header';
import SideNav from './dashboard/SideNav';
import FriendsList from './profile/ProfileFriendsList';
import FriendsSuggestionsComponent from './friends/FriendsSuggestionsComponent';
import useChannel from '../hooks/useChannel';
import '../styles/FriendsPage.css';

const Friends = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { activeChannel, toggleFriendChannel } = useChannel();
  const toggleCollapse = () => setIsCollapsed(prev => !prev);

  return (
    <>
      <Header />
      <div className="dashboard-container">
        <SideNav currentPage="friends" />
        <div className="dashboard-content">
          <FriendsList
            isCollapsed={isCollapsed}
            toggleCollapse={toggleCollapse}
            toggleFriendChannel={toggleFriendChannel}
            activeChannel={activeChannel}
          />
          <FriendsSuggestionsComponent />
        </div>
      </div>
    </>
  );
};

export default Friends;
