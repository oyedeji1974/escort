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
    try {
        const db = await mongoose.connect(process.env.MONGO_URI);
        isConnected = db.connections[0].readyState;
        console.log('✅ MongoDB Connected');
    } catch (err) {
        console.error('❌ DB Error:', err.message);
    }
};

// 6. ROUTES 
// REMOVED "/api" from the path here because vercel.json adds it automatically
app.get('/ads', async (req, res) => {
    await connectDB();
    try {
        const { city, cat } = req.query;
        let query = {};

        // Use Regex for case-insensitive matching so "Birmingham" matches "birmingham"
        if (city) query.city = { $regex: new RegExp("^" + city.trim() + "$", "i") };
        if (cat) query.category = { $regex: new RegExp("^" + cat.trim() + "$", "i") };

        const ads = await Ad.find(query)
            .sort({ createdAt: -1 })
            .limit(20) 
            .lean();   

        res.json(ads);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch ads" });
    }
});

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