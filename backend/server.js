const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); 
const { Groq } = require('groq-sdk');
require("dotenv").config(); // Standard config works for both local and Vercel

const app = express();

// ================= Middleware =================
app.use(cors()); 
app.use(express.json());

// ================= MongoDB Connection =================
mongoose.set("strictQuery", true);

// Note: On Vercel, MONGO_URI is added via the Dashboard, not a file.
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
const groq = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;

// ================= Routes =================

app.get('/', (req, res) => {
  res.send("🚀 Cognitia Server Running...");
});

app.post('/api/ask', async (req, res) => {
  const { question } = req.body;
  if (!question) return res.status(400).json({ error: "Question is required" });

  try {
    let aiAnswer = "AI not configured";

    if (groq) {
      const completion = await groq.chat.completions.create({
        messages: [{ role: "user", content: question }],
        model: "llama-3.1-8b-instant",
      });
      aiAnswer = completion.choices[0].message.content;
    }

    const newChat = new Chat({ question, answer: aiAnswer });
    await newChat.save();

    res.json({ answer: aiAnswer });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// ================= Server Start =================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// REMOVED: Duplicate cors code from the bottom