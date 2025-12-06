const jwt = require('jsonwebtoken');
const { asyncHandler } = require('./errorHandler');

// Verify JWT token middleware
const authenticateToken = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    const error = new Error('Access token required. Please login.');
    error.statusCode = 401;
    throw error;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { userId: '...' }
    next();
  } catch (error) {
    console.error('Token verification error:', error.message);
    const err = new Error('Invalid or expired token. Please login again.');
    err.statusCode = 403;
    throw err;
  }
});

module.exports = { authenticateToken };
