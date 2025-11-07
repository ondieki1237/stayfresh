import express from "express"
import Farmer from "../models/Farmer.js"
import Room from "../models/Room.js"
import Billing from "../models/Billing.js"
import Produce from "../models/Produce.js"

const router = express.Router()

// Get all farmers
router.get("/farmers", async (req, res) => {
  try {
    const farmers = await Farmer.find().select("-password")
    res.json(farmers)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Get all rooms
router.get("/rooms", async (req, res) => {
  try {
    const rooms = await Room.find().populate("owner").populate("sensorId")
    res.json(rooms)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Get dashboard stats
router.get("/stats", async (req, res) => {
  try {
    const totalFarmers = await Farmer.countDocuments()
    const totalRooms = await Room.countDocuments()
    const occupiedRooms = await Room.countDocuments({ status: "Occupied" })
    const totalBilling = await Billing.aggregate([{ $group: { _id: null, total: { $sum: "$amount" } } }])
    const totalProduce = await Produce.countDocuments()

    res.json({
      totalFarmers,
      totalRooms,
      occupiedRooms,
      totalBillingAmount: totalBilling[0]?.total || 0,
      totalProduce,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export default router
