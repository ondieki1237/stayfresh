/**
 * Loan Utility Functions
 * Handle collateral valuation, interest calculations, and eligibility checks
 */

/**
 * Calculate collateral value based on quantity and market price
 * @param {number} quantityKg - Quantity in kilograms
 * @param {number} pricePerKg - Current market price per kg (KSH)
 * @returns {number} Total collateral value (KSH)
 */
export function computeCollateralValue(quantityKg, pricePerKg) {
  if (quantityKg <= 0 || pricePerKg <= 0) return 0
  return Number((quantityKg * pricePerKg).toFixed(2))
}

/**
 * Calculate maximum principal based on collateral value and LTV ratio
 * @param {number} collateralValue - Total collateral value (KSH)
 * @param {number} ltv - Loan-to-value ratio (0.5 to 0.8)
 * @returns {number} Maximum principal (KSH)
 */
export function computePrincipal(collateralValue, ltv) {
  // Clamp LTV between 50% and 80%
  const clampedLtv = Math.min(Math.max(ltv, 0.5), 0.8)
  return Number((collateralValue * clampedLtv).toFixed(2))
}

/**
 * Calculate simple interest for loan term
 * @param {number} principal - Principal amount (KSH)
 * @param {number} apr - Annual percentage rate as decimal (e.g., 0.18 for 18%)
 * @param {number} termDays - Loan term in days
 * @returns {number} Interest amount (KSH)
 */
export function computeInterest(principal, apr, termDays) {
  if (principal <= 0 || apr < 0 || termDays <= 0) return 0
  const interest = principal * apr * (termDays / 365)
  return Number(interest.toFixed(2))
}

/**
 * Calculate origination fee (percentage of principal)
 * @param {number} principal - Principal amount (KSH)
 * @param {number} feePercent - Fee percentage (e.g., 0.02 for 2%)
 * @returns {number} Origination fee (KSH)
 */
export function computeOriginationFee(principal, feePercent = 0.02) {
  if (principal <= 0 || feePercent < 0) return 0
  return Number((principal * feePercent).toFixed(2))
}

/**
 * Calculate total amount due (principal + interest + fees)
 * @param {number} principal - Principal amount (KSH)
 * @param {number} interest - Interest amount (KSH)
 * @param {number} fees - Total fees (KSH)
 * @returns {number} Total due (KSH)
 */
export function computeTotalDue(principal, interest, fees = 0) {
  return Number((principal + interest + fees).toFixed(2))
}

/**
 * Calculate outstanding balance after payments
 * @param {object} loan - Loan object with totalDue and payments
 * @returns {number} Outstanding balance (KSH)
 */
export function computeOutstanding(loan) {
  if (!loan) return 0
  const totalDue = loan.totalDue || 0
  const payments = loan.payments || []
  const paid = payments.reduce((sum, p) => sum + (p.amount || 0), 0)
  return Number(Math.max(0, totalDue - paid).toFixed(2))
}

/**
 * Calculate due date based on loan start and term
 * @param {Date} startDate - Loan start/disbursement date
 * @param {number} termDays - Loan term in days
 * @returns {Date} Due date
 */
export function computeDueDate(startDate, termDays) {
  const due = new Date(startDate)
  due.setDate(due.getDate() + termDays)
  return due
}

/**
 * Check if produce is eligible for collateral
 * @param {object} produce - Produce or Stocking object
 * @param {object} options - Eligibility criteria
 * @returns {object} { eligible: boolean, reasons: string[] }
 */
