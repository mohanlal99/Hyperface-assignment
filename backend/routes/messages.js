
import express from 'express';
import Ticket from '../models/Ticket.js';
import Message from '../models/Message.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

import { GoogleGenerativeAI } from '@google/generative-ai';
import { configDotenv } from 'dotenv';

configDotenv();
const router = express.Router();


const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);


// HELPER: Generate AI reply with context
async function generateAIReply(ticket, messages) {

  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash"
  });

  const conversationHistory = messages
    .map(m => `${m.senderName} (${m.sender}): ${m.content}`)
    .join("\n");

  const prompt = `
You are a professional customer support agent for HyperFace (fintech).

Ticket Category: ${ticket.category}
Original Issue: "${ticket.description}"

Conversation so far:
${conversationHistory}

Generate EXACTLY 3 different professional replies.

Rules:
- Each reply should be 2-3 sentences
- Be empathetic and helpful
- Slight variation in tone/style
- DO NOT repeat same wording

Return ONLY JSON:
{
  "suggestions": [
    "reply 1",
    "reply 2",
    "reply 3"
  ]
}
`;

  try {
    const result = await model.generateContent(prompt);
    let text = result.response.text();

    text = text.replace(/```json|```/g, "").trim();

    return JSON.parse(text);

  } catch (err) {
    console.error("AI reply error:", err.message);

    return {
      suggestions: [
        "Thank you for reaching out. We are checking your issue and will update you shortly.",
        "We understand your concern and are currently reviewing it. Please allow us some time.",
        "Our team is looking into this issue and will get back to you soon with an update."
      ]
    };
  }
}



// GET /tickets/:id/messages — Get all messages for a ticket
router.get('/:id/messages', requireAuth, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ error: 'Ticket not found.' });

    // Users can only read their own ticket's messages
    if (req.user.role === 'user' && ticket.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    const messages = await Message.find({ ticketId: req.params.id }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch messages.' });
  }
});



// POST /tickets/:id/messages — Send a new message
router.post('/:id/messages', requireAuth, async (req, res) => {
  const { content } = req.body;

  if (!content || content.trim().length === 0) {
    return res.status(400).json({ error: 'Message cannot be empty.' });
  }

  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ error: 'Ticket not found.' });

    // Users can only message on their own tickets
    if (req.user.role === 'user' && ticket.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    const message = await Message.create({
      ticketId:   req.params.id,
      sender:     req.user.role, // 'user' or 'admin'
      senderName: req.user.name,
      content:    content.trim()
    });

    // If a user replies, move status to IN_PROGRESS (if it was OPEN)
    if (req.user.role === 'user' && ticket.status === 'OPEN') {
      await Ticket.findByIdAndUpdate(req.params.id, { status: 'IN_PROGRESS' });
    }

    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ error: 'Failed to send message.' });
  }
});



// POST /tickets/:id/messages/ai-reply

router.post('/:id/messages/ai-reply', requireAuth, requireAdmin, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ error: 'Ticket not found.' });

    // Get all existing messages to provide context
    const messages = await Message.find({ ticketId: req.params.id }).sort({ createdAt: 1 });

    const aiResult = await generateAIReply(ticket, messages);


    // const message = await Message.create({
    //   ticketId:   req.params.id,
    //   sender:     'ai',
    //   senderName: 'HyperFace AI',
    //   content:    aiContent
    // });

    res.status(201).json(aiResult);
  } catch (err) {
    console.error('AI reply error:', err.message);
    res.status(500).json({ error: 'AI could not generate a reply. Try again.' });
  }
});

export default router;
