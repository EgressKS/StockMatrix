const mongoose = require('mongoose');

const watchlistSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  stocks: [{
    type: String,
    uppercase: true,
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  country: {
    type: String,
    default: null,
  },
  profile: {
    type: String,
    default: null,
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true,
  },
  watchlists: [watchlistSchema],
  refreshToken: {
    type: String,
    default: null,
  },
  lastLogin: {
    type: Date,
    default: Date.now,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Create default watchlists for new users
userSchema.methods.createDefaultWatchlists = function() {
  if (this.watchlists.length === 0) {
    this.watchlists = [
      {
        name: 'Tech Giants',
        stocks: ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'META', 'NVDA'],
      },
      {
        name: 'My Favorites',
        stocks: [],
      },
    ];
  }
};

// Update lastLogin
userSchema.methods.updateLastLogin = function() {
  this.lastLogin = new Date();
  return this.save();
};

const User = mongoose.model('User', userSchema);

module.exports = User;
