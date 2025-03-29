import { useState, useEffect, useRef } from 'react';
import { getChannelMessages, postMessage, findOrCreateDMChannel } from '../utils/channelHandler';
import { createSocket } from '../utils/api';
import useUser from './useUser';

const useChannel = () => {
    const [activeChannel, setActiveChannel] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const { user } = useUser();
    const socketRef = useRef(null);

    // Initialize socket connection once
    useEffect(() => {
        socketRef.current = createSocket();
        return () => {
            socketRef.current?.disconnect();
        };
    }, []);

    // Join room + listen for live messages
    useEffect(() => {
        if (!activeChannel || !socketRef.current) return;

        const socket = socketRef.current;
        socket.emit('joinChannel', activeChannel._id);

        const handleIncomingMessage = (message) => {
            if (message.senderId === user._id) return;

            if (message.channelId === activeChannel._id) {
                setMessages(prev => [...prev, message]);
            }
        };

        socket.on('messageReceived', handleIncomingMessage);

        return () => {
            socket.off('messageReceived', handleIncomingMessage);
            socket.emit('leaveRoom', activeChannel._id); 
        };
    }, [activeChannel]);

    useEffect(() => {
        const fetchMessages = async () => {
            if (!activeChannel) {
                setMessages([]);
                return;
            }
            try {
                const data = await getChannelMessages(activeChannel._id);
                setMessages(Array.isArray(data.messages) ? data.messages : []);
            } catch (error) {
                console.error('Error fetching channel messages:', error);
            }
        };
        fetchMessages();
    }, [activeChannel]);

    const sendMessage = async (content) => {
        if (!activeChannel) return;
        try {
            const message = await postMessage(activeChannel._id, content);
            setMessages((prev) => [...prev, message]);
            setNewMessage('');
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    const toggleFriendChannel = async (friendId) => {
        const socket = socketRef.current;

        if (activeChannel && activeChannel.friendId === friendId) {
            if (socket && activeChannel._id) {
                socket.emit('leaveChannel', activeChannel._id);
            }

            // Deactivate channel
            setActiveChannel(null);
            setMessages([]);
            return;
        }

        try {
            const channel = await findOrCreateDMChannel(friendId);

            if (socket && activeChannel?._id) {
                socket.emit('leaveChannel', activeChannel._id);
            }

            // Join new channel
            setActiveChannel({ ...channel, friendId });
        } catch (error) {
            console.error('Error setting DM channel:', error);
        }
    };

    return { activeChannel, messages, newMessage, setNewMessage, sendMessage, toggleFriendChannel };
};

export default useChannel;
