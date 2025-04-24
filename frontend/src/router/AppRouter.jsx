// AppRouter.jsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

// Import pages/components
import LandingPage from '../components/LandingPage';
import Dashboard from '../components/dashboard/Dashboard';
import Profile from '../components/Profile';
import Friends from '../components/Friends';
import ChatPage from '../components/chat/ChatPage';
import Settings from '../components/SettingsPage';

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          <LandingPage />
        } />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/friends"
          element={
            <ProtectedRoute>
              <Friends />
            </ProtectedRoute>
          }
        />
        <Route 
          path='/chats/:channelId?'
          element={
            <ProtectedRoute>
              <ChatPage />
            </ProtectedRoute>
          }
        />
        <Route 
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
        <Route
          path="*"
          element={
            <div>404 Not Found</div>
          }
        />

      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
