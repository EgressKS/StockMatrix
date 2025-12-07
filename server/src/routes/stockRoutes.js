const express = require('express');
const router = express.Router();
const {
  getStockOverview,
  getTimeSeries,
  getTopGainers,
  getTopLosers,
  getCompanyLogo,
} = require('../controllers/stockController');
const {
  getAllWatchlists,
  addToWatchlist,
  removeFromWatchlist,
  createWatchlist,
  deleteWatchlist,
} = require('../controllers/watchlistController');

// Stock routes
router.get('/overview/:symbol', getStockOverview);
router.get('/time-series/:symbol/:range', getTimeSeries);
router.get('/gainers', getTopGainers);
router.get('/losers', getTopLosers);
router.get('/logo/:symbol', getCompanyLogo);

// Watchlist routes
router.get('/watchlist', getAllWatchlists);
router.post('/watchlist/add', addToWatchlist);
router.delete('/watchlist/remove/:symbol', removeFromWatchlist);
router.post('/watchlist/create', createWatchlist);
router.delete('/watchlist/:name', deleteWatchlist);

module.exports = router;
