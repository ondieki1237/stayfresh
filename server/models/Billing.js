import mongoose from "mongoose"

const billingSchema = new mongoose.Schema(
  {
    farmer: { type: mongoose.Schema.Types.ObjectId, ref: "Farmer", required: true },
    room: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true },
    
    // Billing cycle information
    billingCycle: {
      type: String,
      enum: ["1month", "2months", "3months", "4months", "6months", "12months"],
      required: true,
    },
    cycleMonths: { type: Number, required: true }, // numerical value (1, 2, 3, etc.)
    
    // Amount breakdown
    baseAmount: { type: Number, required: true }, // base rental rate
    utilityCharges: { type: Number, default: 0 }, // electricity, cooling
    maintenanceCharges: { type: Number, default: 0 },
    discount: { type: Number, default: 0 }, // for longer cycles
    tax: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    
    // Period
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    dueDate: { type: Date, required: true },
    
    // Payment status
    status: { 
      type: String, 
      enum: ["Pending", "Paid", "Overdue", "Partial", "Cancelled"], 
      default: "Pending" 
    },
    amountPaid: { type: Number, default: 0 },
    amountDue: { type: Number },
    
    // Payment details
    paymentDate: { type: Date },
    paymentMethod: { type: String, enum: ["cash", "mobile", "bank", "card"], },
    transactionId: { type: String },
    receiptNumber: { type: String },
    
    // Reminders and notifications
    remindersSent: { type: Number, default: 0 },
    lastReminderDate: { type: Date },
    
    // Late fees
    lateFee: { type: Number, default: 0 },
    daysOverdue: { type: Number, default: 0 },
    
    // Notes
    notes: { type: String },
    
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
)

// Calculate amount due
billingSchema.pre("save", function(next) {
  this.amountDue = this.totalAmount - this.amountPaid + this.lateFee
  
  // Calculate days overdue
  if (this.status === "Overdue" && this.dueDate) {
    const now = new Date()
    const diffTime = now - this.dueDate
    this.daysOverdue = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)))
  }
  
  next()
})

// Apply discount for longer billing cycles
billingSchema.statics.calculateDiscount = function(baseAmount, cycleMonths) {
  const discountRates = {
    1: 0,      // 0% discount
    2: 0.05,   // 5% discount
    3: 0.10,   // 10% discount
    4: 0.12,   // 12% discount
    6: 0.15,   // 15% discount
    12: 0.20   // 20% discount
  }
  
  const rate = discountRates[cycleMonths] || 0
  return baseAmount * cycleMonths * rate
}

export default mongoose.model("Billing", billingSchema)
