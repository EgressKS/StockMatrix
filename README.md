 StockMatrix - Stock Broking App

A production-ready mobile stock broking application built with React Native and Node.js + Express backend, featuring **Google OAuth 2.0 authentication**, **MongoDB database**, and real-time stock data from Yahoo Finance API.

## 🎉 NEW: Authentication & Database Integration

This app now includes:
- ✅ **Google OAuth 2.0 Login** with PKCE
- ✅ **MongoDB User Storage** with persistent watchlists
- ✅ **JWT Authentication** (access + refresh tokens)
- ✅ **Protected API Routes** - All endpoints require authentication
- ✅ **User Profile Management**
- ✅ **No API Keys Required** - Uses Yahoo Finance (free)

## Project Structure

```
├── server/                 # Backend (Node.js + Express)
│   └── src/
│       ├── config/        # API configuration
│       ├── middleware/    # Error handling & middleware
│       ├── controllers/   # Business logic
│       └── routes/        # API routes
│
└── client/                # Frontend (React Native)
    └── src/
        ├── api/          # API service layer
        ├── components/   # Reusable UI components
        ├── screens/      # App screens
        ├── navigation/   # Navigation setup
        ├── store/        # State management
        └── utils/        # Utility functions
```

## Features

### Backend
- Stock overview data (Alpha Vantage)
- Time-series data with multiple ranges (1D, 1W, 1M, 3M, 6M, 1Y, ALL)
- Top gainers and losers
- Company logos (Clearbit)
- Watchlist management (in-memory)
- API response caching (10-minute expiry)
- Centralized error handling

### Frontend
- Explore screen with Top Gainers and Top Losers
- Product details screen with interactive charts
- Watchlist management with custom lists
- Search and filter functionality
- Bottom tab navigation (Explore & Watchlist)
- Bottom sheet modal for watchlist actions
- Loading, error, and empty states
- Clean, modern UI matching design specifications

## 📚 Documentation

**Quick Links:**
- 🚀 **[QUICKSTART.md](QUICKSTART.md)** - Get running in 5 minutes
- 🔧 **[CONFIGURATION.md](CONFIGURATION.md)** - Configuration checklist
- 📖 **[SETUP_GUIDE.md](SETUP_GUIDE.md)** - Detailed setup instructions
- 📝 **[API_DOCS.md](server/API_DOCS.md)** - Complete API reference
- ✨ **[IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)** - What's been built
- 🔄 **[AUTH_CHANGES.md](AUTH_CHANGES.md)** - Changes made

## Prerequisites

- Node.js 18+ installed
- **MongoDB Atlas account** (free tier available)
- **Google Cloud Console project** (for OAuth)
- WSL with Fish or Bash (for Windows users)

## Quick Setup Instructions

### 1. Run Automated Setup

```bash
# Make scripts executable
chmod +x setup-env.sh

# Run setup script (Bash/WSL)
./setup-env.sh

# Or for Fish shell
chmod +x setup-env.fish
./setup-env.fish
```

This will:
- Generate secure JWT secrets
- Create `.env` files
- Prompt for MongoDB URI and Google Client ID

### 2. Configure Google Client IDs

Edit `client/src/screens/LoginScreen.js` (line 18):
```javascript
const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
  clientId: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com',
  androidClientId: 'YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com',
  iosClientId: 'YOUR_IOS_CLIENT_ID.apps.googleusercontent.com',
});
```

### 3. Install Dependencies & Start

```bash
# Backend
cd server
npm install
npm start

# Frontend (new terminal)
cd client
npm install
npm start
```

**For detailed instructions, see [SETUP_GUIDE.md](SETUP_GUIDE.md)**

## API Endpoints

### Public Endpoints
- `GET /health` - Health check
- `POST /api/auth/google` - Login with Google OAuth
- `POST /api/auth/refresh` - Refresh access token

### Protected Endpoints (Require Authentication)

