import express from "express"
import Produce from "../models/Produce.js"
import Room from "../models/Room.js"
import Farmer from "../models/Farmer.js"
import { authMiddleware } from "../middleware/auth.js"
import { sendProduceSoldNotification } from "../utils/emailService.js"

const router = express.Router()

// Get all produce (with filters)
router.get("/", async (req, res) => {
  try {
    const { farmer, room, produceType, status } = req.query
    let query = {}
    
    if (farmer) query.farmer = farmer
    if (room) query.room = room
    if (produceType) query.produceType = produceType
    if (status) query.status = status
    
    const produce = await Produce.find(query)
      .populate("farmer", "-password")
      .populate("room")
      .sort({ createdAt: -1 })
      
    res.json(produce)
  } catch (error) {
    console.error("Get produce error:", error)
    res.status(500).json({ message: error.message })
  }
})

// Get farmer's produce
router.get("/farmer/:farmerId", authMiddleware, async (req, res) => {
  try {
    const produce = await Produce.find({ farmer: req.params.farmerId })
      .populate("room")
      .sort({ createdAt: -1 })
      
    res.json(produce)
  } catch (error) {
    console.error("Get farmer produce error:", error)
    res.status(500).json({ message: error.message })
  }
})

// Get produce in a specific room
router.get("/room/:roomId", async (req, res) => {
  try {
    const produce = await Produce.find({ room: req.params.roomId })
      .populate("farmer", "-password")
      .sort({ createdAt: -1 })
      
    res.json(produce)
  } catch (error) {
    console.error("Get room produce error:", error)
    res.status(500).json({ message: error.message })
  }
})

// Get single produce
router.get("/:id", async (req, res) => {
  try {
    const produce = await Produce.findById(req.params.id)
      .populate("farmer", "-password")
      .populate("room")
      
    if (!produce) {
      return res.status(404).json({ message: "Produce not found" })
    }
    
    res.json(produce)
  } catch (error) {
    console.error("Get produce error:", error)
    res.status(500).json({ message: error.message })
  }
})

// Create produce
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { roomId, quantity } = req.body
    
    // Check if room exists and has capacity
    const room = await Room.findById(roomId)
    if (!room) {
      return res.status(404).json({ message: "Room not found" })
    }
    
    if (room.currentOccupancy + quantity > room.capacity) {
      return res.status(400).json({ 
        message: "Insufficient room capacity", 
        available: room.capacity - room.currentOccupancy 
      })
    }
    
    // Create produce
    const produce = new Produce(req.body)
    await produce.save()
    
    // Update room occupancy
    room.currentOccupancy += quantity
    await room.save()
    
    res.status(201).json({ 
      message: "Produce added successfully", 
      produce 
    })
  } catch (error) {
    console.error("Create produce error:", error)
    res.status(500).json({ message: error.message })
  }
})

// Update produce
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const oldProduce = await Produce.findById(req.params.id)
    if (!oldProduce) {
      return res.status(404).json({ message: "Produce not found" })
    }
    
    // If quantity changed, update room occupancy
    if (req.body.quantity && req.body.quantity !== oldProduce.quantity) {
      const room = await Room.findById(oldProduce.room)
      if (room) {
        const difference = req.body.quantity - oldProduce.quantity
        
        if (room.currentOccupancy + difference > room.capacity) {
          return res.status(400).json({ 
            message: "Insufficient room capacity for this update" 
          })
        }
        
        room.currentOccupancy += difference
        await room.save()
      }
    }
    
    const produce = await Produce.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
    
    res.json({ message: "Produce updated successfully", produce })
  } catch (error) {
    console.error("Update produce error:", error)
    res.status(500).json({ message: error.message })
  }
})

// Mark produce as sold
router.post("/:id/sell", authMiddleware, async (req, res) => {
  try {
    const { salePrice, buyerId } = req.body
    
    const produce = await Produce.findById(req.params.id)
    if (!produce) {
      return res.status(404).json({ message: "Produce not found" })
    }
    
    produce.sold = true
    produce.soldDate = new Date()
    produce.salePrice = salePrice
    produce.buyerId = buyerId
    produce.status = "Sold"
    
    // Calculate profit margin
    if (produce.purchasePrice) {
      produce.profitMargin = ((salePrice - produce.purchasePrice) / produce.purchasePrice) * 100
    }
    
    await produce.save()
    
    // Update room occupancy
    const room = await Room.findById(produce.room)
    if (room) {
      room.currentOccupancy = Math.max(0, room.currentOccupancy - produce.quantity)
      await room.save()
    }
    
    // Send notification email to farmer
    const farmer = await Farmer.findById(produce.farmer)
    if (farmer) {
      sendProduceSoldNotification(farmer, produce, { salePrice }).catch(err => 
        console.error("Failed to send produce sold email:", err)
      )
    }
    
    res.json({ message: "Produce marked as sold", produce })
  } catch (error) {
    console.error("Sell produce error:", error)
    res.status(500).json({ message: error.message })
  }
})

// Delete produce
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const produce = await Produce.findById(req.params.id)
    if (!produce) {
      return res.status(404).json({ message: "Produce not found" })
    }
    
    // Update room occupancy
    const room = await Room.findById(produce.room)
    if (room) {
      room.currentOccupancy = Math.max(0, room.currentOccupancy - produce.quantity)
      await room.save()
    }
    
    await Produce.findByIdAndDelete(req.params.id)
    
    res.json({ message: "Produce deleted successfully" })
  } catch (error) {
    console.error("Delete produce error:", error)
    res.status(500).json({ message: error.message })
  }
})

// Get urgent produce (close to perishing)
router.get("/alerts/urgent", async (req, res) => {
  try {
    const urgentProduce = await Produce.find({
      daysUntilPerish: { $lte: 3, $gt: 0 },
      sold: false,
      status: "Active"
    })
    .populate("farmer", "-password")
    .populate("room")
    .sort({ daysUntilPerish: 1 })
    
    res.json(urgentProduce)
  } catch (error) {
    console.error("Get urgent produce error:", error)
    res.status(500).json({ message: error.message })
  }
})

export default router
