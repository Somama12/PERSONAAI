const Message = require('../models/Message');
const Memory = require('../models/Memory');
const { GoogleGenAI } = require('@google/genai');

const ai = process.env.GEMINI_API_KEY ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }) : null;

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

        // Auto-categorize
        let autoCategory = category || 'Miscellaneous';
        if (!category || category === 'All') {
            const catPrompt = `Classify the following message into one category: Work, Personal, Ideas, Learning, Health, Miscellaneous. Return only the category word.\nMessage: "${text}"`;
            try {
                const catRes = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: catPrompt });
                autoCategory = catRes.text.trim();
                if (!['Work', 'Personal', 'Ideas', 'Learning', 'Health', 'Miscellaneous'].includes(autoCategory)) {
                    autoCategory = 'Miscellaneous';
                }
            } catch (e) {
                console.error("Auto-categorization failed", e);
            }
        }

        const userMessage = new Message({ userId, text, category: autoCategory, role: 'user', mode: mode || 'General' });
        await userMessage.save();

        const contextMessages = await Message.find({ userId }).sort({ createdAt: -1 }).limit(10);
        contextMessages.reverse();

        let historyPrompt = "User conversation history:\n";
        contextMessages.forEach(msg => {
            historyPrompt += `${msg.role === 'user' ? 'User' : 'AI'}: "${msg.text}"\n`;
        });
        historyPrompt += `\nInstructions: Answer the user's latest query considering the history.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: historyPrompt,
        });

        const aiText = response.text || "I'm sorry, I couldn't process that.";
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
        // In a real app we'd use vector search, but for rapid implementation per instructions we'll do regex textual search
        // against Memories and Messages since we didn't add embeddings to Memories/Messages, only Sources.
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
        if (!messages.length) return res.status(200).json({ summary: "No messages to summarize." });

        let history = "";
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
