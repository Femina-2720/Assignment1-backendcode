const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/User');
const Cart = require('../models/Cart');

const router = express.Router();

// ====================== SIGNUP ======================
router.post('/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username & password required' });
    }

    // Check if username already exists
    const existing = await User.findOne({ username });
    if (existing) {
      return res.status(400).json({ error: 'Username already taken' });
    }

    // Hash password
    const hash = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({ username, email, passwordHash: hash });
    await user.save();

    // Create empty cart for user ( ✅ FIXED field to "user" )
    // New (correct)
await Cart.create({ user: user._id, items: [] });


    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: { id: user._id, username: user.username, email }
    });
  } catch (err) {
    console.error('❌ Signup error:', err.message);
    res.status(500).json({
      error: 'server error',
      details: err.message
    });
  }
});

// ====================== LOGIN ======================
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username & password required' });
    }

    // Find user
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    // Compare password
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(400).json({ error: 'Invalid credentials' });

    // Generate token
    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: { id: user._id, username: user.username, email: user.email }
    });
  } catch (err) {
    console.error('❌ Login error:', err.message);
    res.status(500).json({
      error: 'server error',
      details: err.message
    });
  }
});

module.exports = router;
