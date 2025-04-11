import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/SideNav.css';
import HamburgerMenu from './HamburgerMenu';
// Importing the SVG as a React component
import { ReactComponent as DashboardIcon } from '../../assets/dashboard.svg';
import { ReactComponent as SettingsIcon } from '../../assets/settings.svg';
import { ReactComponent as ChatsIcon } from '../../assets/chat.svg'; 
import { ReactComponent as ProfileIcon } from '../../assets/profile-user.svg';
const SideNav = () => {
  const [isCollapsed, setIsCollapsed] = React.useState(true);
  const [activePage, setActivePage] = React.useState('dashboard');
  const navigate = useNavigate();

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleNavigation = (page, path) => {
    setActivePage(page);
    navigate(path);
  };

  return (
    <div className={`side-nav ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="side-nav-header">
        <HamburgerMenu isOpen={!isCollapsed} onToggle={toggleCollapse} />
      </div>
      <div className="nav-items">
        <NavItem
          text="Dashboard"
          isActive={activePage === "dashboard"}
          isCollapsed={isCollapsed}
          onClickHandler={() => handleNavigation("dashboard", "/dashboard")}
          Icon={DashboardIcon}
        />
        <NavItem
          text="Chats"
          isActive={activePage === "chats"}
          isCollapsed={isCollapsed}
          onClickHandler={() => handleNavigation("chats", "/chats")}
          Icon={ChatsIcon} // Replace with the actual icon for Friends
        />
        <NavItem
          text="Profile"
          isActive={activePage === "profile"}
          isCollapsed={isCollapsed}
          onClickHandler={() => handleNavigation("profile", "/profile")}
          Icon={ProfileIcon} // Replace with the actual icon for Friends
        />

        <NavItem
          text="Settings"
          isActive={activePage === "settings"}
          isCollapsed={isCollapsed}
          onClickHandler={() => handleNavigation("settings", "/settings")}
          Icon={SettingsIcon}
        />

  
        {/* Add more NavItem components for other icons */}
      </div>
    </div>
  );
};

const NavItem = ({ text, isActive, isCollapsed, onClickHandler, Icon }) => (
  <div
    className={`nav-item ${isActive ? 'active' : ''} ${isCollapsed ? 'collapsed' : ''}`}
    onClick={onClickHandler}
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
