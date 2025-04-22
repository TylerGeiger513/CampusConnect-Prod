import React from 'react';

const FriendSuggestionCard = ({ suggestion, onAdd }) => (
  <div className="suggestion-card">
    <div className="suggestion-avatar">
      {suggestion.username.charAt(0).toUpperCase()}
    </div>
    <div className="suggestion-name">
      {suggestion.fullName || suggestion.username}
    </div>
    <div className="suggestion-message">
      {suggestion.message}
    </div>
    <button className="suggestion-add-btn" onClick={onAdd}>
      Connect
    </button>
  </div>
);

export default FriendSuggestionCard;
