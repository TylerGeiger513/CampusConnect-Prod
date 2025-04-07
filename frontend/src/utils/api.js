import axios from 'axios';
import io from 'socket.io-client';

const isProd = process.env.NODE_ENV === 'production';
const API_BASE = isProd ? '/api' : 'http://localhost:8081/api';
const SOCKET_BASE = isProd ? undefined : 'http://localhost:8081'; // undefined means "same origin" in production

export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

export const createSocket = () => {
  return io(`${SOCKET_BASE ?? ''}/channels`, {
    path: '/channels/socket.io',
    withCredentials: true,
    transports: ['websocket'], // force websocket if you want
  });
};

export const createNotificationsSocket = () => {
  return io(`${SOCKET_BASE ?? ''}/notifications`, {
    path: '/notifications/socket.io',
    withCredentials: true,
  });
}

export const createPostsSocket = (campusId) => {
  return io(`${SOCKET_BASE ?? ''}/posts`, {
    query: { campusId },
    path: '/posts/socket.io',
    withCredentials: true,
  });
}