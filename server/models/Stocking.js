import mongoose from "mongoose"

const stockingSchema = new mongoose.Schema(
  {
    room: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true },
    farmer: { type: mongoose.Schema.Types.ObjectId, ref: "Farmer", required: true },
    produceType: { 
      type: String, 
      required: true,
      enum: [
        "Tomatoes", "Potatoes", "Onions", "Carrots", "Cabbage",
        "Spinach", "Kale", "Lettuce", "Broccoli", "Cauliflower",
        "Peppers", "Cucumbers", "Beans", "Peas", "Maize",
        "Bananas", "Mangoes", "Avocados", "Oranges", "Apples",
        "Strawberries", "Passion Fruit", "Pineapples", "Other"
      ]
    },
    quantity: { type: Number, required: true }, // in kg
    estimatedValue: { type: Number, required: true }, // Total value
    condition: { 
      type: String, 
      enum: ["Fresh", "Good", "Fair", "Needs Attention"],
      default: "Fresh"
    },
    targetPrice: { type: Number, required: true }, // per kg
    currentMarketPrice: { type: Number, default: 0 }, // per kg
    priceAlertSent: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["Stocked", "Monitoring", "Target Reached", "Sold", "Removed"],
      default: "Monitoring"
    },
    stockedAt: { type: Date, default: Date.now },
    targetReachedAt: { type: Date },
    notes: { type: String },
    
    // Tracking updates
    priceHistory: [{
      price: { type: Number },
      checkedAt: { type: Date, default: Date.now }
    }],
    
    // Notifications
    lastNotificationSent: { type: Date },
    notificationCount: { type: Number, default: 0 },
  },
  { timestamps: true }
)

// Index for efficient queries
stockingSchema.index({ room: 1, status: 1 })
stockingSchema.index({ farmer: 1 })
stockingSchema.index({ status: 1, priceAlertSent: 1 })

// Virtual for price percentage
stockingSchema.virtual("pricePercentage").get(function() {
  if (!this.targetPrice || !this.currentMarketPrice) return 0
  return ((this.currentMarketPrice / this.targetPrice) * 100).toFixed(1)
})

// Virtual for potential earnings
stockingSchema.virtual("potentialEarnings").get(function() {
  return (this.quantity * this.currentMarketPrice).toFixed(2)
})

// Virtual for target earnings
stockingSchema.virtual("targetEarnings").get(function() {
  return (this.quantity * this.targetPrice).toFixed(2)
})

export default mongoose.model("Stocking", stockingSchema)
