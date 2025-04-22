import React, { useState } from 'react';
import '../../styles/NewChannelModal.css';

const NewChannelModal = ({ friends, onClose }) => {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState([]);

  const filtered = friends.filter(f =>
    f.username.toLowerCase().includes(search.toLowerCase())
  );

  const toggle = id => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleCreate = () => {
    // TODO: wire up createChannel API with `selected`
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h4>Create New Channel</h4>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <input
          className="modal-search"
          type="text"
          placeholder="Search friends..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <ul className="modal-list">
          {filtered.map(f => (
            <li key={f.id}>
              <label>
                <input
                  type="checkbox"
                  checked={selected.includes(f.id)}
                  onChange={() => toggle(f.id)}
                />
                {f.username}
              </label>
            </li>
          ))}
        </ul>
        <button
          className="modal-create-btn"
          disabled={selected.length < 2}
          onClick={handleCreate}
        >
          Create
        </button>
      </div>
    </div>
  );
};

export default NewChannelModal;
