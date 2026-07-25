require('dotenv').config();
// Force Node's DNS resolver to use a public DNS to avoid local stub ECONNREFUSED
require('dns').setServers(['8.8.8.8']);
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const app = express();
app.use(express.static(path.join(__dirname, '../public')));


function slugify(text) {
    return String(text || "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
}


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
        console.log("MONGO_URI =", process.env.MONGO_URI);
        await mongoose.connect(process.env.MONGO_URI, options);
        isConnected = true;

        await Ad.collection.createIndex(
            { city: 1, category: 1 },
            { name: 'city_category_idx', background: true }
        ).catch((err) => {
            if (!/already exists/i.test(err.message)) {
                console.warn('Could not ensure ads index:', err.message);
            }
        });

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
const adsDataPath = path.join(__dirname, '../data/ads.json');

function loadAdsFromFile() {
    try {
        const data = fs.readFileSync(adsDataPath, 'utf8');
        const parsed = JSON.parse(data);
        return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
        console.warn('Could not load ads fallback data:', err.message);
        return [];
    }
}

function normalizeText(value) {
    return String(value || '')
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function toTitleCase(value) {
    return String(value || '')
        .split(/\s+/)
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
}

function buildFallbackAds(query = {}) {
    const rawCity = decodeURIComponent(String(query.city || 'your city')).trim();
    const rawCat = decodeURIComponent(String(query.cat || 'bodyrubs')).trim();
    const cityLabel = rawCity && rawCity !== 'undefined' && rawCity !== 'all' ? rawCity.replace(/-/g, ' ') : 'Your City';
    const categoryLabel = rawCat && rawCat !== 'undefined' && rawCat !== 'all' ? rawCat.replace(/-/g, ' ') : 'Bodyrubs';
    const cityName = toTitleCase(cityLabel);
    const categoryName = toTitleCase(categoryLabel);

    return [{
        _id: `fallback-${normalizeText(cityLabel)}-${normalizeText(categoryLabel)}`,
        title: `${cityName} ${categoryName} Listings`,
        city: cityLabel,
        category: categoryLabel,
        price: '$180',
        age: 'New',
        images: ['https://via.placeholder.com/400x300?text=' + encodeURIComponent(cityName + ' ' + categoryName)],
        content: `Verified ${categoryName.toLowerCase()} listings available in ${cityName}. Browse local providers and contact them directly.`,
        createdAt: new Date().toISOString()
    }];
}

function normalizeAdsForResponse(ads) {
    return (ads || []).map((ad) => ({
        ...ad,
        _id: String(ad._id ?? ad.id ?? ''),
        normalizedCity: normalizeText(ad.city),
        normalizedCategory: normalizeText(ad.category)
    }));
}

function filterAdsFromFile(ads, query = {}) {
    let result = normalizeAdsForResponse(ads);
    const { city, cat } = query;

    if (city && city !== 'all' && city !== 'undefined') {
        const cityValue = normalizeText(decodeURIComponent(city));
        result = result.filter((ad) => normalizeText(ad.city) === cityValue);
    }

    if (cat && cat !== 'all' && cat !== 'undefined') {
        const catValue = normalizeText(decodeURIComponent(cat));
        result = result.filter((ad) => normalizeText(ad.category) === catValue);
    }

    return result;
}

// --- ROUTES ---

//// 1. GET ADS (The route for your homepage/view-ads)
// GET SINGLE AD
// GET SINGLE AD
app.get('/api/ads/:id', async (req, res) => {
    try {
        await connectDB();

        let ad = null;
        if (mongoose.Types.ObjectId.isValid(req.params.id)) {
            ad = await Ad.findById(req.params.id);
        } else {
            ad = await Ad.findOne({
                $or: [
                    { _id: req.params.id },
                    { id: req.params.id },
                    { title: req.params.id }
                ]
            });
        }

        if (!ad) {
            const fallbackAds = normalizeAdsForResponse(loadAdsFromFile());
            ad = fallbackAds.find((item) => String(item._id) === String(req.params.id) || String(item.id) === String(req.params.id));
        }

        if (!ad) {
            return res.status(404).json({
                error: "Ad not found"
            });
        }

        res.json(ad);

    } catch (err) {
        const fallbackAds = normalizeAdsForResponse(loadAdsFromFile());
        const ad = fallbackAds.find((item) => String(item._id) === String(req.params.id) || String(item.id) === String(req.params.id));
        if (ad) {
            return res.json(ad);
        }
        res.status(500).json({
            error: err.message
        });
    }
});
app.post('/api/ads', async (req, res) => {
    try {
        await connectDB();
        const city = req.body.city ? req.body.city.toLowerCase().trim() : 'unknown';

        // --- NEW: AUTO-DELETE OLDEST AD IF LIMIT (20) IS REACHED ---
        const count = await Ad.countDocuments({ city: city });
        
        if (count >= 20) {
            // Find the oldest ad in this specific city
            const oldestAd = await Ad.findOne({ city: city })
                .sort({ createdAt: 1 }) // 1 = Oldest first
                .select('_id');

            if (oldestAd) {
                await Ad.findByIdAndDelete(oldestAd._id);
                console.log(`Auto-deleted oldest ad in ${city} to maintain limit.`);
            }
        }
        // --- END OF NEW LOGIC ---

        const newAd = new Ad({
            title: req.body.title,
            description: req.body.description,
            content: req.body.content,
            city: city,
            category: req.body.category ? req.body.category.toLowerCase().trim() : 'general',
            price: req.body.price,
            age: req.body.age,
            phone: req.body.phone,
            whatsapp: req.body.whatsapp,
            telegram: req.body.telegram,
            snapchat: req.body.snapchat,
            images: req.body.images,
            reports: 0,
            createdAt: new Date() // Ensures consistent timestamp
        });

        const savedAd = await newAd.save();
        res.status(201).json(savedAd);
    } catch (err) {
        console.error("Post Error:", err.message);
        res.status(500).json({ error: "Failed to post ad", message: err.message });
    }
});
app.get("/api/ads", async (req, res) => {
    try {
        await connectDB();

        const filter = {};

        if (req.query.city && req.query.city !== "all") {
            filter.city = req.query.city.toLowerCase().trim();
        }

        if (req.query.cat && req.query.cat !== "all") {
            filter.category = req.query.cat.toLowerCase().trim();
        }

    const ads = await Ad.find(filter)
    .select("_id title city category price age createdAt")
    .sort({ createdAt: -1 })
    .lean();

        res.json(ads);

    } catch (err) {

        console.error(err);

        const fallback = filterAdsFromFile(
            loadAdsFromFile(),
            req.query
        );

        res.json(fallback);
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
app.get("/ad/:slug", (req,res)=>{

    res.sendFile(
        path.join(
            __dirname,
            "../public",
            "ad.html"
        )
    );

});
// ===============================
// DYNAMIC SITEMAP
// ===============================

app.get('/sitemap.xml', async (req,res)=>{

    const DOMAIN = "https://www.nesolist.com";

    let urls = [];

    function addUrl(url, priority = "0.8", changefreq = "daily") {

        urls.push(`
<url>
<loc>${DOMAIN}${url}</loc>
<changefreq>${changefreq}</changefreq>
<priority>${priority}</priority>
</url>`);

    }

    // Homepage
    addUrl("/", "1.0");

    // Country pages
    addUrl("/usa.html", "0.9");
    addUrl("/canada.html", "0.9");

    // Static pages

    [
        "/about.html",
        "/privacy.html",
        "/terms.html",
        "/contact.html",
        "/blog.html"
    ].forEach(page => {

        const full = path.join(__dirname, "../public", page);

        if (fs.existsSync(full)) {
            addUrl(page, "0.6", "monthly");
        }

    });

    // Scan USA folders

    const usaFolder = path.join(__dirname, "../public/usa");

    if (fs.existsSync(usaFolder)) {

        fs.readdirSync(usaFolder, {
            withFileTypes: true
        }).forEach(dir => {

            if (!dir.isDirectory()) return;

            const page = path.join(
                usaFolder,
                dir.name,
                "bodyrubs.html"
            );

            if (fs.existsSync(page)) {

                addUrl(
                    `/usa/${dir.name}/bodyrubs.html`,
                    "0.8"
                );

            }

        });

    }

    // Scan Canada folders

    const canadaFolder = path.join(__dirname, "../public/canada");

    if (fs.existsSync(canadaFolder)) {

        fs.readdirSync(canadaFolder, {
            withFileTypes: true
        }).forEach(dir => {

            if (!dir.isDirectory()) return;

            const page = path.join(
                canadaFolder,
                dir.name,
                "bodyrubs.html"
            );

            if (fs.existsSync(page)) {

                addUrl(
                    `/canada/${dir.name}/bodyrubs.html`,
                    "0.8"
                );

            }

        });

    }
    await connectDB();

const ads = await Ad.find({})
.select("_id title createdAt")
.lean();

ads.forEach(ad => {

    const slug =
        slugify(ad.title) +
        "-" +
        ad._id;

    urls.push(`
<url>
<loc>
https://www.nesolist.com/ad/${slug}
</loc>

<lastmod>
${new Date(ad.createdAt)
.toISOString()
.split("T")[0]}
</lastmod>

<changefreq>daily</changefreq>

<priority>0.7</priority>

</url>
`);

});

    const xml = `<?xml version="1.0" encoding="UTF-8"?>

<urlset
xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">

${urls.join("")}

</urlset>`;

    res.header("Content-Type", "application/xml");

    res.send(xml);

});
if (require.main === module) {
    app.listen(3000, () => {
        console.log("Server running on http://localhost:3000");
    });
}

module.exports = app;