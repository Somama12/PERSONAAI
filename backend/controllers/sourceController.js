const Source = require('../models/Source');
const Message = require('../models/Message');
const pdfParse = require('pdf-parse');
const cheerio = require('cheerio');
const { GoogleGenAI } = require('@google/genai');

const ai = process.env.GEMINI_API_KEY ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }) : null;

// Helper: Get Embedding using Gemini
async function getEmbedding(text) {
    if (!ai) throw new Error("Gemini API not configured");
    // Using simple text-embedding-004 model
    const response = await ai.models.embedContent({
        model: "text-embedding-004",
        content: text
    });
    return response.embedding.values;
}

// Helper: Cosine Similarity
function cosineSimilarity(vecA, vecB) {
    let dotProduct = 0.0;
    let normA = 0.0;
    let normB = 0.0;
    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] ** 2;
        normB += vecB[i] ** 2;
    }
    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Helper: Chunk Text
function chunkText(text, maxWords = 200) {
    const words = text.split(/\s+/);
    const chunks = [];
    for (let i = 0; i < words.length; i += maxWords) {
        chunks.push(words.slice(i, i + maxWords).join(' '));
    }
    return chunks;
}

exports.uploadPdf = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No PDF provided' });
        const { userId } = req.body;

        const data = await pdfParse(req.file.buffer);
        const text = data.text;

        const chunks = chunkText(text);

        let contentChunks = [];
        for (const chunk of chunks) {
            if (chunk.trim() === '') continue;
            const embedding = await getEmbedding(chunk);
            contentChunks.push({ text: chunk, embedding });
        }

        const source = new Source({
            userId,
            filename: req.file.originalname,
            type: 'pdf',
            contentChunks
        });

        await source.save();
        res.status(201).json({ sourceId: source._id, filename: source.filename });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
};

exports.scrapeUrl = async (req, res) => {
    try {
        const { userId, url } = req.body;

        // Use native fetch to get HTML
        const fetchRes = await fetch(url);
        const html = await fetchRes.text();

        const $ = cheerio.load(html);
        $('script, style, nav, footer, iframe, header').remove();
        const text = $('body').text().replace(/\s+/g, ' ').trim();

        const chunks = chunkText(text);

        let contentChunks = [];
        for (const chunk of chunks) {
            if (chunk.trim() === '') continue;
            const embedding = await getEmbedding(chunk);
            contentChunks.push({ text: chunk, embedding });
        }

        const source = new Source({
            userId,
            url,
            type: 'url',
            contentChunks
        });

        await source.save();
        res.status(201).json({ sourceId: source._id, url: source.url });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
};

exports.querySource = async (req, res) => {
    try {
        const { userId, sourceId, query } = req.body;

        const source = await Source.findById(sourceId);
        if (!source) return res.status(404).json({ message: 'Source not found' });

        const queryEmbedding = await getEmbedding(query);

        // Find top 3 most similar chunks
        const scoredChunks = source.contentChunks.map(chunk => ({
            text: chunk.text,
            score: cosineSimilarity(queryEmbedding, chunk.embedding)
        }));

        scoredChunks.sort((a, b) => b.score - a.score);
        const topChunks = scoredChunks.slice(0, 3).map(c => c.text);

        const contextText = topChunks.join('\n\n');

        const prompt = `
            You must answer the user's question STRICTLY using the provided context from a source document.
            If the answer is not in the context, say "I cannot answer this based on the provided source." Do not use outside knowledge.
            
            Context from source:
            ${contextText}
            
            User's question: ${query}
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        const aiText = response.text || "I'm sorry, I couldn't process that.";

        const userMessage = new Message({ userId, text: query, category: 'Learning', role: 'user', mode: 'Source', sourceId });
        await userMessage.save();

        const aiMessage = new Message({ userId, text: aiText, category: 'Learning', role: 'ai', mode: 'Source', sourceId });
        await aiMessage.save();

        res.status(200).json({ userMessage, aiMessage });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
};

exports.getUserSources = async (req, res) => {
    try {
        const { userId } = req.params;
        const sources = await Source.find({ userId }).select('-contentChunks').sort({ createdAt: -1 });
        res.status(200).json(sources);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
};

exports.deleteSource = async (req, res) => {
    try {
        const { sourceId } = req.params;
        await Source.findByIdAndDelete(sourceId);
        // Also delete messages associated with this source
        await Message.deleteMany({ sourceId });
        res.status(200).json({ message: 'Source deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
};
