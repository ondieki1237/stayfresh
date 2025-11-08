import express from "express"
import Loan from "../models/Loan.js"
import Produce from "../models/Produce.js"
import Farmer from "../models/Farmer.js"
import { authMiddleware } from "../middleware/auth.js"
import { sendEmail } from "../utils/emailService.js"
import {
  computeCollateralValue,
  computePrincipal,
  computeInterest,
  computeOriginationFee,
  computeDueDate,
  checkEligibility,
  calculateLoanSummary,
  formatCurrency
} from "../utils/loanUtils.js"

const router = express.Router()

// Apply for a loan (farmer)
router.post("/apply", authMiddleware, async (req, res) => {
  try {
    const {
      farmerId,
      produceId,
      requestedLtv = 0.6,
      termDays = 60,
      purpose,
      notes
    } = req.body

    // Validate inputs
    if (!farmerId || !produceId) {
      return res.status(400).json({ message: "Farmer ID and Produce ID are required" })
    }

    // Verify farmer exists
    const farmer = await Farmer.findById(farmerId)
    if (!farmer) {
      return res.status(404).json({ message: "Farmer not found" })
    }

    // Verify produce exists and belongs to farmer
    const produce = await Produce.findById(produceId)
    if (!produce) {
      return res.status(404).json({ message: "Produce not found" })
    }

    if (produce.farmer.toString() !== farmerId) {
      return res.status(403).json({ message: "You don't own this produce" })
    }

    // Check eligibility
    const eligibility = checkEligibility(produce)
    if (!eligibility.eligible) {
      return res.status(400).json({ 
        message: "Produce is not eligible for collateral",
        reasons: eligibility.reasons
      })
    }

    // Calculate loan terms
    const quantity = produce.quantity
    const pricePerKg = produce.currentMarketPrice

    const collateralValue = computeCollateralValue(quantity, pricePerKg)
    const principal = computePrincipal(collateralValue, requestedLtv)
    const originationFee = computeOriginationFee(principal, 0.02) // 2% fee
    const interestAmount = computeInterest(principal, 0.18, termDays) // 18% APR
    const totalDue = principal + interestAmount + originationFee
    const netDisbursement = principal - originationFee

    // Create loan application
    const loan = new Loan({
      farmer: farmerId,
      produce: produceId,
      collateralValue,
      collateralQuantity: quantity,
      principal,
      ltv: requestedLtv,
      termDays,
      interestRate: 0.18,
      interestAmount,
      originationFee,
      processingFee: 0,
      totalFees: originationFee,
      totalDue,
      netDisbursement,
      outstandingBalance: totalDue,
      status: "Pending",
      purpose: purpose || "Working capital",
      notes,
      appliedAt: new Date()
    })

    await loan.save()

    // Send application received email
    try {
      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .info-box { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
            .row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
            .highlight { font-size: 24px; font-weight: bold; color: #3b82f6; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>💰 Loan Application Received</h1>
            </div>
            <div class="content">
              <h2>Hello ${farmer.firstName}!</h2>
              <p>We've received your loan application. Your produce is being used as collateral.</p>

              <div class="info-box">
                <h3>Application Summary:</h3>
                <div class="row">
                  <span>Collateral (${produce.produceType}):</span>
                  <strong>${quantity} kg</strong>
                </div>
                <div class="row">
                  <span>Collateral Value:</span>
                  <strong>${formatCurrency(collateralValue)}</strong>
                </div>
                <div class="row">
                  <span>Loan Amount:</span>
                  <strong class="highlight">${formatCurrency(principal)}</strong>
                </div>
                <div class="row">
                  <span>Loan-to-Value (LTV):</span>
                  <strong>${(requestedLtv * 100).toFixed(0)}%</strong>
                </div>
                <div class="row">
                  <span>Term:</span>
                  <strong>${termDays} days</strong>
                </div>
                <div class="row">
                  <span>Interest Rate:</span>
                  <strong>18% APR</strong>
                </div>
                <div class="row">
                  <span>Interest Amount:</span>
                  <strong>${formatCurrency(interestAmount)}</strong>
                </div>
                <div class="row">
                  <span>Origination Fee (2%):</span>
                  <strong>${formatCurrency(originationFee)}</strong>
                </div>
                <div class="row">
                  <span>Total to Repay:</span>
                  <strong>${formatCurrency(totalDue)}</strong>
                </div>
                <div class="row">
                  <span>You Will Receive:</span>
                  <strong style="color: #22c55e; font-size: 18px;">${formatCurrency(netDisbursement)}</strong>
                </div>
              </div>

              <h3>What's Next?</h3>
              <ul>
                <li>✅ Your application is under review</li>
                <li>⏱️ Review typically takes 1-2 business days</li>
                <li>📧 You'll receive an email once approved</li>
                <li>💰 Funds will be disbursed to your account</li>
              </ul>

              <p><strong>Important:</strong> Your produce remains in storage as collateral until the loan is fully repaid.</p>

              <p>Best regards,<br><strong>The Stay Fresh Team</strong></p>
            </div>
          </div>
        </body>
        </html>
      `

      await sendEmail({
        to: farmer.email,
        subject: `💰 Loan Application Received - ${formatCurrency(principal)}`,
        html: emailHtml
      })

      console.log(`📧 Loan application email sent to ${farmer.email}`)
    } catch (emailError) {
      console.error("❌ Failed to send application email:", emailError)
    }

    // Populate for response
    await loan.populate("farmer produce")

    res.status(201).json({
      message: "Loan application submitted successfully",
      loan,
      summary: {
        collateralValue,
        principal,
        interestAmount,
        originationFee,
        totalDue,
        netDisbursement,
        termDays,
        ltv: requestedLtv
      }
    })
  } catch (error) {
    console.error("Apply loan error:", error)
    res.status(500).json({ message: error.message })
  }
})

// Get loan by ID
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id)
      .populate("farmer", "firstName lastName email phone")
      .populate("produce", "produceType quantity currentMarketPrice condition status")
      .populate("approvedBy", "firstName lastName")

    if (!loan) {
      return res.status(404).json({ message: "Loan not found" })
    }

    res.json(loan)
  } catch (error) {
    console.error("Get loan error:", error)
    res.status(500).json({ message: error.message })
  }
})

// Get all loans for a farmer
router.get("/farmer/:farmerId", authMiddleware, async (req, res) => {
  try {
    const loans = await Loan.find({ farmer: req.params.farmerId })
      .populate("produce", "produceType quantity currentMarketPrice")
      .sort({ appliedAt: -1 })

    res.json(loans)
  } catch (error) {
    console.error("Get farmer loans error:", error)
    res.status(500).json({ message: error.message })
  }
})

// Get all pending loans (admin)
router.get("/pending/all", authMiddleware, async (req, res) => {
  try {
    const pendingLoans = await Loan.find({ status: "Pending" })
      .populate("farmer", "firstName lastName email phone")
      .populate("produce", "produceType quantity currentMarketPrice condition room")
      .sort({ appliedAt: -1 })

    res.json(pendingLoans)
  } catch (error) {
    console.error("Get pending loans error:", error)
    res.status(500).json({ message: error.message })
  }
})

// Get all active loans (admin)
router.get("/active/all", authMiddleware, async (req, res) => {
  try {
    const activeLoans = await Loan.find({ status: "Active" })
      .populate("farmer", "firstName lastName email phone")
      .populate("produce", "produceType quantity currentMarketPrice")
      .sort({ dueAt: 1 })

    res.json(activeLoans)
  } catch (error) {
    console.error("Get active loans error:", error)
    res.status(500).json({ message: error.message })
  }
})

// Approve loan (admin)
router.patch("/:id/approve", authMiddleware, async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id)
      .populate("farmer")
      .populate("produce")

    if (!loan) {
      return res.status(404).json({ message: "Loan not found" })
    }

    if (loan.status !== "Pending") {
      return res.status(400).json({ 
        message: `Loan is already ${loan.status.toLowerCase()}` 
      })
    }

    // Update loan status
    loan.status = "Active"
    loan.approvedAt = new Date()
    loan.approvedBy = req.userId
    loan.disbursedAt = new Date()
    loan.dueAt = computeDueDate(new Date(), loan.termDays)

    await loan.save()

    // Mark produce as pledged
    const produce = loan.produce
    produce.isPledged = true
    produce.pledgedToLoan = loan._id
    produce.collateralValue = loan.collateralValue
    produce.pledgedAt = new Date()
    produce.pledgedQuantity = loan.collateralQuantity
    await produce.save()

    // Send approval email
    try {
      const dueDate = new Date(loan.dueAt).toLocaleDateString('en-KE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })

      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .success-box { background: #d1fae5; padding: 20px; border-radius: 5px; border-left: 4px solid #22c55e; margin: 20px 0; }
            .info-box { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
            .row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
            .highlight { font-size: 28px; font-weight: bold; color: #22c55e; }
            .warning { background: #fef3c7; padding: 15px; border-radius: 5px; border-left: 4px solid #f59e0b; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Loan Approved!</h1>
            </div>
            <div class="content">
              <h2>Congratulations, ${loan.farmer.firstName}!</h2>
              
              <div class="success-box">
                <h3 style="margin: 0;">✅ Your loan has been approved and disbursed</h3>
                <p style="margin: 10px 0 0 0;">Funds have been sent to your account!</p>
              </div>

              <div class="info-box">
                <h3>Loan Details:</h3>
                <div class="row">
                  <span>Disbursed Amount:</span>
                  <strong class="highlight">${formatCurrency(loan.netDisbursement)}</strong>
                </div>
                <div class="row">
                  <span>Loan Principal:</span>
                  <strong>${formatCurrency(loan.principal)}</strong>
                </div>
                <div class="row">
                  <span>Interest (${(loan.interestRate * 100).toFixed(0)}% APR):</span>
                  <strong>${formatCurrency(loan.interestAmount)}</strong>
                </div>
                <div class="row">
                  <span>Fees:</span>
                  <strong>${formatCurrency(loan.totalFees)}</strong>
                </div>
                <div class="row">
                  <span>Total to Repay:</span>
                  <strong style="font-size: 20px; color: #ef4444;">${formatCurrency(loan.totalDue)}</strong>
                </div>
                <div class="row">
                  <span>Due Date:</span>
                  <strong style="color: #ef4444;">${dueDate}</strong>
                </div>
                <div class="row">
                  <span>Term:</span>
                  <strong>${loan.termDays} days</strong>
                </div>
              </div>

              <div class="info-box">
                <h3>Collateral:</h3>
                <div class="row">
                  <span>Produce Type:</span>
                  <strong>${produce.produceType}</strong>
                </div>
                <div class="row">
                  <span>Quantity Pledged:</span>
                  <strong>${loan.collateralQuantity} kg</strong>
                </div>
                <div class="row">
                  <span>Collateral Value:</span>
                  <strong>${formatCurrency(loan.collateralValue)}</strong>
                </div>
              </div>

              <div class="warning">
                <strong>⚠️ Important Reminders:</strong>
                <ul style="margin: 10px 0;">
                  <li>Your produce remains in storage as collateral</li>
                  <li>You cannot sell or remove the produce until the loan is repaid</li>
                  <li>Failure to repay may result in liquidation of your collateral</li>
                  <li>Make payment on or before ${dueDate}</li>
                </ul>
              </div>

              <h3>Repayment Options:</h3>
              <ul>
                <li>💰 Mobile Money: M-Pesa to 0700 000 000</li>
                <li>🏦 Bank Transfer: Account details in your dashboard</li>
                <li>💳 Card Payment: Available in your dashboard</li>
              </ul>

              <p>Thank you for trusting Stay Fresh with your financing needs!</p>
              
              <p>Best regards,<br><strong>The Stay Fresh Team</strong></p>
            </div>
          </div>
        </body>
        </html>
      `

      await sendEmail({
        to: loan.farmer.email,
        subject: `✅ Loan Approved - ${formatCurrency(loan.netDisbursement)} Disbursed`,
        html: emailHtml
      })

      console.log(`📧 Loan approval email sent to ${loan.farmer.email}`)
    } catch (emailError) {
      console.error("❌ Failed to send approval email:", emailError)
    }

    await loan.populate("approvedBy", "firstName lastName")

    res.json({
      message: "Loan approved and disbursed successfully",
      loan
    })
  } catch (error) {
    console.error("Approve loan error:", error)
    res.status(500).json({ message: error.message })
  }
})

// Reject loan (admin)
router.patch("/:id/reject", authMiddleware, async (req, res) => {
  try {
    const { reason } = req.body

    const loan = await Loan.findById(req.params.id)
      .populate("farmer")

    if (!loan) {
      return res.status(404).json({ message: "Loan not found" })
    }

    if (loan.status !== "Pending") {
      return res.status(400).json({ 
        message: `Loan is already ${loan.status.toLowerCase()}` 
      })
    }

    loan.status = "Cancelled"
    loan.rejectionReason = reason || "Application did not meet approval criteria"
    loan.approvedBy = req.userId
    loan.approvedAt = new Date()

    await loan.save()

    // Send rejection email
    try {
      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .info-box { background: #fee2e2; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ef4444; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Loan Application Update</h1>
            </div>
            <div class="content">
              <h2>Hello ${loan.farmer.firstName},</h2>
              <p>Thank you for your loan application. After careful review, we regret to inform you that your application has not been approved at this time.</p>

              <div class="info-box">
                <strong>Reason:</strong><br>
                ${loan.rejectionReason}
              </div>

              <h3>What You Can Do:</h3>
              <ul>
                <li>Improve produce quality or condition</li>
                <li>Increase quantity for better collateral value</li>
                <li>Apply again in the future</li>
                <li>Contact support for more information</li>
              </ul>

              <p>We appreciate your interest and hope to serve you in the future.</p>
              
              <p>Best regards,<br><strong>The Stay Fresh Team</strong></p>
            </div>
          </div>
        </body>
        </html>
      `

      await sendEmail({
        to: loan.farmer.email,
        subject: "Loan Application Update",
        html: emailHtml
      })
    } catch (emailError) {
      console.error("❌ Failed to send rejection email:", emailError)
    }

    res.json({
      message: "Loan rejected",
      loan
    })
  } catch (error) {
    console.error("Reject loan error:", error)
    res.status(500).json({ message: error.message })
  }
})

// Record payment
router.post("/:id/repay", authMiddleware, async (req, res) => {
  try {
    const { amount, method = "Mobile Money", reference, note } = req.body

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Valid payment amount is required" })
    }

    const loan = await Loan.findById(req.params.id)
      .populate("farmer")
      .populate("produce")

    if (!loan) {
      return res.status(404).json({ message: "Loan not found" })
    }

    if (loan.status !== "Active") {
      return res.status(400).json({ 
        message: `Cannot make payment for ${loan.status.toLowerCase()} loan` 
      })
    }

    // Add payment
    loan.payments.push({
      amount: Number(amount),
      paidAt: new Date(),
      method,
      reference,
      note,
      recordedBy: req.userId
    })

    // Update balances
    loan.updateBalances()

    // Check if fully repaid
    if (loan.outstandingBalance <= 0) {
      loan.status = "Repaid"
      loan.repaidAt = new Date()

      // Release collateral
      const produce = loan.produce
      produce.isPledged = false
      produce.pledgedToLoan = null
      await produce.save()

      // Send repayment confirmation email
      try {
        const emailHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .success-box { background: #d1fae5; padding: 20px; border-radius: 5px; border-left: 4px solid #22c55e; margin: 20px 0; }
              .info-box { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
              .row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎉 Loan Fully Repaid!</h1>
              </div>
              <div class="content">
                <h2>Congratulations, ${loan.farmer.firstName}!</h2>
                
                <div class="success-box">
                  <h3 style="margin: 0;">✅ Your loan has been fully repaid</h3>
                  <p style="margin: 10px 0 0 0;">Your collateral has been released!</p>
                </div>

                <div class="info-box">
                  <h3>Payment Summary:</h3>
                  <div class="row">
                    <span>Payment Amount:</span>
                    <strong>${formatCurrency(amount)}</strong>
                  </div>
                  <div class="row">
                    <span>Payment Method:</span>
                    <strong>${method}</strong>
                  </div>
                  ${reference ? `
                  <div class="row">
                    <span>Reference:</span>
                    <strong>${reference}</strong>
                  </div>
                  ` : ''}
                  <div class="row">
                    <span>Total Paid:</span>
                    <strong>${formatCurrency(loan.amountPaid)}</strong>
                  </div>
                  <div class="row">
                    <span>Outstanding Balance:</span>
                    <strong style="color: #22c55e;">KSH 0.00</strong>
                  </div>
                </div>

                <div class="success-box">
                  <strong>✅ Collateral Released:</strong><br>
                  Your ${produce.produceType} (${produce.quantity}kg) is now available for sale or withdrawal.
                </div>

                <p>Thank you for your timely repayment! We look forward to serving you again.</p>
                
                <p>Best regards,<br><strong>The Stay Fresh Team</strong></p>
              </div>
            </div>
          </body>
          </html>
        `

        await sendEmail({
          to: loan.farmer.email,
          subject: "🎉 Loan Fully Repaid - Collateral Released",
          html: emailHtml
        })
      } catch (emailError) {
        console.error("❌ Failed to send repayment email:", emailError)
      }
    } else {
      // Send partial payment receipt
      try {
        const emailHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .info-box { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
              .row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>💰 Payment Received</h1>
              </div>
              <div class="content">
                <h2>Hello ${loan.farmer.firstName}!</h2>
                <p>We've received your payment. Thank you!</p>

                <div class="info-box">
                  <h3>Payment Details:</h3>
                  <div class="row">
                    <span>Amount Paid:</span>
                    <strong>${formatCurrency(amount)}</strong>
                  </div>
                  <div class="row">
                    <span>Method:</span>
                    <strong>${method}</strong>
                  </div>
                  ${reference ? `
                  <div class="row">
                    <span>Reference:</span>
                    <strong>${reference}</strong>
                  </div>
                  ` : ''}
                  <div class="row">
                    <span>Total Paid to Date:</span>
                    <strong>${formatCurrency(loan.amountPaid)}</strong>
                  </div>
                  <div class="row">
                    <span>Outstanding Balance:</span>
                    <strong style="color: #ef4444; font-size: 18px;">${formatCurrency(loan.outstandingBalance)}</strong>
                  </div>
                </div>

                <p>Keep up the good work! We'll notify you as the due date approaches.</p>
                
                <p>Best regards,<br><strong>The Stay Fresh Team</strong></p>
              </div>
            </div>
          </body>
          </html>
        `

        await sendEmail({
          to: loan.farmer.email,
          subject: `💰 Payment Received - ${formatCurrency(amount)}`,
          html: emailHtml
        })
      } catch (emailError) {
        console.error("❌ Failed to send payment email:", emailError)
      }
    }

    await loan.save()

    res.json({
      message: loan.status === "Repaid" 
        ? "Loan fully repaid and collateral released" 
        : "Payment recorded successfully",
      loan,
      outstandingBalance: loan.outstandingBalance
    })
  } catch (error) {
    console.error("Repay loan error:", error)
    res.status(500).json({ message: error.message })
  }
})

// Get loan statistics
router.get("/stats/summary", authMiddleware, async (req, res) => {
  try {
    const [
      totalLoans,
      pendingLoans,
      activeLoans,
      repaidLoans,
      defaultedLoans,
      totalDisbursed,
      totalRepaid,
      totalOutstanding
    ] = await Promise.all([
      Loan.countDocuments(),
      Loan.countDocuments({ status: "Pending" }),
      Loan.countDocuments({ status: "Active" }),
      Loan.countDocuments({ status: "Repaid" }),
      Loan.countDocuments({ status: "Defaulted" }),
      Loan.aggregate([
        { $match: { status: { $in: ["Active", "Repaid"] } } },
        { $group: { _id: null, total: { $sum: "$principal" } } }
      ]),
      Loan.aggregate([
        { $match: { status: "Repaid" } },
        { $group: { _id: null, total: { $sum: "$amountPaid" } } }
      ]),
      Loan.aggregate([
        { $match: { status: "Active" } },
        { $group: { _id: null, total: { $sum: "$outstandingBalance" } } }
      ])
    ])

    res.json({
      totalLoans,
      pendingLoans,
      activeLoans,
      repaidLoans,
      defaultedLoans,
      totalDisbursed: totalDisbursed[0]?.total || 0,
      totalRepaid: totalRepaid[0]?.total || 0,
      totalOutstanding: totalOutstanding[0]?.total || 0
    })
  } catch (error) {
    console.error("Get loan stats error:", error)
    res.status(500).json({ message: error.message })
  }
})

export default router
