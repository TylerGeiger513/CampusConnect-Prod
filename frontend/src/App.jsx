// App.jsx
import React from 'react';
import { UserProvider } from './context/UserContext';
import { ThemeProvider } from './context/ThemeContext';
import AppRouter from './router/AppRouter';
import './styles/index.css';


const App = () => {
  return (
    <ThemeProvider>
      <UserProvider>
        <AppRouter />
      </UserProvider>
    </ThemeProvider>
  );
};

export default App;
