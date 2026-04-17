// routes/tickets.js


import express from 'express';
import Ticket from '../models/Ticket.js';
import Message from '../models/Message.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

import { GoogleGenerativeAI } from '@google/generative-ai';
import { configDotenv } from 'dotenv';

configDotenv()

const router = express.Router();


// HELPER: Send ticket to Gemini for classification
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function classifyWithAI(description) {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash", 
  });

  const prompt = `
You are a support ticket classifier for HyperFace.

Return ONLY valid JSON (no markdown, no extra text):

{
  "category": "PAYMENT or LOGIN or BUG or OTHER",
  "reply": "Short professional reply (max 2 sentences)",
  "confidence": number between 0 and 100
}

Ticket: "${description}"
`;

  try {
    const result = await model.generateContent(prompt);

    let text = result.response.text();

    // Clean markdown if exists
    text = text.replace(/```json|```/g, "").trim();

    return JSON.parse(text);
  } catch (err) {
    console.error("AI error:", err.message);

    return {
      category: "OTHER",
      reply:
        "Thank you for reaching out. Our support team will get back to you shortly.",
      confidence: 0,
    };
  }
}

// ----------------------------------------
// POST /tickets — Create a new ticket
// (user only)
// ----------------------------------------
router.post("/", requireAuth, async (req, res) => {
  const { description, priority } = req.body;

  if (!description || description.trim().length < 10) {
    return res
      .status(400)
      .json({ error: "Please describe your issue in at least 10 characters." });
  }

  try {
    // Create the ticket immediately with defaults
    const ticket = await Ticket.create({
      userId: req.user._id,
      userName: req.user.name,
      userEmail: req.user.email,
      description: description.trim(),
      priority: priority || "MEDIUM",
      status: "OPEN",
    });

    // Default AI reply in case Gemini fails
    let aiReply =
      "Thank you for reaching out. Our support team will review your issue and get back to you shortly.";
    let category = "OTHER";
    let confidence = 0;

    // Call Gemini AI
    try {
      const aiResult = await classifyWithAI(description);
      category = aiResult.category || "OTHER";
      aiReply = aiResult.reply || aiReply;
      confidence = aiResult.confidence || 0;

      // Update ticket with AI results
      ticket.category = category;
      ticket.confidence = confidence;
      ticket.aiProcessed = true;
      await ticket.save();
    } catch (aiErr) {
      console.error("⚠️ AI classification failed:", aiErr.message);
      // Ticket already saved — just continue with defaults
    }

    // Save AI's first reply as the first message in the chat
    await Message.create({
      ticketId: ticket._id,
      sender: "ai",
      senderName: "HyperFace AI",
      content: aiReply,
    });

    res.status(201).json(ticket);
  } catch (err) {
    console.error("Create ticket error:", err);
    res.status(500).json({ error: "Failed to create ticket." });
  }
});

// ----------------------------------------
// GET /tickets — Get tickets
// Admin: all tickets | User: their own tickets
// Supports filters: status, category, priority, search, date
// ----------------------------------------
router.get("/", requireAuth, async (req, res) => {
  try {
    const { status, category, priority, search, dateRange } = req.query;

    // Build the MongoDB filter
    let filter = {};

    // Users can only see their own tickets
    if (req.user.role === "user") {
      filter.userId = req.user._id;
    }

    if (status && status !== "ALL") filter.status = status;
    if (category && category !== "ALL") filter.category = category;
    if (priority && priority !== "ALL") filter.priority = priority;

    // Date range filter
    if (dateRange && dateRange !== "ALL") {
      const now = new Date();
      const ranges = {
        TODAY: new Date(now.setHours(0, 0, 0, 0)),
        WEEK: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        MONTH: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      };
      if (ranges[dateRange]) {
        filter.createdAt = { $gte: ranges[dateRange] };
      }
    }

    // Text search (searches description, userName, userEmail)
    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), "i");
      filter.$or = [
        { description: regex },
        { userName: regex },
        { userEmail: regex },
      ];
    }

    const tickets = await Ticket.find(filter).sort({ createdAt: -1 });
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch tickets." });
  }
});

// ----------------------------------------
// GET /tickets/:id — Get a single ticket
// ----------------------------------------
router.get("/:id", requireAuth, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ error: "Ticket not found." });

    // User can only see their own tickets
    if (
      req.user.role === "user" &&
      ticket.userId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ error: "Access denied." });
    }

    res.json(ticket);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch ticket." });
  }
});

// ----------------------------------------
// PATCH /tickets/:id/status — Update ticket status
// (admin only)
// ----------------------------------------
router.patch("/:id/status", requireAuth, requireAdmin, async (req, res) => {
  const { status } = req.body;

  if (!["OPEN", "IN_PROGRESS", "RESOLVED"].includes(status)) {
    return res
      .status(400)
      .json({ error: "Status must be OPEN, IN_PROGRESS, or RESOLVED." });
  }

  try {
    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }, // Return the updated document
    );
    if (!ticket) return res.status(404).json({ error: "Ticket not found." });
    res.json(ticket);
  } catch (err) {
    res.status(500).json({ error: "Failed to update status." });
  }
});

// ----------------------------------------
// PATCH /tickets/:id/priority — Update priority
// (admin only)
// ----------------------------------------
router.patch("/:id/priority", requireAuth, requireAdmin, async (req, res) => {
  const { priority } = req.body;

  if (!["LOW", "MEDIUM", "HIGH"].includes(priority)) {
    return res
      .status(400)
      .json({ error: "Priority must be LOW, MEDIUM, or HIGH." });
  }

  try {
    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      { priority },
      { new: true },
    );
    if (!ticket) return res.status(404).json({ error: "Ticket not found." });
    res.json(ticket);
  } catch (err) {
    res.status(500).json({ error: "Failed to update priority." });
  }
});

// ----------------------------------------
// GET /tickets/stats/overview — Dashboard stats for admin
// ----------------------------------------
router.get("/stats/overview", requireAuth, requireAdmin, async (req, res) => {
  try {
    const [total, open, inProgress, resolved, highPriority] = await Promise.all(
      [
        Ticket.countDocuments(),
        Ticket.countDocuments({ status: "OPEN" }),
        Ticket.countDocuments({ status: "IN_PROGRESS" }),
        Ticket.countDocuments({ status: "RESOLVED" }),
        Ticket.countDocuments({
          priority: "HIGH",
          status: { $ne: "RESOLVED" },
        }),
      ],
    );

    // Category distribution
    const categoryData = await Ticket.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);

    res.json({ total, open, inProgress, resolved, highPriority, categoryData });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch stats." });
  }
});

export default router;
