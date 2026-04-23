
const dns = require('node:dns');
dns.setServers(['8.8.8.8', '8.8.4.4']); // Forces use of Google DNS
// 1. Load environment variables

require('dotenv').config();

// 2. Import dependencies
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// 3. Middleware - High-speed settings
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

const Ad = mongoose.model('Ad', adSchema);

// 5. MongoDB Connection Logic with Debugging
const dbURI = process.env.MONGO_URI;

console.log('--- SYSTEM CHECK ---');
console.log('Checking .env file...');
if (!dbURI) {
    console.error('❌ ERROR: MONGO_URI is missing from your .env file!');
    console.log('Make sure the .env file is inside the "backend" folder.');
} else {
    console.log('✅ MONGO_URI found. Attempting to connect...');
}

mongoose.connect(dbURI, {
    serverSelectionTimeoutMS: 5000 // Fails after 5 seconds instead of hanging
})
    .then(() => {
        console.log('--------------------------------------------');
        console.log('✅ SUCCESS: Connected to MongoDB Atlas');
        console.log('--------------------------------------------');
        app.listen(PORT, () => console.log(`🚀 Server on: http://localhost:${PORT}`));
    })
    .catch((err) => {
        console.log('--------------------------------------------');
        console.error('❌ CONNECTION FAILED');
        console.error('Reason:', err.message);
        console.log('Tip: Check if your IP is whitelisted (0.0.0.0/0) in Atlas.');
        console.log('--------------------------------------------');
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
            .limit(20) // Only sends 20 at a time to stay fast
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