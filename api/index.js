// 1. Load environment variables
require('dotenv').config();

// 2. Import dependencies
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// 3. Middleware
app.use(cors()); 
app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// 4. THE DATA MODEL
const adSchema = new mongoose.Schema({
    city: { type: String, index: true },      
    category: { type: String, index: true },  
    title: String,
    phone: String,
    whatsapp: String,
    telegram: String,
    snapchat: String,
    content: String,
    price: String,
    age: String,
    images: [String], 
    createdAt: { type: Date, default: Date.now, index: true } 
});

const Ad = mongoose.models.Ad || mongoose.model('Ad', adSchema);

// 5. MongoDB Connection Logic (Optimized for Serverless)
let isConnected = false;
const connectDB = async () => {
    if (isConnected) return;
    if (!process.env.MONGO_URI) {
        throw new Error('MONGO_URI is not configured. Set the environment variable in Vercel and/or local .env file.');
    }
    try {
        const db = await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
        });
        isConnected = db.connections[0].readyState;
        console.log('✅ MongoDB Connected');
    } catch (err) {
        console.error('❌ DB Error:', err.message);
        throw err; // Re-throw to handle in routes
    }
};

const escapeRegex = (value) => {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

// 6. ROUTES 
// REMOVED "/api" from the path here because vercel.json adds it automatically
const handleAdsRequest = async (req, res) => {
    console.log('GET /ads called with query:', req.query);
    await connectDB();
    try {
        const { city, cat } = req.query;
        let query = {};

        if (city) query.city = { $regex: new RegExp('^' + escapeRegex(city.trim()) + '$', 'i') };
        if (cat) query.category = { $regex: new RegExp('^' + escapeRegex(cat.trim()) + '$', 'i') };

        console.log('Query:', query);
        const ads = await Ad.find(query)
            .sort({ createdAt: -1 })
            .limit(20)
            .lean();

        console.log('Ads found:', ads.length);
        res.json(ads);
    } catch (err) {
        console.error('Error in GET /ads:', err);
        res.status(500).json({ error: err.message || 'Failed to fetch ads' });
    }
};

app.get('/ads', handleAdsRequest);
app.get('/api/ads', handleAdsRequest);

app.post('/ads', async (req, res) => {
    await connectDB();
    try {
        const newAd = new Ad(req.body);
        await newAd.save();
        res.status(201).json({ message: "Ad posted successfully!" });
    } catch (err) {
        res.status(500).json({ error: "Failed to post ad" });
    }
});

app.get('/', (req, res) => {
    res.status(200).json({ message: "Omnivo API Online" });
});

module.exports = app;