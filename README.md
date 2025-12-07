# StockMatrix - Stock Broking App

A production-ready mobile stock broking application built with React Native and Node.js + Express backend, featuring **Google OAuth 2.0 authentication**, **MongoDB database**, and real-time stock data from Yahoo Finance API.

## Screenshots

<p align="center">
  <img src="assets/screenshots/signin.jpeg" alt="Sign In" width="24%">
  <img src="assets/screenshots/signup.jpeg" alt="Sign Up" width="24%">
  <img src="assets/screenshots/explore.jpeg" alt="Explore - Top Gainers" width="24%">
  <img src="assets/screenshots/Top-gainer.jpeg" alt="Top Gainers List" width="24%">
</p>

<p align="center">
  <img src="assets/screenshots/DetailScreen.jpeg" alt="Stock Detail Screen" width="24%">
  <img src="assets/screenshots/addToWatchlist.jpeg" alt="Add to Watchlist" width="24%">
  <img src="assets/screenshots/watchlist.jpeg" alt="Watchlist Management" width="24%">
  <img src="assets/screenshots/profile.jpeg" alt="User Profile" width="24%">
</p>

## Prerequisites

- Node.js 18+ installed
- MongoDB Atlas account 
- Google Cloud Console project

## Installation

```bash
# Backend
cd server
npm install
npm run dev

# Frontend (new terminal)
cd client
npm install
npm start
```

## Environment Variables

### Server (.env)
Create a `.env` file in the `server` directory:

```env
PORT=3000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/stockmatrix

# Google OAuth 2.0
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com

# JWT Secrets (generate with: openssl rand -base64 64)
JWT_SECRET=your_long_random_secret_here
JWT_REFRESH_SECRET=your_different_long_random_secret_here
JWT_EXPIRES_IN=7d
```

### Client (.env)
Create a `.env` file in the `client` directory:

```env
API_BASE_URL=http://localhost:3000/api
```

## Tech Stack

### Backend
- Node.js & Express.js
- MongoDB with Mongoose (database)
- JWT (authentication)
- Google OAuth 2.0 (authentication)
- Yahoo Finance API (stock data)
- Axios (API calls)
- Node-Cache (response caching)

### Frontend
- React Native with Expo
- Expo Auth Session (OAuth flow)
- React Navigation (bottom tabs & stack)
- Zustand (state management)
- React Native Chart Kit (graphs)
- React Native Modal (bottom sheets)
- AsyncStorage (token storage)

## Key Features

- **Google OAuth 2.0 authentication** with PKCE flow and JWT access/refresh tokens
- **MongoDB Atlas cloud database** with user data and embedded watchlists for persistent storage
- **Protected API routes** with JWT token verification middleware and refresh token rotation
- **Real-time stock prices** from Yahoo Finance API with 10-minute response caching
- **Custom watchlists** per user with seamless authentication flow and profile management
- **Interactive charts** with multiple time ranges (1D, 1W, 1M, 3M, 6M, 1Y, ALL)
- **Top gainers/losers lists** with search and filter functionality
- **Modern dark theme UI** with bottom tab navigation and loading/error/empty states

## License

This project is licensed under the MIT License — see the LICENSE file for details.
