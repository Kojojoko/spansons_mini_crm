import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './layouts/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Leads from './pages/Leads';
import Profile from './pages/Profile';
import LeadFormModal from './pages/LeadFormModal';
import './App.css';

function App() {
  const [globalSearch, setGlobalSearch] = useState('');

  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Authentication Pages */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Secure CRM Workspace Layout Panel */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <Layout onSearchChange={setGlobalSearch} searchValue={globalSearch} />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="leads" element={<Leads globalSearch={globalSearch} />} />
            <Route path="profile" element={<Profile />} />
          </Route>

          {/* Catch-all Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>

        {/* Global Pipeline Modal Triggered by ?modal=new or ?modal=edit */}
        <LeadFormModal />
      </AuthProvider>
    </Router>
  );
}

export default App;
