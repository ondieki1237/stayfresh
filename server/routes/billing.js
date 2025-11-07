import express from "express"
import Billing from "../models/Billing.js"
import Farmer from "../models/Farmer.js"
import Room from "../models/Room.js"
import { authMiddleware } from "../middleware/auth.js"
import { sendBillingReminderNotification } from "../utils/emailService.js"

const router = express.Router()

// Get all billing records
router.get("/", async (req, res) => {
  try {
    const { farmer, status } = req.query
    let query = {}
    
    if (farmer) query.farmer = farmer
    if (status) query.status = status
    
    const billings = await Billing.find(query)
      .populate("farmer", "-password")
      .populate("room")
      .sort({ createdAt: -1 })
      
    res.json(billings)
  } catch (error) {
    console.error("Get billings error:", error)
    res.status(500).json({ message: error.message })
  }
})

// Get farmer's billing records
router.get("/farmer/:farmerId", authMiddleware, async (req, res) => {
  try {
    const billings = await Billing.find({ farmer: req.params.farmerId })
      .populate("room")
      .sort({ createdAt: -1 })
      
    res.json(billings)
  } catch (error) {
    console.error("Get farmer billings error:", error)
    res.status(500).json({ message: error.message })
  }
})

// Get single billing record
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const billing = await Billing.findById(req.params.id)
      .populate("farmer", "-password")
      .populate("room")
      
    if (!billing) {
      return res.status(404).json({ message: "Billing record not found" })
    }
    
    res.json(billing)
  } catch (error) {
    console.error("Get billing error:", error)
    res.status(500).json({ message: error.message })
  }
})

// Create billing record
router.post("/", async (req, res) => {
  try {
    const billing = new Billing(req.body)
    await billing.save()
    
    res.status(201).json({ 
      message: "Billing record created successfully", 
      billing 
    })
  } catch (error) {
    console.error("Create billing error:", error)
    res.status(500).json({ message: error.message })
  }
})

// Update billing record
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const billing = await Billing.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
    
    if (!billing) {
      return res.status(404).json({ message: "Billing record not found" })
    }
    
    res.json({ message: "Billing updated successfully", billing })
  } catch (error) {
    console.error("Update billing error:", error)
    res.status(500).json({ message: error.message })
  }
})

// Process payment
router.post("/:id/pay", authMiddleware, async (req, res) => {
  try {
    const { amount, paymentMethod, transactionId } = req.body
    
    const billing = await Billing.findById(req.params.id)
    if (!billing) {
      return res.status(404).json({ message: "Billing record not found" })
    }
    
    // Update payment information
    billing.amountPaid += amount
    billing.paymentDate = new Date()
    billing.paymentMethod = paymentMethod
    billing.transactionId = transactionId
    
    // Update status
    if (billing.amountPaid >= billing.totalAmount) {
      billing.status = "Paid"
      billing.receiptNumber = `RCP-${Date.now()}`
    } else {
      billing.status = "Partial"
    }
    
    await billing.save()
    
    // Update farmer's total spent
    const Farmer = (await import("../models/Farmer.js")).default
    await Farmer.findByIdAndUpdate(
      billing.farmer,
      { $inc: { totalSpent: amount } }
    )
    
    res.json({ 
      message: "Payment processed successfully", 
      billing 
    })
  } catch (error) {
    console.error("Process payment error:", error)
    res.status(500).json({ message: error.message })
  }
})

// Get pending bills
router.get("/status/pending", async (req, res) => {
  try {
    const pendingBills = await Billing.find({ status: "Pending" })
      .populate("farmer", "-password")
      .populate("room")
      .sort({ dueDate: 1 })
      
    res.json(pendingBills)
  } catch (error) {
    console.error("Get pending bills error:", error)
    res.status(500).json({ message: error.message })
  }
})

// Get overdue bills
router.get("/status/overdue", async (req, res) => {
  try {
    const overdueBills = await Billing.find({ 
      status: "Overdue",
      dueDate: { $lt: new Date() }
    })
    .populate("farmer", "-password")
    .populate("room")
    .sort({ dueDate: 1 })
    
    res.json(overdueBills)
  } catch (error) {
    console.error("Get overdue bills error:", error)
    res.status(500).json({ message: error.message })
  }
})

// Send payment reminder
router.post("/:id/remind", async (req, res) => {
  try {
    const billing = await Billing.findById(req.params.id)
      .populate("farmer")
      .populate("room")
      
    if (!billing) {
      return res.status(404).json({ message: "Billing record not found" })
    }
    
    billing.remindersSent += 1
    billing.lastReminderDate = new Date()
    await billing.save()
    
    // Send email reminder
    if (billing.farmer && billing.room) {
      sendBillingReminderNotification(billing.farmer, billing, billing.room).catch(err => 
        console.error("Failed to send billing reminder email:", err)
      )
    }
    
    res.json({ message: "Payment reminder sent", billing })
  } catch (error) {
    console.error("Send reminder error:", error)
    res.status(500).json({ message: error.message })
  }
})

// Delete billing record
router.delete("/:id", async (req, res) => {
  try {
    const billing = await Billing.findByIdAndDelete(req.params.id)
    
    if (!billing) {
      return res.status(404).json({ message: "Billing record not found" })
    }
    
    res.json({ message: "Billing record deleted successfully" })
  } catch (error) {
    console.error("Delete billing error:", error)
    res.status(500).json({ message: error.message })
  }
})

export default router
