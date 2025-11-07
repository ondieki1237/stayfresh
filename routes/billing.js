import express from "express"
import Billing from "../models/Billing.js"

const router = express.Router()

// Create billing
router.post("/", async (req, res) => {
  try {
    const billing = new Billing(req.body)
    await billing.save()
    res.status(201).json(billing)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Get billing by farmer
router.get("/farmer/:farmerId", async (req, res) => {
  try {
    const billing = await Billing.find({ farmer: req.params.farmerId }).populate("room")
    res.json(billing)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Update billing status
router.put("/:id", async (req, res) => {
  try {
    const billing = await Billing.findByIdAndUpdate(req.params.id, req.body, { new: true })
    res.json(billing)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export default router
