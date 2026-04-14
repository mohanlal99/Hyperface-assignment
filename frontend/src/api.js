
// api.js — All API calls to the backend live here



const BASE_URL = 'https://hyperface-assignment-wayx.vercel.app';

// Submit a new ticket
export async function createTicket(ticketData) {
  const response = await fetch(`${BASE_URL}/tickets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(ticketData)
  });
  if (!response.ok) throw new Error('Failed to create ticket');
  return response.json();
}

// Get all tickets (for the dashboard)
export async function getAllTickets() {
  const response = await fetch(`${BASE_URL}/tickets`);
  if (!response.ok) throw new Error('Failed to fetch tickets');
  return response.json();
}

// Get one ticket by ID (for the detail page)
export async function getTicketById(id) {
  const response = await fetch(`${BASE_URL}/tickets/${id}`);
  if (!response.ok) throw new Error('Ticket not found');
  return response.json();
}

// Toggle a ticket's status (OPEN → RESOLVED or back)
export async function updateTicketStatus(id) {
  const response = await fetch(`${BASE_URL}/tickets/${id}/status`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  if (!response.ok) throw new Error('Failed to update status');
  return response.json();
}

// Update the AI reply text
export async function updateTicketReply(id, reply) {
  const response = await fetch(`${BASE_URL}/tickets/${id}/reply`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reply })
  });
  if (!response.ok) throw new Error('Failed to update reply');
  return response.json();
}
