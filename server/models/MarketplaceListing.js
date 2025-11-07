import mongoose from "mongoose"

const marketplaceListingSchema = new mongoose.Schema(
  {
    farmer: { type: mongoose.Schema.Types.ObjectId, ref: "Farmer", required: true },
    produce: { type: mongoose.Schema.Types.ObjectId, ref: "Produce", required: true },
    
    // Listing details
    title: { type: String, required: true },
    description: { type: String },
    produceType: { type: String, required: true },
    quantity: { type: Number, required: true }, // in kg
    availableQuantity: { type: Number, required: true }, // remaining quantity
    
    // Pricing
    pricePerKg: { type: Number, required: true },
    totalValue: { type: Number, required: true },
    minOrderQuantity: { type: Number, default: 10 }, // minimum kg per order
    negotiable: { type: Boolean, default: true },
    
    // Quality information
    quality: { type: String, enum: ["Excellent", "Good", "Fair"], required: true },
    isOrganic: { type: Boolean, default: false },
    certifications: [String],
    
    // Availability
    availableFrom: { type: Date, default: Date.now },
    availableUntil: { type: Date, required: true },
    
    // Location
    location: { type: String, required: true },
    deliveryAvailable: { type: Boolean, default: false },
    pickupAvailable: { type: Boolean, default: true },
    deliveryRadius: { type: Number }, // in km
    deliveryFee: { type: Number },
    
    // Status
    status: {
      type: String,
      enum: ["Active", "Pending", "Reserved", "Sold", "Expired", "Cancelled"],
      default: "Active"
    },
    
    // Urgency (for perishable items)
    isUrgent: { type: Boolean, default: false },
    daysUntilPerish: { type: Number },
    
    // Engagement
    views: { type: Number, default: 0 },
    inquiries: { type: Number, default: 0 },
    offers: [{
      buyerId: { type: mongoose.Schema.Types.ObjectId, ref: "Buyer" },
      buyerName: String,
      buyerPhone: String,
      offeredPrice: Number,
      quantity: Number,
      message: String,
      status: { type: String, enum: ["Pending", "Accepted", "Rejected"], default: "Pending" },
      createdAt: { type: Date, default: Date.now }
    }],
    
    // Images
    images: [String],
    
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
)

// Check if listing has expired
marketplaceListingSchema.methods.isExpired = function() {
  return new Date() > this.availableUntil
}

// Mark as urgent if close to perishing
marketplaceListingSchema.pre("save", function(next) {
  if (this.daysUntilPerish && this.daysUntilPerish <= 3) {
    this.isUrgent = true
  }
  next()
})

export default mongoose.model("MarketplaceListing", marketplaceListingSchema)
