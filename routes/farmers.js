import express from "express"
import Farmer from "../models/Farmer.js"
import jwt from "jsonwebtoken"

const router = express.Router()

// Register
router.post("/register", async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone, location } = req.body

    let farmer = await Farmer.findOne({ email })
    if (farmer) return res.status(400).json({ message: "Farmer already exists" })

    farmer = new Farmer({
      email,
      password,
      firstName,
      lastName,
      phone,
      location,
    })

    await farmer.save()

    const token = jwt.sign({ id: farmer._id }, process.env.JWT_SECRET || "secret_key", { expiresIn: "7d" })
    res.status(201).json({ token, farmer })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body

    const farmer = await Farmer.findOne({ email })
    if (!farmer) return res.status(400).json({ message: "Invalid credentials" })

    const isMatch = await farmer.comparePassword(password)
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" })

    const token = jwt.sign({ id: farmer._id }, process.env.JWT_SECRET || "secret_key", { expiresIn: "7d" })
    res.json({ token, farmer })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Get farmer profile
router.get("/profile/:id", async (req, res) => {
  try {
    const farmer = await Farmer.findById(req.params.id).populate("rentedRooms")
    res.json(farmer)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Update farmer profile
router.put("/profile/:id", async (req, res) => {
  try {
    const farmer = await Farmer.findByIdAndUpdate(req.params.id, req.body, { new: true })
    res.json(farmer)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export default router
