// routes/protected.js
const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/User.middleware');

// Any logged-in user
router.get('/profile', authenticate, (req, res) => {
  res.json(req.user);
});

// Admin only
router.get('/admin/users', authenticate, authorize('admin'), async (req, res) => {
  const users = await User.find();
  res.json(users);
});

// Multiple roles
router.get('/moderator', authenticate, authorize('admin', 'moderator'), (req, res) => {
  res.json({ message: 'Moderator content' });
});

module.exports = router;