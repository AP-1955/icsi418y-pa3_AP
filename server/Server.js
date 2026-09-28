const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const User = require('./models/User');

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Signup Route
app.post('/api/signup', async (req, res) => {
  const { f_name, l_name, username, password } = req.body;

  // Validation: Check empty fields
  if (!f_name || !l_name || !username || !password) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    // Check if username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists.' });
    }

    // Create and save new user
    const newUser = new User({ f_name, l_name, username, password });
    await newUser.save();
    res.status(201).json({ message: 'User created successfully!' });
  } catch (error) {
    console.error("Signup error details:", error);
    res.status(500).json({ message: error.message || 'Server error during signup.' });
  }
});

// Login Route
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  // Validation: Check empty fields
  if (!username || !password) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    // Find user by username
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: 'Username does not exist.' });
    }

    // Compare passwords
    if (user.password !== password) {
      return res.status(400).json({ message: 'Incorrect password.' });
    }

    res.status(200).json({ message: 'Login successful!' });
  } catch (error) {
    console.error("Login error details:", error);
    res.status(500).json({ message: error.message || 'Server error during login.' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));