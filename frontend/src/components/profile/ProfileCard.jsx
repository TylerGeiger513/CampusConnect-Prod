import React from 'react';
import '../../styles/ProfileCard.css';

const ProfileCard = ({ profileImg, userName, major, school }) => {
  return (
    <div className="profile-card">
      <img src={profileImg} alt="Profile" className="profile-image" />
      <h3 className="profile-username">{userName}</h3>
      <p className="profile-major">{major}</p>
      <p className="profile-school">{school}</p>
    </div>
  );
};

export default ProfileCard;
