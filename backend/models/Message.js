// models/Message.js
// Each message in a ticket's chat thread
// sender can be 'user', 'admin', or 'ai'

import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  ticketId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ticket',
    required: true
  },
  sender: {
    type: String,
    enum: ['user', 'admin', 'ai'],
    required: true
  },
  senderName: {
    type: String,
    required: true // e.g. "John", "Admin", "HyperFace AI"
  },
  content: {
    type: String,
    required: true
  }
}, { timestamps: true });

const Message = mongoose.models.Message || mongoose.model('Message', messageSchema);

export default Message;
