import React, { useState, useEffect } from 'react';
import { getFriendSuggestions, sendFriendRequest } from '../../utils/friendsHandler';
import FriendSuggestionCard from './FriendSuggestionCard';
import './FriendsSuggestionsComponent.css';

const FriendsSuggestionsComponent = () => {
  const [search, setSearch] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  const fetch = async () => {
    try {
      const data = await getFriendSuggestions(search);
      setSuggestions(data);
    } catch (err) { console.error(err); }
  };

  // refetch when search changes (debounce omitted for brevity)
  useEffect(() => { fetch(); }, [search]);

  const handleAdd = async (id) => {
    await sendFriendRequest(id);
    setSuggestions(s => s.filter(x=>x.id!==id));
  };

  return (
    <div className="suggestions-container">
      <h4>People you may know</h4>
      <input
        className="suggestions-search"
        type="text"
        placeholder="Search by name or username…"
        value={search}
        onChange={e => setSearch(e.target.value)}
      />
      <div className="suggestions-grid">
        {suggestions.slice(0,4).map(s => (
          <FriendSuggestionCard key={s.id} suggestion={s} onAdd={()=>handleAdd(s.id)} />
        ))}
      </div>
    </div>
  );
};

export default FriendsSuggestionsComponent;
