import mongoose from "mongoose"

const produceSchema = new mongoose.Schema(
  {
    farmer: { type: mongoose.Schema.Types.ObjectId, ref: "Farmer", required: true },
    room: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true },
    
    // Produce details
    produceType: { type: String, required: true },
    variety: { type: String }, // e.g., "Cherry Tomatoes", "Russet Potatoes"
    quantity: { type: Number, required: true }, // in kg
    
    // Market information
    currentMarketPrice: { type: Number, required: true },
    purchasePrice: { type: Number }, // what farmer paid for seeds/inputs
    expectedPeakPrice: { type: Number },
    expectedPeakDate: { type: Date },
    minimumSellingPrice: { type: Number }, // farmer's minimum acceptable price
    
    // Quality and condition
    condition: { 
      type: String, 
      enum: ["Excellent", "Fresh", "Good", "Fair", "Poor", "Spoiled"], 
      default: "Fresh" 
    },
    qualityScore: { type: Number, min: 0, max: 100, default: 90 }, // 0-100 scale
    gradeLevel: { type: String, enum: ["A", "B", "C"], default: "A" },
    
    // Storage tracking
    storageDate: { type: Date, default: Date.now },
    expectedStorageDuration: { type: Number }, // in days
    maxStorageDuration: { type: Number }, // maximum safe storage in days
    daysInStorage: { type: Number, default: 0 },
    
    // Harvest information
    harvestDate: { type: Date },
    expectedHarvestDate: { type: Date },
    isOrganic: { type: Boolean, default: false },
    certifications: [String],
    
    // Sales tracking
    sold: { type: Boolean, default: false },
    soldDate: { type: Date },
    salePrice: { type: Number },
    buyerId: { type: mongoose.Schema.Types.ObjectId, ref: "Buyer" },
    profitMargin: { type: Number }, // calculated after sale
    
    // Market insights expectations
    expectsPeakPrice: { type: Boolean, default: false },
    willingToWaitForPeak: { type: Boolean, default: true },
    targetMarketRegions: [String],
    
    // Perishability tracking
    perishabilityLevel: { 
      type: String, 
      enum: ["Very High", "High", "Medium", "Low"], 
      default: "Medium" 
    },
    daysUntilPerish: { type: Number },
    alertThreshold: { type: Number, default: 3 }, // days before perishing to alert
    
    // Status
    status: {
      type: String,
      enum: ["Active", "Listed", "Reserved", "Sold", "Expired", "Removed"],
      default: "Active"
    },
    
    // Loan collateral tracking
    isPledged: { 
      type: Boolean, 
      default: false 
    },
    pledgedToLoan: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Loan" 
    },
    collateralValue: { 
      type: Number,
      min: 0
    }, // Valuation when pledged
    pledgedAt: { type: Date },
    pledgedQuantity: { 
      type: Number,
      min: 0
    }, // Can pledge partial quantity
    
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
)

// Calculate days in storage
produceSchema.pre("save", function(next) {
  if (this.storageDate) {
    const now = new Date()
    const diffTime = Math.abs(now - this.storageDate)
    this.daysInStorage = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }
  next()
})

// Check if produce needs urgent sale
produceSchema.methods.needsUrgentSale = function() {
  return this.daysUntilPerish && this.daysUntilPerish <= this.alertThreshold
}

export default mongoose.model("Produce", produceSchema)
