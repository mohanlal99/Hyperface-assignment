// server.js — App starts here

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { configDotenv } from 'dotenv';

import authRoutes from './routes/auth.js';
import ticketRoutes from './routes/tickets.js';
import messageRoutes from './routes/messages.js';

configDotenv(); 
const app = express();

app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
  });

// Routes
app.use('/auth',    authRoutes);
app.use('/tickets', ticketRoutes);
app.use('/tickets', messageRoutes); 

// Health check
app.get('/', (req, res) => res.json({ status: 'HyperFace API is running' }));

// Global error handler — catches anything routes throw
app.use((err, req, res, next) => {
  console.error('Server error:', err.message);
  res.status(500).json({ error: 'Something went wrong on the server.' });
});

const PORT = process.env.PORT || 5000;


app.listen(PORT, () =>{
  
  console.log(`🚀 Server running at http://localhost:${PORT}`)});
