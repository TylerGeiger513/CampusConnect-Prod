import React, { useState, useEffect } from 'react';
import useFriends from '../../hooks/useFriends';
import '../../styles/ChannelModal.css';
export default function ChannelModal({ onClose, onCreate }) {
  const { friends } = useFriends();
  const [query, setQ] = useState('');
  const [selected, setSel] = useState(null);
  const list = friends.filter(f =>
    f.username.includes(query) || f.fullName.includes(query)
  );

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <header>
          <input
            placeholder="Search friends..."
            value={query}
            onChange={e=>setQ(e.target.value)}
          />
          <button onClick={onClose}>×</button>
        </header>
        <ul className="friend-list">
          {list.map(f=>(
            <li 
              key={f.id}
              onClick={()=> setSel(selected===f.id ? null : f.id)}
              className={selected===f.id ? 'sel' : ''}
            >
              {f.username}
            </li>
          ))}
        </ul>
        <footer>
          <button 
            disabled={!selected} 
            onClick={()=>onCreate(selected)}
          >
            Create Channel
          </button>
        </footer>
      </div>
    </div>
  );
}
