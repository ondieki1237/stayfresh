import express from "express"
import Stocking from "../models/Stocking.js"
import Room from "../models/Room.js"
import Farmer from "../models/Farmer.js"
import MarketData from "../models/MarketData.js"
import { authMiddleware } from "../middleware/auth.js"

const router = express.Router()

// Book stocking (add produce to room)
router.post("/book", authMiddleware, async (req, res) => {
  try {
    const {
      roomId,
      farmerId,
      produceType,
      quantity,
      estimatedValue,
      condition,
      targetPrice,
      notes
    } = req.body

    // Validate room exists and belongs to farmer
    const room = await Room.findById(roomId)
    if (!room) {
      return res.status(404).json({ message: "Room not found" })
    }

    if (room.renter?.toString() !== farmerId) {
      return res.status(403).json({ message: "You don't have access to this room" })
    }

    // Check room capacity
    const currentStockings = await Stocking.find({ 
      room: roomId, 
      status: { $in: ["Stocked", "Monitoring", "Target Reached"] }
    })
    
    const totalStocked = currentStockings.reduce((sum, s) => sum + s.quantity, 0)
    if (totalStocked + quantity > room.capacity) {
      return res.status(400).json({ 
        message: `Room capacity exceeded. Available: ${room.capacity - totalStocked}kg, Requested: ${quantity}kg` 
      })
    }

    // Get current market price
    const latestMarketData = await MarketData.findOne({ produceType })
      .sort({ timestamp: -1 })
      .limit(1)
    
    const currentMarketPrice = latestMarketData?.currentPrice || 0

    // Create stocking
    const stocking = new Stocking({
      room: roomId,
      farmer: farmerId,
      produceType,
      quantity,
      estimatedValue,
      condition,
      targetPrice,
      currentMarketPrice,
      notes,
      priceHistory: [{
        price: currentMarketPrice,
        checkedAt: new Date()
      }]
    })

    await stocking.save()

    // Update room occupancy
    room.currentOccupancy = totalStocked + quantity
    if (room.status === "Available") {
      room.status = "Occupied"
    }
    await room.save()

    // Populate for response
    await stocking.populate("room farmer")

    res.status(201).json({
      message: "Stocking booked successfully! You'll be notified when target price is reached.",
      stocking
    })
  } catch (error) {
    console.error("Book stocking error:", error)
    res.status(500).json({ message: error.message })
  }
})

// Get all stockings for a room
router.get("/room/:roomId", authMiddleware, async (req, res) => {
  try {
    const stockings = await Stocking.find({ room: req.params.roomId })
      .populate("farmer", "firstName lastName email")
      .sort({ stockedAt: -1 })

    // Get current market prices for each produce type
    const produceTypes = [...new Set(stockings.map(s => s.produceType))]
    const marketPrices = await MarketData.find({ 
      produceType: { $in: produceTypes } 
    })
      .sort({ timestamp: -1 })
      .limit(produceTypes.length)

    // Update current prices in stockings
    const stockingsWithPrices = stockings.map(stocking => {
      const marketData = marketPrices.find(m => m.produceType === stocking.produceType)
      const stockingObj = stocking.toObject({ virtuals: true })
      stockingObj.currentMarketPrice = marketData?.currentPrice || stocking.currentMarketPrice
      return stockingObj
    })

    res.json(stockingsWithPrices)
  } catch (error) {
    console.error("Get room stockings error:", error)
    res.status(500).json({ message: error.message })
  }
})

// Get all stockings for a farmer
router.get("/farmer/:farmerId", authMiddleware, async (req, res) => {
  try {
    const stockings = await Stocking.find({ farmer: req.params.farmerId })
      .populate("room", "roomNumber capacity status")
      .sort({ stockedAt: -1 })

    res.json(stockings)
  } catch (error) {
    console.error("Get farmer stockings error:", error)
    res.status(500).json({ message: error.message })
  }
})

// Get single stocking
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const stocking = await Stocking.findById(req.params.id)
      .populate("room", "roomNumber capacity")
      .populate("farmer", "firstName lastName email phone")

    if (!stocking) {
      return res.status(404).json({ message: "Stocking not found" })
    }

    res.json(stocking)
  } catch (error) {
    console.error("Get stocking error:", error)
    res.status(500).json({ message: error.message })
  }
})

// Update stocking
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { quantity, condition, targetPrice, status, notes } = req.body

    const stocking = await Stocking.findById(req.params.id)
    if (!stocking) {
      return res.status(404).json({ message: "Stocking not found" })
    }

    // Update fields
    if (quantity !== undefined) {
      // Check room capacity if quantity increased
      if (quantity > stocking.quantity) {
        const room = await Room.findById(stocking.room)
        const otherStockings = await Stocking.find({ 
          room: stocking.room,
          _id: { $ne: stocking._id },
          status: { $in: ["Stocked", "Monitoring", "Target Reached"] }
        })
        
        const totalOther = otherStockings.reduce((sum, s) => sum + s.quantity, 0)
        if (totalOther + quantity > room.capacity) {
          return res.status(400).json({ 
            message: `Room capacity exceeded. Available: ${room.capacity - totalOther}kg` 
          })
        }

        // Update room occupancy
        room.currentOccupancy = totalOther + quantity
        await room.save()
      }
      
      stocking.quantity = quantity
    }
    
    if (condition) stocking.condition = condition
    if (targetPrice) {
      stocking.targetPrice = targetPrice
      stocking.priceAlertSent = false // Reset alert
    }
    if (status) stocking.status = status
    if (notes !== undefined) stocking.notes = notes

    await stocking.save()

    res.json({ 
      message: "Stocking updated successfully", 
      stocking 
    })
  } catch (error) {
    console.error("Update stocking error:", error)
    res.status(500).json({ message: error.message })
  }
})

// Remove stocking (mark as removed)
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const stocking = await Stocking.findById(req.params.id)
    if (!stocking) {
      return res.status(404).json({ message: "Stocking not found" })
    }

    // Update room occupancy
    const room = await Room.findById(stocking.room)
    if (room) {
      room.currentOccupancy = Math.max(0, room.currentOccupancy - stocking.quantity)
      
      // Check if room is now empty
      const remainingStockings = await Stocking.find({
        room: room._id,
        _id: { $ne: stocking._id },
        status: { $in: ["Stocked", "Monitoring", "Target Reached"] }
      })
      
      if (remainingStockings.length === 0) {
        room.currentOccupancy = 0
      }
      
      await room.save()
    }

    stocking.status = "Removed"
    await stocking.save()

    res.json({ 
      message: "Stocking removed successfully",
      stocking
    })
  } catch (error) {
    console.error("Remove stocking error:", error)
    res.status(500).json({ message: error.message })
  }
})

// Get stocking statistics for farmer
router.get("/farmer/:farmerId/stats", authMiddleware, async (req, res) => {
  try {
    const stockings = await Stocking.find({ farmer: req.params.farmerId })

    const stats = {
      totalStockings: stockings.length,
      activeStockings: stockings.filter(s => 
        ["Stocked", "Monitoring", "Target Reached"].includes(s.status)
      ).length,
      totalQuantity: stockings.reduce((sum, s) => sum + s.quantity, 0),
      targetReached: stockings.filter(s => s.status === "Target Reached").length,
      averageTargetPrice: stockings.reduce((sum, s) => sum + s.targetPrice, 0) / stockings.length || 0,
      totalEstimatedValue: stockings.reduce((sum, s) => sum + s.estimatedValue, 0)
    }

    res.json(stats)
  } catch (error) {
    console.error("Get stocking stats error:", error)
    res.status(500).json({ message: error.message })
  }
})

export default router
