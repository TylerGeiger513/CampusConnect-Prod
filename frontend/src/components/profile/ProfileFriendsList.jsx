import React, { useState } from 'react';
import '../../styles/ProfileFriendsList.css';

const FriendsList = ({ friends, onBlockToggle }) => {
  const [popupFriend, setPopupFriend] = useState(null);

  const handleFriendClick = (friend) => {
    // Always show a confirmation popup on click
    setPopupFriend(friend);
  };

  const handleConfirm = () => {
    if (popupFriend) {
      onBlockToggle(popupFriend.id);
      setPopupFriend(null);
    }
  };

  const handleClosePopup = () => {
    setPopupFriend(null);
  };

  return (
    <div className="friends-list">
      <h2>Friends</h2>
      {friends.map((friend) => (
        <div
          key={friend.id}
          className={`friend-item ${friend.blocked ? 'blocked' : ''}`}
          onClick={() => handleFriendClick(friend)}
        >
          {friend.name}
        </div>
      ))}

      {/* Confirmation Popup */}
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
