/**
 * @file Post.jsx
 * @description Component to render an individual post.
 * Displays post header (author info), content via PostBody, and footer with like button and hashtags.
 */
import React from 'react';
import { Heart } from 'lucide-react';
import PostBody from './PostBody';
import useUser from '../../hooks/useUser';
import '../../styles/UniversitySocialFeed.css';
const Post = ({ post, onLike }) => {
    const { user } = useUser();
    const isLiked = user && post.likes && post.likes.includes(user._id);

    const renderProfileImage = () => {
        if (post.imageUrl) {
            return (
                <img
                    src={post.imageUrl}
                    alt={post.senderName || 'Profile'}
                    className="profile-image"
                />
            );
        }
        const firstLetter = post.senderName ? post.senderName.charAt(0).toUpperCase() : 'A';
        return (
            <div className="profile-placeholder">
                {firstLetter}
            </div>
        );
    };

    return (
        <div className="post">
            <div className="post-header">
                {renderProfileImage()}
                <div className="poster-info">
                    <h2>{post.senderName || 'Anonymous'}</h2>
                    <p className="department">{post.department || 'Student'}</p>
                </div>
            </div>

            <PostBody content={post.content} />

            <div className="post-footer">
                <div className="likes">
                    <button className="like-button" onClick={onLike}>
                        <Heart
                            className={`heart-icon ${isLiked ? 'filled' : ''}`}
                            size={18}
                            color="#ff4d6d"
                        />
                    </button>
                    <span>{post.likes ? post.likes.length : 0}</span>
                </div>
                <div className="tags">
                    {post.hashtags && post.hashtags.map((tag) => (
                        <span className="tag" key={tag}>#{tag}</span>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Post;
