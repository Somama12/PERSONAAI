const Memory = require('../models/Memory');
const Message = require('../models/Message');
const { GoogleGenAI } = require('@google/genai');

const ai = process.env.GEMINI_API_KEY ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }) : null;

exports.extractMemory = async (req, res) => {
    try {
        const { userId, text, aiResponse } = req.body;
        if (!ai) return res.status(500).json({ message: 'Gemini API not configured' });

        const prompt = `
            Analyze this recent exchange to extract any new personal facts about the user.
            User said: "${text}"
            AI replied: "${aiResponse}"

            If there is a new fact, return a JSON array of objects with keys: "fact" (String), "category" (String: Work, Personal, Ideas, Learning, Health, Miscellaneous), "confidence" (Number between 0.1 and 1.0).
            If no new facts, return [].
            Return ONLY valid JSON.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        let jsonText = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
        let extractedFacts = [];
        try {
            extractedFacts = JSON.parse(jsonText);
        } catch (e) {
            console.error("Failed to parse extracted memory JSON", e);
        }

        if (extractedFacts.length === 0) {
            return res.status(200).json({ extracted: [] });
        }

        // Check for contradictions (simplified logic: just return all extracted for frontend to verify)
        // In a real app we'd do semantic similarity here against existing memories.
        // Returning them as 'extracted' so frontend can display the confirmation toast.

        res.status(200).json({ extracted: extractedFacts });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.confirmMemory = async (req, res) => {
    try {
        const { userId, content, category, confidence } = req.body;
        const memory = new Memory({ userId, content, category, confidence, source: 'conversation' });
        await memory.save();
        res.status(201).json(memory);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateMemory = async (req, res) => {
    try {
        const { memoryId, content, category, confidence } = req.body;
        const memory = await Memory.findByIdAndUpdate(memoryId, { content, category, confidence }, { new: true });
        res.status(200).json(memory);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getMemories = async (req, res) => {
    try {
        const { userId } = req.params;
        const memories = await Memory.find({ userId }).sort({ createdAt: -1 });
        res.status(200).json(memories);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.deleteMemory = async (req, res) => {
    try {
        const { id } = req.params;
        await Memory.findByIdAndDelete(id);
        res.status(200).json({ message: 'Memory deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
