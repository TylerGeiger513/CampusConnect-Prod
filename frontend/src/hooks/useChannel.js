import { useState, useEffect, useRef } from 'react';
import { getChannelMessages, postMessage } from '../utils/channelHandler';
import { createSocket } from '../utils/api';
import useUser from './useUser';

// ← accept activeChannel from outside
const useChannel = (activeChannel) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const { user } = useUser();
  const socketRef = useRef(null);

  // init socket once
  useEffect(() => {
    socketRef.current = createSocket();
    return () => socketRef.current?.disconnect();
  }, []);

  // join / leave on activeChannel change
  useEffect(() => {
    const socket = socketRef.current;
    if (!activeChannel || !socket) {
      setMessages([]);       // clear when no channel
      return;
    }
    const channelId = activeChannel.channelId;             // ← use channelId
    socket.emit('joinChannel', channelId);

    const handleIncoming = (msg) => {
      if (msg.channelId === channelId && msg.senderId !== user._id) {
        setMessages(prev => [...prev, msg]);
      }
    };
    socket.on('messageReceived', handleIncoming);

    return () => {
      socket.off('messageReceived', handleIncoming);
      socket.emit('leaveChannel', channelId);
    };
  }, [activeChannel, user]);

  // fetch history
  useEffect(() => {
    if (!activeChannel) return;
    (async () => {
      try {
        const channelId = activeChannel.channelId;          // ← use channelId
        const { messages: hist = [] } = await getChannelMessages(channelId);
        setMessages(hist);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [activeChannel]);

  const sendMessage = async (content) => {
    if (!activeChannel) return;
    const channelId = activeChannel.channelId;            // ← use channelId
    console.log('Sending message:', content, 'to channel:', channelId);
    try {
      const msg = await postMessage(channelId, content);
      setMessages(prev => [...prev, msg]);
    } catch (e) {
      console.error(e);
    }
  };

  return { messages, newMessage, setNewMessage, sendMessage };
};

export default useChannel;