export function checkEligibility(produce, options = {}) {
  const {
    minQuantity = 50, // minimum 50kg
    minPrice = 10, // minimum KSH 10/kg
    allowedConditions = ["Fresh", "Good", "Excellent", "A"],
    allowedStatuses = ["Active", "Listed", "Monitoring", "Stocked"]
  } = options

  const reasons = []
  
  // Check if already pledged
  if (produce.isPledged) {
    reasons.push("Produce is already pledged as collateral")
  }
  
  // Check if sold
  if (produce.sold) {
    reasons.push("Produce has been sold")
  }
  
  // Check quantity
  if (produce.quantity < minQuantity) {
    reasons.push(`Quantity (${produce.quantity}kg) is below minimum (${minQuantity}kg)`)
  }
  
  // Check price
  const price = produce.currentMarketPrice || 0
  if (price < minPrice) {
    reasons.push(`Price (KSH ${price}/kg) is below minimum (KSH ${minPrice}/kg)`)
  }
  
  // Check condition
  if (produce.condition && !allowedConditions.includes(produce.condition)) {
    reasons.push(`Condition "${produce.condition}" is not acceptable for collateral`)
  }
  
  // Check status
  if (produce.status && !allowedStatuses.includes(produce.status)) {
    reasons.push(`Status "${produce.status}" is not eligible for collateral`)
  }
  
  // Check if produce has valuation data
  if (!produce.currentMarketPrice || produce.currentMarketPrice <= 0) {
    reasons.push("No market price available for valuation")
  }
  
  return {
    eligible: reasons.length === 0,
    reasons
  }
}

/**
 * Calculate loan summary for display
 * @param {object} params - Loan parameters
 * @returns {object} Loan summary with all calculations
 */
export function calculateLoanSummary(params) {
  const {
    quantity,
    pricePerKg,
    ltv = 0.6,
    termDays = 60,
    apr = 0.18,
    feePercent = 0.02
  } = params

  const collateralValue = computeCollateralValue(quantity, pricePerKg)
  const principal = computePrincipal(collateralValue, ltv)
  const originationFee = computeOriginationFee(principal, feePercent)
  const interest = computeInterest(principal, apr, termDays)
  const totalDue = computeTotalDue(principal, interest, originationFee)
  const netDisbursement = principal - originationFee
  const dueDate = computeDueDate(new Date(), termDays)

  return {
    collateralValue,
    collateralQuantity: quantity,
    principal,
    ltv,
    termDays,
    apr,
    interestRate: apr,
    interestAmount: interest,
    originationFee,
    totalFees: originationFee,
    totalDue,
    netDisbursement,
    dueDate,
    monthlyPayment: totalDue // for single payment at end
  }
}

/**
 * Calculate current LTV after market price changes
 * @param {number} outstandingBalance - Current outstanding (KSH)
 * @param {number} currentCollateralValue - Current collateral value (KSH)
 * @returns {number} Current LTV ratio
 */
export function calculateCurrentLtv(outstandingBalance, currentCollateralValue) {
  if (!currentCollateralValue || currentCollateralValue <= 0) return 1
  return Number((outstandingBalance / currentCollateralValue).toFixed(4))
}

/**
 * Check if margin call is needed
 * @param {number} outstandingBalance - Current outstanding (KSH)
 * @param {number} currentCollateralValue - Current collateral value (KSH)
 * @param {number} threshold - Margin call threshold (default 0.75 = 75%)
 * @returns {boolean} True if margin call needed
 */
export function needsMarginCall(outstandingBalance, currentCollateralValue, threshold = 0.75) {
  const currentLtv = calculateCurrentLtv(outstandingBalance, currentCollateralValue)
  return currentLtv > threshold
}

/**
 * Format currency for display
 * @param {number} amount - Amount in KSH
 * @returns {string} Formatted amount
 */
export function formatCurrency(amount) {
  return `KSH ${Number(amount).toLocaleString('en-KE', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  })}`
}

/**
 * Calculate days between two dates
 * @param {Date} date1 - Start date
 * @param {Date} date2 - End date
 * @returns {number} Number of days
 */
export function daysBetween(date1, date2) {
  const diffTime = Math.abs(new Date(date2) - new Date(date1))
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

export default {
  computeCollateralValue,
  computePrincipal,
  computeInterest,
  computeOriginationFee,
  computeTotalDue,
  computeOutstanding,
  computeDueDate,
  checkEligibility,
  calculateLoanSummary,
  calculateCurrentLtv,
  needsMarginCall,
  formatCurrency,
  daysBetween
}
