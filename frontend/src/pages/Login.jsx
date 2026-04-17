import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { login, register } from "../api";
import Logo from "../components/Logo";

function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login: saveLogin } = useAuth();

  const [activeTab, setActiveTab] = useState("user");

  const [mode, setMode] = useState("login");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("john@example.com");
  const [password, setPassword] = useState("User@123");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (searchParams.get("intent") === "ticket") {
      setMode("register");
      setActiveTab("user");
    }
  }, [searchParams]);

  function handleTabChange(tab) {
    setActiveTab(tab);
    setError("");
    setName("");
    setPassword("");
    if (tab === "admin") {
      setEmail("admin@hyperface.com");
      setPassword("Admin@123");
    } else {
      setEmail("john@example.com");
      setPassword("User@123");
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "login") {
        const data = await login(email, password);
        saveLogin(data.token, data.user);

        navigate(data.user.role === "admin" ? "/admin" : "/dashboard");
      } else {
        const data = await register(name, email, password);
        saveLogin(data.token, data.user);
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const isAdmin = activeTab === "admin";

  return (
    <div
      className={`login-page ${isAdmin ? "login-admin-bg" : "login-user-bg"}`}
    >
      <div className="login-blob blob1" />
      <div className="login-blob blob2" />

      {/* Logo */}
      <div className="login-logo" onClick={() => navigate("/")}>
        <Logo />
      </div>

      <div className="login-card">
        {/* Tab switcher */}
        <div className="login-tabs">
          <button
            className={`login-tab ${activeTab === "user" ? "active" : ""}`}
            onClick={() => handleTabChange("user")}
          >
            👤 User
          </button>
          <button
            className={`login-tab ${activeTab === "admin" ? "active admin-tab-active" : ""}`}
            onClick={() => handleTabChange("admin")}
          >
            🛡️ Admin
          </button>
        </div>

        <h2 className="login-title">
          {isAdmin
            ? "Admin Portal"
            : mode === "login"
              ? "Welcome back"
              : "Create account"}
        </h2>
        <p className="login-subtitle">
          {isAdmin
            ? "Access the support management dashboard"
            : mode === "login"
              ? "Sign in to manage your support tickets"
              : "Register to raise a support ticket"}
        </p>

        {/* Demo credential hint */}
        {/* <div className="demo-hint">
          {isAdmin
            ? "🔑 Demo: admin@hyperface.com / Admin@123"
            : "🔑 Demo: john@example.com / User@123"}
        </div> */}

        {error && <div className="alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          {/* Name field — only for register */}
          {mode === "register" && !isAdmin && (
            <div className="field-group">
              <label>Full Name</label>
              <input
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}

          <div className="field-group">
            <label>Email Address</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="field-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className={`login-submit-btn ${isAdmin ? "admin-submit" : ""}`}
            disabled={loading}
          >
            {loading
              ? "Please wait..."
              : isAdmin
                ? "🛡️ Enter Admin Dashboard"
                : mode === "login"
                  ? "→ Sign In"
                  : "→ Create Account & Continue"}
          </button>
        </form>

        {/* Toggle login / register — only for users */}
        {!isAdmin && (
          <p className="login-toggle">
            {mode === "login"
              ? "Don't have an account?"
              : "Already have an account?"}{" "}
            <button
              className="toggle-link"
              onClick={() => {
                setMode(mode === "login" ? "register" : "login");
                setError("");
              }}
            >
              {mode === "login" ? "Register here" : "Sign in"}
            </button>
          </p>
        )}
      </div>
    </div>
  );
}

export default Login;
