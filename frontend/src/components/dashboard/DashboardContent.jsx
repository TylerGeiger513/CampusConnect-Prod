// src/components/DashboardContent.jsx
import React from 'react';
import ChatChannel from './ChatChannel';
import '../../styles/DashboardContent.css';

const DashboardContent = ({ activeChannel, messages, newMessage, setNewMessage, sendMessage }) => {
  return (
    <div className="dashboard-content">
      {activeChannel ? (
        <ChatChannel
          channelId={activeChannel.id}
          messages={messages}
          newMessage={newMessage}
          setNewMessage={setNewMessage}
          sendMessage={sendMessage}
        />
      ) : (
        <div className="no-active-channel">No active channel</div>
      )}
    </div>
  );
};

export default DashboardContent;
