import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config/env';

const DEFAULT_API_BASE_URL = 'https://stock-matrix-server.vercel.app/api';
const ACCESS_TOKEN_KEY = '@stockmatrix_access_token';

const stockAPI = axios.create({
  baseURL: API_BASE_URL || DEFAULT_API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to all requests
stockAPI.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Stock endpoints
export const getStockOverview = async (symbol) => {
  try {
    const response = await stockAPI.get(`/stocks/overview/${symbol}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getTimeSeries = async (symbol, range = '1m') => {
  try {
    const response = await stockAPI.get(`/stocks/time-series/${symbol}/${range}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getTopGainers = async () => {
  try {
    const response = await stockAPI.get('/stocks/gainers');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getTopLosers = async () => {
  try {
    const response = await stockAPI.get('/stocks/losers');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getCompanyLogo = (domain) => {
  return `${API_BASE_URL || DEFAULT_API_BASE_URL}/stocks/logo/${domain}`;
};

// Watchlist endpoints
export const getAllWatchlists = async () => {
  try {
    const response = await stockAPI.get('/watchlist');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const addToWatchlist = async (watchlistName, symbol, createNew = false) => {
  try {
    const response = await stockAPI.post('/watchlist/add', {
      watchlistName,
      symbol,
      createNew,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const removeFromWatchlist = async (symbol, watchlistName) => {
  try {
    const response = await stockAPI.delete(`/watchlist/remove/${symbol}`, {
      data: { watchlistName },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const createWatchlist = async (name) => {
  try {
    const response = await stockAPI.post('/watchlist/create', { name });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const deleteWatchlist = async (watchlistName) => {
  try {
    const response = await stockAPI.delete(`/watchlist/${encodeURIComponent(watchlistName)}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export default stockAPI;
