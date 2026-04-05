require('dotenv').config({ path: '.env' });
const { GoogleGenAI } = require('@google/genai');
const aiEmbed = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
async function test() {
    console.log('Requesting...');
    try {
        const response = await aiEmbed.models.embedContent({
            model: 'gemini-embedding-2-preview',
            contents: 'hello world'
        });
        const embeddingObj = response.embeddings?.[0] ?? response.embedding;
        console.log('Length:', embeddingObj?.values?.length);
    } catch(e) { console.error('E', e.message); }
}
test();
