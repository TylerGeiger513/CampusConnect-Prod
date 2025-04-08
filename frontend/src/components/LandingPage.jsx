import React, { useState } from 'react';
import ParticleBackground from './common/ParticleBackground';
import Header from './common/Header';
import '../styles/LandingPage.css';
import AuthCard from './AuthCard';
import { checkUserExists } from '../utils/authHandler';

const LandingPlaceholder = () => {
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('signup');
  const [prefilledEmail, setPrefilledEmail] = useState('');
  const [hideLanding, setHideLanding] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const email = e.target.elements.email.value;
    try {
      const result = await checkUserExists(email);
      console.log('User exists:', result.exists);
      // If the email exists, set mode to 'signin'; otherwise, 'signup'
      setAuthMode(result.exists ? 'signin' : 'signup');
      setPrefilledEmail(email);
      setShowAuth(true);
    } catch (error) {
      console.error("Error checking user existence", error);
    }
  };

  const handleAnimationEnd = (e) => {
    // When fadeUp ends, hide the landing content by setting display: none.
    if (e.animationName === 'fadeUp') {
      setHideLanding(true);
    }
    // When fadeInDown ends, ensure it's not hidden.
    if (e.animationName === 'fadeInDown') {
      setHideLanding(false);
    }
  };

  return (
    <div className="landing-page">
      <Header />
      <ParticleBackground />
      <div
        className={`landing-content ${showAuth ? 'fade-up' : 'fade-in'}`}
        onAnimationEnd={handleAnimationEnd}
        style={hideLanding ? { display: 'none' } : {}}
      >
        <h1 className="landing-title">Campus Connect</h1>
        <p className="landing-description">
          Sign up to see what your peers and classmates are up to! + CI/CD WORKS!!!
        </p>
        <div className="signup-div">
          <form className="landing-form" onSubmit={handleSubmit}>
            <input
              type="email"
              name="email"
              className="email-input"
              placeholder="Enter your email address"
              required
            />
            <button type="submit" className="signup-button">
              Sign Up
            </button>
          </form>
        </div>
      </div>
      {showAuth && (
        <div className="auth-card-wrapper pop-in">
          <AuthCard defaultMode={authMode} prefilledEmail={prefilledEmail} />
        </div>
      )}
    </div>
  );
};

export default LandingPlaceholder;
