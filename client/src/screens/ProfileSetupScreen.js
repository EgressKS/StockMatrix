import React, { useState } from 'react';
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
import { completeProfileSetup } from '../api/authService';

const ProfileSetupScreen = ({ route, navigation }) => {
  const { user } = route.params || {};
  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [country, setCountry] = useState('');

  const handleCompleteSetup = async () => {
    if (!password || !confirmPassword) {
      Alert.alert('Validation Error', 'Please enter and confirm your password');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Validation Error', 'Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Validation Error', 'Passwords do not match');
      return;
    }

    if (isLoading) {
      return;
    }

    setIsLoading(true);
    try {
      await completeProfileSetup(password, country);
      Alert.alert('Success', 'Profile setup complete! You can now access the app.');
      // Navigation will be handled by the auth store when it detects profileSetupComplete
    } catch (error) {
      console.error('Profile setup error:', error);
      const message = error?.message || 'Unable to complete profile setup. Please try again.';
      Alert.alert('Setup Failed', message, [{ text: 'OK' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.logo}>👤</Text>
          <Text style={styles.title}>Complete Your Profile</Text>
          <Text style={styles.subtitle}>
            Set a secure password to complete your account setup
          </Text>
        </View>

        <View style={styles.userInfo}>
          <Text style={styles.label}>Email</Text>
          <View style={[styles.input, styles.disabledInput]}>
            <Text style={styles.disabledText}>{user?.email}</Text>
          </View>

          <Text style={styles.label}>Name</Text>
          <View style={[styles.input, styles.disabledInput]}>
            <Text style={styles.disabledText}>{user?.name}</Text>
          </View>

          <Text style={styles.label}>Password *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter a secure password (min. 6 characters)"
            placeholderTextColor="#6B7280"
            value={password}
            onChangeText={setPassword}
            editable={!isLoading}
            secureTextEntry
          />

          <Text style={styles.label}>Confirm Password *</Text>
          <TextInput
            style={styles.input}
            placeholder="Confirm your password"
            placeholderTextColor="#6B7280"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            editable={!isLoading}
            secureTextEntry
          />

          <Text style={styles.label}>Country (Optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your country"
            placeholderTextColor="#6B7280"
            value={country}
            onChangeText={setCountry}
            editable={!isLoading}
          />

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleCompleteSetup}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Complete Setup</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.info}>
            This password will allow you to sign in with your email address. You can also use Google Sign-In anytime.
          </Text>
        </View>
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
    fontSize: 28,
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
  userInfo: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: '#1A1F3A',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#2D3347',
    fontSize: 16,
  },
  disabledInput: {
    backgroundColor: '#0F1220',
    borderColor: '#1A1F3A',
  },
  disabledText: {
    color: '#8B92B2',
  },
  button: {
    backgroundColor: '#4285F4',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
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
  info: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 24,
    lineHeight: 18,
  },
});

export default ProfileSetupScreen;
