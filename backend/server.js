require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const User = require('./models/User');

const memoryRoutes = require('./routes/memoryRoutes');
const sourceRoutes = require('./routes/sourceRoutes');
const chatRoutes = require('./routes/chatRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Auth Routes
app.post('/api/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: 'User already exists' });

        const user = new User({ name: name || 'User', email, password });
        await user.save();
        res.status(201).json({ message: 'User created successfully', user: { _id: user._id, email: user.email, name: user.name } });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

        const user = await User.findOne({ email });
        if (!user || user.password !== password) return res.status(401).json({ message: 'Invalid credentials' });

        res.status(200).json({ message: 'Login successful', user: { _id: user._id, email: user.email, name: user.name } });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// App Routes
app.use('/api/memory', memoryRoutes);
app.use('/api/source', sourceRoutes);
app.use('/api/chat', chatRoutes);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`✅ Backend server running on port ${PORT}`));
// Trigger restart
