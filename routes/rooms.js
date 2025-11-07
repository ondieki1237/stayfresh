import express from "express"
import Room from "../models/Room.js"

const router = express.Router()

// Get all available rooms
router.get("/available", async (req, res) => {
  try {
    const rooms = await Room.find({ status: "Available" }).populate("sensorId")
    res.json(rooms)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Get farmer's rooms
router.get("/farmer/:farmerId", async (req, res) => {
  try {
    const rooms = await Room.find({ owner: req.params.farmerId }).populate("sensorId")
    res.json(rooms)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Create room (admin only)
router.post("/", async (req, res) => {
  try {
    const room = new Room(req.body)
    await room.save()
    res.status(201).json(room)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Update room
router.put("/:id", async (req, res) => {
  try {
    const room = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true })
    res.json(room)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export default router
