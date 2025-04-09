/**
 * @file usePosts.js
 * @description Custom hook for managing campus-wide posts with real-time updates.
 */
import { useState, useEffect, useRef } from 'react';
import { getPosts, createPost, likePost } from '../utils/postsHandler';
import { createPostsSocket } from '../utils/api';
import useUser from './useUser';


const extractHashtags = (text) => {
    const regex = /#[\w]{1,32}/g;
    const matches = text.match(regex);
    return matches ? [...new Set(matches.map(tag => tag.substring(1)))] : [];
};

const usePosts = () => {
    const [posts, setPosts] = useState([]);
    const [newPost, setNewPost] = useState('');
    const { user } = useUser();
    const socketRef = useRef(null);

    useEffect(() => {
        const campus = user.campus?.id || user.campus;
        socketRef.current = createPostsSocket(campus);
        return () => {
            socketRef.current?.disconnect();
        };
    }, [user]);

    useEffect(() => {
        if (!user || !socketRef.current) return;
        const campus = user.campus?.id || user.campus;
        if (!campus) return;
        const socket = socketRef.current;
        socket.emit('joinCampus', campus);

        const handlePostCreated = (post) => {
            if (post.senderId === user._id) return;
            setPosts((prevPosts) => [...prevPosts, post]);
        };

        const handlePostLiked = (post) => {
            setPosts((prevPosts) =>
                prevPosts.map((p) => (p._id === post._id ? post : p))
            );
        };

        socket.on('postCreated', handlePostCreated);
        socket.on('postLiked', handlePostLiked);

        return () => {
            socket.off('postCreated', handlePostCreated);
            socket.off('postLiked', handlePostLiked);
            socket.emit('leaveCampus', campus);
        };
    }, [user]);

    useEffect(() => {
        const fetchPosts = async () => {
            if (!user || !user.campus?.id) {
                setPosts([]);
                return;
            }
            try {
                const data = await getPosts(user.campus.id);
                if (!data || !Array.isArray(data)) {
                    setPosts([]);
                    return;
                }
                data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                setPosts(data);
            } catch (error) {
                console.error('Error fetching posts:', error);
            }
        };
        fetchPosts();
    }, [user]);

    const sendPost = async () => {
        if (!user || !user.campus?.id || !newPost.trim()) return;
        try {
            const hashtags = extractHashtags(newPost);
            const post = await createPost(user.campus.id, newPost, hashtags);
            setPosts((prevPosts) => [...prevPosts, post]);
            setNewPost('');
        } catch (error) {
            console.error('Error creating post:', error);
        }
    };

    const addLikeToPost = async (postId) => {
        try {
            const updatedPost = await likePost(postId);
            setPosts((prevPosts) =>
                prevPosts.map((p) => (p._id === updatedPost._id ? updatedPost : p))
            );
        } catch (error) {
            console.error('Error liking post:', error);
        }
    };

    return { posts, newPost, setNewPost, sendPost, addLikeToPost };
};

export default usePosts;
