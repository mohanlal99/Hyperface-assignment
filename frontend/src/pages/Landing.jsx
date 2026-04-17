

import React from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';

function Landing() {
  const navigate = useNavigate();

  return (
    <div className="landing">
      {/* Animated background blobs */}
      <div className="landing-blob blob1" />
      <div className="landing-blob blob2" />
      <div className="landing-blob blob3" />

      {/* Top bar */}
      <header className="landing-header">
        <div className="landing-logo">
          <Logo/>
        </div>
        <button className="btn-outline-sm" onClick={() => navigate('/login')}>
          Sign In
        </button>
      </header>

      {/* Hero */}
      <main className="landing-hero">
        <div className="hero-badge">✦ Powered by Google Gemini AI</div>

        <h1 className="hero-title">
          AI-Powered Support,<br />
          <span className="hero-title-accent">Redefined.</span>
        </h1>

        <p className="hero-subtitle">
          Instant ticket classification. Smart replies. Real-time chat between
          customers and support agents — all in one place.
        </p>

        {/* The two main CTAs */}
        <div className="hero-ctas">
          <button className="cta-primary" onClick={() => navigate('/login')}>
            🔐 Login to Portal
          </button>
          <button className="cta-secondary" onClick={() => navigate('/login?intent=ticket')}>
            🎫 Raise a Ticket
          </button>
        </div>
      </main>

     
    </div>
  );
}

export default Landing;
