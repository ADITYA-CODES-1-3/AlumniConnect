import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// --- IMPORT ALL PAGES ---
import Home from './pages/Home'; 
import Login from './pages/Login';
import Register from './pages/Register'; 
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import Jobs from './pages/Jobs';
import PostJob from './pages/PostJob';
import Profile from './pages/Profile';
import Mentorship from './pages/Mentorship';
import Chat from './pages/Chat';
import Events from './pages/Events';          
import CreateEvent from './pages/CreateEvent'; 
import EventDetails from './pages/EventDetails'; // Import the details page

// --- IMPORT COMPONENTS ---
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <div>
      {/* Toast Notification Wrapper */}
      <Toaster position="top-center" />
      
      <Routes>
        
        {/* ============================== */}
        {/* PUBLIC ROUTES (Open)           */}
        {/* ============================== */}
        
        {/* Root URL -> Landing Page */}
        <Route path="/" element={<Home />} />
        
        {/* Auth Pages */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* ============================== */}
        {/* PROTECTED ROUTES (Locked)      */}
        {/* ============================== */}
        
        {/* Chat System */}
        <Route path="/chat/:receiverId" element={<PrivateRoute><Chat /></PrivateRoute>} />
        
        {/* 1. Dashboard */}
        <Route 
          path="/dashboard" 
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } 
        />

        {/* 2. Admin Panel */}
        <Route 
          path="/admin-dashboard" 
          element={
            <PrivateRoute>
              <AdminDashboard />
            </PrivateRoute>
          } 
        />

        {/* 3. Job Portal */}
        <Route 
          path="/jobs" 
          element={
            <PrivateRoute>
              <Jobs />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/post-job" 
          element={
            <PrivateRoute>
              <PostJob />
            </PrivateRoute>
          } 
        />

        {/* 4. Profile Section */}
        <Route path="/profile/:id?" element={<PrivateRoute><Profile /></PrivateRoute>} />

        {/* 5. Mentorship System */}
        <Route 
          path="/mentorship" 
          element={
            <PrivateRoute>
              <Mentorship />
            </PrivateRoute>
          } 
        />

        {/* 6. Event Management System */}
        {/* List of all events */}
        <Route 
          path="/events" 
          element={
            <PrivateRoute>
              <Events />
            </PrivateRoute>
          } 
        />
        
        {/* Create a new event (Admin/Alumni only - logic inside component) */}
        <Route 
          path="/create-event" 
          element={
            <PrivateRoute>
              <CreateEvent />
            </PrivateRoute>
          } 
        />

        {/* Event Details Page (Dynamic ID) */}
        <Route 
          path="/events/:id" 
          element={
            <PrivateRoute>
              <EventDetails />
            </PrivateRoute>
          } 
        />

      </Routes>
    </div>
  );
}

export default App;