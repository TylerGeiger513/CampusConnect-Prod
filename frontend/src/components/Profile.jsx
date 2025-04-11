import React, { useState } from 'react';
import SideNav from './dashboard/SideNav';
import ProfileCard from './profile/ProfileCard';
import UserInfoCard from './profile/UserInfoCard';
import FriendsList from './profile/ProfileFriendsList';
import '../styles/Profile.css';

const Profile = () => {
  // State for user data
  const [profileData, setProfileData] = useState({
    profileImg: 'https://media.istockphoto.com/id/1587604256/photo/portrait-lawyer-and-black-woman-with-tablet-smile-and-happy-in-office-workplace-african.jpg?s=612x612&w=0&k=20&c=n9yulMNKdIYIQC-Qns8agFj6GBDbiKyPRruaUTh4MKs=',
    userName: 'Joe Schmo',
    fullName: 'Johnathan Schmo',
    email: 'john.schmo@example.com',
    school: 'West Chester University',
    major: 'Computer Science',
  });

  // State for user’s friends
  const [friends, setFriends] = useState([
    { id: 1, name: 'Random1', blocked: false },
    { id: 2, name: 'Random2', blocked: false },
    { id: 3, name: 'Random3', blocked: true },
  ]);

  // Update user info when user clicks "Save" in UserInfoCard
  const handleInfoUpdate = (newInfo) => {
    setProfileData({
      ...profileData,
      fullName: newInfo.fullName,
      userName: newInfo.userName,
      email: newInfo.email,
      school: newInfo.school,
      major: newInfo.major,
    });
  };

  // Toggle blocked/unblocked status for a friend
  const handleBlockToggle = (friendId) => {
    setFriends((prev) =>
      prev.map((f) =>
        f.id === friendId ? { ...f, blocked: !f.blocked } : f
      )
    );
  };

  return (
    <div className="profile-page-container">
      <div className="sidenav-column">
        <SideNav />
      </div>
      <div className="left-column">
        <ProfileCard
          profileImg={profileData.profileImg}
          userName={profileData.userName}
          major={profileData.major}
          school={profileData.school}
        />
      </div>
      <div className="right-column">
        <UserInfoCard
          fullName={profileData.fullName}
          userName={profileData.userName}
          email={profileData.email}
          school={profileData.school}
          major={profileData.major}
          onUpdate={handleInfoUpdate}
        />
        <FriendsList
          friends={friends}
          onBlockToggle={handleBlockToggle}
        />
      </div>
    </div>
  );
};

export default Profile;
