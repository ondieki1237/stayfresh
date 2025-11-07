import axios from 'axios';

/**
 * TwelveData API Integration Service
 * Provides real-time commodity and agricultural market data
 * API Key: 66dd04af759746b2853207bc5deaddb1
 */

class TwelveDataService {
  constructor() {
    this.apiKey = '66dd04af759746b2853207bc5deaddb1';
    this.baseUrl = 'https://api.twelvedata.com';
  }

  /**
   * Map produce types to commodity symbols
   */
  getCommoditySymbol(produceType) {
    const commodityMap = {
      // Agricultural commodities
      'tomato': 'TOMATO',
      'potato': 'POTATO', 
      'onion': 'ONION',
      'carrot': 'CARROT',
      'cabbage': 'CABBAGE',
      'beans': 'BEANS',
      // Common commodities that might be available
      'corn': 'ZC',      // Corn futures
      'wheat': 'ZW',     // Wheat futures
      'soybean': 'ZS',   // Soybean futures
      'rice': 'ZR',      // Rice futures
      'sugar': 'SB',     // Sugar futures
      'coffee': 'KC',    // Coffee futures
      'cotton': 'CT',    // Cotton futures
    };

    return commodityMap[produceType.toLowerCase()] || produceType.toUpperCase();
  }

  /**
   * Fetch time series data for a commodity
   */
  async getTimeSeries(produceType, interval = '1day', outputsize = 30) {
    try {
      const symbol = this.getCommoditySymbol(produceType);
      
      const response = await axios.get(`${this.baseUrl}/time_series`, {
        params: {
          symbol: symbol,
          interval: interval,
          apikey: this.apiKey,
          outputsize: outputsize,
          format: 'JSON'
        },
        timeout: 10000
      });

      if (response.data.status === 'error') {
        console.log(`TwelveData API error for ${symbol}:`, response.data.message);
        return null;
      }

      return {
        success: true,
        symbol: symbol,
        data: response.data.values || [],
        meta: response.data.meta || {}
      };
    } catch (error) {
      console.error('TwelveData time series error:', error.message);
      return null;
    }
  }

  /**
   * Get real-time price quote
   */
  async getQuote(produceType) {
    try {
      const symbol = this.getCommoditySymbol(produceType);
      
      const response = await axios.get(`${this.baseUrl}/quote`, {
        params: {
          symbol: symbol,
          apikey: this.apiKey,
          format: 'JSON'
        },
        timeout: 10000
      });

      if (response.data.status === 'error') {
        console.log(`TwelveData quote error for ${symbol}:`, response.data.message);
        return null;
      }

      return {
        success: true,
        symbol: symbol,
        price: parseFloat(response.data.close || response.data.price || 0),
        open: parseFloat(response.data.open || 0),
        high: parseFloat(response.data.high || 0),
        low: parseFloat(response.data.low || 0),
        volume: parseInt(response.data.volume || 0),
        change: parseFloat(response.data.change || 0),
        percentChange: parseFloat(response.data.percent_change || 0),
        timestamp: response.data.timestamp || new Date().toISOString()
      };
    } catch (error) {
      console.error('TwelveData quote error:', error.message);
      return null;
    }
  }

  /**
   * Get market statistics
   */
  async getStatistics(produceType) {
    try {
      const symbol = this.getCommoditySymbol(produceType);
      
      const response = await axios.get(`${this.baseUrl}/statistics`, {
        params: {
          symbol: symbol,
          apikey: this.apiKey,
          format: 'JSON'
        },
        timeout: 10000
      });

      if (response.data.status === 'error') {
        return null;
      }

      return {
        success: true,
        symbol: symbol,
        statistics: response.data
      };
    } catch (error) {
      console.error('TwelveData statistics error:', error.message);
      return null;
    }
  }

  /**
   * Get multiple commodities data at once
   */
  async getBulkQuotes(produceTypes) {
    try {
      const symbols = produceTypes.map(p => this.getCommoditySymbol(p)).join(',');
      
      const response = await axios.get(`${this.baseUrl}/quote`, {
        params: {
          symbol: symbols,
          apikey: this.apiKey,
          format: 'JSON'
        },
        timeout: 15000
      });

      return {
        success: true,
        quotes: response.data
      };
    } catch (error) {
      console.error('TwelveData bulk quotes error:', error.message);
      return null;
    }
  }

