import express from "express"
import Produce from "../models/Produce.js"

const router = express.Router()

// Add produce
router.post("/", async (req, res) => {
  try {
    const produce = new Produce(req.body)
    await produce.save()
    res.status(201).json(produce)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Get produce by farmer
router.get("/farmer/:farmerId", async (req, res) => {
  try {
    const produce = await Produce.find({ farmer: req.params.farmerId }).populate("room")
    res.json(produce)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Get produce by room
router.get("/room/:roomId", async (req, res) => {
  try {
    const produce = await Produce.find({ room: req.params.roomId })
    res.json(produce)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Update produce condition
router.put("/:id", async (req, res) => {
  try {
    const produce = await Produce.findByIdAndUpdate(req.params.id, req.body, { new: true })
    res.json(produce)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export default router
