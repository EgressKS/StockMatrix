import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import StockCard from '../components/StockCard';
import { getTopGainers, getTopLosers } from '../api/stockService';

const SearchIcon = () => (
  <View style={{ width: 24, height: 24 }}>
    <View style={{
      width: 18,
      height: 18,
      borderRadius: 9,
      borderWidth: 2.5,
      borderColor: '#FFFFFF',
      position: 'absolute',
      top: 0,
      left: 0,
    }} />
    <View style={{
      width: 8,
      height: 2.5,
      backgroundColor: '#FFFFFF',
      transform: [{ rotate: '45deg' }],
      position: 'absolute',
      bottom: 0,
      right: 0,
    }} />
  </View>
);

const ExploreScreen = () => {
  const navigation = useNavigation();
  const [gainers, setGainers] = useState([]);
  const [losers, setLosers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);

  const fetchData = async () => {
    try {
      const [gainersRes, losersRes] = await Promise.all([
        getTopGainers(),
        getTopLosers(),
      ]);
      
      setGainers(gainersRes.data || []);
      setLosers(losersRes.data || []);
    } catch (error) {
      console.error('Error fetching stock data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleStockPress = (stock) => {
    navigation.navigate('Product', { symbol: stock.symbol });
  };

  const handleViewAll = (type) => {
    navigation.navigate('ViewAll', { type });
  };

  const handleSearchPress = () => {
    setIsSearchActive(true);
  };

  const handleSearchClose = () => {
    setIsSearchActive(false);
    setSearchText('');
  };

  const handleSearchSubmit = () => {
    setIsSearchActive(false);
  };

  const filterStocks = (stocks) => {
    if (!searchText.trim()) return stocks;
    return stocks.filter(stock =>
      (stock.name && stock.name.toLowerCase().includes(searchText.toLowerCase())) ||
      (stock.symbol && stock.symbol.toLowerCase().includes(searchText.toLowerCase()))
    );
  };

  const filteredGainers = filterStocks(gainers);
  const filteredLosers = filterStocks(losers);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <LinearGradient
      colors={['#000000', '#1a0a3e', '#000000', '#2d1810']}
      locations={[0, 0.3, 0.6, 1]}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.appName}>📊 StockMatrix</Text>
          {isSearchActive ? (
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search stocks..."
                value={searchText}
                onChangeText={setSearchText}
                onSubmitEditing={handleSearchSubmit}
                autoFocus={true}
              />
              <TouchableOpacity onPress={handleSearchClose} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity onPress={handleSearchPress} style={styles.searchIconButton}>
              <SearchIcon />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.horizontalLine} />

        <ScrollView
          style={styles.scrollView}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >

      {/* Top Gainers Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Top Gainers</Text>
        <TouchableOpacity 
          style={styles.viewAllButton}
          onPress={() => handleViewAll('gainers')}
        >
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
        </View>
        <View style={styles.grid}>
          {filteredGainers.slice(0, 2).map((stock, index) => (
            <View key={index} style={styles.gridItem}>
              <StockCard
                stock={stock}
                onPress={() => handleStockPress(stock)}
                variant="grid"
              />
            </View>
          ))}
        </View> 
      </View>

      {/* Top Losers Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Top Losers</Text>
          <TouchableOpacity 
          style={styles.viewAllButton}
          onPress={() => handleViewAll('losers')}
        >
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
        </View>
        
        <View style={styles.grid}>
          {filteredLosers.slice(0, 2).map((stock, index) => (
            <View key={index} style={styles.gridItem}>
              <StockCard
                stock={stock}
                onPress={() => handleStockPress(stock)}
                variant="grid"
              />
            </View>
          ))}
        </View>

        
      </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 28,
    paddingBottom: 12,
  },
  appName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  searchIconButton: {
    padding: 6,
  },
  horizontalLine: {
    height: 1,
    backgroundColor: 'rgba(196, 185, 224, 0.3)',
    marginHorizontal: 16,
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
    marginTop: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 10,
    gap: 8,
  },
  gridItem: {
    width: '48%',
  },
  viewAllButton: {
    backgroundColor: 'rgba(30, 20, 60, 0.6)',
    borderRadius: 12,
    padding: 14,
    marginHorizontal: 16,
    marginTop: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(100, 60, 200, 0.3)',
  },
  viewAllText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    backgroundColor: 'rgba(30, 20, 60, 0.6)',
    borderColor: 'rgba(100, 60, 200, 0.3)',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 15,
    marginRight: 8,
    color: '#FFFFFF',
    placeholderTextColor: '#888888',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});

export default ExploreScreen;
