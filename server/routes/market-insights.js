import express from 'express';
import twelveDataService from '../services/twelveDataService.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route GET /api/market-insights/quote/:produceType
 * @desc Get real-time price quote for a commodity
 * @access Private
 */
router.get('/quote/:produceType', authMiddleware, async (req, res) => {
  try {
    const { produceType } = req.params;
    const quote = await twelveDataService.getQuote(produceType);

    if (!quote || !quote.success) {
      return res.status(404).json({
        success: false,
        message: `No quote data available for ${produceType}. This commodity may not be tracked by the API.`
      });
    }

    res.json(quote);
  } catch (error) {
    console.error('Quote fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch commodity quote',
      error: error.message
    });
  }
});

/**
 * @route GET /api/market-insights/timeseries/:produceType
 * @desc Get historical price data (time series)
 * @access Private
 */
router.get('/timeseries/:produceType', authMiddleware, async (req, res) => {
  try {
    const { produceType } = req.params;
    const { interval = '1day', days = 30 } = req.query;
    
    const timeSeries = await twelveDataService.getTimeSeries(
      produceType,
      interval,
      parseInt(days)
    );

    if (!timeSeries || !timeSeries.success) {
      return res.status(404).json({
        success: false,
        message: `No time series data available for ${produceType}`
      });
    }

    res.json(timeSeries);
  } catch (error) {
    console.error('Time series fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch time series data',
      error: error.message
    });
  }
});

/**
 * @route GET /api/market-insights/analysis/:produceType
 * @desc Get comprehensive market analysis combining multiple data points
 * @access Private
 */
router.get('/analysis/:produceType', authMiddleware, async (req, res) => {
  try {
    const { produceType } = req.params;
    const analysis = await twelveDataService.getEnhancedMarketAnalysis(produceType);

    if (!analysis || !analysis.success) {
      return res.status(404).json({
        success: false,
        message: `No analysis data available for ${produceType}. Try common commodities like corn, wheat, soybean, rice, sugar, or coffee.`
      });
    }

    res.json(analysis);
  } catch (error) {
    console.error('Market analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate market analysis',
      error: error.message
    });
  }
});

/**
 * @route GET /api/market-insights/movers
 * @desc Get market movers (top gainers and losers)
 * @access Private
 */
router.get('/movers', authMiddleware, async (req, res) => {
  try {
    const movers = await twelveDataService.getMarketMovers();

    if (!movers || !movers.success) {
      return res.status(404).json({
        success: false,
        message: 'No market movers data available'
      });
    }

    res.json(movers);
  } catch (error) {
    console.error('Market movers error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch market movers',
      error: error.message
    });
  }
});

/**
 * @route GET /api/market-insights/bulk
 * @desc Get quotes for multiple commodities at once
 * @access Private
 * @query produces - Comma-separated list of produce types
 */
router.get('/bulk', authMiddleware, async (req, res) => {
  try {
    const { produces } = req.query;
    
    if (!produces) {
      return res.status(400).json({
        success: false,
        message: 'Please provide produces query parameter (comma-separated)'
      });
    }

    const produceList = produces.split(',').map(p => p.trim());
    const bulkQuotes = await twelveDataService.getBulkQuotes(produceList);

    if (!bulkQuotes || !bulkQuotes.success) {
      return res.status(404).json({
        success: false,
        message: 'No bulk quotes data available'
      });
    }

    res.json(bulkQuotes);
  } catch (error) {
    console.error('Bulk quotes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bulk quotes',
      error: error.message
    });
  }
});

/**
 * @route GET /api/market-insights/technical/:produceType
 * @desc Get technical indicators (RSI, MA, etc.)
 * @access Private
 * @query indicator - Technical indicator type (rsi, sma, ema, etc.)
 */
router.get('/technical/:produceType', authMiddleware, async (req, res) => {
  try {
    const { produceType } = req.params;
    const { indicator = 'rsi', interval = '1day' } = req.query;
    
    const technicalData = await twelveDataService.getTechnicalIndicators(
      produceType,
      indicator,
      interval
    );

    if (!technicalData || !technicalData.success) {
      return res.status(404).json({
        success: false,
        message: `No ${indicator} data available for ${produceType}`
      });
    }

    res.json(technicalData);
  } catch (error) {
    console.error('Technical indicators error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch technical indicators',
      error: error.message
    });
  }
});

/**
 * @route GET /api/market-insights/api-status
 * @desc Check TwelveData API status and usage
 * @access Private
 */
router.get('/api-status', authMiddleware, async (req, res) => {
  try {
    const status = await twelveDataService.checkApiStatus();

    res.json({
      success: true,
      apiProvider: 'TwelveData',
      apiKey: '66dd04af759746b2853207bc5deaddb1',
      status
    });
  } catch (error) {
    console.error('API status check error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check API status',
      error: error.message
    });
  }
});

export default router;
