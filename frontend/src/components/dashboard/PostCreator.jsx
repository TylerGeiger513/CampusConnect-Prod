/**
 * @file PostCreator.jsx
 * @description Parent component for creating a new post.
 * Renders the RichPostEditor and action buttons.
 */
import React from 'react';
import RichPostEditor from './RichPostEditor';
import '../../styles/UniversitySocialFeed.css';

const PostCreator = ({ newPost = '', setNewPost, onSubmit, onCancel }) => {
    return (
        <div className="post-creator">
            <RichPostEditor
                value={newPost}
                onChange={setNewPost}
                placeholder="What's on your mind?"
            />
            <div className="post-actions">
                <button className="post-submit" onClick={onSubmit}>
                    Post
                </button>
                <button className="post-cancel" onClick={onCancel}>
                    Cancel
                </button>
            </div>
        </div>
    );
};

export default PostCreator;
