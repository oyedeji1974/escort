require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/escort';

mongoose.set('strictQuery', false);

mongoose.connect(MONGO_URI)
  .then(() => console.log('?? MongoDB connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'user' }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

const adSchema = new mongoose.Schema({
  city: { type: String, index: true },
  category: { type: String, index: true },
  title: { type: String, required: true },
  phone: { type: String, required: true },
  content: String,
  description: String,
  price: String,
  age: String,
  whatsapp: String,
  telegram: String,
  snapchat: String,
  images: [String],
  createdAt: { type: Date, default: Date.now, index: true }
});

const Ad = mongoose.model('Ad', adSchema);

const normalizeEmail = email => String(email || '').toLowerCase().trim();

app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password, role = 'user' } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }

    const normalizedEmail = normalizeEmail(email);
    const exists = await User.findOne({ email: normalizedEmail });
    if (exists) {
      return res.status(409).json({ message: 'Email already exists.' });
    }

    const user = await User.create({
      name: String(name).trim(),
      email: normalizedEmail,
      password: String(password),
      role: String(role).trim() || 'user'
    });

    return res.status(201).json({ message: 'Signup successful', user: { email: user.email, name: user.name, role: user.role } });
  } catch (err) {
    console.error('Signup error:', err);
    return res.status(500).json({ message: 'Signup failed', error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const normalizedEmail = normalizeEmail(email);
    const user = await User.findOne({ email: normalizedEmail });
    if (!user || user.password !== password) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    return res.json({ message: 'Login OK', user: { email: user.email, name: user.name, role: user.role } });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Login failed', error: err.message });
  }
});

app.get('/api/ads', async (req, res) => {
  try {
    const { city, cat, page = '1', limit = '50' } = req.query;
    const pageNumber = Math.max(1, parseInt(page, 10) || 1);
    const pageLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));

    const filter = {};
    if (city) {
      filter.city = new RegExp(String(city).trim().replace(/-/g, ' '), 'i');
    }
    if (cat) {
      filter.category = new RegExp(String(cat).trim().replace(/-/g, ' '), 'i');
    }

    const ads = await Ad.find(filter)
      .sort({ createdAt: -1 })
      .skip((pageNumber - 1) * pageLimit)
      .limit(pageLimit)
      .lean();

    return res.json(ads);
  } catch (err) {
    console.error('Fetch ads error:', err);
    return res.status(500).json({ error: 'Fetch failed', details: err.message });
  }
});

app.get('/api/ads/:id', async (req, res) => {
  try {
    const ad = await Ad.findById(req.params.id).lean();
    if (!ad) return res.status(404).json({ error: 'Ad not found' });
    return res.json(ad);
  } catch (err) {
    console.error('Fetch ad by id error:', err);
    return res.status(500).json({ error: 'Fetch failed', details: err.message });
  }
});

app.post('/api/ads', async (req, res) => {
  try {
    const {
      city,
      category,
      title,
      phone,
      content,
      description,
      price,
      age,
      whatsapp,
      telegram,
      snapchat,
      images
    } = req.body;

    if (!title || !phone) {
      return res.status(400).json({ error: 'Title and phone are required.' });
    }

    const newAd = await Ad.create({
      city: city ? String(city).trim() : '',
      category: category ? String(category).trim() : '',
      title: String(title).trim(),
      phone: String(phone).trim(),
      content: content || '',
      description: description || content || '',
      price: price || '',
      age: age || '',
      whatsapp: whatsapp || '',
      telegram: telegram || '',
      snapchat: snapchat || '',
      images: Array.isArray(images) ? images : []
    });

    return res.status(201).json({ message: 'Ad posted successfully', ad: newAd });
  } catch (err) {
    console.error('Post ad error:', err);
    return res.status(500).json({ error: 'Post failed', details: err.message });
  }
});

app.delete('/api/ads/:id', async (req, res) => {
  try {
    const deleted = await Ad.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Ad not found' });
    return res.json({ message: 'Ad deleted successfully' });
  } catch (err) {
    console.error('Delete ad error:', err);
    return res.status(500).json({ error: 'Delete failed', details: err.message });
  }
});

app.get('/', (req, res) => {
  res.send('Server is Online ?');
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`?? Server running on http://localhost:${PORT}`);
});
