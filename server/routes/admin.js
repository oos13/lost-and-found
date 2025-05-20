const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');
const Claim = require('../models/Claim');
const Item = require('../models/Item');

// Admin-only dashboard stats
router.get('/stats', verifyToken, isAdmin, async (req, res) => {
  try {
    const totalClaims = await Claim.countDocuments();
    const approved = await Claim.countDocuments({ status: 'approved' });
    const rejected = await Claim.countDocuments({ status: 'rejected' });
    const contested = await Claim.countDocuments({ status: 'contested' });

    const totalItems = await Item.countDocuments();
    const claimedItems = await Item.countDocuments({ claimed: true });
    const unclaimedItems = await Item.countDocuments({ claimed: false });

    const recentClaims = await Claim.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'fullName')
      .populate('item', 'type');

    const commonTypes = await Item.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    res.json({
      totalClaims,
      approved,
      rejected,
      contested,
      totalItems,
      claimedItems,
      unclaimedItems,
      recentClaims,
      commonTypes
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load stats', details: err.message });
  }
});

module.exports = router;
