const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// --- PERMANENT CONNECTION LOGIC ---
let cachedDb = null;

const connectToDatabase = async () => {
    if (mongoose.connection.readyState >= 1) return;
    if (cachedDb) return cachedDb;

    // This prevents the "Buffering Timeout" error
    mongoose.set('strictQuery', false);
    cachedDb = await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000, // Fail fast if DB is down
    });
    return cachedDb;
};

// --- MODELS ---
const Ad = mongoose.models.Ad || mongoose.model('Ad', new mongoose.Schema({
    title: String,
    description: String,
    content: String,
    city: { type: String, lowercase: true, trim: true },
    category: { type: String, lowercase: true, trim: true },
    price: String,
    age: String,
    phone: String,
    images: [String],
    createdAt: { type: Date, default: Date.now }
}));

// --- GET ADS ROUTE ---
app.get('/api/ads', async (req, res) => {
    try {
        await connectToDatabase();
        
        const { city, cat } = req.query;
        let query = {};

        if (city && city !== 'all' && city !== 'undefined') {
            query.city = decodeURIComponent(city).toLowerCase().trim();
        }
        if (cat && cat !== 'all' && cat !== 'undefined') {
            query.category = decodeURIComponent(cat).toLowerCase().trim();
        }

        const ads = await Ad.find(query).sort({ createdAt: -1 }).limit(100);
        res.status(200).json(ads);
    } catch (err) {
        console.error("Critical Error:", err);
        res.status(500).send(err.message);
    }
});

// Auth and Post routes remain same but ensure they call await connectToDatabase();
app.post('/api/ads', async (req, res) => {
    try {
        await connectToDatabase();
        const newAd = new Ad({
            ...req.body,
            images: req.body.image ? [req.body.image] : []
        });
        await newAd.save();
        res.status(201).json({ success: true });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

module.exports = app;