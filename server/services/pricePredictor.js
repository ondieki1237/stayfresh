import MarketData from '../models/MarketData.js';
import twelveDataService from './twelveDataService.js';

/**
 * Price Prediction Service
 * Uses historical data and market trends to predict future prices
 * Enhanced with TwelveData API for real-time commodity market data
 * Can also integrate with statistics.kilimo.go.ke for local insights
 */

class PricePredictor {
  /**
   * Fetch historical price data for a produce type
   */
  async getHistoricalData(produceType, daysBack = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);

    const historicalData = await MarketData.find({
      produceType,
      timestamp: { $gte: startDate }
    }).sort({ timestamp: 1 });

    return historicalData;
  }

  /**
   * Calculate moving average for price smoothing
   */
  calculateMovingAverage(prices, window = 7) {
    const movingAvg = [];
    for (let i = 0; i < prices.length; i++) {
      if (i < window - 1) {
        movingAvg.push(null);
      } else {
        const sum = prices.slice(i - window + 1, i + 1).reduce((a, b) => a + b, 0);
        movingAvg.push(sum / window);
      }
    }
    return movingAvg;
  }

  /**
   * Simple linear regression for trend prediction
   */
  linearRegression(xValues, yValues) {
    const n = xValues.length;
    const sumX = xValues.reduce((a, b) => a + b, 0);
    const sumY = yValues.reduce((a, b) => a + b, 0);
    const sumXY = xValues.reduce((sum, x, i) => sum + x * yValues[i], 0);
    const sumXX = xValues.reduce((sum, x) => sum + x * x, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    return { slope, intercept };
  }

  /**
   * Predict price for future days
   */
  async predictPrice(produceType, daysAhead = 7) {
    try {
      // Get historical data
      const historicalData = await this.getHistoricalData(produceType, 30);

      if (historicalData.length < 7) {
        return {
          success: false,
          message: 'Insufficient historical data for prediction'
        };
      }

      // Extract prices and create time indices
      const prices = historicalData.map(d => d.currentPrice);
      const timeIndices = historicalData.map((_, i) => i);

      // Calculate moving average to reduce noise
      const movingAvg = this.calculateMovingAverage(prices, 7);
      const validAvg = movingAvg.filter(v => v !== null);
      const validIndices = timeIndices.slice(-validAvg.length);

      // Perform linear regression
      const { slope, intercept } = this.linearRegression(validIndices, validAvg);

      // Predict future prices
      const predictions = [];
      const lastIndex = timeIndices[timeIndices.length - 1];
      const currentPrice = prices[prices.length - 1];

      for (let i = 1; i <= daysAhead; i++) {
        const futureIndex = lastIndex + i;
        const predictedPrice = slope * futureIndex + intercept;
        
        predictions.push({
          day: i,
          predictedPrice: Math.max(0, predictedPrice), // Ensure non-negative
          confidence: this.calculateConfidence(prices, slope, i)
        });
      }

      // Calculate trend
      const priceChange = predictions[predictions.length - 1].predictedPrice - currentPrice;
      const percentChange = (priceChange / currentPrice) * 100;

      return {
        success: true,
        produceType,
        currentPrice,
        predictions,
        trend: slope > 0 ? 'increasing' : 'decreasing',
        trendStrength: Math.abs(slope),
        percentChange: percentChange.toFixed(2),
        recommendation: this.generateRecommendation(slope, percentChange, currentPrice, predictions[predictions.length - 1].predictedPrice)
      };
    } catch (error) {
      console.error('Price prediction error:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  /**
   * Calculate prediction confidence based on price volatility
   */
  calculateConfidence(prices, slope, daysAhead) {
    // Calculate standard deviation
    const mean = prices.reduce((a, b) => a + b, 0) / prices.length;
    const variance = prices.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) / prices.length;
    const stdDev = Math.sqrt(variance);

    // Confidence decreases with distance and volatility
    const volatilityFactor = stdDev / mean; // Coefficient of variation
    const timeFactor = 1 - (daysAhead * 0.05); // Decreases with time
    const confidence = Math.max(0.3, Math.min(0.95, (1 - volatilityFactor) * timeFactor));

    return Math.round(confidence * 100);
  }

  /**
   * Generate actionable recommendation
   */
  generateRecommendation(slope, percentChange, currentPrice, futurePrice) {
    const absChange = Math.abs(percentChange);

    if (slope > 0 && absChange > 5) {
      return {
        action: 'HOLD',
        message: `Prices are expected to rise by ${Math.abs(percentChange).toFixed(1)}% in the coming week. Consider holding your produce for better prices.`,
        icon: '📈',
        color: 'green'
      };
    } else if (slope < 0 && absChange > 5) {
      return {
        action: 'SELL',
        message: `Prices may drop by ${Math.abs(percentChange).toFixed(1)}% in the coming week. Consider selling now to maximize returns.`,
        icon: '📉',
        color: 'red'
      };
    } else {
      return {
        action: 'MONITOR',
        message: `Prices are expected to remain stable. Monitor market conditions closely for the best selling opportunity.`,
        icon: '📊',
        color: 'yellow'
      };
    }
  }

  /**
   * Get seasonal trends (can be enhanced with Kilimo data)
   */
  async getSeasonalTrends(produceType) {
    try {
      // Get data for the past year
      const yearAgo = new Date();
      yearAgo.setFullYear(yearAgo.getFullYear() - 1);

      const yearlyData = await MarketData.find({
        produceType,
        timestamp: { $gte: yearAgo }
      }).sort({ timestamp: 1 });

      if (yearlyData.length < 30) {
        return {
          success: false,
          message: 'Insufficient data for seasonal analysis'
        };
      }

      // Group by month and calculate averages
      const monthlyAvg = {};
      yearlyData.forEach(data => {
        const month = new Date(data.timestamp).getMonth();
        if (!monthlyAvg[month]) {
          monthlyAvg[month] = { sum: 0, count: 0 };
        }
        monthlyAvg[month].sum += data.currentPrice;
        monthlyAvg[month].count += 1;
      });

      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const seasonalPattern = Object.entries(monthlyAvg).map(([month, data]) => ({
        month: monthNames[month],
        avgPrice: Math.round(data.sum / data.count),
        sampleSize: data.count
      }));

      // Find best and worst months
      const sortedByPrice = [...seasonalPattern].sort((a, b) => b.avgPrice - a.avgPrice);
      const bestMonth = sortedByPrice[0];
      const worstMonth = sortedByPrice[sortedByPrice.length - 1];

      return {
        success: true,
        produceType,
        seasonalPattern,
        insights: {
          bestMonth: bestMonth.month,
          bestPrice: bestMonth.avgPrice,
          worstMonth: worstMonth.month,
          worstPrice: worstMonth.avgPrice,
          priceRange: bestMonth.avgPrice - worstMonth.avgPrice
        }
      };
    } catch (error) {
      console.error('Seasonal trends error:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  /**
   * Fetch external data from TwelveData API and other sources
   * Integrates real-time commodity market data
   */
  async fetchExternalData(produceType) {
    try {
      // Fetch data from TwelveData API
      const twelveData = await twelveDataService.getEnhancedMarketAnalysis(produceType);
      
      // This can be further enhanced with:
      // 1. https://statistics.kilimo.go.ke - Government agricultural statistics
      // 2. Weather data for crop yield predictions
      // 3. Import/export data
      
      return {
        success: true,
        twelveData: twelveData || null,
        sources: [
          'TwelveData API - Real-time commodity prices',
          'statistics.kilimo.go.ke - Agricultural statistics',
          'Market price aggregators',
          'Weather forecasting services',
          'Supply chain data providers'
        ],
        implementation: 'TwelveData API integrated, other sources require web scraping or API access'
      };
    } catch (error) {
      console.error('External data fetch error:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  /**
   * Get comprehensive market intelligence
   */
  async getMarketIntelligence(produceType) {
    try {
      const [prediction, seasonal] = await Promise.all([
        this.predictPrice(produceType, 7),
        this.getSeasonalTrends(produceType)
      ]);

      return {
        produceType,
        prediction,
        seasonal,
        timestamp: new Date(),
        dataSource: 'Historical market data',
        note: 'Predictions based on historical trends. Can be enhanced with external data sources like statistics.kilimo.go.ke'
      };
    } catch (error) {
      console.error('Market intelligence error:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }
}

export default new PricePredictor();
