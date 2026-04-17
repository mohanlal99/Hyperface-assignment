import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getTickets, getStats, updateStatus } from '../../api';

const STATUS_STYLE = {
  OPEN:        { bg: '#fef3c7', color: '#d97706', label: '🟡 Open' },
  IN_PROGRESS: { bg: '#dbeafe', color: '#2563eb', label: '🔵 In Progress' },
  RESOLVED:    { bg: '#dcfce7', color: '#16a34a', label: '✅ Resolved' }
};

const PRIORITY_STYLE = {
  HIGH:   { color: '#dc2626', bg: '#fee2e2' },
  MEDIUM: { color: '#d97706', bg: '#fef3c7' },
  LOW:    { color: '#16a34a', bg: '#f0fdf4' }
};

const CATEGORY_COLORS = {
  PAYMENT: '#6366f1',
  LOGIN:   '#0ea5e9',
  BUG:     '#ef4444',
  OTHER:   '#8b5cf6'
};

function AdminDashboard() {
  const navigate = useNavigate();
  const { user, token, logout } = useAuth();

  const [tickets, setTickets] = useState([]);
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch]       = useState('');
  const [status, setStatus]       = useState('ALL');
  const [category, setCategory]   = useState('ALL');
  const [priority, setPriority]   = useState('ALL');
  const [dateRange, setDateRange] = useState('ALL');

  useEffect(() => {
    loadStats();
  }, []);

  useEffect(() => {
    loadTickets();
  }, [status, category, priority, dateRange]);

  async function loadStats() {
    try {
      const s = await getStats(token);
      setStats(s);
    } catch {}
  }

  async function loadTickets() {
    setLoading(true);
    try {
      const filters = {};
      if (status   !== 'ALL') filters.status   = status;
      if (category !== 'ALL') filters.category = category;
      if (priority !== 'ALL') filters.priority = priority;
      if (dateRange !== 'ALL') filters.dateRange = dateRange;
      if (search.trim()) filters.search = search.trim();
      const data = await getTickets(token, filters);
      setTickets(data);
    } catch {}
    finally { setLoading(false); }
  }

  // Search on Enter
  function handleSearchKey(e) {
    if (e.key === 'Enter') loadTickets();
  }

  async function quickStatusChange(e, ticketId, newStatus) {
    e.stopPropagation(); // Don't navigate to detail
    try {
      const updated = await updateStatus(token, ticketId, newStatus);
      setTickets(prev => prev.map(t => t._id === ticketId ? updated : t));
      loadStats();
    } catch {}
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

  // Build a simple bar chart from category data
  function CategoryChart() {
    if (!stats?.categoryData) return null;
    const total = stats.total || 1;
    const cats  = ['PAYMENT', 'LOGIN', 'BUG', 'OTHER'];
    return (
      <div className="chart-bars">
        {cats.map(cat => {
          const item  = stats.categoryData.find(d => d._id === cat);
          const count = item?.count || 0;
          const pct   = Math.round((count / total) * 100);
          return (
            <div key={cat} className="chart-bar-row">
              <span className="chart-label">{cat}</span>
              <div className="chart-bar-track">
                <div
                  className="chart-bar-fill"
                  style={{ width: `${pct}%`, backgroundColor: CATEGORY_COLORS[cat] }}
                />
              </div>
              <span className="chart-count">{count}</span>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="sidebar-logo">
          <img className='sidebar-logo-img' src="https://www.hyperface.co/wp-content/themes/hyperface/assets/img/logo-white.svg" alt="" />
        </div>
        <div className="admin-badge">ADMIN PANEL</div>

        <nav className="sidebar-nav">
          <div className="nav-item active">📊 Dashboard</div>

        </nav>

        <div className="sidebar-user">
          <div className="user-avatar-sm admin-av-color">
            {user.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="sidebar-name">{user.name}</div>
            <div className="sidebar-role-tag">Administrator</div>
          </div>
          <button className="logout-btn" onClick={() => { logout(); navigate('/'); }}>↩</button>
        </div>
      </aside>

      {/* Main */}
      <main className="admin-main">

        {/* Top heading */}
        <div className="admin-topbar">
          <div>
            <h1 className="page-heading">Support Dashboard</h1>
            <p className="page-sub">All customer tickets · Real-time overview</p>
          </div>
          <div className="topbar-date">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
          </div>
        </div>

        {/* Stats cards */}
        {stats && (
          <div className="stats-grid">
            <div className="stat-card total">
              <div className="stat-icon">🎫</div>
              <div className="stat-val">{stats.total}</div>
              <div className="stat-name">Total Tickets</div>
            </div>
            <div className="stat-card open">
              <div className="stat-icon">🟡</div>
              <div className="stat-val">{stats.open}</div>
              <div className="stat-name">Open</div>
            </div>
            <div className="stat-card progress">
              <div className="stat-icon">🔵</div>
              <div className="stat-val">{stats.inProgress}</div>
              <div className="stat-name">In Progress</div>
            </div>
            <div className="stat-card resolved">
              <div className="stat-icon">✅</div>
              <div className="stat-val">{stats.resolved}</div>
              <div className="stat-name">Resolved</div>
            </div>
            <div className="stat-card danger">
              <div className="stat-icon">🔴</div>
              <div className="stat-val">{stats.highPriority}</div>
              <div className="stat-name">High Priority</div>
            </div>
          </div>
        )}

        {/* Category chart */}
        {stats && (
          <div className="chart-card">
            <h3 className="chart-title">Tickets by Category</h3>
            <CategoryChart />
          </div>
        )}

        {/* Filters row */}
        <div className="filters-row">
          {/* Search */}
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search tickets, users, descriptions..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={handleSearchKey}
            />
            <button onClick={loadTickets} className="search-go-btn">Search</button>
          </div>

          <div className="filter-selects">
            <select value={status}    onChange={e => setStatus(e.target.value)}>
              <option value="ALL">All Status</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
            </select>
            <select value={category}  onChange={e => setCategory(e.target.value)}>
              <option value="ALL">All Categories</option>
              <option value="PAYMENT">Payment</option>
              <option value="LOGIN">Login</option>
              <option value="BUG">Bug</option>
              <option value="OTHER">Other</option>
            </select>
            <select value={priority}  onChange={e => setPriority(e.target.value)}>
              <option value="ALL">All Priority</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
            <select value={dateRange} onChange={e => setDateRange(e.target.value)}>
              <option value="ALL">All Time</option>
              <option value="TODAY">Today</option>
              <option value="WEEK">Last 7 Days</option>
              <option value="MONTH">Last 30 Days</option>
            </select>
          </div>
        </div>

        {/* Results count */}
        <div className="results-bar">
          {loading ? 'Loading...' : `${tickets.length} ticket${tickets.length !== 1 ? 's' : ''} found`}
        </div>

        {/* Ticket table */}
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Issue</th>
                <th>Category</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Created</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {!loading && tickets.map(ticket => {
                const s = STATUS_STYLE[ticket.status]     || STATUS_STYLE.OPEN;
                const p = PRIORITY_STYLE[ticket.priority] || PRIORITY_STYLE.MEDIUM;
                return (
                  <tr
                    key={ticket._id}
                    onClick={() => navigate(`/admin/ticket/${ticket._id}`)}
                    className="admin-table-row"
                  >
                    <td>
                      <div className="user-cell">
                        <div className="tbl-av">{ticket.userName.slice(0,2).toUpperCase()}</div>
                        <div>
                          <div className="tbl-name">{ticket.userName}</div>
                          <div className="tbl-email">{ticket.userEmail}</div>
                        </div>
                      </div>
                    </td>
                    <td className="tbl-desc">
                      {ticket.description.length > 60
                        ? ticket.description.slice(0, 60) + '...'
                        : ticket.description}
                    </td>
                    <td>
                      <span className="cat-pill" style={{ backgroundColor: CATEGORY_COLORS[ticket.category] }}>
                        {ticket.category}
                      </span>
                    </td>
                    <td>
                      <span className="priority-pill" style={{ background: p.bg, color: p.color }}>
                        {ticket.priority}
                      </span>
                    </td>
                    <td>
                      <span className="status-pill" style={{ background: s.bg, color: s.color }}>
                        {s.label}
                      </span>
                    </td>
                    <td className="tbl-time">{timeAgo(ticket.createdAt)}</td>
                    <td onClick={e => e.stopPropagation()}>
                      <select
                        className="quick-status-select"
                        value={ticket.status}
                        onChange={e => quickStatusChange(e, ticket._id, e.target.value)}
                      >
                        <option value="OPEN">Open</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="RESOLVED">Resolved</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {!loading && tickets.length === 0 && (
            <div className="table-empty">No tickets match your filters.</div>
          )}
        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;
