

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { createTicket } from '../../api';

function CreateTicket() {
  const navigate = useNavigate();
  const { token } = useAuth();

  const [description, setDescription] = useState('');
  const [priority, setPriority]       = useState('MEDIUM');
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (description.trim().length < 10) {
      setError('Please write at least 10 characters describing your issue.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const ticket = await createTicket(token, description, priority);
    
      navigate(`/ticket/${ticket._id}`);
    } catch (err) {
      setError(err.message || 'Failed to submit ticket. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="user-layout">
      <aside className="user-sidebar">
        <div className="sidebar-logo">
          <img className='sidebar-logo-img' src="https://www.hyperface.co/wp-content/themes/hyperface/assets/img/logo-white.svg" alt="" />
        </div>
        <nav className="sidebar-nav">
          <div className="nav-item" onClick={() => navigate('/dashboard')}>📋 My Tickets</div>
          <div className="nav-item active">➕ New Ticket</div>
        </nav>
      </aside>

      <main className="user-main">
        <div className="create-ticket-wrapper">
          <button className="back-btn" onClick={() => navigate('/dashboard')}>
            ← Back
          </button>

          <div className="create-ticket-card">
            <div className="create-ticket-header">
              <h2>Raise a Support Ticket</h2>
              <p>Describe your issue below. Our AI will instantly classify it and generate an initial response.</p>
            </div>

            {loading ? (
              <div className="ai-loading-box">
                <div className="ai-spinner" />
                <h3>AI is analyzing your issue...</h3>
                <p>Gemini is classifying your ticket and drafting an initial reply. This takes just a few seconds.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                {error && <div className="alert-error">{error}</div>}

                <div className="field-group">
                  <label>Priority Level</label>
                  <div className="priority-selector">
                    {['LOW', 'MEDIUM', 'HIGH'].map(p => (
                      <button
                        type="button"
                        key={p}
                        className={`priority-btn priority-${p.toLowerCase()} ${priority === p ? 'selected' : ''}`}
                        onClick={() => setPriority(p)}
                      >
                        {p === 'LOW' ? '🟢' : p === 'MEDIUM' ? '🟡' : '🔴'} {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="field-group">
                  <label>Describe your issue <span className="req">*</span></label>
                  <textarea
                    rows={7}
                    placeholder="Example: My payment of ₹4,999 was deducted twice but I only received one confirmation. Order ID is HF-12345. Please help resolve this as soon as possible."
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className="ticket-textarea"
                  />
                  <div className="char-count">{description.length} characters</div>
                </div>

                <button type="submit" className="submit-ticket-btn">
                  Submit Ticket
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default CreateTicket;
