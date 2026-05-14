require('dotenv').config(); 
const mongoose = require('mongoose');

console.log('Starting server...');
console.log('Requiring app from api/index.js...');

let app;
try {
    // This connects the local server to your actual API logic
    app = require('./api/index.js');
    console.log('✅ App loaded successfully');
} catch (err) {
    console.error('❌ FATAL ERROR loading app:', err.message);
    process.exit(1);
}

// --- DATABASE CONNECTION ---
const connectDB = async () => {
    try {
        if (!process.env.MONGO_URI) {
            console.warn('⚠️ MONGO_URI missing from .env!');
            return;
        }
        // Connect to Atlas
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅✅✅ DATABASE CONNECTED TO MONGODB ATLAS ✅✅✅');
    } catch (err) {
        console.error('❌ DATABASE ERROR:', err.message);
    }
};

// --- START LOCAL SERVER ---
const PORT = process.env.PORT || 3000;

// This part was what made it work locally
app.listen(PORT, async () => {
    console.log(`Server running on http://localhost:${PORT}`);
    await connectDB(); 
});

// Global Error Catchers
process.on('uncaughtException', (err) => {
    console.error('❌ Uncaught Exception:', err.message);
});

process.on('unhandledRejection', (reason) => {
    console.error('❌ Unhandled Rejection:', reason);
});