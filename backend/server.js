require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { GoogleGenAI } = require('@google/genai');

const User = require('./models/User');
const Message = require('./models/Message');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Initialize Gemini
let ai;
if (process.env.GEMINI_API_KEY) {
    ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
}

// Auth Routes
app.post('/api/signup', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: 'User already exists' });

        const user = new User({ email, password });
        await user.save();
        res.status(201).json({ message: 'User created successfully', user: { _id: user._id, email: user.email } });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

        const user = await User.findOne({ email });
        if (!user || user.password !== password) return res.status(401).json({ message: 'Invalid credentials' });

        res.status(200).json({ message: 'Login successful', user: { _id: user._id, email: user.email } });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Chat Routes
app.get('/api/messages', async (req, res) => {
    try {
        const { userId } = req.query;
        if (!userId) return res.status(400).json({ message: 'userId is required' });

        const messages = await Message.find({ userId }).sort({ createdAt: 1 });
        res.status(200).json(messages);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.get('/api/messages/category/:category', async (req, res) => {
    try {
        const { userId } = req.query;
        const { category } = req.params;
        if (!userId) return res.status(400).json({ message: 'userId is required' });

        const messages = await Message.find({ userId, category }).sort({ createdAt: 1 });
        res.status(200).json(messages);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.post('/api/chat', async (req, res) => {
    try {
        const { userId, text, category } = req.body;
        if (!userId || !text) return res.status(400).json({ message: 'userId and text are required' });

        // Save user message
        const userMessage = new Message({ userId, text, category: category || 'Miscellaneous', role: 'user' });
        await userMessage.save();

        if (!ai) {
            return res.status(500).json({ message: 'Gemini API not configured' });
        }

        // Fetch context
        const contextMessages = await Message.find({ userId }).sort({ createdAt: -1 }).limit(10);
        contextMessages.reverse();

        let historyPrompt = "User conversation history:\n";
        contextMessages.forEach(msg => {
            historyPrompt += `${msg.role === 'user' ? 'User message' : 'AI message'}:\n"${msg.text}"\n`;
        });
        historyPrompt += `\nInstructions: Answer based on the conversation history.`;

        // Generate response
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: historyPrompt,
        });

        const aiText = response.text || "I'm sorry, I couldn't process that.";

        // Save AI message
        const aiMessage = new Message({ userId, text: aiText, category: category || 'Miscellaneous', role: 'ai' });
        await aiMessage.save();

        res.status(200).json({ userMessage, aiMessage });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`✅ Backend server running on port ${PORT}`));
