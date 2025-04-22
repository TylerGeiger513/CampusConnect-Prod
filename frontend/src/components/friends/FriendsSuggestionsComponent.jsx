import React, { useState, useEffect } from 'react';
import { getFriendSuggestions, sendFriendRequest } from '../../utils/friendsHandler';
import FriendSuggestionCard from './FriendSuggestionCard';
import '../../styles/FriendSuggestions.css';

const FriendsSuggestionsComponent = () => {
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const data = await getFriendSuggestions();
        setSuggestions(data);
      } catch (err) {
        console.error('Error fetching suggestions', err);
      }
    })();
  }, []);

  const handleAdd = async (id) => {
    try {
      await sendFriendRequest(id);
      setSuggestions(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      console.error('Error adding friend', err);
    }
  };

  return (
    <div className="suggestions-container">
      <h4>People you may know</h4>
      <div className="suggestions-grid">
        {suggestions.slice(0,4).map(s => (
          <FriendSuggestionCard 
            key={s.id} 
            suggestion={s} 
            onAdd={() => handleAdd(s.id)} 
          />
        ))}
      </div>
    </div>
  );
};

export default FriendsSuggestionsComponent;
