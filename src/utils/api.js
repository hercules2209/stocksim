// src/utils/api.js
import { format, subDays } from 'date-fns';

const API_URL = 'https://asia-south1-stocksim-432707.cloudfunctions.net/api';

/**
 * Get the date range for the past year.
 * @returns {Object} An object containing 'from' and 'to' dates in 'yyyy-MM-dd' format.
 */
const getPastYearDateRange = () => {
  const today = new Date();
  const pastDate = subDays(today, 365);
  const from = format(pastDate, 'yyyy-MM-dd');
  const to = format(today, 'yyyy-MM-dd');
  return { from, to };
};

/**
 * Fetch stock candles data for a given symbol.
 * @param {string} symbol - The stock symbol.
 * @returns {Promise<Object[]>} A promise that resolves to an array of stock candles.
 * @throws Will throw an error if the fetch operation fails.
 */
export const getStockCandles = async (symbol) => {
  try {
    const response = await fetch(`${API_URL}/stock/candles/${symbol}`);
    if (!response.ok) {
      throw new Error('Failed to fetch stock candles');
    }
    const data = await response.json();
    return data.results.map(candle => ({
      time: candle.t / 1000,
      open: candle.o,
      high: candle.h,
      low: candle.l,
      close: candle.c,
      volume: candle.v
    }));
  } catch (error) {
    console.error('Error fetching stock candles:', error);
    throw error;
  }
};

/**
 * Fetch company profile data for a given symbol.
 * @param {string} symbol - The stock symbol.
 * @returns {Promise<Object>} A promise that resolves to the company profile data.
 * @throws Will throw an error if the fetch operation fails.
 */
