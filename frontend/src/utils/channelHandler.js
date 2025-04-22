import { api } from './api';

/**
 * Retrieves messages for a given channel.
 */
export const getChannelMessages = async (channelId) => {
  const response = await api.get(`/channels/${channelId}/messages`);
  return response.data;
};

/**
 * Sends a new message in a channel.
 */
export const postMessage = async (channelId, content) => {
  const response = await api.post('/channels/message', { channelId, content });
  return response.data;
};

/**
 * Retrieves or creates a DM channel between the authenticated user and the target user.
 */
export const findOrCreateDMChannel = async (targetUserId) => {
  try {
    const response = await api.post('/channels/channel/getDMChannel', { userId: targetUserId });
    return response.data;
  } catch (error) {
    console.error('Error creating DM channel:', error);
    throw error;
  }
};

export const getChannelsMeta = async () => {
  const res = await api.get('/channels/meta');
  return res.data;
};

export const searchChannels = async (query) => {
  const res = await api.get(`/channels/search?query=${encodeURIComponent(query)}`);
  return res.data;
};

export const createChannel = async (participantIds) => {
  const res = await api.post('/channels/create', { participantIds });
  return res.data;
};

export const markChannelRead = async (channelId) => {
  await api.post('/channels/markRead', { channelId });
};
