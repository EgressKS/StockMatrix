const express = require('express');
const router = express.Router();
const {
  googleAuth,
  refreshAccessToken,
  getProfile,
  updateProfile,
  logout,
} = require('../controllers/authController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Public routes
router.post('/google', googleAuth); 
router.post('/refresh', refreshAccessToken);

// Protected routes
router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, updateProfile);
router.post('/logout', authenticateToken, logout);

module.exports = router;
