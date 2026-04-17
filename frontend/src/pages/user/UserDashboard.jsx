

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getTickets } from '../../api';

const STATUS_STYLE = {
  OPEN:        { bg: '#fef3c7', color: '#d97706', label: '🟡 Open' },
  IN_PROGRESS: { bg: '#dbeafe', color: '#2563eb', label: '🔵 In Progress' },
  RESOLVED:    { bg: '#dcfce7', color: '#16a34a', label: '✅ Resolved' }
};

const PRIORITY_STYLE = {
  HIGH:   { bg: '#fee2e2', color: '#dc2626' },
  MEDIUM: { bg: '#fef3c7', color: '#d97706' },
  LOW:    { bg: '#f0fdf4', color: '#16a34a' }
};

function UserDashboard() {
  const navigate = useNavigate();
  const { user, token, logout } = useAuth();

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    loadTickets();
  }, []);

  async function loadTickets() {
    try {
      const data = await getTickets(token);
      setTickets(data);
    } catch (err) {
      setError('Could not load tickets. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  }

  function getInitials(name) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  function timeAgo(dateStr) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins  = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days  = Math.floor(diff / 86400000);
    if (mins < 1)  return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  }

  const openCount     = tickets.filter(t => t.status === 'OPEN').length;
  const progressCount = tickets.filter(t => t.status === 'IN_PROGRESS').length;
  const resolvedCount = tickets.filter(t => t.status === 'RESOLVED').length;

  return (
    <div className="user-layout">
      {/* Sidebar */}
      <aside className="user-sidebar">
        <div className="sidebar-logo">
          <img className='sidebar-logo-img' src="https://www.hyperface.co/wp-content/themes/hyperface/assets/img/logo-white.svg" alt="" />
        </div>
        <nav className="sidebar-nav">
          <div className="nav-item active">📋 My Tickets</div>
          <div className="nav-item" onClick={() => navigate('/create-ticket')}>➕ New Ticket</div>
        </nav>
        <div className="sidebar-user">
          <div className="user-avatar-sm">{getInitials(user.name)}</div>
          <div>
            <div className="sidebar-name">{user.name}</div>
            <div className="sidebar-email">{user.email}</div>
          </div>
          <button className="logout-btn" onClick={() => { logout(); navigate('/'); }}>↩</button>
        </div>
      </aside>

      {/* Main content */}
      <main className="user-main">
        <div className="user-topbar">
          <div>
            <h1 className="page-heading">My Support Tickets</h1>
            <p className="page-sub">Track and manage your support requests</p>
          </div>
          <button className="btn-new-ticket" onClick={() => navigate('/create-ticket')}>
            + New Ticket
          </button>
        </div>

        {/* Stats row */}
        <div className="user-stats-row">
          <div className="user-stat">
            <span className="user-stat-num">{tickets.length}</span>
            <span className="user-stat-label">Total</span>
          </div>
          <div className="user-stat open">
            <span className="user-stat-num">{openCount}</span>
            <span className="user-stat-label">Open</span>
          </div>
          <div className="user-stat progress">
            <span className="user-stat-num">{progressCount}</span>
            <span className="user-stat-label">In Progress</span>
          </div>
          <div className="user-stat resolved">
            <span className="user-stat-num">{resolvedCount}</span>
            <span className="user-stat-label">Resolved</span>
          </div>
        </div>

        {/* Ticket list */}
        {loading && <div className="loading-msg">Loading your tickets...</div>}
        {error   && <div className="error-msg">{error}</div>}

        {!loading && tickets.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">🎫</div>
            <h3>No tickets yet</h3>
            <p>Submit your first support request and get an AI-generated reply instantly.</p>
            <button className="btn-new-ticket" onClick={() => navigate('/create-ticket')}>
              Raise a Ticket
            </button>
          </div>
        )}

        <div className="ticket-list">
          {tickets.map(ticket => {
            const s = STATUS_STYLE[ticket.status]   || STATUS_STYLE.OPEN;
            const p = PRIORITY_STYLE[ticket.priority] || PRIORITY_STYLE.MEDIUM;
            return (
              <div
                key={ticket._id}
                className="ticket-card"
                onClick={() => navigate(`/ticket/${ticket._id}`)}
              >
                <div className="ticket-card-left">
                  <div className="ticket-cat-dot" style={{ backgroundColor: p.color }} />
                  <div>
                    <p className="ticket-card-desc">
                      {ticket.description.length > 90
                        ? ticket.description.slice(0, 90) + '...'
                        : ticket.description}
                    </p>
                    <div className="ticket-card-meta">
                      <span className="cat-chip">{ticket.category}</span>
                      <span className="time-chip">{timeAgo(ticket.createdAt)}</span>
                    </div>
                  </div>
                </div>
                <div className="ticket-card-right">
                  <span className="priority-chip" style={{ background: p.bg, color: p.color }}>
                    {ticket.priority}
                  </span>
                  <span className="status-chip" style={{ background: s.bg, color: s.color }}>
                    {s.label}
                  </span>
                  <span className="arrow-icon">›</span>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}

export default UserDashboard;
