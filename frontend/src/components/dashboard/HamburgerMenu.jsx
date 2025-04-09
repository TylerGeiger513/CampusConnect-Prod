import React from 'react';
import '../../styles/HamburgerMenu.css';

const HamburgerMenu = ({ isOpen, onToggle }) => {
  return (
    <div
      id="hamburgerMenu"
      className={isOpen ? 'open' : ''}
      onClick={onToggle}
    >
      <span></span>
      <span></span>
      <span></span>
      <span></span>
      <span></span>
      <span></span>
    </div>
  );
};

export default HamburgerMenu;