import express from "express"
import mongoose from "mongoose"
import cors from "cors"
import dotenv from "dotenv"
import farmerRoutes from "./routes/farmers.js"
import roomRoutes from "./routes/rooms.js"
import produceRoutes from "./routes/produce.js"
import billingRoutes from "./routes/billing.js"
import sensorRoutes from "./routes/sensors.js"
import adminRoutes from "./routes/admin.js"
import marketRoutes from "./routes/market.js"
import chamaRoutes from "./routes/chamas.js"
import { startPowerScheduler } from "./services/powerScheduler.js"

dotenv.config()

const app = express()

// Middleware
app.use(cors())
app.use(express.json())

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/cold-chain")
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB connection error:", err))

// Routes
app.use("/api/farmers", farmerRoutes)
app.use("/api/rooms", roomRoutes)
app.use("/api/produce", produceRoutes)
app.use("/api/billing", billingRoutes)
app.use("/api/sensors", sensorRoutes)
app.use("/api/admin", adminRoutes)
app.use("/api/market", marketRoutes)
app.use("/api/chamas", chamaRoutes)

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "API is running" })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  
  // Start the power scheduler for automatic room power management
  startPowerScheduler(5) // Check every 5 minutes
})
