const Message = require('../models/Message');
const Memory = require('../models/Memory');
const { GoogleGenAI } = require('@google/genai');

const ai = process.env.GEMINI_API_KEY ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }) : null;

const VALID_CATEGORIES = ['Work', 'Personal', 'Ideas', 'Learning', 'Health', 'Miscellaneous'];

exports.getMessages = async (req, res) => {
    try {
        const { userId } = req.query;
        if (!userId) return res.status(400).json({ message: 'userId is required' });
        const messages = await Message.find({ userId }).sort({ createdAt: 1 });
        res.status(200).json(messages);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getMessagesByCategory = async (req, res) => {
    try {
        const { userId } = req.query;
        const { category } = req.params;
        if (!userId) return res.status(400).json({ message: 'userId is required' });
        const messages = await Message.find({ userId, category }).sort({ createdAt: 1 });
        res.status(200).json(messages);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.chat = async (req, res) => {
    try {
        const { userId, text, category, mode } = req.body;
        if (!userId || !text) return res.status(400).json({ message: 'userId and text are required' });
        if (!ai) return res.status(500).json({ message: 'Gemini API not configured' });

        // Fetch recent conversation history BEFORE the call
        const contextMessages = await Message.find({ userId }).sort({ createdAt: -1 }).limit(10);
        contextMessages.reverse();

        const userMemories = await Memory.find({ userId }).sort({ createdAt: -1 });
        let memoryContext = '';
        if (userMemories.length > 0) {
            memoryContext = "Important facts about the user you MUST remember and use to answer questions:\\n";
            userMemories.forEach(mem => {
                memoryContext += `- ${mem.content}\\n`;
            });
        }

        let historyText = '';
        contextMessages.forEach(msg => {
            historyText += `${msg.role === 'user' ? 'User' : 'AI'}: "${msg.text}"\n`;
        });

        // ── SINGLE combined call: categorize + reply in one structured JSON response ──
        // This halves Gemini quota usage (was 2 calls per message, now 1).
        const combinedPrompt = `
You are PersonaAI, a helpful personal AI assistant with memory.
${memoryContext}

Conversation history:
${historyText}

Latest user message: "${text}"

Your task:
1. Respond to the user helpfully and naturally, continuing the conversation.
2. Classify the user's message into exactly one of: Work, Personal, Ideas, Learning, Health, Miscellaneous.

Return your response as a JSON object with exactly two fields:
{
  "category": "<one of the six categories>",
  "reply": "<your full AI response to the user>"
}

Return ONLY the JSON object, no markdown, no extra text.
        `.trim();

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: combinedPrompt,
            config: {
                responseMimeType: 'application/json'
            }
        });

        let autoCategory = category || 'Miscellaneous';
        let aiText = "I'm sorry, I couldn't process that.";

        try {
            const parsed = JSON.parse(response.text.trim());
            aiText = parsed.reply || aiText;
            const rawCat = (parsed.category || '').trim();
            const formattedCat = rawCat.charAt(0).toUpperCase() + rawCat.slice(1).toLowerCase();
            autoCategory = VALID_CATEGORIES.includes(formattedCat) ? formattedCat : 'Miscellaneous';
        } catch (e) {
            console.error('Failed to parse combined chat response JSON:', e);
            // Fallback: try to use the raw text as the reply
            aiText = response.text || aiText;
        }

        // Override with user-specified category if provided and valid
        if (category && category !== 'All' && VALID_CATEGORIES.includes(category)) {
            autoCategory = category;
        }

        const userMessage = new Message({ userId, text, category: autoCategory, role: 'user', mode: mode || 'General' });
        await userMessage.save();

        const aiMessage = new Message({ userId, text: aiText, category: autoCategory, role: 'ai', mode: mode || 'General' });
        await aiMessage.save();

        res.status(200).json({ userMessage, aiMessage });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.search = async (req, res) => {
    try {
        const { userId, query } = req.query;
        const msgResults = await Message.find({
            userId,
            text: { $regex: query, $options: 'i' }
        }).limit(20).sort({ createdAt: -1 });

        const memResults = await Memory.find({
            userId,
            content: { $regex: query, $options: 'i' }
        }).limit(20).sort({ createdAt: -1 });

        res.status(200).json({ messages: msgResults, memories: memResults });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.summarize = async (req, res) => {
    try {
        const { userId } = req.query;
        const { cat } = req.params;

        const messages = await Message.find({ userId, category: cat }).sort({ createdAt: 1 }).limit(50);
        if (!messages.length) return res.status(200).json({ summary: 'No messages to summarize.' });

        let history = '';
        messages.forEach(msg => {
            history += `${msg.role}: ${msg.text}\n`;
        });

        const prompt = `Summarise the following conversation history for the category '${cat}' into a single, concise paragraph.\n\n${history}`;
        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
        res.status(200).json({ summary: response.text });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
