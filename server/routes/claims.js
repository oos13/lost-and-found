const express = require('express');
const router = express.Router();
const Claim = require('../models/Claim');
const Item = require('../models/Item');
const User = require('../models/User');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');
const sendEmail = require('../utils/sendEmail');

// Submit a claim
router.post('/', verifyToken, async (req, res) => {
  const {
    itemId,
    type,
    color,
    brand,
    size,
    serialNumber,
    locationLost,
    tags,
    details
  } = req.body;

  try {
    const newClaim = new Claim({
      item: itemId || null,
      user: req.user.id,
      type,
      color,
      brand,
      size,
      serialNumber,
      locationLost,
      tags,
      details,
      status: 'pending',
    });

    // Hold for electronics w/o serial number
    if (type?.toLowerCase() === 'electronics' && !serialNumber) {
      const holdUntil = new Date();
      holdUntil.setDate(holdUntil.getDate() + 3);
      newClaim.holdUntil = holdUntil;
    }

    // Match scoring
    const unclaimedItems = await Item.find({ claimed: false });

    let bestMatch = null;
    let bestScore = 0;

    for (const item of unclaimedItems) {
      let score = 0;

      if (item.type?.toLowerCase() === type?.toLowerCase()) score += 30;
      if (item.color?.toLowerCase() === color?.toLowerCase()) score += 25;
      if (item.brand?.toLowerCase() === brand?.toLowerCase()) score += 20;
      if (item.size?.toLowerCase() === size?.toLowerCase()) score += 15;

      if (serialNumber && item.serialNumber && serialNumber === item.serialNumber) {
        score = 100; // override if serial matches
      }

      // Location match
      if (item.locationFound?.toLowerCase() === locationLost?.toLowerCase()) score += 15;

      // Tag matching
      if (Array.isArray(tags) && Array.isArray(item.tags)) {
        const tagMatches = tags.filter(tag => item.tags.includes(tag.toLowerCase()));
        score += tagMatches.length * 5;
      }

      // Date proximity (±5 days)
      const dayDiff = Math.abs((new Date() - new Date(item.dateFound)) / (1000 * 60 * 60 * 24));
      if (dayDiff <= 5) score += 10;

      // Keyword fuzzy match
      const keywords = details?.toLowerCase().split(/\s+/) || [];
      let keywordScore = 0;
      if (item.description) {
        keywords.forEach(word => {
          if (item.description.toLowerCase().includes(word)) keywordScore += 2;
        });
        score += Math.min(keywordScore, 20);
      }

      if (score > bestScore) {
        bestScore = score;
        bestMatch = item;
      }
    }

    if (bestScore >= 70 && bestMatch) {
      newClaim.likelyMatch = true;
      newClaim.matchScore = bestScore;
      if (!newClaim.item) newClaim.item = bestMatch._id;

      // Send smart match email to user
      const user = await User.findById(req.user.id);
      const message = `
Hi ${user.fullName},

An item in the Lost & Found appears to match your claim.

Please visit the administration office during pickup hours to complete the verification process and retrieve your item.

Thank you,
Lost & Found Team
      `;

      await sendEmail({
        to: user.email,
        subject: 'We Found a Possible Match for Your Lost Item',
        text: message
      });
    }

    await newClaim.save();

    res.status(201).json({
      message: 'Claim submitted successfully',
      claim: newClaim
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to submit claim', details: err.message });
  }
});

// Admin-only: View all claims (optional ?status=pending)
router.get('/', verifyToken, isAdmin, async (req, res) => {
  const { status } = req.query;

  try {
    const query = status ? { status } : {};

    const claims = await Claim.find(query)
      .populate('user', 'fullName email schoolId')
      .populate('item', 'type color brand size locationFound photoUrl dateFound claimed')
      .sort({ createdAt: -1 });

    res.json(claims);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch claims', details: err.message });
  }
});

// Admin-only: Approve, reject, or contest a claim
router.put('/:id/decision', verifyToken, isAdmin, async (req, res) => {
    const { decision, adminNotes } = req.body;
  
    if (!['approved', 'rejected', 'contested'].includes(decision)) {
      return res.status(400).json({ error: 'Invalid decision type' });
    }
  
    try {
      const claim = await Claim.findById(req.params.id).populate('item user');
      if (!claim) return res.status(404).json({ error: 'Claim not found' });
  
      claim.status = decision;
      claim.adminNotes = adminNotes || '';
      claim.decisionAt = new Date();
  
      // If approved, mark item as claimed
      if (decision === 'approved' && claim.item) {
        claim.item.claimed = true;
        claim.item.claimedBy = claim.user._id;
        await claim.item.save();
      }
  
      await claim.save();
  
      // Send decision email
      const user = claim.user;
      let subject = '';
      let text = '';
  
      if (decision === 'approved') {
        subject = 'Your Lost Item Claim Has Been Approved';
        text = `Hi ${user.fullName},
  
  Great news! Your claim has been approved, and your item is ready for pickup.
  
  Please visit the school administration office during pickup hours to verify and retrieve your item.
  
  Thank you,
  Lost & Found Team`;
      } else if (decision === 'rejected') {
        subject = 'Update on Your Lost Item Claim';
        text = `Hi ${user.fullName},
  
  We reviewed your claim, but unfortunately it was not approved.
  
  ${adminNotes ? 'Reason: ' + adminNotes : ''}
  
  You are welcome to reach out if you believe there was a mistake.
  
  Thank you,
  Lost & Found Team`;
      } else if (decision === 'contested') {
        subject = 'Your Lost Item Claim Requires Further Verification';
        text = `Hi ${user.fullName},
  
  Your claim is currently contested. To resolve this, please visit the administration office in person for final verification.
  
  Thank you,
  Lost & Found Team`;
      }
  
      await sendEmail({
        to: user.email,
        subject,
        text
      });
  
      res.json({
        message: `Claim ${decision} and email sent successfully`,
        claim
      });
  
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to update claim', details: err.message });
    }
  });

// Admin-only: Confirm in-person pickup of an approved claim
router.put('/:id/pickup', verifyToken, isAdmin, async (req, res) => {
    try {
      const claim = await Claim.findById(req.params.id).populate('user item');
      if (!claim) return res.status(404).json({ error: 'Claim not found' });
  
      if (claim.status !== 'approved') {
        return res.status(400).json({ error: 'Only approved claims can be marked as picked up' });
      }
  
      claim.pickedUp = true;
      claim.pickedUpAt = new Date();
      await claim.save();
  
      res.json({
        message: 'Pickup confirmed successfully',
        claim
      });
  
      // Optional: Email confirmation
      const msg = `
  Hi ${claim.user.fullName},
  
  Your lost item has been successfully picked up and marked as resolved in our system.
  
  Thank you for using the Lost & Found.
  
  - Lost & Found Team
      `;
  
      await sendEmail({
        to: claim.user.email,
        subject: 'Lost Item Pickup Confirmed',
        text: msg
      });
  
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to confirm pickup', details: err.message });
    }
  });

// Logged-in user: View their own submitted claims
router.get('/my', verifyToken, async (req, res) => {
    try {
      const claims = await Claim.find({ user: req.user.id })
        .populate('item', 'type brand color size locationFound claimed photoUrl dateFound')
        .sort({ createdAt: -1 });
  
      res.json(claims);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch user claims', details: err.message });
    }
  });

  // Admin-only: Dashboard statistics
router.get('/stats', verifyToken, isAdmin, async (req, res) => {
  try {
    const claims = await Claim.find().select('status createdAt');

    const stats = {
      totalClaims: claims.length,
      totalApproved: claims.filter(c => c.status === 'approved').length,
      totalRejected: claims.filter(c => c.status === 'rejected').length,
      totalContested: claims.filter(c => c.status === 'contested').length,
      claimsPerDay: []
    };

    const counts = {};
    claims.forEach(claim => {
      const date = new Date(claim.createdAt).toISOString().split('T')[0];
      counts[date] = (counts[date] || 0) + 1;
    });

    stats.claimsPerDay = Object.entries(counts).map(([date, count]) => ({
      date,
      count
    })).sort((a, b) => new Date(a.date) - new Date(b.date));

    res.json(stats);
  } catch (err) {
    console.error('Failed to compute stats:', err);
    res.status(500).json({ error: 'Failed to compute stats' });
  }
});

// Admin-only: Delete a claim
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const claim = await Claim.findByIdAndDelete(req.params.id);
    if (!claim) return res.status(404).json({ error: 'Claim not found' });

    res.json({ message: 'Claim deleted successfully' });
  } catch (err) {
    console.error('Failed to delete claim:', err);
    res.status(500).json({ error: 'Failed to delete claim', details: err.message });
  }
});
  
  

module.exports = router;

