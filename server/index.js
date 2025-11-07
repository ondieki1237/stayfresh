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
import marketplaceRoutes from "./routes/marketplace.js"
import trainingRoutes from "./routes/training.js"
import chamaRoutes from "./routes/chamas.js"
import ussdRoutes from "./routes/ussd.js"
import stockingRoutes from "./routes/stocking.js"
import { startPowerScheduler } from "./services/powerScheduler.js"
import { startPriceMonitoring } from "./services/priceMonitor.js"

dotenv.config()

const app = express()

// Middleware - CORS Configuration (Allow all origins)
app.use(cors({
  origin: '*', // Allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false
}))

// Handle preflight requests
app.options('*', cors())

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/cold-chain")
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => console.log("❌ MongoDB connection error:", err))

// Routes
app.use("/api/farmers", farmerRoutes)
app.use("/api/rooms", roomRoutes)
app.use("/api/produce", produceRoutes)
app.use("/api/billing", billingRoutes)
app.use("/api/sensors", sensorRoutes)
app.use("/api/admin", adminRoutes)
app.use("/api/market", marketRoutes)
app.use("/api/marketplace", marketplaceRoutes)
app.use("/api/training", trainingRoutes)
app.use("/api/chamas", chamaRoutes)
app.use("/api/ussd", ussdRoutes)
app.use("/api/stocking", stockingRoutes)

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "API is running", timestamp: new Date() })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`🌐 Health check: http://localhost:${PORT}/api/health`)
  
  // Start the power scheduler for automatic room power management
  startPowerScheduler(5) // Check every 5 minutes
  
  // Start price monitoring service for target price alerts
  startPriceMonitoring(60) // Check market prices every 60 minutes
  
  console.log("✅ All services started successfully")
})
