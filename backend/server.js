const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { Groq } = require('groq-sdk');
require("dotenv").config();

const app = express();

// ================= Middleware =================
app.use(cors({
  origin: process.env.FRONTEND_URL || "https://cognitia-frontend1.vercel.app",
  methods: ["GET", "POST", "OPTIONS"],
  credentials: true
}));
app.use(express.json());

// ================= MongoDB Connection =================
mongoose.set("strictQuery", true);

if (process.env.MONGO_URI) {
  mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB Connected"))
    .catch(err => console.error("❌ MongoDB Error:", err));
}

// ================= Schema =================
const chatSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: String, required: true },
  date: { type: Date, default: Date.now }
});
const Chat = mongoose.model('Chat', chatSchema);

// ================= Groq Setup =================
const groq = process.env.GROQ_API_KEY
  ? new Groq({ apiKey: process.env.GROQ_API_KEY })
  : null;

// ================= Routes =================
app.get('/', (req, res) => {
  res.json({ status: "ok", message: "🚀 Cognitia Server Running..." });
});

app.post('/api/ask', async (req, res) => {
  const { question } = req.body;

  if (!question || typeof question !== 'string' || !question.trim()) {
    return res.status(400).json({ error: "Question is required" });
  }

  if (!groq) {
    return res.status(500).json({ error: "AI not configured. GROQ_API_KEY is missing." });
  }

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are Cognitia, a helpful and concise AI assistant. Answer clearly and accurately."
        },
        {
          role: "user",
          content: question.trim()
        }
      ],
      model: "llama-3.1-8b-instant",
      max_tokens: 1024,
      temperature: 0.7,
    });

    const aiAnswer = completion.choices[0].message.content;

    // Save to MongoDB
    const newChat = new Chat({ question: question.trim(), answer: aiAnswer });
    await newChat.save();

    res.json({ answer: aiAnswer });
  } catch (error) {
    console.error("❌ Error:", error.message);
    res.status(500).json({ error: "Server error. Please try again." });
  }
});
app.get('/api/ask', (req, res) => {
  res.json({
    status: "API working ✅",
    message: "Use POST to send question"
  });
});
// ================= Vercel Export =================
module.exports = app;

// Local development
const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Server live at http://localhost:${PORT}`);
  });
}
module.exports = app;