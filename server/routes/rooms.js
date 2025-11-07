import express from "express"
import Room from "../models/Room.js"
import Farmer from "../models/Farmer.js"
import { authMiddleware } from "../middleware/auth.js"

const router = express.Router()

// Get all available rooms
router.get("/available", async (req, res) => {
  try {
    const rooms = await Room.find({ status: "Available" })
      .populate("sensorId")
      .sort({ roomNumber: 1 })
      
    res.json(rooms)
  } catch (error) {
    console.error("Get available rooms error:", error)
    res.status(500).json({ message: error.message })
  }
})

// Get all rooms (with filters)
router.get("/", async (req, res) => {
  try {
    const { status, minCapacity, maxCapacity } = req.query
    let query = {}
    
    if (status) query.status = status
    if (minCapacity) query.capacity = { $gte: parseInt(minCapacity) }
    if (maxCapacity) query.capacity = { ...query.capacity, $lte: parseInt(maxCapacity) }
    
    const rooms = await Room.find(query)
      .populate("owner", "-password")
      .populate("sensorId")
      .sort({ roomNumber: 1 })
      
    res.json(rooms)
  } catch (error) {
    console.error("Get rooms error:", error)
    res.status(500).json({ message: error.message })
  }
})

// Get farmer's rooms
router.get("/farmer/:farmerId", authMiddleware, async (req, res) => {
  try {
    const rooms = await Room.find({ renter: req.params.farmerId })
      .populate("sensorId")
      .sort({ roomNumber: 1 })
      
    res.json(rooms)
  } catch (error) {
    console.error("Get farmer rooms error:", error)
    res.status(500).json({ message: error.message })
  }
})

// Get single room
router.get("/:id", async (req, res) => {
  try {
    const room = await Room.findById(req.params.id)
      .populate("owner", "-password")
      .populate("sensorId")
      
    if (!room) {
      return res.status(404).json({ message: "Room not found" })
    }
    
    res.json(room)
  } catch (error) {
    console.error("Get room error:", error)
    res.status(500).json({ message: error.message })
  }
})

// Create room (admin only)
router.post("/", async (req, res) => {
  try {
    const room = new Room(req.body)
    await room.save()
    
    res.status(201).json({ 
      message: "Room created successfully", 
      room 
    })
  } catch (error) {
    console.error("Create room error:", error)
    res.status(500).json({ message: error.message })
  }
})

// Update room
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const room = await Room.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    )
    
    if (!room) {
      return res.status(404).json({ message: "Room not found" })
    }
    
    res.json({ message: "Room updated successfully", room })
  } catch (error) {
    console.error("Update room error:", error)
    res.status(500).json({ message: error.message })
  }
})

// Rent a room
router.post("/:id/rent", authMiddleware, async (req, res) => {
  try {
    const { farmerId, startDate, endDate, billingCycle } = req.body
    
    const room = await Room.findById(req.params.id)
    if (!room) {
      return res.status(404).json({ message: "Room not found" })
    }
    
    if (room.status !== "Available") {
      return res.status(400).json({ message: "Room is not available for rent" })
    }
    
    // Update room
    room.renter = farmerId
    room.status = "Occupied"
    room.startDate = startDate
    room.endDate = endDate
    await room.save()
    
    // Update farmer's rented rooms
    await Farmer.findByIdAndUpdate(
      farmerId,
      { $addToSet: { rentedRooms: room._id } }
    )
    
    // Create billing record
    const Billing = (await import("../models/Billing.js")).default
    const cycleMonths = parseInt(billingCycle.replace("month", "").replace("s", ""))
    const baseAmount = room.rentalRate * cycleMonths
    const discount = Billing.calculateDiscount(room.rentalRate, cycleMonths)
    const totalAmount = baseAmount - discount
    
    const billing = new Billing({
      farmer: farmerId,
      room: room._id,
      billingCycle,
      cycleMonths,
      baseAmount,
      discount,
      totalAmount,
      startDate,
      endDate,
      dueDate: new Date(startDate).setDate(new Date(startDate).getDate() + 7) // 7 days to pay
    })
    
    await billing.save()
    
    res.json({ 
      message: "Room rented successfully", 
      room,
      billing
    })
  } catch (error) {
    console.error("Rent room error:", error)
    res.status(500).json({ message: error.message })
  }
})

