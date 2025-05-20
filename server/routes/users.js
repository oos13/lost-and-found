const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Claim = require('../models/Claim');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

// GET all users with optional filters
router.get('/', verifyToken, isAdmin, async (req, res) => {
  try {
    const { role, email, schoolId, startDate, endDate } = req.query;
    const query = {};

    if (role) query.role = role;
    if (email) query.email = { $regex: email, $options: 'i' };
    if (schoolId) query.schoolId = { $regex: schoolId, $options: 'i' };
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const users = await User.find(query).sort({ createdAt: -1 });

    const usersWithActivity = await Promise.all(users.map(async (user) => {
      const claimCount = await Claim.countDocuments({ user: user._id });
      return { ...user.toObject(), claimCount };
    }));

    res.json(usersWithActivity);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// PUT: promote or demote user
router.put('/:id/role', verifyToken, isAdmin, async (req, res) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
    res.json({ message: `User role updated to ${role}`, user });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update user role' });
  }
});



router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const userId = req.params.id;

    // Delete user
    const user = await User.findByIdAndDelete(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Delete all claims by this user
    await Claim.deleteMany({ user: userId });

    res.json({ message: 'User and associated claims deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete user and claims' });
  }
});

module.exports = router;
