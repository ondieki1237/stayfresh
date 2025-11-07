import express from 'express';
import pricePredictor from '../services/pricePredictor.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/predictions/:produceType
 * Get price predictions for a specific produce type
 */
router.get('/:produceType', authMiddleware, async (req, res) => {
  try {
    const { produceType } = req.params;
    const daysAhead = parseInt(req.query.days) || 7;

    const prediction = await pricePredictor.predictPrice(produceType, daysAhead);

    res.json(prediction);
  } catch (error) {
    console.error('Prediction error:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * GET /api/predictions/:produceType/seasonal
 * Get seasonal trends for a produce type
 */
router.get('/:produceType/seasonal', authMiddleware, async (req, res) => {
  try {
    const { produceType } = req.params;

    const seasonal = await pricePredictor.getSeasonalTrends(produceType);

    res.json(seasonal);
  } catch (error) {
    console.error('Seasonal trends error:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * GET /api/predictions/:produceType/intelligence
 * Get comprehensive market intelligence
 */
router.get('/:produceType/intelligence', authMiddleware, async (req, res) => {
  try {
    const { produceType } = req.params;

    const intelligence = await pricePredictor.getMarketIntelligence(produceType);

    res.json(intelligence);
  } catch (error) {
    console.error('Market intelligence error:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router;
