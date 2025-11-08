import mongoose from "mongoose"

const loanSchema = new mongoose.Schema(
  {
    farmer: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Farmer", 
      required: true 
    },
    produce: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Produce", 
      required: true 
    },
    
    // Collateral and valuation
    collateralValue: { 
      type: Number, 
      required: true,
      min: 0
    }, // KSH value at pledge time
    collateralQuantity: { 
      type: Number, 
      required: true,
      min: 0
    }, // kg pledged
    
    // Loan terms
    principal: { 
      type: Number, 
      required: true,
      min: 0
    }, // funded amount (KSH)
    ltv: { 
      type: Number, 
      required: true,
      min: 0.5,
      max: 0.8,
      default: 0.6
    }, // loan-to-value ratio
    termDays: { 
      type: Number, 
      required: true,
      min: 7,
      max: 365,
      default: 60
    },
    interestRate: { 
      type: Number, 
      required: true,
      min: 0,
      max: 1,
      default: 0.18
    }, // annual rate as decimal (0.18 = 18% APR)
    
    // Fees and charges
    originationFee: { 
      type: Number, 
      default: 0,
      min: 0
    }, // KSH
    processingFee: { 
      type: Number, 
      default: 0,
      min: 0
    }, // KSH
    totalFees: {
      type: Number,
      default: 0,
      min: 0
    },
    
    // Calculated amounts
    interestAmount: { 
      type: Number, 
      default: 0,
      min: 0
    }, // total interest for term
    totalDue: {
      type: Number,
      default: 0,
      min: 0
    }, // principal + interest + fees
    netDisbursement: {
      type: Number,
      default: 0,
      min: 0
    }, // principal - upfront fees
    
    // Status tracking
    status: {
      type: String,
      enum: [
        "Draft",        // Application not submitted
        "Pending",      // Awaiting admin review
        "Approved",     // Approved, funds to be disbursed
        "Active",       // Funds disbursed, repayment ongoing
        "Repaid",       // Fully repaid
        "Defaulted",    // Overdue past grace period
        "Liquidation",  // Collateral being liquidated
        "Cancelled"     // Application cancelled
      ],
      default: "Pending"
    },
    
    // Dates
    appliedAt: { 
      type: Date, 
      default: Date.now 
    },
    approvedAt: { type: Date },
    approvedBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Farmer" 
    }, // admin who approved
    disbursedAt: { type: Date },
    dueAt: { type: Date },
    repaidAt: { type: Date },
    defaultedAt: { type: Date },
    
    // Payment tracking
    payments: [{
      amount: { type: Number, required: true, min: 0 },
      paidAt: { type: Date, default: Date.now },
      method: { 
        type: String, 
        enum: ["Cash", "Mobile Money", "Bank Transfer", "Card", "Other"],
        default: "Mobile Money"
      },
      reference: String,
      note: String,
      recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Farmer" }
    }],
    
    // Balance tracking
    amountPaid: {
      type: Number,
      default: 0,
      min: 0
    },
    outstandingBalance: {
      type: Number,
      default: 0,
      min: 0
    },
    
    // Risk management
    marginCallTriggered: {
      type: Boolean,
      default: false
    },
    marginCallDate: { type: Date },
    revaluationDate: { type: Date },
    currentCollateralValue: { type: Number }, // updated value on revaluation
    
    // Additional info
    purpose: String, // farmer's reason for loan
    notes: String, // admin notes
    rejectionReason: String,
    
    // Document tracking
    documentsProvided: [{
      name: String,
      url: String,
      uploadedAt: { type: Date, default: Date.now }
    }],
    
    // Notifications sent
    notificationsSent: [{
      type: { 
        type: String,
        enum: ["Application", "Approved", "Disbursed", "Reminder", "MarginCall", "Default", "Repaid"]
      },
      sentAt: { type: Date, default: Date.now },
      channel: { type: String, enum: ["Email", "SMS", "Push"], default: "Email" }
    }],
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
)

// Virtual: days until due
loanSchema.virtual("daysUntilDue").get(function() {
  if (!this.dueAt || this.status !== "Active") return null
  const now = new Date()
  const due = new Date(this.dueAt)
  const diffTime = due - now
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
})

// Virtual: is overdue
loanSchema.virtual("isOverdue").get(function() {
  if (!this.dueAt || this.status !== "Active") return false
  return new Date() > new Date(this.dueAt)
})

// Virtual: days overdue
loanSchema.virtual("daysOverdue").get(function() {
  if (!this.isOverdue) return 0
  const now = new Date()
  const due = new Date(this.dueAt)
  const diffTime = now - due
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
})

// Virtual: current LTV (if revalued)
loanSchema.virtual("currentLtv").get(function() {
  if (!this.currentCollateralValue) return this.ltv
  if (this.currentCollateralValue === 0) return 1
  return this.outstandingBalance / this.currentCollateralValue
})

// Method: calculate interest for term
loanSchema.methods.calculateInterest = function() {
  return Number((this.principal * this.interestRate * (this.termDays / 365)).toFixed(2))
}

// Method: calculate total due
loanSchema.methods.calculateTotalDue = function() {
  return Number((this.principal + this.interestAmount + this.totalFees).toFixed(2))
}

// Method: calculate outstanding balance
loanSchema.methods.calculateOutstanding = function() {
  const paid = this.payments.reduce((sum, p) => sum + p.amount, 0)
  return Number((this.totalDue - paid).toFixed(2))
}

// Method: update balances
loanSchema.methods.updateBalances = function() {
  this.amountPaid = this.payments.reduce((sum, p) => sum + p.amount, 0)
  this.outstandingBalance = this.calculateOutstanding()
}

// Method: check if margin call needed
loanSchema.methods.needsMarginCall = function(threshold = 0.75) {
  if (!this.currentCollateralValue) return false
  const currentLtv = this.outstandingBalance / this.currentCollateralValue
  return currentLtv > threshold
}

// Pre-save: update calculated fields
loanSchema.pre("save", function(next) {
  // Calculate interest if not set
  if (this.isModified("principal") || this.isModified("interestRate") || this.isModified("termDays")) {
    this.interestAmount = this.calculateInterest()
  }
  
  // Calculate total fees
  this.totalFees = this.originationFee + this.processingFee
  
  // Calculate total due
  this.totalDue = this.calculateTotalDue()
  
  // Calculate net disbursement (subtract upfront fees)
  this.netDisbursement = Math.max(0, this.principal - this.originationFee - this.processingFee)
  
  // Update balances if payments changed
  if (this.isModified("payments")) {
    this.updateBalances()
  }
  
  // Set initial outstanding
  if (this.isNew) {
    this.outstandingBalance = this.totalDue
  }
  
  next()
})

// Index for queries
loanSchema.index({ farmer: 1, status: 1 })
loanSchema.index({ status: 1, dueAt: 1 })
loanSchema.index({ produce: 1 })

export default mongoose.model("Loan", loanSchema)
