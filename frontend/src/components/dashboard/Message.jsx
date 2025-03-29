import React from 'react';
import '../../styles/Message.css';

const Message = ({ message, isSent, isGrouped }) => {
  return (
    <div className={`message-item ${isSent ? 'sent' : 'received'} ${isGrouped ? 'grouped' : ''}`}>
      <div className={`message-header ${isGrouped ? 'hidden-header' : ''}`}>
        <div className="sender-info">
          <span className="friend-name">{isSent ? 'You' : message.senderName}</span>
          <span className="timestamp">
            {new Date(message.createdAt).toLocaleTimeString().replace(/:\d{2} /, ' ')}
          </span>
        </div>
      </div>

      <div className={`bubble ${isSent ? 'sent' : 'received'}`}>
        {message.content}
      </div>

      {/* Profile pic stays visible always */}
      <div className= {`msg-friend-pfp ${isGrouped ? 'grouped' : ''}`}>
        {message.senderName?.charAt(0).toUpperCase()}
      </div>
    </div>
  );
};

export default Message;
