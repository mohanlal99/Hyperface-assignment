# 🎫 AI-Powered Support Ticket Assistant

A full-stack support ticket system where AI (Google Gemini) automatically classifies 
tickets and generates professional replies.

---

## 🗂 Project Structure

```
project/
├── backend/
│   ├── server.js          ← Express server entry point
│   ├── routes/
│   │   └── tickets.js     ← All API routes + logic
│   ├── .env.example       ← Copy this to .env
│   └── package.json
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── App.js          ← Root component with routing
    │   ├── App.css         ← All styles
    │   ├── index.js        ← React entry point
    │   ├── api.js          ← All fetch calls to backend
    │   └── pages/
    │       ├── CreateTicket.jsx   ← Submit ticket form
    │       ├── Dashboard.jsx      ← List all tickets
    │       └── TicketDetail.jsx   ← View one ticket
    └── package.json
```

---

## 🚀 How to Run

```bash
# Go into backend folder
cd backend

# Install dependencies
npm install

# Create your .env file
cp .env.example .env

# Start the backend server
npm run dev
```

`Backend runs at: http://localhost:5000`

---

### Step 3: Set Up the Frontend

```bash
# Go into frontend folder
cd frontend

# Install dependencies
npm install

# Start React
npm start
```

`Frontend opens at: http://localhost:3000`

---

## 📡 API Endpoints

| Method | URL                        | What it does                    |
|--------|----------------------------|---------------------------------|
| POST   | /tickets                   | Create ticket + call AI         |
| GET    | /tickets                   | Get all tickets                 |
| GET    | /tickets/:id               | Get one ticket                  |
| POST   | /tickets/:id/status        | Toggle OPEN / RESOLVED          |
| POST   | /tickets/:id/reply         | Update the AI reply             |

---

## 🤖 How AI Works

1. User submits a ticket with their issue
2. Backend saves the ticket immediately
3. Backend sends the issue to Google Gemini with a prompt:
   > "Classify this ticket as PAYMENT, LOGIN, BUG, or OTHER. Generate a professional reply."
4. Gemini returns: `{ category, reply, confidence }`
5. Ticket is updated with AI results
6. If AI fails → ticket is kept with default: `category = OTHER`

---

## 💡 Pages

- **`/`** — Submit Ticket form (Name, Email, Priority, Description)
- **`/dashboard`** — Table of all tickets with category, status, priority
- **`/ticket/:id`** — Full ticket detail with AI reply + actions



## 🛠 Tech Stack

| Part     | Technology                          |
|----------|-------------------------------------|
| Frontend | React 18, React Router v6           |
| Backend  | Node.js, Express                    |
| Database | In-memory array       |
| AI       | Google Gemini 1.5 Flash (free tier) |
| Styling  | Custom CSS (no frameworks)          |
