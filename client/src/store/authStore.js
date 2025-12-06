import { create } from 'zustand';
import {
  googleLogin,
  logout as logoutService,
  getProfile,
  updateProfile as updateProfileService,
  getUserData,
  isAuthenticated,
  clearTokens,
} from '../api/authService';

const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  // Initialize auth state from storage
  initialize: async () => {
    set({ isLoading: true });
    try {
      const authenticated = await isAuthenticated();
      if (authenticated) {
        const userData = await getUserData();
        set({
          user: userData,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
        
        // Fetch fresh user data from server
        try {
          const response = await getProfile();
          set({ user: response.data });
        } catch (error) {
          console.error('Error fetching profile:', error);
        }
      } else {
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: error.message,
      });
    }
  },

  // Login with Google
  login: async (idToken, country = null) => {
    set({ isLoading: true, error: null });
    try {
      const response = await googleLogin(idToken, country);
      const { user } = response.data;
      
      set({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      
      return response;
    } catch (error) {
      set({
        error: error.message || 'Login failed',
        isLoading: false,
      });
      throw error;
    }
  },

  // Logout
  logout: async () => {
    set({ isLoading: true });
    try {
      await logoutService();
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error('Logout error:', error);
      // Clear state even if logout fails
      await clearTokens();
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  },

  // Update profile
  updateProfile: async (profileData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await updateProfileService(profileData);
      set({
        user: response.data,
        isLoading: false,
        error: null,
      });
      return response;
    } catch (error) {
      set({
        error: error.message || 'Profile update failed',
        isLoading: false,
      });
      throw error;
    }
  },

  // Refresh user data
  refreshProfile: async () => {
    try {
      const response = await getProfile();
      set({ user: response.data });
      return response;
    } catch (error) {
      console.error('Error refreshing profile:', error);
      throw error;
    }
  },

  // Clear error
  clearError: () => set({ error: null }),
}));

export default useAuthStore;
