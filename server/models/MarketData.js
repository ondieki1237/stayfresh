import mongoose from "mongoose"

const marketDataSchema = new mongoose.Schema(
  {
    produceType: { type: String, required: true },
    region: { type: String, required: true },
    
    // Current pricing
    currentPrice: { type: Number, required: true }, // per kg
    previousPrice: { type: Number },
    lowestPrice: { type: Number }, // in last 30 days
    highestPrice: { type: Number }, // in last 30 days
    averagePrice: { type: Number }, // in last 30 days
    
    // Market dynamics
    demand: { type: String, enum: ["Very Low", "Low", "Medium", "High", "Very High"], default: "Medium" },
    supply: { type: String, enum: ["Very Low", "Low", "Medium", "High", "Very High"], default: "Medium" },
    
    // Trends
    trendDirection: { type: String, enum: ["Rising", "Falling", "Stable"], default: "Stable" },
    trendPercentage: { type: Number, default: 0 }, // percentage change
    
    // Predictions
    predictedPeakPrice: { type: Number },
    predictedPeakDate: { type: Date },
    predictedLowPrice: { type: Number },
    predictedLowDate: { type: Date },
    
    // Market insights
    bestTimeToSell: { type: String }, // e.g., "Next 3-5 days"
    marketConfidence: { type: String, enum: ["Low", "Medium", "High"], default: "Medium" },
    
    // Buying interest
    activeBuyers: { type: Number, default: 0 },
    avgBuyerOfferPrice: { type: Number },
    
    // Historical data (weekly snapshots)
    priceHistory: [{
      price: Number,
      date: Date,
      demand: String,
      supply: String
    }],
    
    // Metadata
    dataSource: { type: String, default: "Market Survey" },
    lastUpdated: { type: Date, default: Date.now },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true },
)

// Update trend calculation
marketDataSchema.methods.calculateTrend = function() {
  if (this.previousPrice && this.currentPrice) {
    const change = ((this.currentPrice - this.previousPrice) / this.previousPrice) * 100
    this.trendPercentage = parseFloat(change.toFixed(2))
    
    if (change > 5) this.trendDirection = "Rising"
    else if (change < -5) this.trendDirection = "Falling"
    else this.trendDirection = "Stable"
  }
}

export default mongoose.model("MarketData", marketDataSchema)
