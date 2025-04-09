// Header.jsx
import React from 'react';
import useUser from '../../hooks/useUser';
import '../../styles/Header.css';
import useTheme from '../../hooks/useTheme';

const toggleTheme = (theme, setTheme) => {
  setTheme(theme === 'light' ? 'dark' : 'light');
}


const SignInButton = ({ onClick }) => (
  <button className="btn sign-in" onClick={onClick}>
    Sign In
  </button>
);

const SignUpButton = ({ onClick }) => (
  <button className="btn sign-up" onClick={onClick}>
    Sign Up
  </button>
);

const AuthButtons = () => {
  const handleSignIn = () => {
    console.log('Sign In clicked');
  };

  const handleSignUp = () => {
    console.log('Sign Up clicked');
  };

  return (
    <div className="auth-buttons">
      <SignInButton onClick={handleSignIn} />
      <SignUpButton onClick={handleSignUp} />
    </div>
  );
};

const UserInfo = ({ user }) => (
  <div className="user-info">
    <strong>{user.username}</strong>
    <div className="user-campus">{user.campus.name}</div>
  </div>
);

const ToggleThemeButton = () => {
  const { theme, toggleTheme } = useTheme();
  return (
    <button className="btn toggle-theme" onClick={toggleTheme}>
      {theme === lightTheme ? 'Dark Mode' : 'Light Mode'}
    </button>
  );
};

const Header = () => {
  const { user } = useUser();

  return (
    <header className="app-header">
      <div className="header-inner">
        <div className="logo">
          <h1>Campus Connect</h1>
        </div>
        <ToggleThemeButton />
        <nav className="nav-content">
          {user ? <UserInfo user={user} /> : <AuthButtons />}
        </nav>
      </div>
    </header>
  );
};

export default Header;
