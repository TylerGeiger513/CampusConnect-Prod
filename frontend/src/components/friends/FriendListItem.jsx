import React, { useState } from 'react';
import './FriendListItem.css';
// Assume SVGs are imported or handled appropriately (e.g., using an Icon component)

import { ReactComponent as CommentIcon } from '../../assets/comment.svg';
import { ReactComponent as CheckIcon } from '../../assets/check.svg';
import { ReactComponent as DotsIcon } from '../../assets/dots.svg';
import { ReactComponent as PinIcon } from '../../assets/pin.svg';
import { ReactComponent as XIcon } from '../../assets/close.svg';


const FriendListItem = ({ user, type, actions }) => {
  const [menuVisible, setMenuVisible] = useState(false);

  const handleMenuToggle = (e) => {
    e.stopPropagation(); // Prevent triggering item click
    setMenuVisible(!menuVisible);
  };

  const handleAction = (e, action) => {
    e.stopPropagation();
    setMenuVisible(false);
    action(user.id);
  };

  const renderActions = () => {
    switch (type) {
      case 'friend':
        return (
          <>
            <button className="action-btn" onClick={(e) => handleAction(e, actions.onChat)}>
              <CommentIcon /> 
            </button>
            <div className="action-menu-container">
              <button className="action-btn" onClick={handleMenuToggle}>
                <DotsIcon />
              </button>
              {menuVisible && (
                <div className="action-menu">
                  <button onClick={(e) => handleAction(e, actions.onRemove)}>Remove Friend</button>
                  <button onClick={(e) => handleAction(e, actions.onBlock)}>Block</button>
                </div>
              )}
            </div>
          </>
        );
      case 'incoming':
        return (
          <>
            <button className="action-btn" onClick={(e) => handleAction(e, actions.onAccept)}>
              <CheckIcon />
            </button>
            <button className="action-btn" onClick={(e) => handleAction(e, actions.onDeny)}>
                <XIcon />
            </button>
            <button className="action-btn" onClick={handleMenuToggle}>
                <DotsIcon />
              </button>
              {menuVisible && (
                <div className="action-menu">
                    <button onClick={(e) => handleAction(e, actions.onDeny)}>Deny Request</button>
                    <button onClick={(e) => handleAction(e, actions.onAccept)}>Accept Request</button>
                    <button onClick={(e) => handleAction(e, actions.onBlock)}>Block</button>
                </div>
              )}
          </>
        );
      case 'outgoing':
        return (
          <>
            <button className="action-btn" onClick={(e) => handleAction(e, actions.onCancel)}>
              <XIcon />
            </button>
             
            <button className="action-btn" onClick={handleMenuToggle}>
                <DotsIcon />
              </button>
              {menuVisible && (
                <div className="action-menu">
                    <button onClick={(e) => handleAction(e, actions.onDeny)}>Deny Request</button>
                    <button onClick={(e) => handleAction(e, actions.onAccept)}>Accept Request</button>
                    <button onClick={(e) => handleAction(e, actions.onBlock)}>Block</button>
                </div>
              )}
          </>
        );
      case 'blocked':
        return (
          <>
            <div className="action-menu-container">
              <button className="action-btn" onClick={handleMenuToggle}>
                <DotsIcon />
              </button>
              {menuVisible && (
                <div className="action-menu">
                  <button onClick={(e) => handleAction(e, actions.onUnblock)}>Unblock</button>
                </div>
              )}
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <li className="friend-list-item" onClick={() => type === 'friend' && actions.onChat(user.id)}>
      <div className="friend-list-pfp">
        {user.username.charAt(0).toUpperCase()}
      </div>
      <div className="friend-list-info">
        <span className="friend-list-name">{user.fullName || user.username}</span>
        {user.campus && (
          <span className="friend-list-campus">
            <PinIcon /> {user.campus}
          </span>
        )}
      </div>
      <div className="friend-list-actions">
        {renderActions()}
      </div>
      {menuVisible && <div className="backdrop" onClick={handleMenuToggle}></div>}
    </li>
  );
};

export default FriendListItem;
