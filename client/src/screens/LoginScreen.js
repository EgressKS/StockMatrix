import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  ScrollView,
} from 'react-native';
import {
  GoogleSignin,
  statusCodes as GoogleSignInStatusCodes,
} from '@react-native-google-signin/google-signin';
import useAuthStore from '../store/authStore';
import { GOOGLE_WEB_CLIENT_ID, GOOGLE_ANDROID_CLIENT_ID, GOOGLE_IOS_CLIENT_ID } from '../config/env';

const LoginScreen = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignupMode, setIsSignupMode] = useState(false);
  const [signupName, setSignupName] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [signupCountry, setSignupCountry] = useState('');
  const { login, signup } = useAuthStore();

  useEffect(() => {
    const configureGoogleSignIn = async () => {
      try {
        await GoogleSignin.configure({
          webClientId: GOOGLE_WEB_CLIENT_ID || undefined,
          androidClientId: GOOGLE_ANDROID_CLIENT_ID || undefined,
          iosClientId: GOOGLE_IOS_CLIENT_ID || undefined,
          offlineAccess: true,
        });
      } catch (error) {
        console.error('Google Sign-In configuration error:', error);
      }
    };

    configureGoogleSignIn();
  }, []);

  const handleGoogleSignIn = async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const { idToken } = await GoogleSignin.signIn();

      if (!idToken) {
        throw new Error('Google did not return an ID token.');
      }

      await login({ idToken, isGoogleAuth: true });
    } catch (error) {
      if (error?.code === GoogleSignInStatusCodes.SIGN_IN_CANCELLED) {
        setIsLoading(false);
        return;
      }

      console.error('Google sign-in error:', error);
      let message = 'Unable to sign in with Google. Please try again.';

      if (error?.code === GoogleSignInStatusCodes.IN_PROGRESS) {
        message = 'Google sign-in is already in progress.';
      } else if (error?.code === GoogleSignInStatusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        message = 'Google Play Services is unavailable or out of date.';
      } else if (typeof error?.message === 'string' && error.message.trim().length) {
        message = error.message;
      }

      Alert.alert('Sign In Failed', message, [{ text: 'OK' }]);
      setIsLoading(false);
    }
  };

  const handleEmailLogin = async () => {
    if (!email || !password) {
      Alert.alert('Validation Error', 'Please enter both email and password');
      return;
    }

    if (isLoading) return;

    setIsLoading(true);
    try {
      await login({ email, password, isGoogleAuth: false });
    } catch (error) {
      console.error('Login error:', error);
      const message = error?.message || 'Unable to login. Please try again.';
      Alert.alert('Login Failed', message, [{ text: 'OK' }]);
      setIsLoading(false);
    }
  };

  const handleSignup = async () => {
    if (!signupName || !email || !signupPassword) {
      Alert.alert('Validation Error', 'Please fill in all required fields');
      return;
    }

    if (signupPassword.length < 6) {
      Alert.alert('Validation Error', 'Password must be at least 6 characters');
      return;
    }

    if (signupPassword !== signupConfirmPassword) {
      Alert.alert('Validation Error', 'Passwords do not match');
      return;
    }

    if (isLoading) return;

    setIsLoading(true);
    try {
      await signup({
        name: signupName,
        email,
        password: signupPassword,
        country: signupCountry,
      });
    } catch (error) {
      console.error('Signup error:', error);
      const message = error?.message || 'Unable to create account. Please try again.';
      Alert.alert('Signup Failed', message, [{ text: 'OK' }]);
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.logo}>📈</Text>
          <Text style={styles.title}>StockMatrix</Text>
          <Text style={styles.subtitle}>
            Track stocks, manage watchlists, and stay updated with market trends
          </Text>
        </View>

        {!isSignupMode ? (
          // Login Mode
          <View style={styles.authForm}>
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Sign In to Your Account</Text>

              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#6B7280"
                value={email}
                onChangeText={setEmail}
                editable={!isLoading}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#6B7280"
                value={password}
                onChangeText={setPassword}
                editable={!isLoading}
                secureTextEntry
              />

              <TouchableOpacity
                style={[styles.button, isLoading && styles.buttonDisabled]}
                onPress={handleEmailLogin}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Sign In with Email</Text>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              style={[styles.googleButton, isLoading && styles.buttonDisabled]}
              onPress={handleGoogleSignIn}
              disabled={isLoading}
            >
              <Text style={styles.googleIcon}>G</Text>
              <Text style={styles.googleButtonText}>Continue with Google</Text>
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => setIsSignupMode(true)} disabled={isLoading}>
                <Text style={styles.linkText}>Create one</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          // Signup Mode
          <View style={styles.authForm}>
            <Text style={styles.sectionTitle}>Create Your Account</Text>

            <TextInput
              style={styles.input}
              placeholder="Full Name *"
              placeholderTextColor="#6B7280"
              value={signupName}
              onChangeText={setSignupName}
              editable={!isLoading}
            />
            <TextInput
              style={styles.input}
              placeholder="Email *"
              placeholderTextColor="#6B7280"
              value={email}
              onChangeText={setEmail}
              editable={!isLoading}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              placeholder="Password (min. 6 characters) *"
              placeholderTextColor="#6B7280"
              value={signupPassword}
              onChangeText={setSignupPassword}
              editable={!isLoading}
              secureTextEntry
            />
            <TextInput
              style={styles.input}
              placeholder="Confirm Password *"
              placeholderTextColor="#6B7280"
              value={signupConfirmPassword}
              onChangeText={setSignupConfirmPassword}
              editable={!isLoading}
              secureTextEntry
            />
            <TextInput
              style={styles.input}
              placeholder="Country (Optional)"
              placeholderTextColor="#6B7280"
              value={signupCountry}
              onChangeText={setSignupCountry}
              editable={!isLoading}
            />

            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleSignup}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Create Account</Text>
              )}
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => setIsSignupMode(false)} disabled={isLoading}>
                <Text style={styles.linkText}>Sign in</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <Text style={styles.terms}>
          By continuing, you agree to our Terms of Service and Privacy Policy
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E27',
  },
  content: {
    padding: 24,
    paddingTop: 40,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    fontSize: 60,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#8B92B2',
    textAlign: 'center',
    lineHeight: 20,
  },
  authForm: {
    marginBottom: 24,
  },
  formSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#1A1F3A',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#2D3347',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#4285F4',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: '#4285F4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#2D3347',
  },
  dividerText: {
    color: '#6B7280',
    marginHorizontal: 12,
    fontSize: 14,
  },
  googleButton: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    marginBottom: 16,
  },
  googleIcon: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4285F4',
    marginRight: 8,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  footerText: {
    color: '#8B92B2',
    fontSize: 14,
  },
  linkText: {
    color: '#4285F4',
    fontWeight: '600',
    fontSize: 14,
  },
  terms: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default LoginScreen;
