const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Global connection variable
let isConnected = false;

const connectDB = async () => {
    if (isConnected) return;
    
    // Set connection options for maximum stability on Vercel
    const options = {
        serverSelectionTimeoutMS: 10000, // Give it 10 seconds to wake up
        socketTimeoutMS: 45000,
    };

    try {
        await mongoose.connect(process.env.MONGO_URI, options);
        isConnected = true;
        console.log("MongoDB Connected Successfully");
    } catch (err) {
        console.error("MongoDB Connection Failed:", err.message);
        // Don't kill the process, let the next request try again
        isConnected = false;
        throw err;
    }
};

app.get('/api/ads', async (req, res) => {
    try {
        await connectDB();
        
        const { city, cat } = req.query;
        let filter = {};

        if (city && city !== 'all' && city !== 'undefined') {
            filter.city = decodeURIComponent(city).toLowerCase().trim();
        }
        if (cat && cat !== 'all' && cat !== 'undefined') {
            filter.category = decodeURIComponent(cat).toLowerCase().trim();
        }

        const ads = await mongoose.model('Ad').find(filter).sort({ createdAt: -1 }).limit(50);
        res.status(200).json(ads);
    } catch (err) {
        // This sends the specific error to your browser console so we can see it
        res.status(500).json({ error: "Database Connection Error", message: err.message });
    }
});

// Define Schema for safety
if (!mongoose.models.Ad) {
    mongoose.model('Ad', new mongoose.Schema({
        title: String,
        description: String,
        content: String,
        city: String,
        category: String,
        price: String,
        phone: String,
        images: [String],
        createdAt: { type: Date, default: Date.now }
    }));
}

module.exports = app;