import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import SubmitClaim from './pages/SubmitClaim';
import UserClaims from './pages/UserClaims';
import AdminClaims from './pages/AdminClaims';
import AdminItems from './pages/AdminItems';
import AdminDashboard from './pages/AdminDashboard';
import Layout from './components/Layout';

function App() {
  return (
    <Router>
      <Routes>
        {/* Redirect root to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Shared layout for logged-in users */}
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/submit-claim" element={<SubmitClaim />} />
          <Route path="/my-claims" element={<UserClaims />} />
          <Route path="/admin/claims" element={<AdminClaims />} />
          <Route path="/admin/items" element={<AdminItems />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;