**Authentication:**
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/logout` - Logout user

**Stock Endpoints:**
- `GET /api/stocks/overview/:symbol` - Get stock overview
- `GET /api/stocks/time-series/:symbol/:range` - Get historical data
- `GET /api/stocks/gainers` - Get top gaining stocks
- `GET /api/stocks/losers` - Get top losing stocks
- `GET /api/stocks/logo/:symbol` - Get company logo

**Watchlist Endpoints:**
- `GET /api/watchlist` - Get all user watchlists
- `POST /api/watchlist/add` - Add stock to watchlist
- `DELETE /api/watchlist/remove/:symbol` - Remove stock from watchlist
- `POST /api/watchlist/create` - Create new watchlist
- `DELETE /api/watchlist/:name` - Delete watchlist

**See [API_DOCS.md](server/API_DOCS.md) for detailed documentation with examples.**

## App Screens

1. **Login Screen** - Google OAuth authentication
2. **Explore Screen** - Browse top gainers and losers
3. **Product Screen** - Detailed stock information with charts
4. **Watchlist Screen** - Manage custom watchlists
5. **View All Screen** - Paginated stock listings with search
6. **Profile Screen** - User profile and settings with logout

## Tech Stack

### Backend
- Node.js & Express.js
- **MongoDB with Mongoose** (database)
- **JWT** (authentication)
- **Google OAuth 2.0** (authentication)
- Yahoo Finance API (stock data)
- Axios (API calls)
- Node-Cache (response caching)

### Frontend
- React Native with Expo
- **Expo Auth Session** (OAuth flow)
- React Navigation (bottom tabs & stack)
- Zustand (state management)
- React Native Chart Kit (graphs)
- React Native Modal (bottom sheets)
- AsyncStorage (token storage)

## Environment Variables

### Server (.env)
```env
PORT=3000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/stockmatrix

# Google OAuth 2.0
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com

# JWT Secrets (generate with: openssl rand -base64 64)
JWT_SECRET=your_long_random_secret_here
JWT_REFRESH_SECRET=your_different_long_random_secret_here
JWT_EXPIRES_IN=7d
```

### Client (.env)
```env
API_BASE_URL=http://localhost:3000/api
```

**See [CONFIGURATION.md](CONFIGURATION.md) for detailed setup.**

## Key Features

✅ **Authentication:**
- Google OAuth 2.0 with PKCE flow
- JWT access and refresh tokens
- Auto token refresh on expiry
- Secure logout

✅ **Database:**
- MongoDB Atlas cloud database
- User data with embedded watchlists
- Persistent storage across sessions

✅ **Security:**
- All API routes protected with JWT
- Token verification middleware
- Refresh token rotation
- MongoDB user-level data isolation

✅ **Stock Data:**
- Real-time prices from Yahoo Finance
- No API key required
- 10-minute response caching
- Top gainers/losers lists

✅ **User Experience:**
- Seamless authentication flow
- Profile management
- Custom watchlists per user
- Modern dark theme UI

## Images / Screenshots

Screenshots from the running app:

<p align="left" style="display:flex; align-items:flex-start; gap:8px;">
  <img src="assets/screenshots/home.png-explore.jpg" alt="Home - Top Gainers/Losers" style="height:240px; object-fit:cover;">
  <img src="assets/screenshots/top-gainers-list.jpg" alt="Top Gainers List" style="height:240px; object-fit:cover;">
  <img src="assets/screenshots/details-screen.jpg" alt="Details Chart" style="height:240px; object-fit:cover;">
  <img src="assets/screenshots/add-watchlist-modal.jpg" alt="Add to Watchlist Modal" style="height:240px; object-fit:cover;">
  <img src="assets/screenshots/watchlists.jpg" alt="Watchlists" style="height:240px; object-fit:cover;">
</p>

## License

This project is licensed under the MIT License — see the LICENSE file for details.
