/**
 * @file PostsFeed.jsx
 * @description React component for displaying and creating campus-wide posts.
 * Uses the `usePosts` hook for state management, real-time updates, and API interactions.
 */

import React from 'react';
import { Heart } from 'lucide-react';
import usePosts from '../../hooks/usePosts';
import '../../styles/UniversitySocialFeed.css';
import Post from './Post';

const PostsFeed = () => {
  // Get posts state and functions from the custom hook.
  const { posts, newPost, setNewPost, sendPost, addLikeToPost } = usePosts();

  return (
    <div className="posts-feed">
      {/* Header */}
      <header className="posts-header">
        <h1>Campus Posts</h1>
      </header>

      {/* Post Creation Area */}
      <div className="create-post">
        <textarea
          className="post-input"
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
          placeholder="What's on your mind?"
          autoFocus
        />
        <div className="post-actions">
          <button className="post-submit" onClick={sendPost}>
            Post
          </button>
        </div>
      </div>

      {/* Posts List */}
      <div className="feed-content">
        {posts.map((post) => (
          <Post post={post} onLike={() => addLikeToPost(post._id)} />
        ))}
      </div>
    </div>
  );
};

export default PostsFeed;
