import mongoose from "mongoose"

const buyerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    businessName: { type: String },
    businessType: { 
      type: String, 
      enum: ["Restaurant", "Retailer", "Wholesaler", "Processor", "Individual"],
      required: true
    },
    
    // Location
    location: { type: String, required: true },
    deliveryAddress: { type: String },
    
    // Preferences
    preferredProduce: [String],
    preferredRegions: [String],
    maxBudget: { type: Number },
    
    // Purchase history
    totalPurchases: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
    averageOrderValue: { type: Number, default: 0 },
    
    // Ratings
    rating: { type: Number, min: 0, max: 5, default: 5 },
    reviewsCount: { type: Number, default: 0 },
    
    // Status
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
)

export default mongoose.model("Buyer", buyerSchema)
