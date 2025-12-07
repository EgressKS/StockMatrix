const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

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
  password: {
    type: String,
    minlength: 6,
    select: false,
    default: null,
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true,
    default: null,
  },
  country: {
    type: String,
    default: null,
  },
  profile: {
    type: String,
    default: null,
  },
  authProvider: {
    type: String,
    enum: ['email', 'google'],
    default: 'email',
  },
  profileSetupComplete: {
    type: Boolean,
    default: false,
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

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

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
