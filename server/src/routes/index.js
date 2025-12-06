const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');

// Import route modules
const authRoutes = require('./authRoutes');
const stockRoutes = require('./stockRoutes');

// Import watchlist controller
const {
  getAllWatchlists,
  addToWatchlist,
  removeFromWatchlist,
  createWatchlist,
  deleteWatchlist,
} = require('../controllers/watchlistController');

// Public auth routes
router.use('/auth', authRoutes);

// Protected stock routes - require authentication
router.use('/stocks', authenticateToken, stockRoutes);

// Protected watchlist routes - require authentication
router.get('/watchlist', authenticateToken, getAllWatchlists);
router.post('/watchlist/add', authenticateToken, addToWatchlist);
router.delete('/watchlist/remove/:symbol', authenticateToken, removeFromWatchlist);
router.post('/watchlist/create', authenticateToken, createWatchlist);
router.delete('/watchlist/:name', authenticateToken, deleteWatchlist);

module.exports = router;
