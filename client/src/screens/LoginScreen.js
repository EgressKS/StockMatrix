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
import { LinearGradient } from 'expo-linear-gradient';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import Constants from 'expo-constants';
import useAuthStore from '../store/authStore';

WebBrowser.maybeCompleteAuthSession();

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

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: Constants.expoConfig?.extra?.googleWebClientId || '',
    redirectUrl: Google.useAuthRequestResult?.redirectUrl,
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      handleGoogleSignInSuccess(id_token);
    }
  }, [response]);

  const handleGoogleSignInSuccess = async (idToken) => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      await login({ idToken, isGoogleAuth: true });
    } catch (error) {
      console.error('Google sign-in error:', error);
      const message = error?.message || 'Unable to sign in with Google. Please try again.';
      Alert.alert('Sign In Failed', message, [{ text: 'OK' }]);
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (isLoading) return;
    try {
      const result = await promptAsync();
      if (result?.type !== 'success') {
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Google sign-in error:', error);
      Alert.alert('Sign In Failed', 'Unable to sign in with Google. Please try again.', [{ text: 'OK' }]);
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
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {!isSignupMode ? (
          // Login Mode
          <View style={styles.formContainer}>
            <Text style={styles.title}>Welcome Back!</Text>
            <Text style={styles.subtitle}>Sign in to access smart, personalized stock{'\n'}plans made for you.</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email address*</Text>
              <TextInput
                style={styles.input}
                placeholder="example@gmail.com"
                placeholderTextColor="#666"
                value={email}
                onChangeText={setEmail}
                editable={!isLoading}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password*</Text>
              <TextInput
                style={styles.input}
                placeholder="@Sn123hsn#"
                placeholderTextColor="#666"
                value={password}
                onChangeText={setPassword}
                editable={!isLoading}
                secureTextEntry
              />
            </View>

            <View style={styles.optionsRow}>
              <View style={styles.rememberRow}>
                <View style={styles.checkbox} />
                <Text style={styles.rememberText}>Remember me</Text>
              </View>
              <TouchableOpacity>
                <Text style={styles.forgotText}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={handleEmailLogin}
              disabled={isLoading}
              activeOpacity={0.9}
            >
              <View style={[styles.signInButton, isLoading && styles.buttonDisabled]}>
                {isLoading ? (
                  <ActivityIndicator color="#000" />
                ) : (
                  <Text style={styles.signInButtonText}>✦ Sign in</Text>
                )}
              </View>
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>Or continue with</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              onPress={handleGoogleSignIn}
              disabled={isLoading}
              activeOpacity={0.9}
            >
              <View style={[styles.googleButton, isLoading && styles.buttonDisabled]}>
                <Text style={styles.googleIcon}>G</Text>
                <Text style={styles.googleButtonText}>Google</Text>
              </View>
            </TouchableOpacity>

            <View style={styles.signupSection}>
              <Text style={styles.footerText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => setIsSignupMode(true)} disabled={isLoading}>
                <Text style={styles.signupLink}>Sign up</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          // Signup Mode
          <View style={styles.formContainer}>
            <Text style={styles.title}>Create Your Account</Text>
            <Text style={styles.subtitle}>Create your account to explore exciting stock{'\n'}destinations and adventures.</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name*</Text>
              <TextInput
                style={styles.input}
                placeholder="Alex Smith"
                placeholderTextColor="#666"
                value={signupName}
                onChangeText={setSignupName}
                editable={!isLoading}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email address*</Text>
              <TextInput
                style={styles.input}
                placeholder="example@gmail.com"
                placeholderTextColor="#666"
                value={email}
                onChangeText={setEmail}
                editable={!isLoading}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password*</Text>
              <TextInput
                style={styles.input}
                placeholder="@Sn123hsn#"
                placeholderTextColor="#666"
                value={signupPassword}
                onChangeText={setSignupPassword}
                editable={!isLoading}
                secureTextEntry
              />
            </View>

            <TouchableOpacity
              onPress={handleSignup}
              disabled={isLoading}
              activeOpacity={0.9}
            >
              <View style={[styles.signInButton, isLoading && styles.buttonDisabled]}>
                {isLoading ? (
                  <ActivityIndicator color="#000" />
                ) : (
                  <Text style={styles.signInButtonText}>✦ Register</Text>
                )}
              </View>
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>Or continue with</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              onPress={handleGoogleSignIn}
              disabled={isLoading}
              activeOpacity={0.9}
            >
              <View style={[styles.googleButton, isLoading && styles.buttonDisabled]}>
                <Text style={styles.googleIcon}>G</Text>
                <Text style={styles.googleButtonText}>Google</Text>
              </View>
            </TouchableOpacity>

            <View style={styles.signupSection}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => setIsSignupMode(false)} disabled={isLoading}>
                <Text style={styles.signupLink}>Sign in</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    position: 'relative',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 40,
  },
  formContainer: {
    paddingHorizontal: 30,
    maxWidth: 450,
    width: '100%',
    alignSelf: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 12,
    color: '#999',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 18,
  },
  inputGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 12,
    color: '#fff',
    marginBottom: 6,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#333333',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#fff',
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#555555',
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#444',
    marginRight: 8,
  },
  rememberText: {
    fontSize: 13,
    color: '#999',
  },
  forgotText: {
    fontSize: 13,
    color: '#fff',
    fontWeight: '500',
  },
  signInButton: {
    backgroundColor: '#E50914',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  signInButtonText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 0.5,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#2A2A2A',
  },
  dividerText: {
    color: '#666',
    marginHorizontal: 14,
    fontSize: 11,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: 14,
    borderRadius: 8,
    marginBottom: 18,
  },
  googleIcon: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4285F4',
    marginRight: 10,
  },
  googleButtonText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#000000',
    letterSpacing: 0.5,
  },
  signupSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  footerText: {
    color: '#666',
    fontSize: 12,
  },
  signupLink: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default LoginScreen;
