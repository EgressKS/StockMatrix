const express = require('express');
const router = express.Router();
const {
  googleAuth,
  completeProfileSetup,
  signup,
  login,
  refreshAccessToken,
  getProfile,
  updateProfile,
  logout,
} = require('../controllers/authController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Public routes
router.post('/google', googleAuth);
router.post('/signup', signup);
router.post('/login', login);
router.post('/refresh', refreshAccessToken);

// Protected routes
router.post('/profile/setup', authenticateToken, completeProfileSetup);
router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, updateProfile);
router.post('/logout', authenticateToken, logout);

module.exports = router;
