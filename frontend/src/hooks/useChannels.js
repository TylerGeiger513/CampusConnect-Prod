import { useState, useEffect, useRef } from 'react';
import {
  getChannelsMeta,
  searchChannels,
  markChannelRead,
  postMessage,
  findOrCreateDMChannel,
} from '../utils/channelHandler';
import { createSocket } from '../utils/api';

export default function useChannels() {
  const [channels, setChannels] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [active, setActive] = useState(null);
  const [search, setSearch] = useState('');
  const socket = useRef(null);

  useEffect(() => {
    socket.current = createSocket('/channels');
    socket.current.on('messageReceived', () => refresh());
    socket.current.on('channelRead', ({ channelId }) => {
      setChannels(ch => ch.map(c => c.channelId===channelId?{...c, unreadCount:0}:c));
    });
    return () => socket.current.disconnect();
  }, []);

  const refresh = async () => {
    const data = await getChannelsMeta();
    setChannels(data);
    applySearch(search, data);
  };

  useEffect(() => {
    refresh();
  }, []);

  const applySearch = (q, list=channels) => {
    if (!q) return setFiltered(list);
    searchChannels(q).then(setFiltered);
  };

  const pick = async ch => {
    setActive(ch);
    if (ch.unreadCount) {
      await markChannelRead(ch.channelId);
      socket.current.emit('markRead', ch.channelId);
    }
  };

  const newChannel = async userId => {
    // open or create a 1:1 DM, then reload list
    const ch = await findOrCreateDMChannel(userId);
    await refresh();
    setActive(ch);
  };

  return {
    channels: filtered,
    active,
    pick,
    search, setSearch: q => { setSearch(q); applySearch(q); },
    newChannel,
  };
}
