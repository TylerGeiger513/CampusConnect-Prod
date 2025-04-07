/**
 * @file postsHandler.js
 * @description Utility functions for interacting with the posts API.
 */
import { api } from './api';

export const getPosts = async (campus) => {
  const response = await api.get(`/posts/${campus}`);
  return response.data;
};

/**
 * Creates a new post.
 * @param {string} campus - Campus identifier.
 * @param {string} content - Post content.
 * @param {string[]} hashtags - Array of hashtag strings (without the '#' prefix).
 * @returns {Promise<Object>} The created post.
 */
export const createPost = async (campus, content, hashtags = []) => {
  const response = await api.post('/posts', { campusId: campus, content, hashtags });
  return response.data;
};

export const likePost = async (postId) => {
  const response = await api.post(`/posts/${postId}/like`);
  return response.data;
};
