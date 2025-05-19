const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

const whitelist = ['12345', '67890', '99999']; // Replace with actual valid school IDs

// Register
router.post('/register', async (req, res) => {
  const { fullName, email, schoolId, password } = req.body;

  if (!whitelist.includes(schoolId)) {
    return res.status(400).json({ error: 'School ID not recognized' });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ error: 'Email already registered' });
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  const newUser = new User({
    fullName,
    email,
    schoolId,
    passwordHash,
    role: 'user' // default role
  });

  await newUser.save();

  res.status(201).json({ message: 'User registered successfully' });
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ error: 'Invalid email or password' });

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) return res.status(400).json({ error: 'Invalid email or password' });

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '2h' }
  );

  res.json({
    token,
    user: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role
    }
  });
});

module.exports = router;
