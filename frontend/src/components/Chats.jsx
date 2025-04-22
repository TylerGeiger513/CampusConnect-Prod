import React from 'react';
import Header from './common/Header';
import SideNav from './dashboard/SideNav';
import ChatChannel from './dashboard/ChatChannel';
import useChannel from '../hooks/useChannel';

const Chats = () => {
  const { activeChannel, messages, newMessage, setNewMessage, sendMessage } = useChannel();

  return (
    <>
      <Header />
      <div className="dashboard-container">
        <SideNav currentPage="chats" />
        <div className="dashboard-content">
          <ChatChannel
            messages={messages}
            newMessage={newMessage}
            setNewMessage={setNewMessage}
            sendMessage={sendMessage}
          />
        </div>
      </div>
    </>
  );
};

export default Chats;
