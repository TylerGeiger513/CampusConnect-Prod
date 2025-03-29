// ThemeContext.jsx
import React, { createContext, useState, useEffect } from 'react';

export const lightTheme = {
  '--primary-a0': '#9c42f5',
  '--primary-a10': '#9b4ce8',
  '--primary-a20': '#9954db',
  '--primary-a30': '#975cce',
  '--primary-a40': '#9563c1',
  '--primary-a50': '#926ab4',
  '--surface-a0': '#ffffff',
  '--surface-a10': '#f0f0f0',
  '--surface-a20': '#e1e1e1',
  '--surface-a30': '#d3d3d3',
  '--surface-a40': '#c5c5c5',
  '--surface-a50': '#b6b6b6',
  '--color-text': '#000000',
  '--color-light-red': '#fbe3e4',
  '--color-darker-red': '#fc422d',
  '--color-light-green': '#b7e9ce',
  '--color-darker-green': '#04aa4e',
  '--color-text-alt': '#555'
};

export const darkTheme = {
  '--primary-a0': '#9c42f5',
  '--primary-a10': '#9b4ce8',
  '--primary-a20': '#9954db',
  '--primary-a30': '#975cce',
  '--primary-a40': '#9563c1',
  '--primary-a50': '#926ab4',
  '--surface-a0': '#201e1e',
  '--surface-a10': '#1D1B1B',
  '--surface-a20': '#312F2F',
  '--surface-a30': '#393737',
  '--surface-a40': '#413F3F',
  '--surface-a50': '#525050',
  '--color-text': '#ffffff',
  '--color-light-red': '#fbe3e4',
  '--color-darker-red': '#fc422d',
  '--color-light-green': '#b7e9ce',
  '--color-darker-green': '#04aa4e',
  '--color-text-alt': '#BDBDBD'
};

export const ThemeContext = createContext({
  theme: lightTheme,
  toggleTheme: () => {},
  themeLoaded: false,
});

export const ThemeProvider = ({ children }) => {
  const getInitialTheme = () => {
    const storedTheme = localStorage.getItem('themeData');
    if (storedTheme) {
      try {
        return JSON.parse(storedTheme);
      } catch (e) {
        console.error('Error parsing themeData from localStorage', e);
      }
    }
    return lightTheme;
  };

  const [theme, setTheme] = useState(getInitialTheme);
  const [themeLoaded, setThemeLoaded] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    Object.entries(theme).forEach(([varName, value]) => {
      root.style.setProperty(varName, value);
    });
    localStorage.setItem('themeData', JSON.stringify(theme));
    setThemeLoaded(true);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === lightTheme ? darkTheme : lightTheme));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, themeLoaded }}>
      {children}
    </ThemeContext.Provider>
  );
};
