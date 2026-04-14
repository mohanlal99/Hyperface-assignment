// Shows all submitted tickets in a table.
// User can click any ticket to see details.

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllTickets } from '../api';

// Category badge colors
const CATEGORY_COLORS = {
  PAYMENT: '#f59e0b',
  LOGIN:   '#3b82f6',
  BUG:     '#ef4444',
  OTHER:   '#6b7280',
};

// Priority badge colors
const PRIORITY_COLORS = {
  HIGH:   '#ef4444',
  MEDIUM: '#f59e0b',
  LOW:    '#22c55e',
};

function Dashboard() {
  const navigate = useNavigate();

  const [tickets, setTickets] = useState([]);  
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');  

  // Load tickets when the page first opens
  useEffect(() => {
    loadTickets();
  }, []);

  async function loadTickets() {
    try {
      const data = await getAllTickets();
      setTickets(data);
    } catch (err) {
      setError('Could not load tickets. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }

  // Show just the first 60 characters of the description
  function shortDescription(text) {
    if (text.length <= 60) return text;
    return text.slice(0, 60) + '...';
  }

  // Format date like "Jan 5, 2024, 10:30 AM"
  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }

  if (loading) return <div className="center-message">Loading tickets...</div>;
  if (error)   return <div className="center-message alert alert-error">{error}</div>;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Support Tickets</h1>
        <span className="ticket-count">{tickets.length} total</span>
      </div>

      {tickets.length === 0 ? (
        <div className="empty-state">
          <p>No tickets yet. Submit your first one!</p>
        </div>
      ) : (
        <div className="ticket-table-wrapper">
          <table className="ticket-table">
            <thead>
              <tr>
                <th>Issue</th>
                <th>Category</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Submitted</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((ticket) => (
                // Clicking a row opens the ticket detail page
                <tr
                  key={ticket.id}
                  className="ticket-row"
                  onClick={() => navigate(`/ticket/${ticket.id}`)}
                >
                  {/* Short preview of the issue */}
                  <td className="ticket-desc">
                    <span className="ticket-name">{ticket.name}</span>
                    <span className="ticket-preview">{shortDescription(ticket.description)}</span>
                  </td>

                  {/* AI-classified category */}
                  <td>
                    <span
                      className="badge"
                      style={{ backgroundColor: CATEGORY_COLORS[ticket.category] || '#6b7280' }}
                    >
                      {ticket.category}
                    </span>
                  </td>

                  {/* Priority level */}
                  <td>
                    <span
                      className="badge"
                      style={{ backgroundColor: PRIORITY_COLORS[ticket.priority] || '#6b7280' }}
                    >
                      {ticket.priority}
                    </span>
                  </td>

                  {/* Open or Resolved */}
                  <td>
                    <span className={`status-badge ${ticket.status === 'OPEN' ? 'status-open' : 'status-resolved'}`}>
                      {ticket.status === 'OPEN' ? '🔴 Open' : '✅ Resolved'}
                    </span>
                  </td>

                  {/* Created time */}
                  <td className="ticket-time">{formatDate(ticket.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
