import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

console.log('Testing services with server/.env...');
console.log('QDRANT_URL:', process.env.QDRANT_URL);
console.log('NEO4J_URI:', process.env.NEO4J_URI);

// 1. Test Mongo
import mongoose from 'mongoose';
try {
    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 });
    console.log('✅ MongoDB connected successfully');
    await mongoose.disconnect();
} catch (e) {
    console.error('❌ MongoDB failed:', e.message);
}

// 2. Test Qdrant
import { QdrantClient } from '@qdrant/js-client-rest';
try {
    const qdrant = new QdrantClient({
        url: process.env.QDRANT_URL?.trim().replace(/\/$/, ''),
        apiKey: process.env.QDRANT_API_KEY
    });
    const collections = await qdrant.getCollections();
    console.log('✅ Qdrant connected. Collections:', collections.collections.map(c => c.name));
} catch (e) {
    console.error('❌ Qdrant failed:', e.message);
}

// 3. Test Neo4j
import neo4j from 'neo4j-driver';
try {
    const driver = neo4j.driver(
        process.env.NEO4J_URI,
        neo4j.auth.basic(process.env.NEO4J_USERNAME, process.env.NEO4J_PASSWORD)
    );
    const serverInfo = await driver.getServerInfo();
    console.log('✅ Neo4j connected:', serverInfo.address);
    await driver.close();
} catch (e) {
    console.error('❌ Neo4j failed:', e.message);
}

// 4. Test Gemini
import { GoogleGenAI } from '@google/genai';
try {
    const gemini = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await gemini.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: 'Say hello in one word'
    });
    console.log('✅ Gemini (gemini-2.0-flash) succeeded:', response.text?.trim());
} catch (e) {
    console.error('❌ Gemini (gemini-2.0-flash) failed:', e.message);
}

// 4b. Test Gemini configured model
try {
    const gemini = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await gemini.models.generateContent({
        model: process.env.GEMINI_CHAT_MODEL || 'gemini-3.6-flash',
        contents: 'Say hello in one word'
    });
    console.log(`✅ Gemini (${process.env.GEMINI_CHAT_MODEL}) succeeded:`, response.text?.trim());
} catch (e) {
    console.error(`❌ Gemini (${process.env.GEMINI_CHAT_MODEL}) failed:`, e.message);
}

// 4c. Test Gemini embedding gemini-embedding-001
try {
    const gemini = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const result = await gemini.models.embedContent({
        model: 'gemini-embedding-001',
        contents: 'test embedding'
    });
    console.log('✅ Gemini embedding (gemini-embedding-001) succeeded, dimension:', result.embeddings?.[0]?.values?.length);
} catch (e) {
    console.error('❌ Gemini embedding (gemini-embedding-001) failed:', e.message);
}

// 4d. Test text-embedding-004
try {
    const gemini = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const result = await gemini.models.embedContent({
        model: 'text-embedding-004',
        contents: 'test embedding'
    });
    console.log('✅ Gemini embedding (text-embedding-004) succeeded, dimension:', result.embeddings?.[0]?.values?.length);
} catch (e) {
    console.error('❌ Gemini embedding (text-embedding-004) failed:', e.message);
}

// 5. Test Groq
import Groq from 'groq-sdk';
try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const res = await groq.chat.completions.create({
        messages: [{ role: 'user', content: 'Say hello in one word' }],
        model: process.env.GROQ_CHAT_MODEL || 'llama-3.3-70b-versatile'
    });
    console.log('✅ Groq succeeded:', res.choices[0]?.message?.content?.trim());
} catch (e) {
    console.error('❌ Groq failed:', e.message);
}

// 6. Test SMTP
import nodemailer from 'nodemailer';
try {
    const smtpPort = Number(process.env.SMTP_PORT || 587);
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: smtpPort,
        family: 4,
        secure: smtpPort === 465,
        requireTLS: smtpPort === 587,
        auth: {
            user: process.env.SMTP_USER || '',
            pass: (process.env.SMTP_PASS || '').replace(/\s+/g, '')
        }
    });
    await transporter.verify();
    console.log('✅ SMTP verified for:', process.env.SMTP_USER);
} catch (e) {
    console.error('❌ SMTP failed:', e.message);
}
