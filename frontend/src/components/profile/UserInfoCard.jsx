import React, { useState, useEffect } from 'react';
import '../../styles/UserInfoCard.css';
import { getCampuses } from '../../utils/campusHandler'; // Import campus handler

// Changed prop 'campus' to 'campusName'
const UserInfoCard = ({ fullName, username, email, campusName, major, onUpdate }) => {
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState(''); // State for password mismatch error
  const [campuses, setCampuses] = useState([]); // State for campuses list

  // Temporary fields to store edits before saving
  const [tempFullName, setTempFullName] = useState(fullName);
  const [tempUserName, setTempUserName] = useState(username);
  const [tempEmail, setTempEmail] = useState(email);
  const [tempCampusName, setTempCampusName] = useState(campusName); // Keep for display
  const [tempCampusId, setTempCampusId] = useState(''); // Add state for selected campus ID
  const [tempMajor, setTempMajor] = useState(major);
  const [tempOldPassword, setTempOldPassword] = useState(''); // Add state for old password
  const [tempPassword, setTempPassword] = useState('');
  const [tempConfirmPassword, setTempConfirmPassword] = useState('');

  // Fetch campuses on mount
  useEffect(() => {
    const fetchCampuses = async () => {
      try {
        const data = await getCampuses();
        setCampuses(data || []); // Ensure campuses is an array
        // Find the ID for the initial campus name
        const initialCampus = data.find(c => c.name === campusName);
        if (initialCampus) {
          setTempCampusId(initialCampus._id);
        }
      } catch (error) {
        console.error('Error fetching campuses:', error);
      }
    };
    fetchCampuses();
  }, []); // Fetch only once on mount

  // Update temp state if props change (e.g., after successful save)
  useEffect(() => {
    setTempFullName(fullName);
    setTempUserName(username);
    setTempEmail(email);
    setTempCampusName(campusName); // Update display name
    setTempMajor(major);
    // Find the corresponding campus ID when props change
    const currentCampus = campuses.find(c => c.name === campusName);
    setTempCampusId(currentCampus ? currentCampus._id : '');
  }, [fullName, username, email, campusName, major, campuses]); // Add campuses to dependency array


  // Save button handler
  const handleSave = () => {
    setError(''); // Reset error

    // --- Frontend Validations ---
    if (!tempCampusId) {
      setError('Please select a campus.');
      return;
    }
    if (tempPassword && !tempOldPassword) {
      setError('Current password is required to set a new password.');
      return;
    }
    if (tempPassword && tempPassword !== tempConfirmPassword) {
      setError('New passwords do not match.');
      return;
    }
    // --- End Frontend Validations ---


    const updatePayload = {
      fullName: tempFullName,
      username: tempUserName,
      email: tempEmail,
      campusId: tempCampusId, // Ensure this is not empty due to check above
      major: tempMajor,
    };

    // Include password fields only if a new password is being set and is not empty
    if (tempPassword) {
      updatePayload.oldPassword = tempOldPassword; // Already checked if present
      updatePayload.password = tempPassword;
    } else if (tempOldPassword) {
        // If only old password is provided without a new one, don't send password fields.
        // This case shouldn't proceed due to validation above, but added defensively.
        console.warn("Old password provided without new password - not sending password fields.");
    }


    console.log("Calling onUpdate with payload:", updatePayload); // Log before calling parent
    onUpdate(updatePayload);

    // Reset password fields after attempting save (consider moving this inside onUpdate's success logic)
    setTempOldPassword('');
    setTempPassword('');
    setTempConfirmPassword('');
    setEditing(false); // Exit editing mode
  };

  const handleCancel = () => {
    // Reset fields to original values from props
    setTempFullName(fullName);
    setTempUserName(username);
    setTempEmail(email);
    setTempCampusName(campusName); // Reset display name
    setTempMajor(major);
    // Reset campus ID based on original name
    const originalCampus = campuses.find(c => c.name === campusName);
    setTempCampusId(originalCampus ? originalCampus._id : '');
    // Reset password fields, error, and setEditing(false)
    setTempOldPassword(''); // Clear old password field
    setTempPassword('');
    setTempConfirmPassword('');
    setError(''); // Clear any errors
    setEditing(false); // Exit editing mode
  };


  return (
    <div className="user-info-card">
      {editing ? (
        <div>
          {/* ... existing input fields for fullName, username, email ... */}
           <div className="info-field">
            <label>Full Name:</label>
            <input
              type="text"
              value={tempFullName || ''}
              onChange={(e) => setTempFullName(e.target.value)}
            />
          </div>
          <div className="info-field">
            <label>Username:</label>
            <input
              type="text"
              value={tempUserName || ''}
              onChange={(e) => setTempUserName(e.target.value)}
            />
          </div>
          <div className="info-field">
            <label>Email:</label>
            <input
              type="email" // Use type="email" for better validation
              value={tempEmail || ''}
              onChange={(e) => setTempEmail(e.target.value)}
            />
          </div>
          {/* Campus Field - Changed to Select */}
          <div className="info-field">
            <label>Campus:</label>
            <select
              value={tempCampusId}
              onChange={(e) => setTempCampusId(e.target.value)}
              required // Make selection required if applicable
            >
              <option value="">Select your campus</option>
              {campuses.map((campus) => (
                <option key={campus._id} value={campus._id}>
                  {campus.name}
                </option>
              ))}
            </select>
          </div>
          {/* Major Field */}
          <div className="info-field">
            <label>Major:</label>
             <input
              type="text"
              value={tempMajor || ''} // Handle potential null/undefined
              onChange={(e) => setTempMajor(e.target.value)}
               placeholder="Enter major"
            />
          </div>
           {/* Password Fields */}
           <div className="info-field">
            <label>Old Password:</label>
            <input
              type="password"
              placeholder="Required to change password"
              value={tempOldPassword}
              onChange={(e) => setTempOldPassword(e.target.value)}
            />
          </div>
           <div className="info-field">
            <label>New Password:</label>
            <input
              type="password"
              placeholder="Leave blank to keep current"
              value={tempPassword}
              onChange={(e) => setTempPassword(e.target.value)}
            />
          </div>
          <div className="info-field">
            <label>Confirm Password:</label>
            <input
              type="password"
              placeholder="Confirm new password"
              value={tempConfirmPassword}
              onChange={(e) => setTempConfirmPassword(e.target.value)}
            />
          </div>
          {error && <p className="error-message">{error}</p>}
          <div className="edit-actions">
             <button
               className="save-btn"
               onClick={handleSave}
               disabled={!tempCampusId || (tempPassword && !tempOldPassword)} // Example disable condition
             >
               Save
             </button>
             <button className="cancel-btn" onClick={handleCancel}>Cancel</button>
          </div>

        </div>
      ) : (
        <div className="display-mode">
          {/* ... existing display paragraphs ... */}
          <p><strong>Full Name:</strong> {fullName}</p>
          <p><strong>Username:</strong> {username}</p>
          <p><strong>Email:</strong> {email}</p>
          {/* Display Campus Name */}
          <p><strong>Campus:</strong> {campusName || 'Not specified'}</p>
          <p><strong>Major:</strong> {major || 'Not specified'}</p>
          <button className="edit-btn" onClick={() => setEditing(true)}>Edit</button>
        </div>
      )}
    </div>
  );
};

export default UserInfoCard;