  /**
   * Get market movers (top gainers/losers)
   */
  async getMarketMovers() {
    try {
      // Get quotes for common agricultural commodities
      const commodities = ['corn', 'wheat', 'soybean', 'rice', 'sugar', 'coffee'];
      const symbols = commodities.map(c => this.getCommoditySymbol(c)).join(',');
      
      const response = await axios.get(`${this.baseUrl}/quote`, {
        params: {
          symbol: symbols,
          apikey: this.apiKey,
          format: 'JSON'
        },
        timeout: 15000
      });

      if (!response.data) return null;

      // Parse and sort by percent change
      const quotes = Array.isArray(response.data) ? response.data : [response.data];
      const movers = quotes
        .filter(q => q.percent_change)
        .map(q => ({
          symbol: q.symbol,
          name: q.name || q.symbol,
          price: parseFloat(q.close || q.price || 0),
          change: parseFloat(q.percent_change || 0)
        }))
        .sort((a, b) => Math.abs(b.change) - Math.abs(a.change));

      return {
        success: true,
        topGainers: movers.filter(m => m.change > 0).slice(0, 5),
        topLosers: movers.filter(m => m.change < 0).slice(0, 5)
      };
    } catch (error) {
      console.error('TwelveData market movers error:', error.message);
      return null;
    }
  }

  /**
   * Get technical indicators (RSI, MA, etc.)
   */
  async getTechnicalIndicators(produceType, indicator = 'rsi', interval = '1day') {
    try {
      const symbol = this.getCommoditySymbol(produceType);
      
      const response = await axios.get(`${this.baseUrl}/${indicator}`, {
        params: {
          symbol: symbol,
          interval: interval,
          apikey: this.apiKey,
          format: 'JSON',
          outputsize: 30
        },
        timeout: 10000
      });

      if (response.data.status === 'error') {
        return null;
      }

      return {
        success: true,
        symbol: symbol,
        indicator: indicator,
        values: response.data.values || []
      };
    } catch (error) {
      console.error('TwelveData technical indicators error:', error.message);
      return null;
    }
  }

  /**
   * Enhanced market analysis combining multiple data points
   */
  async getEnhancedMarketAnalysis(produceType) {
    try {
      const [quote, timeSeries, statistics] = await Promise.allSettled([
        this.getQuote(produceType),
        this.getTimeSeries(produceType, '1day', 30),
        this.getStatistics(produceType)
      ]);

      const analysis = {
        produceType,
        timestamp: new Date().toISOString(),
        dataSource: 'TwelveData API'
      };

      // Add quote data if available
      if (quote.status === 'fulfilled' && quote.value) {
        analysis.currentPrice = quote.value.price;
        analysis.priceChange = quote.value.change;
        analysis.percentChange = quote.value.percentChange;
        analysis.dayHigh = quote.value.high;
        analysis.dayLow = quote.value.low;
        analysis.volume = quote.value.volume;
      }

      // Add historical data if available
      if (timeSeries.status === 'fulfilled' && timeSeries.value) {
        analysis.historicalData = timeSeries.value.data.slice(0, 7).map(d => ({
          date: d.datetime,
          price: parseFloat(d.close || d.price || 0)
        }));
      }

      // Add statistics if available
      if (statistics.status === 'fulfilled' && statistics.value) {
        analysis.statistics = statistics.value.statistics;
      }

      return {
        success: true,
        ...analysis
      };
    } catch (error) {
      console.error('Enhanced market analysis error:', error.message);
      return {
        success: false,
        message: error.message
      };
    }
  }

  /**
   * Check API status and available symbols
   */
  async checkApiStatus() {
    try {
      const response = await axios.get(`${this.baseUrl}/api_usage`, {
        params: {
          apikey: this.apiKey
        },
        timeout: 5000
      });

      return {
        success: true,
        usage: response.data
      };
    } catch (error) {
      console.error('API status check error:', error.message);
      return {
        success: false,
        message: error.message
      };
    }
  }
}

export default new TwelveDataService();
