const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const { asyncHandler, successResponse } = require('../middleware/errorHandler');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Generate JWT tokens
const generateAccessToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

const generateRefreshToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: '30d',
  });
};

// Google OAuth authentication
const googleAuth = asyncHandler(async (req, res) => {
  const { idToken } = req.body;

  if (!idToken) {
    const error = new Error('ID token is required');
    error.statusCode = 400;
    throw error;
  }

  try {
    // Verify the Google ID token
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    // Find or create user
    let user = await User.findOne({ email });
    let isNewUser = false;

    if (!user) {
      // Create new user from Google data
      user = new User({
        name,
        email,
        googleId,
        profile: picture || null,
        authProvider: 'google',
        profileSetupComplete: false,
      });

      isNewUser = true;
      
      console.log(`New user created via Google: ${email}`);
    } else {
      // Update existing user with Google ID if not already set
      if (!user.googleId) {
        user.googleId = googleId;
      }
      if (picture && !user.profile) {
        user.profile = picture;
      }
      
      console.log(`User logged in via Google: ${email}`);
    }

    // Update last login and save
    await user.updateLastLogin();

    // Generate tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Save refresh token to user
    user.refreshToken = refreshToken;
    await user.save();

    // Return user data and tokens
    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      country: user.country,
      profile: user.profile,
      authProvider: user.authProvider,
      profileSetupComplete: user.profileSetupComplete,
      watchlists: user.watchlists,
      createdAt: user.createdAt,
    };

    successResponse(res, {
      user: userData,
      accessToken,
      refreshToken,
      isNewUser,
    }, 'Google authentication successful', isNewUser ? 201 : 200);

  } catch (error) {
    console.error('Google auth error:', error);
    const err = new Error('Invalid Google token or authentication failed');
    err.statusCode = 401;
    throw err;
  }
});

// Complete profile setup for Google users
const completeProfileSetup = asyncHandler(async (req, res) => {
  const { password, country } = req.body;

  if (!password) {
    const error = new Error('Password is required to complete profile setup');
    error.statusCode = 400;
    throw error;
  }

  const user = await User.findById(req.user.userId);

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  if (user.profileSetupComplete && user.password) {
    const error = new Error('Profile setup is already complete');
    error.statusCode = 400;
    throw error;
  }

  // Update user profile
  user.password = password;
  user.country = country || user.country;
  user.profileSetupComplete = true;

  await user.save();

  successResponse(res, {
    id: user._id,
    name: user.name,
    email: user.email,
    country: user.country,
    profile: user.profile,
    profileSetupComplete: user.profileSetupComplete,
  }, 'Profile setup completed successfully');
});

// User signup
const signup = asyncHandler(async (req, res) => {
  const { email, password, name, country } = req.body;

  // Validate required fields
  if (!email || !password || !name) {
    const error = new Error('Email, password, and name are required');
    error.statusCode = 400;
    throw error;
  }

  // Check if user already exists
  let user = await User.findOne({ email });

  if (user) {
    const error = new Error('User already exists with this email');
    error.statusCode = 409;
    throw error;
  }

  // Create new user
  user = new User({
    name,
    email,
    password,
    country: country || null,
  });

  await user.save();

  console.log(`New user created: ${email}`);

  // Generate tokens
  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  // Save refresh token to user
  user.refreshToken = refreshToken;
  await user.save();

  // Return user data and tokens
  const userData = {
    id: user._id,
    name: user.name,
    email: user.email,
    country: user.country,
    profile: user.profile,
    watchlists: user.watchlists,
    createdAt: user.createdAt,
  };

  successResponse(res, {
    user: userData,
    accessToken,
    refreshToken,
  }, 'Signup successful', 201);
});

// User login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validate required fields
  if (!email || !password) {
    const error = new Error('Email and password are required');
    error.statusCode = 400;
    throw error;
  }

  try {
    // Find user and include password field
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    // Compare passwords
    const isPasswordMatch = await user.comparePassword(password);

    if (!isPasswordMatch) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    // Update last login
    await user.updateLastLogin();

    console.log(`User logged in: ${email}`);

    // Generate tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Save refresh token to user
    user.refreshToken = refreshToken;
    await user.save();

    // Return user data and tokens
    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      country: user.country,
      profile: user.profile,
      watchlists: user.watchlists,
      createdAt: user.createdAt,
    };

    successResponse(res, {
      user: userData,
      accessToken,
      refreshToken,
    }, 'Login successful', 200);

  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
});

// Refresh access token
const refreshAccessToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    const error = new Error('Refresh token is required');
    error.statusCode = 400;
    throw error;
  }

  try {
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    
    // Find user
    const user = await User.findById(decoded.userId);

    if (!user || user.refreshToken !== refreshToken) {
      const error = new Error('Invalid refresh token');
      error.statusCode = 401;
      throw error;
    }

    // Generate new access token
    const accessToken = generateAccessToken(user._id);

    successResponse(res, {
      accessToken,
    }, 'Token refreshed successfully');

  } catch (error) {
    console.error('Refresh token error:', error);
    const err = new Error('Invalid or expired refresh token');
    err.statusCode = 401;
    throw err;
  }
});

// Get current user profile
const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.userId).select('-refreshToken');

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  successResponse(res, user, 'Profile retrieved successfully');
});

// Update user profile
const updateProfile = asyncHandler(async (req, res) => {
  const { name, country, profile } = req.body;

  const user = await User.findById(req.user.userId);

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  // Update fields
  if (name) user.name = name;
  if (country) user.country = country;
  if (profile) user.profile = profile;

  await user.save();

  successResponse(res, {
    id: user._id,
    name: user.name,
    email: user.email,
    country: user.country,
    profile: user.profile,
  }, 'Profile updated successfully');
});

// Logout
const logout = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.userId);

  if (user) {
    user.refreshToken = null;
    await user.save();
  }

  successResponse(res, null, 'Logged out successfully');
});

module.exports = {
  googleAuth,
  completeProfileSetup,
  signup,
  login,
  refreshAccessToken,
  getProfile,
  updateProfile,
  logout,
};
