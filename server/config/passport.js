// config/passport.js (Google Strategy Setup)
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User.model');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/api/auth/google/callback',
    scope: ['profile', 'email']  // Add 'https://www.googleapis.com/auth/calendar' if needed
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const { user, isNew } = await User.findOrCreateGoogleUser(profile, {
        access_token: accessToken,
        refresh_token: refreshToken,
        expiry_date: profile._json.exp ? Date.now() + (profile._json.exp * 1000) : null,
        scope: ['profile', 'email']
      });
      
      return done(null, { user: user.toAuthJSON(), isNew });
    } catch (error) {
      return done(error, false);
    }
  }
));

// JWT serialization (not session-based)
passport.serializeUser((data, done) => done(null, data));
passport.deserializeUser((data, done) => done(null, data));

module.exports = passport;