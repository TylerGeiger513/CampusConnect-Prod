import React from 'react';
import { useNavigate } from 'react-router-dom'; // Re-import useNavigate
import '../../styles/SideNav.css';
import HamburgerMenu from './HamburgerMenu';
// Importing the SVG as a React component
import { ReactComponent as DashboardIcon } from '../../assets/dashboard.svg';
import { ReactComponent as SettingsIcon } from '../../assets/settings.svg';
import { ReactComponent as ChatsIcon } from '../../assets/chat.svg';
import { ReactComponent as ProfileIcon } from '../../assets/profile-user.svg';
import { ReactComponent as FriendsIcon } from '../../assets/friends.svg';

// Accept only currentPage prop
const SideNav = ({ currentPage }) => {
  const [isCollapsed, setIsCollapsed] = React.useState(true);
  const navigate = useNavigate(); // Re-introduce navigate hook

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  // Re-introduce handleNavigation function
  const handleNavigation = (pageKey, path) => {
    // pageKey is used here to potentially set internal state if needed,
    // but the main action is navigation.
    // The active state is determined by the currentPage prop passed from parent.
    navigate(path);
  };

  return (
    <div className={`side-nav ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="side-nav-header">
        <HamburgerMenu isOpen={!isCollapsed} onToggle={toggleCollapse} />
      </div>
      <div className="nav-items">
        {/* Pass isActive based on currentPage prop */}
        {/* Use internal handleNavigation for onClickHandler */}
        <NavItem
          text="Dashboard"
          pageKey="dashboard" // Keep pageKey if needed for handleNavigation logic
          path="/dashboard"
          isActive={currentPage === "dashboard"}
          isCollapsed={isCollapsed}
          onClickHandler={() => handleNavigation("dashboard", "/dashboard")} // Use internal handler
          Icon={DashboardIcon}
        />
        <NavItem
          text="Friends"
          pageKey="friends"
          path="/friends"
          isActive={currentPage === "friends"}
          isCollapsed={isCollapsed}
          onClickHandler={() => handleNavigation("friends", "/friends")}
          Icon={FriendsIcon}
        />
        <NavItem
          text="Chats"
          pageKey="chats"
          path="/chats"
          isActive={currentPage === "chats"}
          isCollapsed={isCollapsed}
          onClickHandler={() => handleNavigation("chats", "/chats")}
          Icon={ChatsIcon}
        />
        <NavItem
          text="Profile"
          pageKey="profile"
          path="/profile"
          isActive={currentPage === "profile"}
          isCollapsed={isCollapsed}
          onClickHandler={() => handleNavigation("profile", "/profile")}
          Icon={ProfileIcon}
        />
        <NavItem
          text="Settings"
          pageKey="settings"
          path="/settings"
          isActive={currentPage === "settings"}
          isCollapsed={isCollapsed}
          onClickHandler={() => handleNavigation("settings", "/settings")}
          Icon={SettingsIcon}
        />
        {/* Add more NavItem components for other icons */}
      </div>
    </div>
  );
};

// Revert NavItem props: Remove onNavigate, re-add onClickHandler
const NavItem = ({ text, pageKey, path, isActive, isCollapsed, onClickHandler, Icon }) => (
  <div
    className={`nav-item ${isActive ? 'active' : ''} ${isCollapsed ? 'collapsed' : ''}`}
    onClick={onClickHandler} // Use onClickHandler prop again
    style={{ cursor: 'pointer' }}
  >
    <div className={`icon-container ${isCollapsed ? 'collapsed' : 'expanded'}`}>
      <Icon className="nav-icon" />
    </div>

    <div className={`text-container ${isActive ? 'active' : ''} ${isCollapsed ? 'collapsed' : ''}`}>
      <span className={`nav-text ${isCollapsed ? 'collapsed' : ''}`}>{text}</span>
    </div>
  </div>
);

export default SideNav;
