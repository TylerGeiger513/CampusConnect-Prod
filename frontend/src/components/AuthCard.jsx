import React, { useState, useEffect, useRef } from 'react';
import '../styles/AuthCard.css';
import { login, signup } from '../utils/authHandler';
import { getCampuses } from '../utils/campusHandler';

const AuthCard = ({ defaultMode, prefilledEmail }) => {
  const [mode, setMode] = useState(defaultMode || 'signup');
  const [cardHeight, setCardHeight] = useState(0);
  const [campuses, setCampuses] = useState([]);
  const sliderRef = useRef(null);

  // Update height based solely on the active panel's scrollHeight.
  const updateHeight = () => {
    if (sliderRef.current) {
      const activeIndex = mode === 'signup' ? 0 : 1;
      const activePanel = sliderRef.current.children[activeIndex];
      if (activePanel) {
        setCardHeight(activePanel.scrollHeight);
      }
    }
  };

  useEffect(() => {
    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, [mode]);

  // Fetch campuses on mount.
  useEffect(() => {
    const fetchCampuses = async () => {
      try {
        const data = await getCampuses();
        setCampuses(data);
      } catch (error) {
        console.error('Error fetching campuses:', error);
      }
    };
    fetchCampuses();
  }, []);

  // Toggle mode and update height immediately.
  const handleToggle = (newMode) => {
    if (sliderRef.current) {
      const activeIndex = newMode === 'signup' ? 0 : 1;
      const newHeight = sliderRef.current.children[activeIndex].scrollHeight;
      setMode(newMode);
      setCardHeight(newHeight);
    }
  };

  // Handle sign up form submission.
  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const credentials = {
      username: formData.get('signup-username'),
      email: formData.get('signup-email'),
      password: formData.get('signup-password'),
      campus: formData.get('signup-campus'),
    };
    try {
      await signup(credentials);
      // On success, redirect to dashboard
      window.location.href = '/dashboard';
    } catch (error) {
      console.error('Signup failed:', error);
    }
  };

  // Handle sign in form submission.
  const handleSigninSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const credentials = {
      identifier: formData.get('signin-identifier'), // username or email
      password: formData.get('signin-password'),
    };
    try {
      await login(credentials);
      // On success, redirect to dashboard
      window.location.href = '/dashboard';
    } catch (error) {
      console.error('Sign in failed:', error);
    }
  };

  return (
    <div className="auth-card-container">
      <div className="toggle-header">
        <span
          className={`toggle-label ${mode === 'signup' ? 'active' : ''}`}
          onClick={() => handleToggle('signup')}
        >
          Sign Up
        </span>
        <span
          className={`toggle-label ${mode === 'signin' ? 'active' : ''}`}
          onClick={() => handleToggle('signin')}
        >
          Sign In
        </span>
        <div
          className={`toggle-indicator ${mode === 'signup' ? 'left' : 'right'}`}
        />
      </div>

      {/* Auth card's height is determined solely by the active panel */}
      <div className="auth-card" style={{ height: cardHeight, overflow: 'hidden' }}>
        <div
          className="slider"
          ref={sliderRef}
          style={{
            transform: mode === 'signup' ? 'translateX(0%)' : 'translateX(-50%)',
          }}
        >
          {/* Sign Up Panel */}
          <div className="panel">
            <h2>Create Account</h2>
            <form className="auth-form" onSubmit={handleSignupSubmit}>
              <label htmlFor="signup-username">Username</label>
              <input
                id="signup-username"
                name="signup-username"
                type="text"
                placeholder="Enter your username"
                required
              />

              <label htmlFor="signup-email">Email</label>
              <input
                id="signup-email"
                name="signup-email"
                type="email"
                placeholder="Enter your email"
                defaultValue={mode === 'signup' ? prefilledEmail : ''}
                required
              />

              <label htmlFor="signup-password">Password</label>
              <input
                id="signup-password"
                name="signup-password"
                type="password"
                placeholder="Create a password"
                required
              />

              <label htmlFor="signup-campus">Campus</label>
              <select
                id="signup-campus"
                name="signup-campus"
                required
              >
                <option value="">Select your campus</option>
                {campuses.map((campus) => (
                  <option key={campus._id} value={campus._id}>
                    {campus.name}
                  </option>
                ))}
              </select>

              <button type="submit" className="submit-button">
                Sign Up
              </button>
            </form>
          </div>

          {/* Sign In Panel */}
          <div className="panel">
            <h2>Welcome Back</h2>
            <form className="auth-form" onSubmit={handleSigninSubmit}>
              <label htmlFor="signin-identifier">Username or Email</label>
              <input
                id="signin-identifier"
                name="signin-identifier"
                type="text"
                placeholder="Username or Email"
                defaultValue={mode === 'signin' ? prefilledEmail : ''}
                required
              />

              <label htmlFor="signin-password">Password</label>
              <input
                id="signin-password"
                name="signin-password"
                type="password"
                placeholder="Password"
                required
              />
              <button type="submit" className="submit-button">
                Sign In
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthCard;
