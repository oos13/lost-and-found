const express = require('express');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/protected', verifyToken, (req, res) => {
  res.json({ message: `Welcome, user ${req.user.id}` });
});

router.get('/admin-only', verifyToken, isAdmin, (req, res) => {
  res.json({ message: 'You are an admin' });
});

module.exports = router;
// This route is for testing purposes only. It should be removed or secured in production.
// It allows you to test the authentication and authorization middleware.