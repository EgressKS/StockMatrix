const axios = require('axios');
const NodeCache = require('node-cache');
const apiConfig = require('../config/apiConfig');
const { asyncHandler, successResponse } = require('../middleware/errorHandler');
const cache = new NodeCache({ stdTTL: apiConfig.cache.ttl });

const YahooFinance = require('yahoo-finance2').default;
const yahooFinance = new YahooFinance({ suppressNotices: ['ripHistorical'] });

const getStockOverview = asyncHandler(async (req, res) => {
  const { symbol } = req.params;
  const ticker = (symbol || '').toUpperCase();
  const cacheKey = `overview_${ticker}`;

  if (!ticker) {
    return successResponse(res, null, 'No symbol provided', 400);
  }

  const cachedData = cache.get(cacheKey);
  if (cachedData) return successResponse(res, cachedData, 'Stock overview retrieved from cache');

  try {
    const summary = await yahooFinance.quoteSummary(ticker, {
      modules: ['price', 'assetProfile', 'summaryProfile', 'defaultKeyStatistics']
    });

    if (!summary || !summary.price) {
      throw new Error('Stock symbol not found or Yahoo returned empty data');
    }

    const price = summary.price || {};
    const profile = summary.assetProfile || summary.summaryProfile || {};
    const stats = summary.defaultKeyStatistics || {};

    const formattedData = {
      symbol: price.symbol || ticker,
      name: price.shortName || price.longName || 'N/A',
      description: profile.longBusinessSummary || 'No description available',
      exchange: price.exchangeName || price.fullExchangeName || 'N/A',
      sector: profile.sector || 'N/A',
      industry: profile.industry || 'N/A',
      marketCap: price.marketCap ?? stats.marketCap ?? null,
      peRatio: stats.forwardPE ?? stats.trailingPE ?? null,
      dividendYield: (stats.dividendYield != null)
        ? (Number(stats.dividendYield) * 100).toFixed(2) + '%'
        : (price.dividendYield != null ? (Number(price.dividendYield) * 100).toFixed(2) + '%' : null),
      week52High: price.fiftyTwoWeekHigh ?? null,
      week52Low: price.fiftyTwoWeekLow ?? null,
      beta: stats.beta ?? price.beta ?? null,
      eps: stats.trailingEps ?? null,
      currentPrice: price.regularMarketPrice ?? price.currentPrice ?? null
    };

    cache.set(cacheKey, formattedData);
    return successResponse(res, formattedData, 'Stock overview retrieved successfully');

  } catch (err) {
    console.error('Yahoo fetch error', err);
    throw new Error('Failed to fetch stock data from Yahoo Finance');
  }
});

function computePeriod(range) {
  const now = new Date();
  let period2 = now;
  let period1;

  switch (range) {
    case '1d':
      period1 = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);
      break;
    case '1w':
      period1 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '1m':
      period1 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case '3m':
      period1 = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    case '6m':
      period1 = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
      break;
    case '1y':
      period1 = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      break;
    case 'all':
      period1 = new Date(now.getFullYear() - 20, now.getMonth(), now.getDate());
      break;
    default:
      period1 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
  }

  return [period1, period2];
}

function pickInterval(range) {
  switch (range) {
    case '1d': return '1m';   // 1 minute intervals
    case '1w': return '30m';  // 30 minute intervals
    case '1m': return '1h';   // 1 hour intervals
    case '3m': return '1d';   // 1 day intervals
    case '6m': return '1d';   // 1 day intervals
    case '1y': return '1wk';  // 1 week intervals
    case 'all': return '1mo'; // 1 month intervals
    default: return '1d';
  }
}

const getTimeSeries = asyncHandler(async (req, res) => {
  const { symbol, range } = req.params || {};
  if (!symbol) return successResponse(res, null, 'No symbol provided', 400);

  const ticker = symbol.toUpperCase();
  const normalizedRange = (range || '1m').toLowerCase();
  const cacheKey = `timeseries_${ticker}_${normalizedRange}`;

  // Check cache
  const cachedData = cache.get(cacheKey);
  if (cachedData) {
    return successResponse(res, cachedData, 'Time series data retrieved from cache');
  }

  const [period1, period2] = computePeriod(normalizedRange);
  const interval = pickInterval(normalizedRange);

  try {
    const queryOptions = {
      period1,
      period2,
      interval,
    };

    const chartData = await yahooFinance.chart(ticker, queryOptions);

    if (!chartData || !chartData.quotes || chartData.quotes.length === 0) {
      throw new Error('No chart data available for this symbol');
    }

    // Format the data from chart response
    const formattedData = chartData.quotes.map(quote => ({
      time: quote.date.toISOString(),
      price: quote.close != null ? Number(quote.close) : null,
      open: quote.open != null ? Number(quote.open) : null,
      high: quote.high != null ? Number(quote.high) : null,
      low: quote.low != null ? Number(quote.low) : null,
      volume: quote.volume != null ? Number(quote.volume) : null,
    }));

    const result = {
      symbol: ticker,
      range: normalizedRange,
      data: formattedData,
    };

    cache.set(cacheKey, result);
    return successResponse(res, result, 'Time series data retrieved successfully');

  } catch (err) {
    console.error('Yahoo TimeSeries Error:', err);
    throw new Error('Failed to fetch time series data from Yahoo Finance');
  }
});

