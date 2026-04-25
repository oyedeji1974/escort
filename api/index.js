const dns = require('node:dns');
dns.setServers(['8.8.8.8', '8.8.4.4']); // Forces use of Google DNS

// 1. Load environment variables
require('dotenv').config();

// 2. Import dependencies
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// 3. Middleware - High-speed settings
// Updated CORS to be more flexible for your Vercel deployment
app.use(cors()); 
app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// 4. THE DATA MODEL (The Secret to Speed)
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

// Check if model exists to prevent re-compilation errors on Vercel
const Ad = mongoose.models.Ad || mongoose.model('Ad', adSchema);

// 5. MongoDB Connection Logic
const dbURI = process.env.MONGO_URI;

if (!dbURI) {
    console.error('❌ ERROR: MONGO_URI is missing from Environment Variables!');
}

// Connect to MongoDB (Vercel best practice: connect outside the listener)
mongoose.connect(dbURI, {
    serverSelectionTimeoutMS: 10000, // Give it 10 seconds
    connectTimeoutMS: 10000
})
.then(() => {
    console.log('✅ Connected to MongoDB Atlas');
})
.catch((err) => {
    console.error('❌ CONNECTION FAILED:', err.message);
});

// 6. ROUTES - Optimized for 1000+ Ads
app.get('/api/ads', async (req, res) => {
    try {
        const { city, cat } = req.query;
        let query = {};

        if (city) query.city = city.toLowerCase().trim();
        if (cat) query.category = cat.toLowerCase().trim();

        const ads = await Ad.find(query)
            .sort({ createdAt: -1 })
            .limit(20) 
            .lean();   

        res.json(ads);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch ads" });
    }
});

app.post('/api/ads', async (req, res) => {
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

// 7. EXPORT FOR VERCEL
// We remove app.listen and export the app instead.
// This allows Vercel to handle the server execution.
module.exports = app;