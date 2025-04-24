import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import FriendListItem from './FriendListItem';
import './FriendsManagement.css';
import {
  getFriendsList,
  getIncomingRequests,
  getSentRequests,
  getBlockedUsers,
  acceptFriendRequest,
  denyFriendRequest,
  removeFriend,
  cancelFriendRequest,
  blockUser,
  unblockUser,
} from '../../utils/friendsHandler';
import { findOrCreateDMChannel } from '../../utils/channelHandler'; 

const FriendsManagement = () => {
  const [activeTab, setActiveTab] = useState('friends'); // 'friends', 'pending', 'blocked'
  const [friends, setFriends] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [blocked, setBlocked] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate(); // Initialize navigate

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [friendsData, incomingData, sentData, blockedData] = await Promise.all([
        getFriendsList(),
        getIncomingRequests(),
        getSentRequests(),
        getBlockedUsers(),
      ]);
      setFriends(friendsData.friends || []);
      setIncomingRequests(incomingData.requests || []);
      setSentRequests(sentData.requests || []);
      setBlocked(blockedData.blockedUsers || []);
    } catch (error) {
      console.error('Error fetching friends data:', error);
      // Handle error display if needed
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- Action Handlers ---
  const handleAccept = async (userId) => {
    try {
      await acceptFriendRequest(userId);
      fetchData(); // Re-fetch all data to update lists
    } catch (error) { console.error('Error accepting request:', error); }
  };

  const handleDeny = async (userId) => {
    try {
      await denyFriendRequest(userId);
      fetchData();
    } catch (error) { console.error('Error denying request:', error); }
  };

  const handleRemove = async (userId) => {
    // Add confirmation dialog here if desired
    try {
      await removeFriend(userId);
      fetchData();
    } catch (error) { console.error('Error removing friend:', error); }
  };

  const handleCancel = async (userId) => {
    try {
      await cancelFriendRequest(userId);
      fetchData();
    } catch (error) { console.error('Error cancelling request:', error); }
  };

  const handleBlock = async (userId) => {
     // Add confirmation dialog here if desired
    try {
      await blockUser(userId);
      fetchData();
    } catch (error) { console.error('Error blocking user:', error); }
  };

   const handleUnblock = async (userId) => {
    try {
      await unblockUser(userId);
      fetchData();
    } catch (error) { console.error('Error unblocking user:', error); }
  };

  const handleChat = async (userId) => {
    console.log(`Attempting to open chat with user: ${userId}`);
    try {
      // Find or create the DM channel
      const channelData = await findOrCreateDMChannel(userId);
      if (channelData && channelData._id) {
        console.log(`Navigating to channel: ${channelData._id}`);
        // Navigate to the chat page with the specific channel ID
        navigate(`/chats/${channelData._id}`);
      } else {
        console.error('Failed to get channel data for user:', userId);
        // Handle error - maybe show a notification to the user
      }
    } catch (error) {
      console.error('Error finding or creating DM channel:', error);
      // Handle error - maybe show a notification to the user
    }
  };

  const renderList = () => {
    if (loading) return <div className="loading-message">Loading...</div>;

    switch (activeTab) {
      case 'friends':
        return friends.length > 0 ? (
          friends.map(user => (
            <FriendListItem
              key={user.id}
              user={user}
              type="friend"
              actions={{ onChat: handleChat, onRemove: handleRemove, onBlock: handleBlock }}
            />
          ))
        ) : <div className="empty-message">No friends yet.</div>;

      case 'pending':
        return (
          <>
            <h4 className="pending-header">Incoming ({incomingRequests.length})</h4>
            {incomingRequests.length > 0 ? (
              incomingRequests.map(user => (
                <FriendListItem
                  key={`in-${user.id}`}
                  user={user}
                  type="incoming"
                  actions={{ onAccept: handleAccept, onDeny: handleDeny, onBlock: handleBlock }}
                />
              ))
            ) : <div className="empty-message">No incoming requests.</div>}

            <h4 className="pending-header">Outgoing ({sentRequests.length})</h4>
            {sentRequests.length > 0 ? (
              sentRequests.map(user => (
                <FriendListItem
                  key={`out-${user.id}`}
                  user={user}
                  type="outgoing"
                  actions={{ onCancel: handleCancel, onBlock: handleBlock }}
                />
              ))
            ) : <div className="empty-message">No outgoing requests.</div>}
          </>
        );

      case 'blocked':
        return blocked.length > 0 ? (
          blocked.map(user => (
            <FriendListItem
              key={user.id}
              user={user}
              type="blocked"
              actions={{ onUnblock: handleUnblock }}
            />
          ))
        ) : <div className="empty-message">No blocked users.</div>;

      default:
        return null;
    }
  };

  return (
    <div className="friends-management-container">
      <div className="friends-management-tabs">
        <button
          className={`tab-button ${activeTab === 'friends' ? 'active' : ''}`}
          onClick={() => setActiveTab('friends')}
        >
          Friends
        </button>
        <button
          className={`tab-button ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          Pending
        </button>
        <button
          className={`tab-button ${activeTab === 'blocked' ? 'active' : ''}`}
          onClick={() => setActiveTab('blocked')}
        >
          Blocked
        </button>
        {/* Add Friend Button could go here */}
        {/* <button className="add-friend-main-btn">Add Friend</button> */}
      </div>
      <div className="friends-management-list">
        <ul>
          {renderList()}
        </ul>
      </div>
    </div>
  );
};

export default FriendsManagement;