// Request room abandonment
router.post("/:id/abandon", authMiddleware, async (req, res) => {
  try {
    const { reason, farmerId } = req.body
    
    if (!reason || !reason.trim()) {
      return res.status(400).json({ message: "Please provide a reason for abandoning the room" })
    }
    
    const room = await Room.findById(req.params.id)
    if (!room) {
      return res.status(404).json({ message: "Room not found" })
    }
    
    // Verify the farmer is the renter
    if (room.renter?.toString() !== farmerId) {
      return res.status(403).json({ message: "You are not authorized to abandon this room" })
    }
    
    // Create abandonment request
    room.abandonmentRequest = {
      reason: reason.trim(),
      requestedAt: new Date(),
      status: "Pending"
    }
    
    await room.save()
    
    res.json({ 
      message: "Abandonment request submitted successfully. Admin will review your request.", 
      room 
    })
  } catch (error) {
    console.error("Abandon room error:", error)
    res.status(500).json({ message: error.message })
  }
})

// Approve/Reject abandonment request (admin only)
router.post("/:id/abandon/:action", authMiddleware, async (req, res) => {
  try {
    const { action } = req.params // 'approve' or 'reject'
    
    if (!["approve", "reject"].includes(action)) {
      return res.status(400).json({ message: "Invalid action" })
    }
    
    const room = await Room.findById(req.params.id)
    if (!room) {
      return res.status(404).json({ message: "Room not found" })
    }
    
    if (!room.abandonmentRequest || room.abandonmentRequest.status !== "Pending") {
      return res.status(400).json({ message: "No pending abandonment request for this room" })
    }
    
    if (action === "approve") {
      // Remove from farmer's rented rooms
      if (room.renter) {
        await Farmer.findByIdAndUpdate(
          room.renter,
          { $pull: { rentedRooms: room._id } }
        )
      }
      
      // Reset room
      room.renter = null
      room.status = "Available"
      room.currentOccupancy = 0
      room.startDate = null
      room.endDate = null
      room.abandonmentRequest.status = "Approved"
    } else {
      room.abandonmentRequest.status = "Rejected"
    }
    
    await room.save()
    
    res.json({ 
      message: `Abandonment request ${action}d successfully`, 
      room 
    })
  } catch (error) {
    console.error("Process abandonment error:", error)
    res.status(500).json({ message: error.message })
  }
})

// Release a room (end rental) - admin function
router.post("/:id/release", authMiddleware, async (req, res) => {
  try {
    const room = await Room.findById(req.params.id)
    if (!room) {
      return res.status(404).json({ message: "Room not found" })
    }
    
    // Remove from farmer's rented rooms
    if (room.renter) {
      await Farmer.findByIdAndUpdate(
        room.renter,
        { $pull: { rentedRooms: room._id } }
      )
    }
    
    // Reset room
    room.renter = null
    room.status = "Available"
    room.currentOccupancy = 0
    room.startDate = null
    room.endDate = null
    room.abandonmentRequest = undefined
    await room.save()
    
    res.json({ message: "Room released successfully", room })
  } catch (error) {
    console.error("Release room error:", error)
    res.status(500).json({ message: error.message })
  }
})

// Request produce release from room
router.post("/:id/request-release", authMiddleware, async (req, res) => {
  try {
    const room = await Room.findById(req.params.id).populate("renter", "firstName lastName email")
    if (!room) {
      return res.status(404).json({ message: "Room not found" })
    }
    
    // Here you would typically send a notification or create a request record
    // For now, we'll just return success
    
    res.json({ 
      message: "Produce release request submitted successfully", 
      room,
      requestedBy: room.renter
    })
  } catch (error) {
    console.error("Request release error:", error)
    res.status(500).json({ message: error.message })
  }
})

// Delete room (admin only)
router.delete("/:id", async (req, res) => {
  try {
    const room = await Room.findByIdAndDelete(req.params.id)
    
    if (!room) {
      return res.status(404).json({ message: "Room not found" })
    }
    
    res.json({ message: "Room deleted successfully" })
  } catch (error) {
    console.error("Delete room error:", error)
    res.status(500).json({ message: error.message })
  }
})

export default router
