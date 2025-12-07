import { create } from 'zustand';
import {
  googleLogin,
  signup as signupService,
  login as loginService,
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
  needsProfileSetup: false,

  // Initialize auth state from storage
  initialize: async () => {
    set({ isLoading: true });
    try {
      const authenticated = await isAuthenticated();
      if (authenticated) {
        const userData = await getUserData();
        const needsSetup = userData?.authProvider === 'google' && !userData?.profileSetupComplete;
        
        set({
          user: userData,
          isAuthenticated: !needsSetup,
          needsProfileSetup: needsSetup,
          isLoading: false,
          error: null,
        });
        
        // Fetch fresh user data from server
        try {
          const response = await getProfile();
          const freshNeedsSetup = response.data?.authProvider === 'google' && !response.data?.profileSetupComplete;
          set({ 
            user: response.data,
            needsProfileSetup: freshNeedsSetup,
            isAuthenticated: !freshNeedsSetup,
          });
        } catch (error) {
          console.error('Error fetching profile:', error);
        }
      } else {
        set({
          user: null,
          isAuthenticated: false,
          needsProfileSetup: false,
          isLoading: false,
        });
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      set({
        user: null,
        isAuthenticated: false,
        needsProfileSetup: false,
        isLoading: false,
        error: error.message,
      });
    }
  },

  // Login with email and password or Google
  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      let response;
      
      if (credentials.isGoogleAuth) {
        response = await googleLogin(credentials.idToken);
        const { user, isNewUser } = response.data;
        
        const needsSetup = !user.profileSetupComplete && user.authProvider === 'google';
        set({
          user,
          isAuthenticated: !needsSetup,
          needsProfileSetup: needsSetup,
          isLoading: false,
          error: null,
        });
      } else {
        response = await loginService(credentials.email, credentials.password);
        const { user } = response.data;
        
        set({
          user,
          isAuthenticated: true,
          needsProfileSetup: false,
          isLoading: false,
          error: null,
        });
      }
      
      return response;
    } catch (error) {
      set({
        error: error.message || 'Login failed',
        isLoading: false,
      });
      throw error;
    }
  },

  // Signup with email and password
  signup: async (signupData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await signupService(
        signupData.name,
        signupData.email,
        signupData.password,
        signupData.country
      );
      const { user } = response.data;
      
      set({
        user,
        isAuthenticated: true,
        needsProfileSetup: false,
        isLoading: false,
        error: null,
      });
      
      return response;
    } catch (error) {
      set({
        error: error.message || 'Signup failed',
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
        needsProfileSetup: false,
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
        needsProfileSetup: false,
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
      const needsSetup = response.data?.authProvider === 'google' && !response.data?.profileSetupComplete;
      set({ 
        user: response.data,
        needsProfileSetup: needsSetup,
        isAuthenticated: !needsSetup,
      });
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
