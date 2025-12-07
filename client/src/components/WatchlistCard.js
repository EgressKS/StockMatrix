import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const WatchlistCard = ({ watchlist, onPress, onMenuPress }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.content}>
        <View>
          <Text style={styles.name}>{watchlist.name}</Text>
          <Text style={styles.stockCount}>{watchlist.stockCount} stocks</Text>
        </View>
        <TouchableOpacity 
          style={styles.menuButton} 
          onPress={(e) => {
            e.stopPropagation();
            onMenuPress && onMenuPress();
          }}
        >
          <Text style={styles.menuIcon}>⋯</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(30, 20, 60, 0.6)',
    borderColor: 'rgba(100, 60, 200, 0.3)',
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  stockCount: {
    fontSize: 14,
    color: '#999999',
  },
  menuButton: {
    padding: 8,
  },
  menuIcon: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});

export default WatchlistCard;
