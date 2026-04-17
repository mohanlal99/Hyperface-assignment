import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const ticketSchema = new mongoose.Schema({
  // Who submitted this ticket
   ticketId: {
    type: String,
    unique: true,
    default: uuidv4
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userName:  { type: String, required: true },
  userEmail: { type: String, required: true },

  description: { type: String, required: true },
  priority: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH'],
    default: 'MEDIUM'
  },

  status: {
    type: String,
    enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED'],
    default: 'OPEN'
  },

  category:   { type: String, enum: ['PAYMENT', 'LOGIN', 'BUG', 'OTHER'], default: 'OTHER' },
  confidence: { type: Number, default: 0 }, // AI confidence score 0-100

  aiProcessed: { type: Boolean, default: false }

}, { timestamps: true });

const Ticket = mongoose.models.Ticket || mongoose.model('Ticket', ticketSchema);

export default Ticket;
