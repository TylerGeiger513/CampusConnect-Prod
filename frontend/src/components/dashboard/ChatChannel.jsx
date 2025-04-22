import React, { useEffect, useRef } from 'react';
import Message from './Message';
import '../../styles/ChatChannel.css';
import useUser from '../../hooks/useUser';

const ChatChannel = ({
  messages = [],
  newMessage = '',
  setNewMessage = () => {},
  sendMessage = () => {}
}) => {
  const { user, loading } = useUser();
  const messagesContainerRef = useRef(null);

  const scrollToBottom = () => {
    const container = messagesContainerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // guard newMessage and trim safely
    const text = (newMessage || '').trim();
    if (!text) return;
    sendMessage(text);
    setNewMessage('');
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (loading) return <div className="chat-channel">Loading user...</div>;

  return (
    <div className="chat-channel">
      <div className="chat-header">Channel Chat</div>
      <div className="messages" ref={messagesContainerRef}>
        {messages.length === 0 && <div className="no-messages">No messages yet</div>}
        {messages.map((msg, index) => {
          const isSent = msg.senderId === user?._id;
          const prevMsg = messages[index - 1];
          const isGrouped =
            prevMsg &&
            prevMsg.senderId === msg.senderId &&
            Math.abs(new Date(msg.createdAt) - new Date(prevMsg.createdAt)) < 10 * 60 * 1000; // 10 mins

          return (
            <Message
              key={msg._id || msg.id}
              message={msg}
              isSent={isSent}
              isGrouped={isGrouped}
            />
          );
        })}
      </div>
      <form className="message-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default ChatChannel;