export const getCompanyProfile = async (symbol) => {
  try {
    const response = await fetch(`${API_URL}/stock/profile/${symbol}`);
    if (!response.ok) {
      throw new Error('Failed to fetch company profile');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching company profile:', error);
    throw error;
  }
};

/**
 * Fetch company news for a given symbol.
 * @param {string} symbol - The stock symbol.
 * @returns {Promise<Object[]>} A promise that resolves to an array of company news.
 * @throws Will throw an error if the fetch operation fails.
 */
export const getCompanyNews = async (symbol) => {
  try {
    const { from, to } = getPastYearDateRange();
    const response = await fetch(`${API_URL}/stock/news/${symbol}?from=${from}&to=${to}`);
    if (!response.ok) {
      throw new Error('Failed to fetch company news');
    }
    let news = await response.json();
    return news.sort((a, b) => b.datetime - a.datetime);
  } catch (error) {
    console.error('Error fetching company news:', error);
    throw error;
  }
};

/**
 * Fetch stock suggestions based on a query.
 * @param {string} query - The search query.
 * @returns {Promise<string[]>} A promise that resolves to an array of stock symbols.
 * @throws Will throw an error if the fetch operation fails.
 */
export const getStockSuggestions = async (query) => {
  try {
    const response = await fetch(`${API_URL}/stock/suggestions/${query}`);
    if (!response.ok) {
      throw new Error('Failed to fetch stock suggestions');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching stock suggestions:', error);
    return [];
  }
};



/**
 * Fetch recommendation trends for a given symbol.
 * @param {string} symbol - The stock symbol.
 * @returns {Promise<Object[]>} A promise that resolves to an array of recommendation trends.
 * @throws Will throw an error if the fetch operation fails.
 */
export const getRecommendationTrends = async (symbol) => {
  try {
    const response = await fetch(`${API_URL}/stock/recommendations/${symbol}`);
    if (!response.ok) {
      throw new Error('Failed to fetch recommendation trends');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching recommendation trends:', error);
    throw error;
  }
};

/**
 * Fetch stock details for a given symbol.
 * @param {string} symbol - The stock symbol.
 * @returns {Promise<Object>} A promise that resolves to the stock details.
 * @throws Will throw an error if the fetch operation fails.
 */
export const getStockDetails = async (symbol) => {
  try {
    const response = await fetch(`${API_URL}/stock/details/${symbol}`);
    if (!response.ok) {
      throw new Error('Failed to fetch stock details');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching stock details:', error);
    throw error;
  }
};


/**
 * Calculate various indicators (SMA, EMA, RSI) for the given stock data.
 * @param {Object[]} data - The stock data.
 * @returns {Object} An object containing arrays of calculated SMA, EMA, and RSI values.
 */
export const calculateIndicators = (data) => {
  if (!Array.isArray(data) || data.length === 0) {
    console.warn('Invalid or empty data provided to calculateIndicators');
    return {
      sma: [],
      ema: [],
      rsi: []
    };
  }

  return {
    sma: calculateSMA(data, 20),
    ema: calculateEMA(data, 20),
    rsi: calculateRSI(data)
  };
};

/**
 * Calculate the Simple Moving Average (SMA) for the given stock data.
 * @param {Object[]} data - The stock data.
 * @param {number} period - The period for the SMA calculation.
 * @returns {Object[]} An array of SMA values.
 */
const calculateSMA = (data, period) => {
  const sma = [];
  for (let i = period - 1; i < data.length; i++) {
    const sum = data.slice(i - period + 1, i + 1).reduce((acc, candle) => acc + candle.close, 0);
    sma.push({ time: data[i].time, value: sum / period });
  }
  return sma;
};

/**
 * Calculate the Exponential Moving Average (EMA) for the given stock data.
 * @param {Object[]} data - The stock data.
 * @param {number} period - The period for the EMA calculation.
 * @returns {Object[]} An array of EMA values.
 */
const calculateEMA = (data, period) => {
  const k = 2 / (period + 1);
  let ema = calculateSMA(data.slice(0, period), period)[0].value; // Initialize EMA with SMA value
  const emaData = [{ time: data[period - 1].time, value: ema }]; // Start after the SMA period

  for (let i = period; i < data.length; i++) {
    ema = (data[i].close - ema) * k + ema;
    emaData.push({ time: data[i].time, value: ema });
  }

  return emaData;
};

/**
 * Calculate the Relative Strength Index (RSI) for the given stock data.
 * @param {Object[]} data - The stock data.
 * @param {number} [period=14] - The period for the RSI calculation.
 * @returns {Object[]} An array of RSI values.
 */
const calculateRSI = (data, period = 14) => {
  const rsi = [];
  let gains = 0;
  let losses = 0;

  for (let i = 1; i < data.length; i++) {
    const difference = data[i].close - data[i - 1].close;
    if (difference >= 0) {
      gains += difference;
    } else {
      losses -= difference;
    }

    if (i >= period) {
      if (i > period) {
        gains = ((period - 1) * gains + (data[i].close - data[i - 1].close > 0 ? data[i].close - data[i - 1].close : 0)) / period;
        losses = ((period - 1) * losses + (data[i].close - data[i - 1].close < 0 ? data[i - 1].close - data[i].close : 0)) / period;
      }

      const relativeStrength = gains / losses;
      const rsiValue = 100 - (100 / (1 + relativeStrength));
      rsi.push({ time: data[i].time, value: rsiValue });
    }
  }

  return rsi;
};


/**
 * Fetch current market status for a given exchange.
 * @param {string} exchange - The exchange code.
 * @returns {Promise<Object>} A promise that resolves to the market status data.
 */
export const getMarketStatus = async (exchange) => {
  try {
    const response = await fetch(`${API_URL}/market-status?exchange=${exchange}`);
    if (!response.ok) {
      throw new Error('Failed to fetch market status');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching market status:', error);
    throw error;
  }
};

/**
 * Fetch market holidays for a given exchange.
 * @param {string} exchange - The exchange code.
 * @returns {Promise<Object>} A promise that resolves to the market holidays data.
 */
export const getMarketHolidays = async (exchange) => {
  try {
    const response = await fetch(`${API_URL}/market-holiday?exchange=${exchange}`);
    if (!response.ok) {
      throw new Error('Failed to fetch market holidays');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching market holidays:', error);
    throw error;
  }
};

/**
 * Fetch market news for a given category.
 * @param {string} category - The news category.
 * @param {number} [minId] - Optional minimum news ID.
 * @returns {Promise<Object[]>} A promise that resolves to an array of news items.
 */
export const getMarketNews = async (category, minId = null) => {
  try {
    let url = `${API_URL}/market-news?category=${category}`;
    if (minId) {
      url += `&minId=${minId}`;
    }
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch market news');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching market news:', error);
    throw error;
  }
};

/**
 * 
 * @returns 
 */

export const getAllArticles = async () => {
  try {
    const response = await fetch(`${API_URL}/articles`);
    if (!response.ok) {
      throw new Error('Failed to fetch articles');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching articles:', error);
    throw error;
  }
};

/**
 * 
 * @param {*} id 
 * @returns {Object}
 */
export const getArticleById = async (id) => {
  try {
    const response = await fetch(`${API_URL}/articles/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch article');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching article:', error);
    throw error;
  }
};