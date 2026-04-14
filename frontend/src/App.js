
// App.js — The root of our React app



import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import CreateTicket from './pages/CreateTicket';
import Dashboard from './pages/Dashboard';
import TicketDetail from './pages/TicketDetail';

function App() {
  return (
    <BrowserRouter>
      {/* Top navigation bar */}
      <nav className="navbar">
        <div className="navbar-brand">
          <img src='https://www.hyperface.co/wp-content/themes/hyperface/assets/img/logo-white.svg' alt='Logo'/>
        </div>
        <div className="navbar-links">
          <Link to="/">Submit Ticket</Link>
          <Link to="/dashboard">Dashboard</Link>
        </div>
      </nav>

      {/* Page content changes based on the URL */}
      <div className="page-content">
        <Routes>
          <Route path="/"           element={<CreateTicket />} />
          <Route path="/dashboard"  element={<Dashboard />} />
          <Route path="/ticket/:id" element={<TicketDetail />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