const getTopGainers = asyncHandler(async (req, res) => {
  const cacheKey = 'top_gainers';

  const cachedData = cache.get(cacheKey);
  if (cachedData) {
    return successResponse(res, cachedData, 'Top gainers retrieved from cache');
  }

  const response = await axios.get('https://query1.finance.yahoo.com/v1/finance/screener/predefined/saved', {
    params: {
      formatted: true,
      scrIds: 'day_gainers',
      count: 10,
      region: 'US',
      lang: 'en-US'
    },
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  });

  if (!response.data || !response.data.finance) {
    throw new Error('Unable to fetch top gainers from Yahoo Finance');
  }

  const quotes = response.data?.finance?.result?.[0]?.quotes || [];
  
  const formattedGainers = quotes.map(stock => ({
    symbol: stock.symbol,
    name: stock.shortName || stock.longName || stock.symbol,
    price: stock.regularMarketPrice?.raw || stock.regularMarketPrice || 0,
    change: stock.regularMarketChange?.raw || stock.regularMarketChange || 0,
    changePercent: stock.regularMarketChangePercent?.raw || stock.regularMarketChangePercent || 0,
    volume: stock.regularMarketVolume?.raw || stock.regularMarketVolume || 0,
  }));

  cache.set(cacheKey, formattedGainers);
  successResponse(res, formattedGainers, 'Top gainers retrieved successfully');
});

const getTopLosers = asyncHandler(async (req, res) => {
  const cacheKey = 'top_losers';

  const cachedData = cache.get(cacheKey);
  if (cachedData) {
    return successResponse(res, cachedData, 'Top losers retrieved from cache');
  }

  const response = await axios.get('https://query1.finance.yahoo.com/v1/finance/screener/predefined/saved', {
    params: {
      formatted: true,
      scrIds: 'day_losers',
      count: 10,
      region: 'US',
      lang: 'en-US'
    },
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  });

  if (!response.data || !response.data.finance) {
    throw new Error('Unable to fetch top losers from Yahoo Finance');
  }

  const quotes = response.data?.finance?.result?.[0]?.quotes || [];
  
  const formattedLosers = quotes.map(stock => ({
    symbol: stock.symbol,
    name: stock.shortName || stock.longName || stock.symbol,
    price: stock.regularMarketPrice?.raw || stock.regularMarketPrice || 0,
    change: stock.regularMarketChange?.raw || stock.regularMarketChange || 0,
    changePercent: stock.regularMarketChangePercent?.raw || stock.regularMarketChangePercent || 0,
    volume: stock.regularMarketVolume?.raw || stock.regularMarketVolume || 0,
  }));

  cache.set(cacheKey, formattedLosers);
  successResponse(res, formattedLosers, 'Top losers retrieved successfully');
});


const getCompanyLogo = asyncHandler(async (req, res) => {
  const { symbol } = req.params;
  
  if (!symbol) {
    return successResponse(res, null, 'No symbol provided', 400);
  }

  const ticker = symbol.toUpperCase();
  const cacheKey = `logo_${ticker}`;

  // Check cache first
  const cachedLogo = cache.get(cacheKey);
  if (cachedLogo) {
    return successResponse(res, cachedLogo, 'Company logo retrieved from cache');
  }

  try {
    const summary = await yahooFinance.quoteSummary(ticker, {
      modules: ['assetProfile', 'summaryProfile', 'price']
    });

    const profile = summary.assetProfile || summary.summaryProfile || {};
    const price = summary.price || {};
    
    // Extract website domain from profile
    let logoUrl = null;
    let domain = null;
    
    if (profile.website) {
      domain = profile.website
        .replace(/^https?:\/\//, '')
        .replace(/^www\./, '')
        .split('/')[0];
      
      logoUrl = `https://logo.clearbit.com/${domain}`;
    }
    
    const result = { 
      logoUrl,
      domain,
      symbol: ticker,
      companyName: price.shortName || price.longName || profile.longName || ticker,
      website: profile.website || null
    };
    
    cache.set(cacheKey, result);
    return successResponse(res, result, 'Company logo retrieved successfully');

  } catch (err) {
    console.error('Logo fetch error:', err);
    throw new Error('Failed to fetch company logo from Yahoo Finance');
  }
});

module.exports = {
  getStockOverview,
  getTimeSeries,
  getTopGainers,
  getTopLosers,
  getCompanyLogo,
};