// routes/auth.js
const express = require('express');
const router = express.Router();
const passport = require('passport');
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/User.middleware');

// Google OAuth
router.get('/google', passport.authenticate('google', { 
  scope: ['profile', 'email'],
  accessType: 'offline',      // Request refresh token
  prompt: 'consent'           // Force consent screen for refresh token
}));

router.get('/google/callback', 
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  authController.googleCallback
);

// Token management
router.post('/refresh', authController.refreshToken);
router.post('/logout', authenticate, authController.logout);

// Get current user
router.get('/me', authenticate, (req, res) => {
  res.json(req.user);
});

module.exports = router;