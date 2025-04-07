/**
 * @file UniversitySocialFeed.jsx
 * @description Main feed component for campus posts.
 * Uses the usePosts hook for API interactions and real-time updates,
 * renders individual posts via the Post component, and uses PostCreator for creating posts.
 */
import React, { useState } from 'react';
import { School } from 'lucide-react';
import usePosts from '../../hooks/usePosts';
import useUser from '../../hooks/useUser';
import Post from './Post';
import '../../styles/UniversitySocialFeed.css';
import PostCreator from './PostCreator';

const UniversitySocialFeed = () => {
  const { posts, newPost, setNewPost, sendPost, addLikeToPost } = usePosts();
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const { user } = useUser();

  const handleCreatePost = async () => {
    if (newPost.trim()) {
      await sendPost();
      setIsCreatingPost(false);
    }
  };

  const renderProfileImage = () => {
    if (user.profilePicture) {
      return (
        <img
          src={user.profilePicture}
          alt={user.username || 'Profile'}
          className="profile-image"
        />
      );
    }
    const firstLetter = user.username ? user.username.charAt(0).toUpperCase() : 'A';
    return (
      <div className="profile-placeholder">
        {firstLetter}
      </div>
    );
  };

  const handleCancelPost = () => setIsCreatingPost(false);

  return (
    <div className="university-feed">
      <header className="university-header">
        <div className="university-title">
          <School className="university-icon" />
          <h1>{user?.campus?.name || 'Your University'}</h1>
        </div>
      </header>

      <div className="feed-content">
        {posts.map((post) => (
          <Post
            key={post._id}
            post={post}
            onLike={() => addLikeToPost(post._id)}
          />
        ))}
      </div>

      <div className="create-post">
        {renderProfileImage()}
        {isCreatingPost ? (
          <PostCreator
            newPost={newPost}
            setNewPost={setNewPost}
            onSubmit={handleCreatePost}
            onCancel={handleCancelPost}
          />
        ) : (
          <button
            className="post-button"
            onClick={() => setIsCreatingPost(true)}
          >
            Create a post
          </button>
        )}
      </div>
    </div>
  );
};

export default UniversitySocialFeed;
