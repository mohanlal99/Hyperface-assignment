
// Shows the full details of a single ticket.

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTicketById, updateTicketStatus, updateTicketReply } from '../api';

const CATEGORY_COLORS = {
  PAYMENT: '#f59e0b',
  LOGIN:   '#3b82f6',
  BUG:     '#ef4444',
  OTHER:   '#6b7280',
};

function TicketDetail() {
  const { id } = useParams();       
  const navigate = useNavigate();

  const [ticket, setTicket]       = useState(null); 
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');

  // For the "edit reply" feature
  const [editMode, setEditMode]   = useState(false);  
  const [newReply, setNewReply]   = useState('');      

  const [saving, setSaving]       = useState(false);   

  // Load ticket data when page opens
  useEffect(() => {
    loadTicket();
  }, [id]);

  async function loadTicket() {
    try {
      const data = await getTicketById(id);
      setTicket(data);
      setNewReply(data.aiReply); 
    } catch (err) {
      setError('Could not load ticket.');
    } finally {
      setLoading(false);
    }
  }

  // Toggle ticket status between OPEN and RESOLVED
  async function handleStatusToggle() {
    setSaving(true);
    try {
      const updated = await updateTicketStatus(id);
      setTicket(updated); 
    } catch (err) {
      alert('Failed to update status. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  // Save the edited reply
  async function handleSaveReply() {
    if (!newReply.trim()) {
      alert('Reply cannot be empty.');
      return;
    }
    setSaving(true);
    try {
      const updated = await updateTicketReply(id, newReply);
      setTicket(updated);
      setEditMode(false); // Close edit mode after saving
    } catch (err) {
      alert('Failed to save reply. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  function formatDate(dateString) {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleString('en-IN', {
      month: 'long', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }

  if (loading) return <div className="center-message">Loading ticket...</div>;
  if (error)   return <div className="center-message alert alert-error">{error}</div>;
  if (!ticket) return <div className="center-message">Ticket not found.</div>;

  const isResolved = ticket.status === 'RESOLVED';

  return (
    <div className="detail-container">

      {/* Back button */}
      <button className="btn btn-ghost" onClick={() => navigate('/dashboard')}>
        ← Back to Dashboard
      </button>

      {/* Ticket Header */}
      <div className="detail-card">
        <div className="detail-header">
          <div>
            <h1 className="detail-title">Ticket #{ticket.id.slice(0, 8)}</h1>
            <p className="detail-meta">
              Submitted by <strong>{ticket.name}</strong> ({ticket.email})
            </p>
            <p className="detail-meta">Created: {formatDate(ticket.createdAt)}</p>
            {ticket.updatedAt && (
              <p className="detail-meta">Last updated: {formatDate(ticket.updatedAt)}</p>
            )}
          </div>

          {/* Status badge */}
          <span className={`status-badge large ${isResolved ? 'status-resolved' : 'status-open'}`}>
            {isResolved ? '✅ Resolved' : '🔴 Open'}
          </span>
        </div>

        {/* Priority and Category badges */}
        <div className="badge-row">
          <span
            className="badge"
            style={{ backgroundColor: CATEGORY_COLORS[ticket.category] || '#6b7280' }}
          >
            {ticket.category}
          </span>
          <span className="badge" style={{ backgroundColor: '#8b5cf6' }}>
            {ticket.priority} PRIORITY
          </span>
          {ticket.confidence > 0 && (
            <span className="badge" style={{ backgroundColor: '#0ea5e9' }}>
              AI Confidence: {ticket.confidence}%
            </span>
          )}
        </div>
      </div>

      {/* Issue Description */}
      <div className="detail-card">
        <h2 className="section-title">📋 Issue Description</h2>
        <p className="detail-description">{ticket.description}</p>
      </div>

      {/* AI Generated Reply */}
      <div className="detail-card">
        <div className="reply-header">
          <h2 className="section-title">🤖 AI Generated Reply</h2>
          {/* Button to switch to edit mode */}
          {!editMode && (
            <button className="btn btn-secondary" onClick={() => setEditMode(true)}>
              ✏️ Edit Reply
            </button>
          )}
        </div>

        {!editMode && (
          <p className="ai-reply-text">{ticket.aiReply}</p>
        )}

        {editMode && (
          <div>
            <textarea
              className="form-input form-textarea"
              value={newReply}
              onChange={(e) => setNewReply(e.target.value)}
              rows={4}
            />
            <div className="action-buttons">
              <button className="btn btn-primary" onClick={handleSaveReply} disabled={saving}>
                {saving ? 'Saving...' : '💾 Save Reply'}
              </button>
              <button className="btn btn-ghost" onClick={() => setEditMode(false)}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="detail-card action-card">
        <h2 className="section-title">⚡ Actions</h2>
        <button
          className={`btn ${isResolved ? 'btn-secondary' : 'btn-success'}`}
          onClick={handleStatusToggle}
          disabled={saving}
        >
          {saving
            ? 'Updating...'
            : isResolved
            ? '🔄 Reopen Ticket'
            : '✅ Mark as Resolved'}
        </button>
      </div>

    </div>
  );
}

export default TicketDetail;
