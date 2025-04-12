import React, { useState, useEffect } from 'react';
import '../../styles/ProfileFriendsList.css';

const FriendsList = () => {
  const [friends, setFriends] = useState([]);
  const [popupFriend, setPopupFriend] = useState(null);
  const [newFriendName, setNewFriendName] = useState('');

  // Fetch the friend list from the backend.
  const fetchFriends = async () => {
    try {
      const res = await fetch('/friends/friendsList', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Include authentication headers if needed.
        },
      });
      if (res.ok) {
        const data = await res.json();
        // Expected response format: { friends: [...] }
        setFriends(data.friends);
      } else {
        console.error('Failed to fetch friends list');
      }
    } catch (err) {
      console.error('Error fetching friends:', err);
    }
  };

  // Load friends on component mount.
  useEffect(() => {
    fetchFriends();
  }, []);

  // Click handler for showing the confirmation popup.
  const handleFriendClick = (friend) => {
    setPopupFriend(friend);
  };

  // When confirmed, toggle block status for the friend.
  const handleConfirm = async () => {
    if (popupFriend) {
      try {
        if (popupFriend.blocked) {
          const res = await fetch('/friends/unblock', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ target: popupFriend.id }),
          });
          if (!res.ok) console.error('Failed to unblock friend');
        } else {
          const res = await fetch('/friends/block', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ target: popupFriend.id }),
          });
          if (!res.ok) console.error('Failed to block friend');
        }
      } catch (err) {
        console.error('Error toggling block status:', err);
      }
      setPopupFriend(null);
      fetchFriends(); // Refresh the friend list.
    }
  };

  const handleClosePopup = () => {
    setPopupFriend(null);
  };

  // Update the input state when user types a friend name.
  const handleInputChange = (e) => {
    setNewFriendName(e.target.value);
  };

  // Send a friend request using the API.
  const handleAddFriend = async () => {
    if (newFriendName.trim() !== '') {
      try {
        const res = await fetch('/friends/request', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          // Passing the friend name as the target (adjust if your API expects an ID).
          body: JSON.stringify({ target: newFriendName.trim() }),
        });
        if (res.ok) {
          console.log('Friend request sent.');
          setNewFriendName('');
          fetchFriends(); // Refresh friend list after sending the request.
        } else {
          console.error('Failed to send friend request.');
        }
      } catch (err) {
        console.error('Error sending friend request:', err);
      }
    }
  };

  return (
    <div className="friends-list">
      <h2>Friends</h2>
      
      {/* Render the list of friends */}
      {friends.map((friend) => (
        <div
          key={friend.id}
          className={`friend-item ${friend.blocked ? 'blocked' : ''}`}
          onClick={() => handleFriendClick(friend)}
        >
          {friend.name}
        </div>
      ))}

      {/* Add Friend Section */}
      <div className="add-friend-section">
        <input
          type="text"
          className="add-friend-input"
          value={newFriendName}
          onChange={handleInputChange}
          placeholder="Enter friend's name"
        />
        <button className="add-friend-btn" onClick={handleAddFriend}>
          Add Friend
        </button>
      </div>

      {/* Confirmation Popup for blocking/unblocking */}
      {popupFriend && (
        <div className="confirm-popup">
          <div className="confirm-content">
            <p>
              {popupFriend.blocked
                ? `Unblock ${popupFriend.name}?`
                : `Block ${popupFriend.name}?`}
            </p>
            <div className="popup-buttons">
              <button className="confirm-btn" onClick={handleConfirm}>
                Yes
              </button>
              <button className="confirm-btn" onClick={handleClosePopup}>
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FriendsList;
