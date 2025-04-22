import React, { useState, useEffect } from 'react';
import '../../styles/ChannelList.css';
import { getFriendsList } from '../../utils/friendsHandler';
import NewChannelModal from './NewChannelModal';

const ChannelList = () => {
  const [showModal, setShowModal] = useState(false);
  const [friends, setFriends] = useState([]);

  useEffect(() => {
    (async () => {
      const data = await getFriendsList();
      setFriends(data.friends || []);
    })();
  }, []);

  return (
    <div className="channel-list">
      <div className="channel-list-header">
        <h3>Channels</h3>
        <button
          className="new-channel-btn"
          onClick={() => setShowModal(true)}
        >
          + New Channel
        </button>
      </div>
      <ul>
        <li># general</li>
        <li># random</li>
        <li># development</li>
      </ul>
      {showModal && (
        <NewChannelModal
          friends={friends}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

export default ChannelList;
