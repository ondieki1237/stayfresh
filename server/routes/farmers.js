import express from "express"
import Farmer from "../models/Farmer.js"
import jwt from "jsonwebtoken"
import { authMiddleware } from "../middleware/auth.js"
import { sendWelcomeEmail } from "../utils/emailService.js"

const router = express.Router()

// Register
router.post("/register", async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone, location } = req.body

    // Validate input
    if (!email || !password || !firstName || !lastName || !phone || !location) {
      return res.status(400).json({ message: "Please provide all required fields" })
    }

    // Check if farmer already exists
    let farmer = await Farmer.findOne({ email })
    if (farmer) {
      return res.status(400).json({ message: "Farmer already exists with this email" })
    }

    // Create new farmer
    farmer = new Farmer({
      email,
      password,
      firstName,
      lastName,
      phone,
      location,
    })

    await farmer.save()

    // Generate token
    const token = jwt.sign(
      { id: farmer._id }, 
      process.env.JWT_SECRET || "secret_key", 
      { expiresIn: "30d" }
    )
    
    // Remove password from response
    const farmerResponse = farmer.toObject()
    delete farmerResponse.password

    // Send welcome email (non-blocking)
    sendWelcomeEmail(farmerResponse).catch(err => 
      console.error("Failed to send welcome email:", err)
    )

    res.status(201).json({ 
      message: "Registration successful", 
      token, 
      farmer: farmerResponse 
    })
  } catch (error) {
    console.error("Registration error:", error)
    res.status(500).json({ message: error.message })
  }
})

// Login (handle both with and without trailing slash)
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: "Please provide email and password" })
    }

    // Find farmer
    const farmer = await Farmer.findOne({ email })
    if (!farmer) {
      return res.status(400).json({ message: "Invalid email or password" })
    }

    // Check password
    const isMatch = await farmer.comparePassword(password)
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" })
    }

    // Check if account is active
    if (!farmer.isActive) {
      return res.status(403).json({ message: "Account is deactivated. Please contact support." })
    }

    // Generate token
    const token = jwt.sign(
      { id: farmer._id }, 
      process.env.JWT_SECRET || "secret_key", 
      { expiresIn: "30d" }
    )
    
    // Remove password from response
    const farmerResponse = farmer.toObject()
    delete farmerResponse.password

    res.json({ 
      message: "Login successful", 
      token, 
      farmer: farmerResponse 
    })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({ message: error.message })
  }
})

// Get farmer profile
router.get("/profile/:id", authMiddleware, async (req, res) => {
  try {
    const farmer = await Farmer.findById(req.params.id)
      .populate("rentedRooms")
      .select("-password")
      
    if (!farmer) {
      return res.status(404).json({ message: "Farmer not found" })
    }
    
    res.json(farmer)
  } catch (error) {
    console.error("Get profile error:", error)
    res.status(500).json({ message: error.message })
  }
})

// Update farmer profile
router.put("/profile/:id", authMiddleware, async (req, res) => {
  try {
    // Prevent password update through this route
    if (req.body.password) {
      delete req.body.password
    }
    
    const farmer = await Farmer.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    ).select("-password")
    
    if (!farmer) {
      return res.status(404).json({ message: "Farmer not found" })
    }
    
    res.json({ message: "Profile updated successfully", farmer })
  } catch (error) {
    console.error("Update profile error:", error)
    res.status(500).json({ message: error.message })
  }
})

// Get all farmers (admin only)
router.get("/", async (req, res) => {
  try {
    const farmers = await Farmer.find()
      .select("-password")
      .populate("rentedRooms")
      .sort({ createdAt: -1 })
      
    res.json(farmers)
  } catch (error) {
    console.error("Get farmers error:", error)
    res.status(500).json({ message: error.message })
  }
})

// Get farmer statistics
router.get("/stats/:id", authMiddleware, async (req, res) => {
  try {
    const farmer = await Farmer.findById(req.params.id).select("-password")
    
    if (!farmer) {
      return res.status(404).json({ message: "Farmer not found" })
    }
    
    // Get additional stats
    const Room = (await import("../models/Room.js")).default
    const Produce = (await import("../models/Produce.js")).default
    const Billing = (await import("../models/Billing.js")).default
    
    const totalRooms = await Room.countDocuments({ owner: req.params.id })
    const totalProduce = await Produce.countDocuments({ farmer: req.params.id })
    const pendingBills = await Billing.countDocuments({ 
      farmer: req.params.id, 
      status: "Pending" 
    })
    
    res.json({
      farmer,
      stats: {
        totalRooms,
        totalProduce,
        pendingBills,
        totalSpent: farmer.totalSpent
      }
    })
  } catch (error) {
    console.error("Get stats error:", error)
    res.status(500).json({ message: error.message })
  }
})

export default router
