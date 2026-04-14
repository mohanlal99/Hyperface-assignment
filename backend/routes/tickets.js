import express from "express";
import { v4 as uuidv4 } from "uuid";
import genAi from "../config/google.api.js";

const router = express.Router();


// In-memory "database" — just a plain array.
// Tickets are stored here while the server runs.

let tickets = [];

// HELPER: Call Gemini AI to classify the ticket
async function callGeminiAI(issueDescription) {
  try {
    // Use latest working model
    const model = genAi.getGenerativeModel({
      model: "gemini-2.5-flash-lite",
    });

    const prompt = `You are a customer support assistant.

            Classify the ticket into ONE category:
            PAYMENT, LOGIN, BUG, OTHER

          Also generate a short professional reply.

          Return ONLY JSON:
          {
            "category": "",
            "reply": "",
            "confidence": 0-100
          }

          Ticket: ${issueDescription}
        `;

    const result = await model.generateContent(prompt);
    const response = await result.response;

    // IMPORTANT: text() is a function
    const text = response.text();

    // Clean response (remove ``` if exists)
    const cleanText = text.replace(/```json|```/g, "").trim();

    let parsed;

    try {
      parsed = JSON.parse(cleanText);
    } catch (err) {
      // If JSON fails → fallback
      parsed = {
        category: "OTHER",
        reply: "We will get back to you shortly.",
        confidence: 0,
      };
    }

    // Ensure valid category
    const validCategories = ["PAYMENT", "LOGIN", "BUG", "OTHER"];

    return {
      category: validCategories.includes(parsed.category)
        ? parsed.category
        : "OTHER",
      reply: parsed.reply || "We will get back to you shortly.",
      confidence: parsed.confidence || 0,
    };
  } catch (error) {
    console.error("Gemini SDK Error:", error.message);

    return {
      category: "OTHER",
      reply: "We will get back to you shortly.",
      confidence: 0,
    };
  }
}


// POST /tickets
// Creates a new ticket, then calls AI to classify it and generate a reply.
router.post("/", async (req, res) => {
  const { name, email, description, priority } = req.body;

  // Make sure all required fields are present
  if (!name || !email || !description) {
    return res
      .status(400)
      .json({ error: "Name, email, and description are required." });
  }

  // Build the ticket object with default values
  const ticket = {
    id: uuidv4(), // Unique ID
    name,
    email,
    description,
    priority: priority || "MEDIUM", // LOW / MEDIUM / HIGH
    status: "OPEN", // All tickets start as OPEN
    category: "OTHER", // Will be updated by AI
    aiReply: "We will get back to you shortly.", // Default reply if AI fails
    confidence: 0,
    createdAt: new Date().toISOString(),
    updatedAt: null,
  };

  // Save the ticket right away (before calling AI)
  // This way, even if AI fails, the ticket is saved.
  tickets.push(ticket);

  // Now call Gemini AI to classify the ticket
  try {
    const aiResult = await callGeminiAI(description);

    // Update ticket with what AI returned
    ticket.category = aiResult.category || "OTHER";
    ticket.aiReply = aiResult.reply || "We will get back to you shortly.";
    ticket.confidence = aiResult.confidence || 0;

    console.log(`✅ AI classified ticket as: ${ticket.category}`);
  } catch (aiError) {
    // AI call failed — that's okay, ticket is already saved with default values
    console.error("⚠️  AI failed, using defaults. Error:", aiError.message);
  }

  // Return the saved ticket to the frontend
  res.status(201).json(ticket);
});


// GET /tickets
// Returns all tickets (newest first)
router.get("/", (req, res) => {
  // Reverse so newest tickets show first
  const sortedTickets = [...tickets].reverse();
  res.json(sortedTickets);
});


// GET /tickets/:id
// Returns one specific ticket by its ID
router.get("/:id", (req, res) => {
  const ticket = tickets.find((t) => t.id === req.params.id);

  if (!ticket) {
    return res.status(404).json({ error: "Ticket not found." });
  }

  res.json(ticket);
});


// POST /tickets/:id/status
// Toggles ticket status between OPEN and RESOLVED
router.post("/:id/status", (req, res) => {
  const ticket = tickets.find((t) => t.id === req.params.id);

  if (!ticket) {
    return res.status(404).json({ error: "Ticket not found." });
  }

  // Flip the status
  ticket.status = ticket.status === "OPEN" ? "RESOLVED" : "OPEN";
  ticket.updatedAt = new Date().toISOString();

  res.json(ticket);
});


// POST /tickets/:id/reply
// Updates the AI-generated reply manually (useful if AI gave a bad reply)
router.post("/:id/reply", (req, res) => {
  const { reply } = req.body;
  const ticket = tickets.find((t) => t.id === req.params.id);

  if (!ticket) {
    return res.status(404).json({ error: "Ticket not found." });
  }

  if (!reply || reply.trim() === "") {
    return res.status(400).json({ error: "Reply text cannot be empty." });
  }

  ticket.aiReply = reply;
  ticket.updatedAt = new Date().toISOString();

  res.json(ticket);
});


export default router