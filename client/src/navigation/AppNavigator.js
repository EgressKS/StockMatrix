import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import ExploreScreen from '../screens/ExploreScreen';
import ProductScreen from '../screens/ProductScreen';
import ViewAllScreen from '../screens/ViewAllScreen';
import WatchlistScreen from '../screens/WatchlistScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Explore Stack Navigator
const ExploreStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false, 
      }}
    >
      <Stack.Screen name="ExploreHome" component={ExploreScreen} />
      <Stack.Screen name="Product" component={ProductScreen} />
      <Stack.Screen name="ViewAll" component={ViewAllScreen} />
    </Stack.Navigator>
  );
};

// Home Icon
const HomeIcon = ({ focused }) => (
  <View style={{ width: 22, height: 22, justifyContent: 'center', alignItems: 'center' }}>
    <View style={{
      width: 18,
      height: 16,
      borderWidth: 2,
      borderColor: focused ? '#FF6B35' : '#888888',
      borderBottomWidth: 0,
      position: 'absolute',
      bottom: 1,
    }} />
    <View style={{
      width: 0,
      height: 0,
      borderLeftWidth: 11,
      borderRightWidth: 11,
      borderBottomWidth: 9,
      borderLeftColor: 'transparent',
      borderRightColor: 'transparent',
      borderBottomColor: focused ? '#FF6B35' : '#888888',
      position: 'absolute',
      top: 0,
    }} />
    <View style={{
      width: 5,
      height: 6,
      backgroundColor: focused ? '#FF6B35' : '#888888',
      position: 'absolute',
      bottom: 1,
    }} />
  </View>
);

// Watchlist Icon
const WatchlistIcon = ({ focused }) => (
  <View style={{ width: 22, height: 22, justifyContent: 'center', alignItems: 'center' }}>
    <Text style={{ fontSize: 22, color: focused ? '#4285F4' : '#888888' }}>
      {focused ? '★' : '☆'}
    </Text>
  </View>
);

// Profile Icon with Circle
const ProfileIcon = ({ focused }) => (
  <View style={{
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: focused ? 'rgba(233, 30, 99, 0.3)' : 'rgba(136, 136, 136, 0.3)',
    borderWidth: 2,
    borderColor: focused ? '#E91E63' : '#888888',
    justifyContent: 'center',
    alignItems: 'center',
  }}>
    <View style={{
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: focused ? '#E91E63' : '#888888',
      position: 'absolute',
      top: 2,
    }} />
    <View style={{
      width: 16,
      height: 10,
      borderTopLeftRadius: 8,
      borderTopRightRadius: 8,
      backgroundColor: focused ? '#E91E63' : '#888888',
      position: 'absolute',
      bottom: 0,
    }} />
  </View>
);

// Main Tab Navigator
const AppNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#FFFFFF',
        tabBarInactiveTintColor: '#888888',
        tabBarStyle: {
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
          borderTopWidth: 1,
          borderTopColor: 'rgba(100, 60, 200, 0.3)',
          backgroundColor: 'rgba(10, 5, 20, 0.95)',
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          marginTop: 2,
        },
      }}
    >
      <Tab.Screen
        name="Explore"
        component={ExploreStack}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ focused }) => (
            <HomeIcon focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Watchlist"
        component={WatchlistScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <WatchlistIcon focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <ProfileIcon focused={focused} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default AppNavigator;
