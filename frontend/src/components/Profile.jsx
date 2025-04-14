import React, { useState } from 'react';
import Header from './common/Header'; 
import SideNav from './dashboard/SideNav'; 
import ProfileCard from './profile/ProfileCard';
import UserInfoCard from './profile/UserInfoCard';
import FriendsList from './profile/ProfileFriendsList';
import '../styles/Profile.css';

const Profile = () => {
  // State for user data remains unchanged.
  const [profileData, setProfileData] = useState({
    profileImg: 'https://media.istockphoto.com/id/1587604256/photo/portrait-lawyer-and-black-woman-with-tablet-smile-and-happy-in-office-workplace-african.jpg?s=612x612&w=0&k=20&c=n9yulMNKdIYIQC-Qns8agFj6GBDbiKyPRruaUTh4MKs=',
    userName: 'Joe Schmo',
    fullName: 'Johnathan Schmo',
    email: 'john.schmo@example.com',
    school: 'West Chester University',
    major: 'Computer Science',
  });

  // This function handles profile info updates.
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

  return (
    <div>
      <Header />
      <div className="profile-page-container">
        <div className="sidenav-column">
          <SideNav />
        </div>
        <div className="profile-content">
          <div className="left-column">
            <ProfileCard
              profileImg={profileData.profileImg}
              userName={profileData.userName}
              major={profileData.major}
              school={profileData.school}
            />
          </div>
          <div className="right-column">
            <div className="user-info-friends">
              <div className="user-info-card-wrapper">
                <UserInfoCard
                  fullName={profileData.fullName}
                  userName={profileData.userName}
                  email={profileData.email}
                  school={profileData.school}
                  major={profileData.major}
                  onUpdate={handleInfoUpdate}
                />
              </div>
              <div className="friends-list-wrapper">
                <FriendsList />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
