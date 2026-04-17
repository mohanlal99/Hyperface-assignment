

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';

import Landing        from './pages/Landing';
import Login          from './pages/Login';
import UserDashboard  from './pages/user/UserDashboard';
import CreateTicket   from './pages/user/CreateTicket';
import UserTicketChat from './pages/user/TicketChat';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminTicketChat from './pages/admin/AdminTicketChat';

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />;
  return children;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public pages */}
          <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />

          {/* User pages */}
          <Route path="/dashboard" element={<PrivateRoute role="user"><UserDashboard /></PrivateRoute>} />
          <Route path="/create-ticket" element={<PrivateRoute role="user"><CreateTicket /></PrivateRoute>} />
          <Route path="/ticket/:id" element={<PrivateRoute role="user"><UserTicketChat /></PrivateRoute>} />

          {/* Admin pages */}
          <Route path="/admin" element={<PrivateRoute role="admin"><AdminDashboard /></PrivateRoute>} />
          <Route path="/admin/ticket/:id" element={<PrivateRoute role="admin"><AdminTicketChat /></PrivateRoute>} />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
