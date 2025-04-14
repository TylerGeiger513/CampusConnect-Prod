import React, { useState, useEffect } from 'react';
import '../../styles/ProfileFriendsList.css';
import {
  getFriendsList,
  getIncomingRequests,
  sendFriendRequest,
  acceptFriendRequest,
  denyFriendRequest,
} from '../../utils/friendsHandler';

const FriendsList = ({ isCollapsed, toggleCollapse, toggleFriendChannel, activeChannel }) => {
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [addFriendInput, setAddFriendInput] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const friendsData = await getFriendsList();
        const requestsData = await getIncomingRequests();
        setFriends(friendsData.friends || []);
        setFriendRequests(requestsData.requests || []);
      } catch (error) {
        console.error('Error fetching friends data:', error);
      }
    };
    fetchData();
  }, []);

  const handleSendRequest = async () => {
    if (!addFriendInput) return;
    try {
      await sendFriendRequest(addFriendInput);
      setAddFriendInput('');
      const requestsData = await getIncomingRequests();
      setFriendRequests(requestsData.requests || []);
    } catch (error) {
      console.error('Error sending friend request:', error);
    }
  };

  const handleAccept = async (target) => {
    try {
      await acceptFriendRequest(target);
      setFriendRequests((prev) => prev.filter((req) => req.id !== target));
      const friendsData = await getFriendsList();
      setFriends(friendsData.friends || []);
    } catch (error) {
      console.error('Error accepting friend request:', error);
    }
  };

  const handleDeny = async (target) => {
    try {
      await denyFriendRequest(target);
      setFriendRequests((prev) => prev.filter((req) => req.id !== target));
    } catch (error) {
      console.error('Error denying friend request:', error);
    }
  };

  return (
    <div className={`friends-list ${isCollapsed ? 'collapsed' : 'open'}`}>
      <div className="friends-header">
        <div
          id="friendsMenu"
          className={isCollapsed ? '' : 'open'}
          onClick={toggleCollapse}
        >
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
        </div>
        { !isCollapsed && <h3>Friends</h3> }
      </div>
      { !isCollapsed && (
        <>
          <div className="add-friend-section">
            <input
              type="text"
              value={addFriendInput}
              onChange={(e) => setAddFriendInput(e.target.value)}
              placeholder="Add friend..."
            />
            <button onClick={handleSendRequest}>SEND</button>
          </div>
          {/* New container for horizontal layout */}
          <div className="horizontal-friends">
            <div className="friends-section friend-requests">
              <div className="section-label">Friend Requests</div>
              <div className="friends-body">
                {friendRequests.length === 0 ? (
                  <div className="empty-message">
                    You do not have any friend requests :(
                  </div>
                ) : (
                  <ul>
                    {friendRequests.map((req) => (
                      <li key={req.id} className="friend-item">
                        <div className="friend-pfp">
                          {req.username.charAt(0).toUpperCase()}
                        </div>
                        <span className="friend-name">{req.username}</span>
                        <div className="friend-actions">
                          <button
                            className="accept-button"
                            onClick={() => handleAccept(req.id)}
                          >
                            Accept
                          </button>
                          <button
                            className="deny-button"
                            onClick={() => handleDeny(req.id)}
                          >
                            Deny
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            <div className="friends-section friends-list-col">
              <div className="section-label">Friends</div>
              <div className="friends-body">
                {friends.length === 0 ? (
                  <div className="empty-message">
                    You do not have any friends :(
                  </div>
                ) : (
                  <ul>
                    {friends.map((friend) => (
                      <li
                        key={friend.id}
                        className={`friend-item ${activeChannel && activeChannel.friendId === friend.id ? 'active' : ''}`}
                        onClick={() => toggleFriendChannel(friend.id)}
                      >
                        <div className="friend-pfp">
                          {friend.username.charAt(0).toUpperCase()}
                        </div>
                        <span className="friend-name">{friend.username}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default FriendsList;
