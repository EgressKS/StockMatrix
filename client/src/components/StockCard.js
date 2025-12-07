import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { formatCurrency, formatPercentage, getPercentageColor, getStockDomain } from '../utils/formatters';
import { getTimeSeries } from '../api/stockService';

const StockCard = ({ stock, onPress, variant = 'grid' }) => {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [{ data: [0] }]
  });
  const [imageError, setImageError] = useState(false);
  
  const changeColor = getPercentageColor(stock.changePercent || stock.change);
  const domain = getStockDomain(stock.symbol);
  const logoUrl = `http://localhost:3000/api/stocks/logo/${domain}`;
  
  const getFirstChar = () => {
    const name = stock.name || stock.symbol;
    return name.charAt(0).toUpperCase();
  };
  
  const getLogoColor = () => {
    const colors = [
      '#FF6B35', // Orange
      '#4285F4', // Blue
      '#E91E63', // Pink
      '#9C27B0', // Purple
      '#00BCD4', // Cyan
      '#4CAF50', // Green
      '#FF9800', // Amber
      '#F44336', // Red
    ];
    const char = getFirstChar();
    const index = char.charCodeAt(0) % colors.length;
    return colors[index];
  };

  useEffect(() => {
    fetchChartData();
  }, [stock.symbol]);

  const fetchChartData = async () => {
    try {
      const response = await getTimeSeries(stock.symbol, '1m');
      const timeSeriesData = response.data?.data || [];
      setChartData({
        labels: [],
        datasets: [{
          data: timeSeriesData.map(item => item.price),
          strokeWidth: 2,
        }]
      });
    } catch (error) {
      console.error('Error fetching chart data:', error);
      setChartData({
        labels: [],
        datasets: [{ data: [0] }]
      });
    }
  };

  const chartConfig = {
    backgroundColor: 'transparent',
    backgroundGradientFrom: 'transparent',
    backgroundGradientTo: 'transparent',
    decimalPlaces: 0,
    color: (opacity = 1) => changeColor,
    labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForLabels: {
      fontSize: 10,
    },
    propsForDots: {
      r: '0',
    }
  };

  if (variant === 'list') {
    return (
      <TouchableOpacity style={styles.listCard} onPress={onPress}>
        <View style={styles.listLeft}>
          <View style={styles.logoContainer}>
            {imageError ? (
              <View style={[styles.logoFallback, { backgroundColor: getLogoColor() }]}>
                <Text style={styles.logoFallbackText}>{getFirstChar()}</Text>
              </View>
            ) : (
              <Image
                source={{ uri: logoUrl }}
                style={styles.logo}
                onError={() => setImageError(true)}
              />
            )}
          </View>
          <View style={styles.listInfo}>
            <Text style={styles.companyName} numberOfLines={1} ellipsizeMode="tail">
              {stock.name || stock.symbol}
            </Text>
            <Text style={styles.symbol}>{stock.symbol}</Text>
          </View>
        </View>
        <View style={styles.listRight}>
          <Text style={styles.price}>{formatCurrency(stock.price)}</Text>
          <Text style={[styles.change, { color: changeColor }]}>
            {formatPercentage(stock.changePercent || stock.change)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.gridCard} onPress={onPress}>
      <View style={styles.cardHeader}>
        <View style={styles.headerContent}>
          <Text style={styles.companyName} numberOfLines={2} ellipsizeMode="tail">
            {stock.name || stock.symbol}
          </Text>
          <Text style={styles.symbol}>{stock.symbol}</Text>
        </View>
      </View>
      
      <View style={styles.chartContainer}>
        <LineChart
          data={chartData}
          width={Dimensions.get('window').width * 0.40} 
          height={45}
          chartConfig={chartConfig}
          bezier
          withDots={false}
          withShadow={false}
          withInnerLines={false}
          withOuterLines={false}
          withHorizontalLabels={false}
          withVerticalLabels={false}
          withHorizontalLines={false}
          withVerticalLines={false}
          style={styles.chart}
          getDotProps={() => ({
            r: '0',
            strokeWidth: '0',
          })}
          segments={2}
        />
      </View>

      <View style={styles.cardFooter}>
        <Text style={styles.price}>{formatCurrency(stock.price)}</Text>
        <Text style={[styles.changeText, { color: changeColor }]}>
          {formatPercentage(stock.changePercent || stock.change)}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  gridCard: {
    backgroundColor: 'rgba(30, 20, 60, 0.6)',
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(100, 60, 200, 0.3)',
    height: 185,
  },
  listCard: {
    backgroundColor: 'rgba(30, 20, 60, 0.6)',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(100, 60, 200, 0.3)',
  },
  cardHeader: {
    marginBottom: 6,
  },
  headerContent: {
    minHeight: 36,
  },
  listLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  listRight: {
    alignItems: 'flex-end',
    minWidth: 80,
    justifyContent: 'center',
  },
  listInfo: {
    marginLeft: 12,
    flex: 1,
    marginRight: 8,
  },
  logoContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(50, 30, 80, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  logo: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  logoFallback: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoFallbackText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  companyName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
    lineHeight: 16,
  },
  symbol: {
    fontSize: 11,
    color: '#999999',
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  chartContainer: {
    height: 50,
    marginVertical: 6,
    alignItems: 'center',
    width: '100%', 
    overflow: 'hidden', 
  },
  
  chart: {
    marginVertical: 0,
    paddingVertical: 0,
    marginLeft: -15, 
    marginRight: -15, 
  },
  
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  price: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  change: {
    fontSize: 13,
    fontWeight: '700',
  },
  changeText: {
    fontSize: 13,
    fontWeight: '700',
  },
});

export default StockCard;
