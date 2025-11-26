require('dotenv').config();

const apiConfig = {
  // alphaVantage: {
  //   baseURL: 'https://www.alphavantage.co',
  //   apiKey: process.env.ALPHA_VANTAGE_KEY,
  // },
  yahooFinance: {
    baseURL: 'https://query1.finance.yahoo.com',
  },
  clearbit: {
    logoURL: 'https://logo.clearbit.com',
  },
  cache: {
    ttl: 600, // 10 minutes in seconds
  },
};

module.exports = apiConfig;
