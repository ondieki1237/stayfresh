import express from "express"
import MarketData from "../models/MarketData.js"

const router = express.Router()

// Get all market data
router.get("/", async (req, res) => {
  try {
    const marketData = await MarketData.find()
      .sort({ timestamp: -1 })
      
    res.json(marketData)
  } catch (error) {
    console.error("Get market data error:", error)
    res.status(500).json({ message: error.message })
  }
})

// Get market data by produce type
router.get("/produce/:produceType", async (req, res) => {
  try {
    const marketData = await MarketData.find({ 
      produceType: req.params.produceType 
    })
    .sort({ timestamp: -1 })
    .limit(30) // Last 30 data points
    
    if (marketData.length === 0) {
      // Return sample data if none exists
      return res.json([{
        produceType: req.params.produceType,
        region: "General",
        currentPrice: 50,
        demand: "Medium",
        supply: "Medium",
        trendDirection: "Stable",
        trendPercentage: 0,
        lastUpdated: new Date()
      }])
    }
    
    res.json(marketData)
  } catch (error) {
    console.error("Get market data by produce error:", error)
    res.status(500).json({ message: error.message })
  }
})

// Get market data by produce type and region
router.get("/:produceType/:region", async (req, res) => {
  try {
    const marketData = await MarketData.findOne({
      produceType: req.params.produceType,
      region: req.params.region,
    }).sort({ timestamp: -1 })
    
    if (!marketData) {
      // Return sample data if none exists
      return res.json({
        produceType: req.params.produceType,
        region: req.params.region,
        currentPrice: 50,
        demand: "Medium",
        supply: "Medium",
        trendDirection: "Stable",
        trendPercentage: 0,
        lastUpdated: new Date()
      })
    }
    
    res.json(marketData)
  } catch (error) {
    console.error("Get market data error:", error)
    res.status(500).json({ message: error.message })
  }
})

// Get price history for a produce type
router.get("/:produceType/history", async (req, res) => {
  try {
    const { days = 30 } = req.query
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    
    const marketData = await MarketData.find({
      produceType: req.params.produceType,
      timestamp: { $gte: cutoffDate }
    })
    .sort({ timestamp: 1 })
    .select("currentPrice timestamp region demand supply")
    
    res.json(marketData)
  } catch (error) {
    console.error("Get price history error:", error)
    res.status(500).json({ message: error.message })
  }
})

// Create or update market data
router.post("/", async (req, res) => {
  try {
    const { produceType, region } = req.body
    
    // Check if market data already exists for this produce/region today
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    let marketData = await MarketData.findOne({
      produceType,
      region,
      timestamp: { $gte: today }
    })
    
    if (marketData) {
      // Update existing record
      Object.assign(marketData, req.body)
      marketData.lastUpdated = new Date()
      marketData.calculateTrend()
      await marketData.save()
    } else {
      // Create new record
      marketData = new MarketData(req.body)
      marketData.calculateTrend()
      await marketData.save()
    }
    
    res.json({ 
      message: "Market data saved successfully", 
      marketData 
    })
  } catch (error) {
    console.error("Create/update market data error:", error)
    res.status(500).json({ message: error.message })
  }
})

// Get market insights for farmer's produce
router.get("/insights/:produceType", async (req, res) => {
  try {
    const marketData = await MarketData.find({ 
      produceType: req.params.produceType 
    })
    .sort({ timestamp: -1 })
    .limit(30)
    
    // Calculate insights
    const avgPrice = marketData.reduce((sum, data) => sum + data.currentPrice, 0) / marketData.length
    const maxPrice = Math.max(...marketData.map(data => data.currentPrice))
    const minPrice = Math.min(...marketData.map(data => data.currentPrice))
    
    // Find best region
    const regionPrices = {}
    marketData.forEach(data => {
      if (!regionPrices[data.region]) {
        regionPrices[data.region] = []
      }
      regionPrices[data.region].push(data.currentPrice)
    })
    
    const bestRegion = Object.entries(regionPrices).reduce((best, [region, prices]) => {
      const avgRegionPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length
      return avgRegionPrice > (best.price || 0) ? { region, price: avgRegionPrice } : best
    }, {})
    
    // Recommendation
    let recommendation = "Hold"
    const latestData = marketData[0]
    if (latestData) {
      if (latestData.trendDirection === "Rising" && latestData.demand === "High") {
        recommendation = "Sell Soon"
      } else if (latestData.trendDirection === "Falling") {
        recommendation = "Sell Now"
      } else if (latestData.demand === "Very High") {
        recommendation = "Sell Now"
      }
    }
    
    res.json({
      produceType: req.params.produceType,
      currentMarketPrice: latestData?.currentPrice || 0,
      averagePrice: avgPrice,
      highestPrice: maxPrice,
      lowestPrice: minPrice,
      priceRange: maxPrice - minPrice,
      trend: latestData?.trendDirection || "Stable",
      demand: latestData?.demand || "Medium",
      supply: latestData?.supply || "Medium",
      bestRegion: bestRegion.region || "N/A",
      bestRegionPrice: bestRegion.price || 0,
      recommendation,
      confidence: latestData?.marketConfidence || "Medium",
      lastUpdated: latestData?.lastUpdated || new Date()
    })
  } catch (error) {
    console.error("Get market insights error:", error)
    res.status(500).json({ message: error.message })
  }
})

// Compare prices across regions
router.get("/compare/:produceType", async (req, res) => {
  try {
    const latestByRegion = await MarketData.aggregate([
      { $match: { produceType: req.params.produceType } },
      { $sort: { timestamp: -1 } },
      {
        $group: {
          _id: "$region",
          currentPrice: { $first: "$currentPrice" },
          demand: { $first: "$demand" },
          supply: { $first: "$supply" },
          trend: { $first: "$trendDirection" },
          trendPercentage: { $first: "$trendPercentage" },
          lastUpdated: { $first: "$lastUpdated" }
        }
      }
    ])
    
    res.json(latestByRegion)
  } catch (error) {
    console.error("Compare prices error:", error)
    res.status(500).json({ message: error.message })
  }
})

export default router
