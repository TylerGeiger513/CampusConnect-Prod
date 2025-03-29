// friendsHandler.js

import { api } from './api'; 

/**
 * Retrieves the current user's friends list.
 * Expects the backend to return an object like { friends: [...] }.
 */
export const getFriendsList = async () => {
  try {
    const response = await api.post('/friends/friendsList');
    return response.data;
  } catch (error) {
    console.error('Error getting friends list:', error);
    throw error;
  }
};

/**
 * Retrieves incoming friend requests.
 * Expects the backend to return an object like { requests: [...] }.
 */
export const getIncomingRequests = async () => {
  try {
    const response = await api.post('/friends/getIncomingRequests');
    return response.data;
  } catch (error) {
    console.error('Error getting incoming friend requests:', error);
    throw error;
  }
};

/**
 * Retrieves friend requests that the user has sent.
 * Expects the backend to return an object like { requests: [...] }.
 */
export const getSentRequests = async () => {
  try {
    const response = await api.post('/friends/getSentRequests');
    return response.data;
  } catch (error) {
    console.error('Error getting sent friend requests:', error);
    throw error;
  }
};

/**
 * Retrieves the list of blocked users.
 * Expects the backend to return an object like { blockedUsers: [...] }.
 */
export const getBlockedUsers = async () => {
  try {
    const response = await api.post('/friends/getBlockedUsers');
    return response.data;
  } catch (error) {
    console.error('Error getting blocked users:', error);
    throw error;
  }
};

/**
 * Sends a friend request to the target user.
 * @param {string} target - The identifier (or email) of the user to send a request to.
 */
export const sendFriendRequest = async (target) => {
  try {
    const response = await api.post('/friends/request', { target });
    return response.data;
  } catch (error) {
    console.error('Error sending friend request:', error);
    throw error;
  }
};

/**
 * Accepts a friend request from the target user.
 * @param {string} target - The identifier of the user whose request to accept.
 */
export const acceptFriendRequest = async (target) => {
  try {
    const response = await api.post('/friends/accept', { target });
    return response.data;
  } catch (error) {
    console.error('Error accepting friend request:', error);
    throw error;
  }
};

/**
 * Denies a friend request from the target user.
 * @param {string} target - The identifier of the user whose request to deny.
 */
export const denyFriendRequest = async (target) => {
  try {
    const response = await api.post('/friends/deny', { target });
    return response.data;
  } catch (error) {
    console.error('Error denying friend request:', error);
    throw error;
  }
};

/**
 * Removes the target user from the friends list.
 * @param {string} target - The identifier of the friend to remove.
 */
export const removeFriend = async (target) => {
  try {
    const response = await api.post('/friends/remove', { target });
    return response.data;
  } catch (error) {
    console.error('Error removing friend:', error);
    throw error;
  }
};

/**
 * Cancels a previously sent friend request to the target user.
 * @param {string} target - The identifier of the user to cancel the request for.
 */
export const cancelFriendRequest = async (target) => {
  try {
    const response = await api.post('/friends/cancel', { target });
    return response.data;
  } catch (error) {
    console.error('Error cancelling friend request:', error);
    throw error;
  }
};

/**
 * Blocks the target user.
 * @param {string} target - The identifier of the user to block.
 */
export const blockUser = async (target) => {
  try {
    const response = await api.post('/friends/block', { target });
    return response.data;
  } catch (error) {
    console.error('Error blocking user:', error);
    throw error;
  }
};

/**
 * Unblocks the target user.
 * @param {string} target - The identifier of the user to unblock.
 */
export const unblockUser = async (target) => {
  try {
    const response = await api.post('/friends/unblock', { target });
    return response.data;
  } catch (error) {
    console.error('Error unblocking user:', error);
    throw error;
  }
};
