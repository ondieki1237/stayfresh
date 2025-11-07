import express from "express"
import MarketData from "../models/MarketData.js"

const router = express.Router()

// Get market data by produce type and region
router.get("/:produceType/:region", async (req, res) => {
  try {
    const marketData = await MarketData.findOne({
      produceType: req.params.produceType,
      region: req.params.region,
    }).sort({ timestamp: -1 })
    res.json(marketData)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Get all market data by produce type
router.get("/produce/:produceType", async (req, res) => {
  try {
    const marketData = await MarketData.find({ produceType: req.params.produceType }).sort({ timestamp: -1 })
    res.json(marketData)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export default router
