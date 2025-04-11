import React, { useState } from 'react';
import '../../styles/UserInfoCard.css';

const UserInfoCard = ({ fullName, userName, email, school, major, onUpdate }) => {
  const [editing, setEditing] = useState(false);

  // Temporary fields to store edits before saving
  const [tempFullName, setTempFullName] = useState(fullName);
  const [tempUserName, setTempUserName] = useState(userName);
  const [tempEmail, setTempEmail] = useState(email);
  const [tempSchool, setTempSchool] = useState(school);
  const [tempMajor, setTempMajor] = useState(major);

  // Save button handler
  const handleSave = () => {
    onUpdate({
      fullName: tempFullName,
      userName: tempUserName,
      email: tempEmail,
      school: tempSchool,
      major: tempMajor,
    });
    setEditing(false);
  };

  return (
    <div className="user-info-card">
      {editing ? (
        <div>
          <div className="info-field">
            <label>Full Name:</label>
            <input
              type="text"
              value={tempFullName}
              onChange={(e) => setTempFullName(e.target.value)}
            />
          </div>
          <div className="info-field">
            <label>Username:</label>
            <input
              type="text"
              value={tempUserName}
              onChange={(e) => setTempUserName(e.target.value)}
            />
          </div>
          <div className="info-field">
            <label>Email:</label>
            <input
              type="text"
              value={tempEmail}
              onChange={(e) => setTempEmail(e.target.value)}
            />
          </div>
          <div className="info-field">
            <label>School:</label>
            <select
              value={tempSchool}
              onChange={(e) => setTempSchool(e.target.value)}
            >
              <option value="West Chester University">West Chester University</option>
              <option value="Temple University">Temple University</option>
              <option value="Penn State University">Penn State University</option>
            </select>
          </div>
          <div className="info-field">
            <label>Major:</label>
            <select
              value={tempMajor}
              onChange={(e) => setTempMajor(e.target.value)}
            >
              <option value="Computer Science">Computer Science</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <button className="edit-btn" onClick={handleSave}>Save</button>
        </div>
      ) : (
        <div className="display-mode">
          <p><strong>Full Name:</strong> {fullName}</p>
          <p><strong>Username:</strong> {userName}</p>
          <p><strong>Email:</strong> {email}</p>
          <p><strong>School:</strong> {school}</p>
          <p><strong>Major:</strong> {major}</p>
          <button className="edit-btn" onClick={() => setEditing(true)}>Edit</button>
        </div>
      )}
    </div>
  );
};

export default UserInfoCard;
