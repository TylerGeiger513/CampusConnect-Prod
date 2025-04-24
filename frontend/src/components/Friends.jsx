import React from 'react';
import Header from './common/Header';
import SideNav from './dashboard/SideNav';
import FriendsManagement from './friends/FriendsManagement';
import FriendsSuggestionsComponent from './friends/FriendsSuggestionsComponent';
import '../styles/FriendsPage.css';

const Friends = () => {
  return (
    <>
      <Header />
      <div className="dashboard-container">
        <SideNav currentPage="friends" />
        <div className="friends-content">
          <FriendsManagement />
          <FriendsSuggestionsComponent />
        </div>
      </div>
    </>
  );
};

export default Friends;
