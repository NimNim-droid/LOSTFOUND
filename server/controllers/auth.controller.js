// controllers/authController.js
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User.model');
const RefreshToken = require('../models/RefreshTokens.model');
const LoginAttempt = require('../models/LoginAtemps.model');

// Token configuration
const JWT_ACCESS_EXPIRY = '15m';    // Short-lived
const JWT_REFRESH_EXPIRY = '7d';    // Long-lived
const REFRESH_TOKEN_DB_DAYS = 7;

const generateTokens = async (user, req) => {
  const accessToken = jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: JWT_ACCESS_EXPIRY, issuer: 'your-app-name' }
  );

  const refreshTokenString = RefreshToken.generateToken();
  const refreshToken = new RefreshToken({
    token: crypto.createHash('sha256').update(refreshTokenString).digest('hex'),
    user: user._id,
    deviceInfo: {
      fingerprint: req.body.deviceFingerprint,
      userAgent: req.headers['user-agent'],
      ip: req.ip
    },
    expiresAt: new Date(Date.now() + REFRESH_TOKEN_DB_DAYS * 24 * 60 * 60 * 1000)
  });
  
  await refreshToken.save();

  return { accessToken, refreshToken: refreshTokenString };
};

exports.googleCallback = async (req, res) => {
  try {
    const { user, isNew } = req.user; // From passport
    
    // Log successful attempt
    await LoginAttempt.create({
      email: user.email,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      success: true,
      provider: 'google'
    });

    const tokens = await generateTokens(
      await User.findById(user.id), 
      req
    );

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/api/auth/refresh'
    });

    // Redirect to frontend with access token (or send JSON for SPA)
    res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${tokens.accessToken}&isNew=${isNew}`);
    
  } catch (error) {
    res.redirect(`${process.env.CLIENT_URL}/login?error=auth_failed`);
  }
};

exports.refreshToken = async (req, res) => {
  try {
    const incomingToken = req.cookies.refreshToken || req.body.refreshToken;
    if (!incomingToken) return res.status(401).json({ error: 'Refresh token required' });

    const hashedToken = crypto.createHash('sha256').update(incomingToken).digest('hex');
    const storedToken = await RefreshToken.findOne({ 
      token: hashedToken, 
      isRevoked: false 
    }).populate('user');

    if (!storedToken || storedToken.expiresAt < new Date()) {
      return res.status(403).json({ error: 'Invalid or expired refresh token' });
    }

    // Rotate token (security best practice)
    const newTokenString = RefreshToken.generateToken();
    storedToken.isRevoked = true;
    storedToken.replacedByToken = crypto.createHash('sha256').update(newTokenString).digest('hex');
    storedToken.revokedAt = new Date();
    await storedToken.save();

    const newRefreshToken = new RefreshToken({
      token: crypto.createHash('sha256').update(newTokenString).digest('hex'),
      user: storedToken.user._id,
      deviceInfo: storedToken.deviceInfo,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_DB_DAYS * 24 * 60 * 60 * 1000)
    });
    await newRefreshToken.save();

    const accessToken = jwt.sign(
      { userId: storedToken.user._id, role: storedToken.user.role },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: JWT_ACCESS_EXPIRY }
    );

    res.cookie('refreshToken', newTokenString, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/api/auth/refresh'
    });

    res.json({ accessToken });
    
  } catch (error) {
    res.status(500).json({ error: 'Token refresh failed' });
  }
};

exports.logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
      await RefreshToken.updateOne(
        { token: crypto.createHash('sha256').update(refreshToken).digest('hex') },
        { isRevoked: true, revokedAt: new Date() }
      );
    }
    
    res.clearCookie('refreshToken', { path: '/api/auth/refresh' });
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Logout failed' });
  }
};