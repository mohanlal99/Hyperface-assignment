import express from "express";
import cors from "cors";
import { configDotenv } from "dotenv";
import ticketRoutes from "./routes/tickets.js";

configDotenv();

const app = express();

app.use(cors()); // Allow cors for everyone
app.use(express.json()); // This lets us read JSON from request body

// All ticket-related routes live in /routes/tickets.js
app.use('/tickets', ticketRoutes);

// Simple health check route — just to confirm server is running
app.get('/', (req, res) => {
  res.json({ message: 'Support Ticket API is running!' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
