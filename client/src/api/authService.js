import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config/env';

const authAPI = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token storage keys
const ACCESS_TOKEN_KEY = '@stockmatrix_access_token';
const REFRESH_TOKEN_KEY = '@stockmatrix_refresh_token';
const USER_DATA_KEY = '@stockmatrix_user_data';

// Token management
export const saveTokens = async (accessToken, refreshToken) => {
  try {
    await AsyncStorage.multiSet([
      [ACCESS_TOKEN_KEY, accessToken],
      [REFRESH_TOKEN_KEY, refreshToken],
    ]);
  } catch (error) {
    console.error('Error saving tokens:', error);
  }
};

export const getAccessToken = async () => {
  try {
    return await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
  } catch (error) {
    console.error('Error getting access token:', error);
    return null;
  }
};

export const getRefreshToken = async () => {
  try {
    return await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
  } catch (error) {
    console.error('Error getting refresh token:', error);
    return null;
  }
};

export const clearTokens = async () => {
  try {
    await AsyncStorage.multiRemove([
      ACCESS_TOKEN_KEY,
      REFRESH_TOKEN_KEY,
      USER_DATA_KEY,
    ]);
  } catch (error) {
    console.error('Error clearing tokens:', error);
  }
};

export const saveUserData = async (userData) => {
  try {
    await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
  } catch (error) {
    console.error('Error saving user data:', error);
  }
};

export const getUserData = async () => {
  try {
    const data = await AsyncStorage.getItem(USER_DATA_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
};

// Request interceptor to add auth token
authAPI.interceptors.request.use(
  async (config) => {
    const token = await getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
authAPI.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 403 (forbidden/expired token) and we haven't retried yet
    if (error.response?.status === 403 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await getRefreshToken();
        if (refreshToken) {
          // Try to refresh the access token
          const response = await axios.post(
            `${API_BASE_URL || DEFAULT_API_BASE_URL}/auth/refresh`,
            { refreshToken }
          );

          const { accessToken } = response.data.data;
          await AsyncStorage.setItem(ACCESS_TOKEN_KEY, accessToken);

          // Retry the original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return authAPI(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect to login
        await clearTokens();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Auth API endpoints
export const googleLogin = async (idToken) => {
  try {
    const response = await authAPI.post('/auth/google', { idToken });
    
    const { user, accessToken, refreshToken, isNewUser } = response.data.data;
    
    // Save tokens and user data
    await saveTokens(accessToken, refreshToken);
    await saveUserData(user);
    
    return { ...response.data, isNewUser };
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const completeProfileSetup = async (password, country = null) => {
  try {
    const response = await authAPI.post('/auth/profile/setup', {
      password,
      country,
    });
    
    const { data } = response.data;
    
    // Update stored user data
    await saveUserData(data);
    
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const signup = async (name, email, password, country = null) => {
  try {
    const response = await authAPI.post('/auth/signup', {
      name,
      email,
      password,
      country,
    });
    
    const { user, accessToken, refreshToken } = response.data.data;
    
    // Save tokens and user data
    await saveTokens(accessToken, refreshToken);
    await saveUserData(user);
    
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const login = async (email, password) => {
  try {
    const response = await authAPI.post('/auth/login', {
      email,
      password,
    });
    
    const { user, accessToken, refreshToken } = response.data.data;
    
    // Save tokens and user data
    await saveTokens(accessToken, refreshToken);
    await saveUserData(user);
    
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const refreshAccessToken = async () => {
  try {
    const refreshToken = await getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await authAPI.post('/auth/refresh', { refreshToken });
    const { accessToken } = response.data.data;
    
    await AsyncStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getProfile = async () => {
  try {
    const response = await authAPI.get('/auth/profile');
    
    // Update stored user data
    await saveUserData(response.data.data);
    
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const updateProfile = async (profileData) => {
  try {
    const response = await authAPI.put('/auth/profile', profileData);
    
    // Update stored user data
    await saveUserData(response.data.data);
    
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const logout = async () => {
  try {
    await authAPI.post('/auth/logout');
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    // Clear local storage regardless of API response
    await clearTokens();
  }
};

// Check if user is authenticated
export const isAuthenticated = async () => {
  const token = await getAccessToken();
  return !!token;
};

export default authAPI;
