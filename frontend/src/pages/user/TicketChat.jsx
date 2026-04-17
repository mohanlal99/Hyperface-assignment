

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getTicket, getMessages, sendMessage } from '../../api';

const STATUS_STYLE = {
  OPEN:        { bg: '#fef3c7', color: '#d97706', label: '🟡 Open' },
  IN_PROGRESS: { bg: '#dbeafe', color: '#2563eb', label: '🔵 In Progress' },
  RESOLVED:    { bg: '#dcfce7', color: '#16a34a', label: '✅ Resolved' }
};

function TicketChat() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();

  const [ticket, setTicket]     = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput]       = useState('');
  const [sending, setSending]   = useState(false);
  const [loading, setLoading]   = useState(true);

  const bottomRef = useRef(null);

  useEffect(() => {
    loadAll();
  }, [id]);


  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function loadAll() {
    try {
      const [t, m] = await Promise.all([
        getTicket(token, id),
        getMessages(token, id)
      ]);
      setTicket(t);
      setMessages(m);
    } catch (err) {
    
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  }

  async function handleSend(e) {
    e.preventDefault();
    if (!input.trim()) return;

    setSending(true);
    const content = input.trim();
    setInput('');

    try {
      const newMsg = await sendMessage(token, id, content);
      setMessages(prev => [...prev, newMsg]);
    
      const updated = await getTicket(token, id);
      setTicket(updated);
    } catch (err) {
      alert('Failed to send message. Please try again.');
      setInput(content);
    } finally {
      setSending(false);
    }
  }

  function formatTime(dateStr) {
    return new Date(dateStr).toLocaleTimeString('en-IN', {
      hour: '2-digit', minute: '2-digit'
    });
  }

  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  }

  if (loading) return <div className="full-center">Loading chat...</div>;
  if (!ticket) return null;

  const s = STATUS_STYLE[ticket.status] || STATUS_STYLE.OPEN;
  const isResolved = ticket.status === 'RESOLVED';

  return (
    <div className="chat-layout">
      {/* Chat header */}
      <div className="chat-topbar">
        <button className="back-btn-sm" onClick={() => navigate('/dashboard')}>←</button>
        <div className="chat-ticket-info">
          <h3>Ticket #{ticket._id.slice(-6).toUpperCase()}</h3>
          <p>{ticket.description.slice(0, 60)}{ticket.description.length > 60 ? '...' : ''}</p>
        </div>
        <div className="chat-meta">
          <span className="cat-badge">{ticket.category}</span>
          <span className="status-chip" style={{ background: s.bg, color: s.color }}>{s.label}</span>
        </div>
      </div>

      {/* Ticket description bubble at top */}
      <div className="chat-body">
        <div className="chat-date-divider">{formatDate(ticket.createdAt)}</div>

        {/* Original ticket as user message */}
        <div className="chat-row user-row">
          <div className="chat-bubble user-bubble">
            <div className="bubble-label">You · Original Issue</div>
            <div className="bubble-content">{ticket.description}</div>
            <div className="bubble-time">{formatTime(ticket.createdAt)}</div>
          </div>
          <div className="chat-avatar user-av">
            {user.name.slice(0, 2).toUpperCase()}
          </div>
        </div>

        {/* All messages */}
        {messages.map((msg, idx) => {
          const isUser  = msg.sender === 'user';
          const isAI    = msg.sender === 'ai';
          const isAdmin = msg.sender === 'admin';

          return (
            <div key={msg._id} className={`chat-row ${isUser ? 'user-row' : 'agent-row'}`}>
              {!isUser && (
                <div className={`chat-avatar ${isAI ? 'ai-av' : 'admin-av'}`}>
                  {isAI ? '🤖' : 'A'}
                </div>
              )}
              <div className={`chat-bubble ${isUser ? 'user-bubble' : isAI ? 'ai-bubble' : 'admin-bubble'}`}>
                <div className="bubble-label">
                  {isAI ? 'HyperFace AI' : isAdmin ? `Admin · ${msg.senderName}` : 'You'}
                </div>
                <div className="bubble-content">{msg.content}</div>
                <div className="bubble-time">{formatTime(msg.createdAt)}</div>
              </div>
              {isUser && (
                <div className="chat-avatar user-av">
                  {user.name.slice(0, 2).toUpperCase()}
                </div>
              )}
            </div>
          );
        })}

        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="chat-input-area">
        {isResolved ? (
          <div className="resolved-notice">
            ✅ This ticket has been resolved. If you have a new issue, please raise a new ticket.
          </div>
        ) : (
          <form className="chat-input-form" onSubmit={handleSend}>
            <input
              className="chat-input"
              type="text"
              placeholder="Reply to support team..."
              value={input}
              onChange={e => setInput(e.target.value)}
              disabled={sending}
              autoFocus
            />
            <button className="chat-send-btn" type="submit" disabled={sending || !input.trim()}>
              {sending ? '...' : '↑ Send'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default TicketChat;
