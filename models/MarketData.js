import mongoose from "mongoose"

const marketDataSchema = new mongoose.Schema(
  {
    produceType: { type: String, required: true },
    region: { type: String, required: true },
    currentPrice: { type: Number, required: true },
    trendPercentage: { type: Number }, // positive or negative
    season: { type: String },
    demand: { type: String, enum: ["Low", "Medium", "High"] },
    supply: { type: String, enum: ["Low", "Medium", "High"] },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true },
)

export default mongoose.model("MarketData", marketDataSchema)
