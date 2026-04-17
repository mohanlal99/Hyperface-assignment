import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  getTicket,
  getMessages,
  sendMessage,
  generateAIReply,
  updateStatus,
  updatePriority,
} from "../../api";

const STATUS_STYLE = {
  OPEN: { bg: "#fef3c7", color: "#d97706", label: "🟡 Open" },
  IN_PROGRESS: { bg: "#dbeafe", color: "#2563eb", label: "🔵 In Progress" },
  RESOLVED: { bg: "#dcfce7", color: "#16a34a", label: "✅ Resolved" },
};

const CATEGORY_COLORS = {
  PAYMENT: "#6366f1",
  LOGIN: "#0ea5e9",
  BUG: "#ef4444",
  OTHER: "#8b5cf6",
};

function AdminTicketChat() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();

  const [ticket, setTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState([]);

  const bottomRef = useRef(null);

  useEffect(() => {
    loadAll();
  }, [id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function loadAll() {
    try {
      const [t, m] = await Promise.all([
        getTicket(token, id),
        getMessages(token, id),
      ]);
      setTicket(t);
      setMessages(m);
    } catch {
      navigate("/admin");
    } finally {
      setLoading(false);
    }
  }

  async function handleSend(e) {
    e.preventDefault();
    if (!input.trim()) return;
    setSending(true);
    const content = input.trim();
    setInput("");
    try {
      const msg = await sendMessage(token, id, content);
      setMessages((prev) => [...prev, msg]);
    } catch {
      alert("Failed to send message.");
      setInput(content);
    } finally {
      setSending(false);
    }
  }

  async function handleAIReply() {
    setAiLoading(true);
    try {
      const data = await generateAIReply(token, id);

      setAiSuggestions(data.suggestions || []);
    } catch (err) {
      alert(err.message || "AI could not generate suggestions.");
    } finally {
      setAiLoading(false);
    }
  }

  async function handleStatusChange(newStatus) {
    try {
      const updated = await updateStatus(token, id, newStatus);
      setTicket(updated);
    } catch {
      alert("Failed to update status.");
    }
  }

  async function handlePriorityChange(newPriority) {
    try {
      const updated = await updatePriority(token, id, newPriority);
      setTicket(updated);
    } catch {
      alert("Failed to update priority.");
    }
  }

  function formatTime(dateStr) {
    return new Date(dateStr).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  if (loading) return <div className="full-center">Loading ticket...</div>;
  if (!ticket) return null;

  const s = STATUS_STYLE[ticket.status] || STATUS_STYLE.OPEN;

  return (
    <div className="admin-chat-layout">
      {/* Left: Chat panel */}
      <div className="admin-chat-panel">
        {/* Chat topbar */}
        <div className="admin-chat-topbar">
          <button className="back-btn-sm" onClick={() => navigate("/admin")}>
            ← Dashboard
          </button>
          <div className="chat-ticket-info">
            <h3>
              #{ticket._id.slice(-6).toUpperCase()} · {ticket.userName}
            </h3>
            <p>{ticket.userEmail}</p>
          </div>
          <span
            className="status-chip"
            style={{ background: s.bg, color: s.color }}
          >
            {s.label}
          </span>
        </div>

        {/* Messages area */}
        <div className="chat-body">
          <div className="chat-date-divider">
            {formatDate(ticket.createdAt)}
          </div>

          {/* Original issue bubble */}
          <div className="chat-row agent-row">
            <div className="chat-avatar user-av-blue">
              {ticket.userName.slice(0, 2).toUpperCase()}
            </div>
            <div className="chat-bubble user-msg-bubble">
              <div className="bubble-label">
                {ticket.userName} · Original Issue
              </div>
              <div className="bubble-content">{ticket.description}</div>
              <div className="bubble-time">{formatTime(ticket.createdAt)}</div>
            </div>
          </div>

          {messages.map((msg) => {
            const isUserMsg = msg.sender === "user";
            const isAI = msg.sender === "ai";
            const isAdminMsg = msg.sender === "admin";

            return (
              <div
                key={msg._id}
                className={`chat-row ${isUserMsg ? "agent-row" : "admin-send-row"}`}
              >
                {isUserMsg && (
                  <div className="chat-avatar user-av-blue">
                    {msg.senderName.slice(0, 2).toUpperCase()}
                  </div>
                )}
                {isAI && <div className="chat-avatar ai-av">🤖</div>}
                {isAdminMsg && (
                  <div className="chat-avatar admin-send-av">A</div>
                )}

                <div
                  className={`chat-bubble ${isUserMsg ? "user-msg-bubble" : isAI ? "ai-bubble" : "admin-send-bubble"}`}
                >
                  <div className="bubble-label">
                    {isAI
                      ? "HyperFace AI"
                      : isAdminMsg
                        ? `You · Admin`
                        : msg.senderName}
                  </div>
                  <div className="bubble-content">{msg.content}</div>
                  <div className="bubble-time">{formatTime(msg.createdAt)}</div>
                </div>
              </div>
            );
          })}

          {/* AI typing indicator */}
          {aiLoading && (
            <div className="chat-row agent-row">
              <div className="chat-avatar ai-av">🤖</div>
              <div className="chat-bubble ai-bubble typing-bubble">
                <div className="typing-dots">
                  <span />
                  <span />
                  <span />
                </div>
                <div className="bubble-label" style={{ marginTop: 4 }}>
                  HyperFace AI is thinking...
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Admin input area */}
        <div className="admin-chat-input-area">
          {/* AI reply button */}
          <button
            className="ai-reply-btn"
            onClick={handleAIReply}
            disabled={aiLoading || sending}
          >
            {aiLoading ? "⏳ Generating..." : "🤖 Generate AI Reply"}
          </button>

          {aiSuggestions.length > 0 && (
  <div className="ai-suggestions-box">
    <p className="ai-suggestions-title">AI Suggestions:</p>

    <div className="ai-suggestions-list">
      {aiSuggestions.map((s, i) => (
        <button
          key={i}
          onClick={() => {
            setInput(s);
            setAiSuggestions([]);
          }}
          className="ai-suggestion-item"
        >
          {s}
        </button>
      ))}
    </div>
  </div>
)}

          <form className="chat-input-form" onSubmit={handleSend}>
            <input
              className="chat-input"
              type="text"
              placeholder="Type your reply as admin..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={sending || aiLoading}
            />
            <button
              className="chat-send-btn"
              type="submit"
              disabled={sending || !input.trim()}
            >
              {sending ? "..." : "↑ Send"}
            </button>
          </form>
        </div>
      </div>

      {/* Right: Ticket details panel */}
      <div className="admin-details-panel">
        <h3 className="details-panel-title">Ticket Details</h3>

        {/* Category */}
        <div className="detail-row">
          <span className="detail-key">Category</span>
          <span
            className="cat-pill"
            style={{ backgroundColor: CATEGORY_COLORS[ticket.category] }}
          >
            {ticket.category}
          </span>
        </div>

        {/* AI confidence */}
        {ticket.confidence > 0 && (
          <div className="detail-row">
            <span className="detail-key">AI Confidence</span>
            <div className="confidence-bar-wrap">
              <div className="confidence-bar">
                <div
                  className="confidence-fill"
                  style={{ width: `${ticket.confidence}%` }}
                />
              </div>
              <span className="confidence-val">{ticket.confidence}%</span>
            </div>
          </div>
        )}

        {/* Status picker */}
        <div className="detail-section">
          <span className="detail-key">Status</span>
          <div className="pill-picker">
            {["OPEN", "IN_PROGRESS", "RESOLVED"].map((st) => {
              const style = STATUS_STYLE[st];
              return (
                <button
                  key={st}
                  className={`pill-option ${ticket.status === st ? "pill-selected" : ""}`}
                  style={
                    ticket.status === st
                      ? {
                          background: style.bg,
                          color: style.color,
                          borderColor: style.color,
                        }
                      : {}
                  }
                  onClick={() => handleStatusChange(st)}
                >
                  {style.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Priority picker */}
        <div className="detail-section">
          <span className="detail-key">Priority</span>
          <div className="pill-picker">
            {[
              { val: "LOW", label: "🟢 Low", color: "#16a34a", bg: "#f0fdf4" },
              {
                val: "MEDIUM",
                label: "🟡 Medium",
                color: "#d97706",
                bg: "#fef3c7",
              },
              {
                val: "HIGH",
                label: "🔴 High",
                color: "#dc2626",
                bg: "#fee2e2",
              },
            ].map((p) => (
              <button
                key={p.val}
                className={`pill-option ${ticket.priority === p.val ? "pill-selected" : ""}`}
                style={
                  ticket.priority === p.val
                    ? { background: p.bg, color: p.color, borderColor: p.color }
                    : {}
                }
                onClick={() => handlePriorityChange(p.val)}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dates */}
        <div className="detail-section">
          <div className="detail-row">
            <span className="detail-key">Created</span>
            <span className="detail-val">{formatDate(ticket.createdAt)}</span>
          </div>
          <div className="detail-row" style={{ marginTop: 8 }}>
            <span className="detail-key">Updated</span>
            <span className="detail-val">
              {ticket.updatedAt ? formatDate(ticket.updatedAt) : "—"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminTicketChat;
