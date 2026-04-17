
const BASE = 'http://localhost:5000';

// Helper: build auth headers
function authHeader(token) {
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
}

// --- Auth ---
export async function login(email, password) {
  const r = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data.error || 'Login failed');
  return data;
}

export async function register(name, email, password) {
  const r = await fetch(`${BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password })
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data.error || 'Registration failed');
  return data;
}

// --- Tickets ---
export async function createTicket(token, description, priority) {
  const r = await fetch(`${BASE}/tickets`, {
    method: 'POST',
    headers: authHeader(token),
    body: JSON.stringify({ description, priority })
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data.error || 'Failed to create ticket');
  return data;
}

export async function getTickets(token, filters = {}) {
  const params = new URLSearchParams(filters).toString();
  const r = await fetch(`${BASE}/tickets?${params}`, { headers: authHeader(token) });
  const data = await r.json();
  if (!r.ok) throw new Error(data.error || 'Failed to fetch tickets');
  return data;
}

export async function getTicket(token, id) {
  const r = await fetch(`${BASE}/tickets/${id}`, { headers: authHeader(token) });
  const data = await r.json();
  if (!r.ok) throw new Error(data.error || 'Ticket not found');
  return data;
}

export async function updateStatus(token, id, status) {
  const r = await fetch(`${BASE}/tickets/${id}/status`, {
    method: 'PATCH',
    headers: authHeader(token),
    body: JSON.stringify({ status })
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data.error || 'Failed to update status');
  return data;
}

export async function updatePriority(token, id, priority) {
  const r = await fetch(`${BASE}/tickets/${id}/priority`, {
    method: 'PATCH',
    headers: authHeader(token),
    body: JSON.stringify({ priority })
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data.error || 'Failed to update priority');
  return data;
}

export async function getStats(token) {
  const r = await fetch(`${BASE}/tickets/stats/overview`, { headers: authHeader(token) });
  const data = await r.json();
  if (!r.ok) throw new Error(data.error || 'Failed to fetch stats');
  return data;
}

// --- Messages / Chat ---
export async function getMessages(token, ticketId) {
  const r = await fetch(`${BASE}/tickets/${ticketId}/messages`, { headers: authHeader(token) });
  const data = await r.json();
  if (!r.ok) throw new Error(data.error || 'Failed to fetch messages');
  return data;
}

export async function sendMessage(token, ticketId, content) {
  const r = await fetch(`${BASE}/tickets/${ticketId}/messages`, {
    method: 'POST',
    headers: authHeader(token),
    body: JSON.stringify({ content })
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data.error || 'Failed to send message');
  return data;
}

export async function generateAIReply(token, ticketId) {
  const r = await fetch(`${BASE}/tickets/${ticketId}/messages/ai-reply`, {
    method: 'POST',
    headers: authHeader(token)
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data.error || 'AI reply failed');
  return data;
}
