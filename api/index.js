const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

app.use(cors());
// Increased limit to 10mb to handle Base64 images
app.use(express.json({ limit: '10mb' }));

// Global connection variable for Vercel's serverless environment
let isConnected = false;

const connectDB = async () => {
    if (isConnected) return;
    
    const options = {
        serverSelectionTimeoutMS: 10000, 
        socketTimeoutMS: 45000,
    };

    try {
        await mongoose.connect(process.env.MONGO_URI, options);
        isConnected = true;
        console.log("MongoDB Connected Successfully");
    } catch (err) {
        console.error("MongoDB Connection Failed:", err.message);
        isConnected = false;
        throw err;
    }
};

// --- DATABASE SCHEMA ---
const adSchema = new mongoose.Schema({
    title: String,
    description: String,
    content: String,
    city: String,
    category: String,
    price: String,
    age: String,
    phone: String,
    whatsapp: String,
    telegram: String,
    snapchat: String,
    images: [String], // Array of Base64 strings
    reports: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

// Prevent model overwrite error on Vercel hot-reloads
const Ad = mongoose.models.Ad || mongoose.model('Ad', adSchema);

// --- ROUTES ---

// 1. GET ADS (The route for your homepage/view-ads)
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

        const ads = await Ad.find(filter).sort({ createdAt: -1 }).limit(50);
        res.status(200).json(ads);
    } catch (err) {
        res.status(500).json({ error: "Database Error", message: err.message });
    }
});

// 2. POST ADS (The route for your post-ad.html)
app.post('/api/ads', async (req, res) => {
    try {
        await connectDB();
        
        const newAd = new Ad({
            title: req.body.title,
            description: req.body.description,
            content: req.body.content,
            city: req.body.city ? req.body.city.toLowerCase().trim() : 'unknown',
            category: req.body.category ? req.body.category.toLowerCase().trim() : 'general',
            price: req.body.price,
            age: req.body.age,
            phone: req.body.phone,
            whatsapp: req.body.whatsapp,
            telegram: req.body.telegram,
            snapchat: req.body.snapchat,
            images: req.body.images,
            reports: 0
        });

        const savedAd = await newAd.save();
        res.status(201).json(savedAd);
    } catch (err) {
        console.error("Post Error:", err.message);
        res.status(500).json({ error: "Failed to post ad", message: err.message });
    }
});

// 3. REPORT AD (Public - increment report count)
app.post('/api/ads/:id/report', async (req, res) => {
    try {
        const { id } = req.params;

        if (!id || id === 'null' || id === 'undefined') {
            return res.status(400).json({ error: "Bad Request", message: "A valid ad ID must be provided." });
        }

        await connectDB();

        let reportedAd = null;
        if (mongoose.Types.ObjectId.isValid(id)) {
            reportedAd = await Ad.findByIdAndUpdate(id, { $inc: { reports: 1 } }, { new: true });
        }

        if (!reportedAd) {
            reportedAd = await Ad.findOneAndUpdate(
                {
                    $or: [
                        { _id: id },
                        { id: id },
                        { title: id }
                    ]
                },
                { $inc: { reports: 1 } },
                { new: true }
            );
        }

        if (!reportedAd) {
            return res.status(404).json({ error: "Ad not found" });
        }

        res.status(200).json({ message: "Report received", reports: reportedAd.reports || 0, ad: reportedAd });
    } catch (err) {
        res.status(500).json({ error: "Failed to report ad", message: err.message });
    }
});

// 4. DELETE AD (Admin - delete by ID)
app.delete('/api/ads/:id', async (req, res) => {
    try {
        const { id } = req.params;

        if (!id || id === 'null' || id === 'undefined') {
            return res.status(400).json({ error: "Bad Request", message: "A valid document ID must be provided." });
        }

        await connectDB();
        const adminPassword = req.query.admin || req.body.admin;

        if (adminPassword !== process.env.ADMIN_PASSWORD) {
            return res.status(401).json({ error: "Unauthorized - Invalid admin password" });
        }

        // Try deleting by MongoDB ObjectId first. If that fails or matches nothing, try matching text parameters
        let result = null;
        if (mongoose.Types.ObjectId.isValid(id)) {
            result = await Ad.findByIdAndDelete(id);
        }
        
        if (!result) {
            result = await Ad.findOneAndDelete({
                $or: [
                    { _id: id },
                    { id: id },
                    { title: id } // Fallback to title matching if system IDs are missing entirely
                ]
            });
        }
        
        if (!result) {
            return res.status(404).json({ error: "Ad not found" });
        }

        res.status(200).json({ message: "Ad deleted successfully", deletedAd: result });
    } catch (err) {
        res.status(500).json({ error: "Failed to delete ad", message: err.message });
    }
});

