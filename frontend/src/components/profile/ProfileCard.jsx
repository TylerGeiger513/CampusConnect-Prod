import React from 'react';
import '../../styles/ProfileCard.css';

// Changed prop 'school' to 'campus'
const ProfileCard = ({ profileImg, username, major, campus }) => {
  const getInitials = (name) => {
    return name ? name.charAt(0).toUpperCase() : '?';
  };

  return (
    <div className="profile-card">
      {profileImg ? (
        <img src={profileImg} alt="Profile" className="profile-image" />
      ) : (
        // Default avatar div when no image
        <div className="profile-image default-avatar">
          <span>{getInitials(username)}</span>
        </div>
      )}
      <h3 className="profile-username">{username}</h3>
      <p className="profile-major">{major}</p>
      {/* Display campus name */}
      <p className="profile-campus">{campus}</p>
    </div>
  );
};

export default ProfileCard;
