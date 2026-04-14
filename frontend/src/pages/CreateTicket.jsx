// This page shows a form for submitting a new support ticket.

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createTicket } from '../api';

function CreateTicket() {
  const navigate = useNavigate();

  // Form field values
  const [name, setName]               = useState('');
  const [email, setEmail]             = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority]       = useState('MEDIUM');

  // UI state
  const [loading, setLoading] = useState(false);  
  const [error, setError]     = useState('');     

  // This runs when the user clicks "Submit"
  async function handleSubmit(e) {
    e.preventDefault(); 

    // Simple validation
    if (!name || !email || !description) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Send ticket to backend (backend will call AI)
      const newTicket = await createTicket({ name, email, description, priority });

      
      navigate(`/ticket/${newTicket.id}`);
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="form-container">
      <div className="form-card">
        <h1 className="form-title">Submit a Support Ticket</h1>
        <p className="form-subtitle">Our AI will classify your issue and generate a reply instantly.</p>

        {/* Show error if there is one */}
        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          {/* Name Field */}
          <div className="form-group">
            <label className="form-label">Your Name</label>
            <input
              className="form-input"
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Email Field */}
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              className="form-input"
              type="email"
              placeholder="john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Priority Field (Bonus feature) */}
          <div className="form-group">
            <label className="form-label">Priority</label>
            <select
              className="form-input"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          </div>

          {/* Description Field */}
          <div className="form-group">
            <label className="form-label">Describe your issue</label>
            <textarea
              className="form-input form-textarea"
              placeholder="Tell us what's going wrong. Be as detailed as possible..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
            />
          </div>

          {/* Submit Button */}
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner" /> AI is processing your ticket...
              </>
            ) : (
              '🚀 Submit Ticket'
            )}
          </button>
        </form>

        {/* Show note while AI is working */}
        {loading && (
          <div className="ai-processing-note">
            ✨ Our AI is reading your issue and preparing a reply. This takes a few seconds...
          </div>
        )}
      </div>
    </div>
  );
}

export default CreateTicket;