// 4. GET ALL ADS (Admin dashboard)
app.get('/api/admin/all-ads', async (req, res) => {
    try {
        await connectDB();
        
        const adminPassword = req.query.admin;
        if (adminPassword !== process.env.ADMIN_PASSWORD) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const ads = await Ad.find().sort({ createdAt: -1 }).lean();
        
        // Comprehensive parsing to capture every possible variant of database record keys
        const standardizedAds = ads.map((ad, idx) => {
            let directId = '';
            
            if (ad._id) {
                directId = typeof ad._id === 'object' && ad._id.$oid ? ad._id.$oid.toString() : ad._id.toString();
            } else if (ad.id) {
                directId = typeof ad.id === 'object' && ad.id.$oid ? ad.id.$oid.toString() : ad.id.toString();
            } else {
                // Extreme Fallback: If document lacks identifiers completely, bind it to its title string safely
                directId = ad.title ? encodeURIComponent(ad.title) : `fallback-index-${idx}`;
            }

            return {
                ...ad,
                adIdString: directId 
            };
        });

        res.status(200).json(standardizedAds);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch ads", message: err.message });
    }
});

// 5. DELETE ALL ADS (Admin dashboard)
app.delete('/api/admin/delete-all', async (req, res) => {
    try {
        await connectDB();

        const adminPassword = req.query.admin || req.body.admin;
        if (adminPassword !== process.env.ADMIN_PASSWORD) {
            return res.status(401).json({ error: "Unauthorized - Invalid admin password" });
        }

        const result = await Ad.deleteMany({});
        res.status(200).json({ message: "All ads deleted successfully", deletedCount: result.deletedCount });
    } catch (err) {
        res.status(500).json({ error: "Failed to delete all ads", message: err.message });
    }
});

// 6. HEALTH CHECK
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: "Server is running" });
});


// =================================================================
// 🛡️ NEW SECURE AUTHENTICATION EXTENSION (SAFELY ADDED AT THE BOTTOM)
// =================================================================

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    age: { type: Number, required: true },
    sex: { type: String, required: true },
    country: { type: String, required: true },
    phone: { type: String, required: true },
    zip: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // Saved natively
    role: { type: String, default: 'user' },
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

// 7. USER SIGNUP ROUTE
app.post('/api/signup', async (req, res) => {
    try {
        await connectDB();
        const { name, age, sex, country, phone, zip, email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required." });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
        if (existingUser) {
            return res.status(400).json({ message: "An account with this email already exists." });
        }

        const newUser = new User({
            name,
            age,
            sex,
            country,
            phone,
            zip,
            email: email.toLowerCase().trim(),
            password,
            role: 'user' // Default access tier
        });

        await newUser.save();
        res.status(201).json({ message: "Account created successfully!" });
    } catch (err) {
        console.error("Signup Endpoint Error:", err.message);
        res.status(500).json({ error: "Registration failed", message: err.message });
    }
});

// 8. USER LOGIN ROUTE
app.post('/api/login', async (req, res) => {
    try {
        await connectDB();
        const { email, password } = req.body;

        const user = await User.findOne({ email: email.toLowerCase().trim() });
        if (!user || user.password !== password) {
            return res.status(401).json({ message: "Invalid email or password." });
        }

        // Return user data safely (excluding password field)
        const userResponse = {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        };

        res.status(200).json({ message: "Login successful", user: userResponse });
    } catch (err) {
        console.error("Login Endpoint Error:", err.message);
        res.status(500).json({ error: "Authentication failed", message: err.message });
    }
});
// 9. GET ALL USERS (Admin dashboard helper)
app.get('/api/admin/all-users', async (req, res) => {
    try {
        await connectDB();
        
        const adminPassword = req.query.admin;
        if (adminPassword !== process.env.ADMIN_PASSWORD) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        // Fetch users, sorting by newest, selecting only admin-relevant fields
        const users = await User.find().sort({ createdAt: -1 }).select('email phone name createdAt').lean();
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch users", message: err.message });
    }
});

module.exports = app;