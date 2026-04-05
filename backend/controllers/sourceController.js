const Source = require('../models/Source');
const Message = require('../models/Message');
const pdfParse = require('pdf-parse');
const cheerio = require('cheerio');
const { GoogleGenAI } = require('@google/genai');

const ai = process.env.GEMINI_API_KEY ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }) : null;

// Separate v1 client — gemini-embedding-2-preview is not available on v1beta (SDK default)
const aiEmbed = process.env.GEMINI_API_KEY
    ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
    : null;

const VALID_CATEGORIES = ['Work', 'Personal', 'Ideas', 'Learning', 'Health', 'Miscellaneous'];

// ── Helper: Get Embedding ──────────────────────────────────────────────────────
async function getEmbedding(text) {
    if (!aiEmbed) throw new Error('Gemini API not configured');
    const response = await aiEmbed.models.embedContent({
        model: 'gemini-embedding-2-preview',
        contents: text,
    });
    const embeddingObj = response.embeddings?.[0] ?? response.embedding;
    return embeddingObj.values;
}

async function getEmbeddingsBatch(texts) {
    if (!aiEmbed) throw new Error('Gemini API not configured');
    if (!texts || texts.length === 0) return [];
    
    // Batch in chunks to respect API limits if extremely large, though embedContent allows array
    const BATCH_SIZE = 100;
    const allEmbeddings = [];
    
    for (let i = 0; i < texts.length; i += BATCH_SIZE) {
        const batch = texts.slice(i, i + BATCH_SIZE);
        const response = await aiEmbed.models.embedContent({
            model: 'gemini-embedding-2-preview',
            contents: batch,
        });
        const batchEmbeddings = response.embeddings.map(e => e.values);
        allEmbeddings.push(...batchEmbeddings);
    }
    
    return allEmbeddings;
}

// ── Helper: Cosine Similarity ──────────────────────────────────────────────────
function cosineSimilarity(vecA, vecB) {
    let dot = 0, normA = 0, normB = 0;
    for (let i = 0; i < vecA.length; i++) {
        dot += vecA[i] * vecB[i];
        normA += vecA[i] ** 2;
        normB += vecB[i] ** 2;
    }
    if (normA === 0 || normB === 0) return 0;
    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

// ── Helper: Sentence-aware chunking ───────────────────────────────────────────
// Splits text at sentence boundaries, accumulating up to maxChars before starting a new chunk.
// This avoids cutting mid-sentence which degrades embedding quality.
function chunkText(text, maxChars = 1200) {
    // Normalize whitespace
    const normalized = text.replace(/\s+/g, ' ').trim();

    // Split into sentences using punctuation boundaries
    const sentences = normalized.match(/[^.!?]+[.!?]+["']?|[^.!?]+$/g) || [normalized];

    const chunks = [];
    let current = '';

    for (const sentence of sentences) {
        const trimmed = sentence.trim();
        if (!trimmed) continue;

        if ((current + ' ' + trimmed).trim().length > maxChars && current.length > 0) {
            chunks.push(current.trim());
            current = trimmed;
        } else {
            current = current ? current + ' ' + trimmed : trimmed;
        }
    }

    if (current.trim()) chunks.push(current.trim());
    return chunks;
}

// ── Helper: Detect best category for source query ─────────────────────────────
async function detectQueryCategory(query) {
    if (!ai) return 'Learning';
    try {
        const prompt = `Classify this query into one category: Work, Personal, Ideas, Learning, Health, Miscellaneous.\nQuery: "${query}"\nReturn ONLY the category word.`;
        const res = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
        const cat = (res.text || '').trim();
        const formatted = cat.charAt(0).toUpperCase() + cat.slice(1).toLowerCase();
        return VALID_CATEGORIES.includes(formatted) ? formatted : 'Learning';
    } catch {
        return 'Learning';
    }
}

// ── uploadPdf ──────────────────────────────────────────────────────────────────
exports.uploadPdf = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No PDF provided' });
        const { userId } = req.body;

        const data = await pdfParse(req.file.buffer);
        const chunks = chunkText(data.text);

        const validChunks = chunks.filter(c => c.trim() !== '');
        const contentChunks = [];
        if (validChunks.length > 0) {
            const embeddings = await getEmbeddingsBatch(validChunks);
            for (let i = 0; i < validChunks.length; i++) {
                contentChunks.push({ text: validChunks[i], embedding: embeddings[i] });
            }
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

// ── scrapeUrl ──────────────────────────────────────────────────────────────────
exports.scrapeUrl = async (req, res) => {
    try {
        const { userId, url } = req.body;

        const fetchRes = await fetch(url);
        const html = await fetchRes.text();

        const $ = cheerio.load(html);
        $('script, style, nav, footer, iframe, header').remove();
        const text = $('body').text().replace(/\s+/g, ' ').trim();

        const chunks = chunkText(text);

        const validChunks = chunks.filter(c => c.trim() !== '');
        const contentChunks = [];
        if (validChunks.length > 0) {
            const embeddings = await getEmbeddingsBatch(validChunks);
            for (let i = 0; i < validChunks.length; i++) {
                contentChunks.push({ text: validChunks[i], embedding: embeddings[i] });
            }
        }

        const source = new Source({ userId, url, type: 'url', contentChunks });
        await source.save();
        res.status(201).json({ sourceId: source._id, url: source.url });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
};

// ── querySource ────────────────────────────────────────────────────────────────
exports.querySource = async (req, res) => {
    try {
        const { userId, sourceId, query } = req.body;

        const source = await Source.findById(sourceId);
        if (!source) return res.status(404).json({ message: 'Source not found' });

        const queryEmbedding = await getEmbedding(query);

        // Score all chunks and pick top 4
        const scoredChunks = source.contentChunks
            .map(chunk => ({ text: chunk.text, score: cosineSimilarity(queryEmbedding, chunk.embedding) }))
            .sort((a, b) => b.score - a.score)
            .slice(0, 4);

        const contextText = scoredChunks.map(c => c.text).join('\n\n');

        const prompt = `
You must answer the user's question STRICTLY using the provided context from a source document.
If the answer is not in the context, say "I cannot answer this based on the provided source." Do not use outside knowledge.

Context from source:
${contextText}

User's question: ${query}
        `.trim();

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        const aiText = response.text || "I'm sorry, I couldn't process that.";

        // ── Detect query category instead of hardcoding 'Learning' ──
        const queryCategory = await detectQueryCategory(query);

        const userMessage = new Message({ userId, text: query, category: queryCategory, role: 'user', mode: 'Source', sourceId });
        await userMessage.save();

        const aiMessage = new Message({ userId, text: aiText, category: queryCategory, role: 'ai', mode: 'Source', sourceId });
        await aiMessage.save();

        res.status(200).json({ userMessage, aiMessage });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
};

// ── getUserSources ─────────────────────────────────────────────────────────────
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

// ── deleteSource ───────────────────────────────────────────────────────────────
exports.deleteSource = async (req, res) => {
    try {
        const { sourceId } = req.params;
        await Source.findByIdAndDelete(sourceId);
        await Message.deleteMany({ sourceId });
        res.status(200).json({ message: 'Source deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
};
