const Memory = require('../models/Memory');
const Message = require('../models/Message');
const { GoogleGenAI } = require('@google/genai');

const ai = process.env.GEMINI_API_KEY ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }) : null;
const VALID_CATEGORIES = ['Work', 'Personal', 'Ideas', 'Learning', 'Health', 'Miscellaneous'];

exports.extractMemory = async (req, res) => {
    try {
        const { userId, text } = req.body;
        if (!userId || !text) return res.status(400).json({ message: 'User ID and text required' });

        if (!ai) return res.status(500).json({ message: 'AI not configured' });

        // Retrieve existing memories to avoid re-extracting the exact same factual string
        const existingMemories = await Memory.find({ userId });
        const memoryContext = existingMemories.map(m => `- ${m.content}`).join('\n');

        const prompt = `
Extract core actionable facts or long-term personal details about the user from the following text.
If no important fact exists, output empty array [].
Otherwise, return a JSON array of objects with keys: "fact" (String), "category" (String: Work, Personal, Ideas, Learning, Health, Miscellaneous), "confidence" (Number between 0.1 and 1.0).

Already known facts:
${memoryContext || "None"}

Please DO NOT RE-EXTRACT facts that are already in the "Already known facts" list!

Text: "${text}"
`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { responseMimeType: 'application/json' }
        });

        const data = JSON.parse(response.text.trim());
        if (!Array.isArray(data) || data.length === 0) {
            return res.status(200).json({ extracted: [] });
        }

        res.status(200).json({ extracted: data });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.confirmMemory = async (req, res) => {
    try {
        const { userId, content, category, confidence } = req.body;
        const finalCategory = VALID_CATEGORIES.includes(category) ? category : 'Miscellaneous';

        // Duplicate and Contradiction Check
        if (ai) {
            const existing = await Memory.find({ userId, category: finalCategory });
            if (existing.length > 0) {
                const existingList = existing.map(m => `ID: ${m._id}, Content: ${m.content}`).join('\n');
                const conflictPrompt = `
You are checking a personal memory database for contradictions or exact duplicates.

New fact to save: "${content}"

Existing memories in the same category:
${existingList}

Does the new fact contradict or closely duplicate any existing memory? 
Return JSON: { "conflict": true/false, "conflictingId": "THE_ID", "resolution": "Brief explanation" }
Return ONLY the JSON object.
                `.trim();

                try {
                    const conflictRes = await ai.models.generateContent({
                        model: 'gemini-2.5-flash',
                        contents: conflictPrompt,
                        config: { responseMimeType: 'application/json' }
                    });

                    const conflictData = JSON.parse(conflictRes.text.trim());

                    if (conflictData.conflict && conflictData.conflictingId) {
                        const updated = await Memory.findByIdAndUpdate(
                            conflictData.conflictingId,
                            { content, confidence, updatedAt: new Date() },
                            { new: true }
                        );
                        if (updated) {
                            return res.status(200).json({ memory: updated, replaced: true, resolution: conflictData.resolution });
                        }
                    }
                } catch (e) {
                    console.error('Conflict detection failed (non-fatal):', e.message);
                }
            }
        }

        const memory = new Memory({ userId, content, category: finalCategory, confidence, source: 'conversation' });
        await memory.save();
        res.status(201).json({ memory, replaced: false });
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
