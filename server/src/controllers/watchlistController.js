const { asyncHandler, successResponse } = require('../middleware/errorHandler');
const User = require('../models/User');

// Get all watchlists for authenticated user
const getAllWatchlists = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.userId);

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  const formattedWatchlists = user.watchlists.map(wl => ({
    id: wl._id,
    name: wl.name,
    stockCount: wl.stocks.length,
    stocks: wl.stocks,
    createdAt: wl.createdAt,
  }));

  successResponse(res, formattedWatchlists, 'Watchlists retrieved successfully');
});

// Add stock to watchlist
const addToWatchlist = asyncHandler(async (req, res) => {
  const { watchlistName, symbol, createNew } = req.body;

  if (!symbol) {
    const error = new Error('Stock symbol is required');
    error.statusCode = 400;
    throw error;
  }

  const user = await User.findById(req.user.userId);

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  let targetWatchlist = watchlistName;

  // Create new watchlist if requested
  if (createNew && watchlistName) {
    const existingWatchlist = user.watchlists.find(wl => wl.name === watchlistName);
    if (!existingWatchlist) {
      user.watchlists.push({
        name: watchlistName,
        stocks: [],
      });
    }
    targetWatchlist = watchlistName;
  }

  // Default to first watchlist if none specified
  if (!targetWatchlist) {
    if (user.watchlists.length === 0) {
      user.watchlists.push({ name: 'My Favorites', stocks: [] });
    }
    targetWatchlist = user.watchlists[0].name;
  }

  // Find the watchlist
  const watchlist = user.watchlists.find(wl => wl.name === targetWatchlist);

  if (!watchlist) {
    const error = new Error('Watchlist not found');
    error.statusCode = 404;
    throw error;
  }

  // Add symbol if not already present
  const upperSymbol = symbol.toUpperCase();
  if (!watchlist.stocks.includes(upperSymbol)) {
    watchlist.stocks.push(upperSymbol);
  }

  await user.save();

  successResponse(res, {
    watchlistName: targetWatchlist,
    symbol: upperSymbol,
    stocks: watchlist.stocks,
  }, 'Stock added to watchlist successfully');
});

// Remove stock from watchlist
const removeFromWatchlist = asyncHandler(async (req, res) => {
  const { symbol } = req.params;
  const { watchlistName } = req.body;

  if (!watchlistName) {
    const error = new Error('Watchlist name is required');
    error.statusCode = 400;
    throw error;
  }

  const user = await User.findById(req.user.userId);

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  const watchlist = user.watchlists.find(wl => wl.name === watchlistName);

  if (!watchlist) {
    const error = new Error('Watchlist not found');
    error.statusCode = 404;
    throw error;
  }

  const upperSymbol = symbol.toUpperCase();
  watchlist.stocks = watchlist.stocks.filter(s => s !== upperSymbol);

  await user.save();

  successResponse(res, {
    watchlistName,
    symbol: upperSymbol,
    remainingStocks: watchlist.stocks,
  }, 'Stock removed from watchlist successfully');
});

// Create new watchlist
const createWatchlist = asyncHandler(async (req, res) => {
  const { name } = req.body;

  if (!name) {
    const error = new Error('Watchlist name is required');
    error.statusCode = 400;
    throw error;
  }

  const user = await User.findById(req.user.userId);

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  // Check if watchlist already exists
  const existingWatchlist = user.watchlists.find(wl => wl.name === name);
  if (existingWatchlist) {
    const error = new Error('Watchlist already exists');
    error.statusCode = 409;
    throw error;
  }

  user.watchlists.push({
    name,
    stocks: [],
  });

  await user.save();

  const newWatchlist = user.watchlists[user.watchlists.length - 1];

  successResponse(res, {
    id: newWatchlist._id,
    name: newWatchlist.name,
    stocks: newWatchlist.stocks,
  }, 'Watchlist created successfully', 201);
});

// Delete watchlist
const deleteWatchlist = asyncHandler(async (req, res) => {
  const { name } = req.params;

  if (!name) {
    const error = new Error('Watchlist name is required');
    error.statusCode = 400;
    throw error;
  }

  const user = await User.findById(req.user.userId);

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  const watchlistIndex = user.watchlists.findIndex(wl => wl.name === name);

  if (watchlistIndex === -1) {
    const error = new Error('Watchlist not found');
    error.statusCode = 404;
    throw error;
  }

  user.watchlists.splice(watchlistIndex, 1);
  await user.save();

  successResponse(res, {
    name,
  }, 'Watchlist deleted successfully');
});

module.exports = {
  getAllWatchlists,
  addToWatchlist,
  removeFromWatchlist,
  createWatchlist,
  deleteWatchlist,
};
