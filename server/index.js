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
import predictionsRoutes from "./routes/predictions.js"
import marketInsightsRoutes from "./routes/market-insights.js"
import { startPowerScheduler } from "./services/powerScheduler.js"
import { startPriceMonitoring } from "./services/priceMonitor.js"

dotenv.config()

const app = express()

// Middleware - CORS Configuration
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001', 
  'https://garage48.codewithseth.co.ke',
  'https://www.garage48.codewithseth.co.ke',
  'https://kisumu.codewithseth.co.ke',
  'https://www.kisumu.codewithseth.co.ke'
]

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman, or server-to-server)
    if (!origin) return callback(null, true)
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true)
    } else {
      console.log('❌ CORS blocked origin:', origin)
      callback(null, true) // Still allow for now, just log
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  optionsSuccessStatus: 200
}))

// Handle preflight requests
app.options('*', cors())

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Request logging middleware (for debugging)
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.path} - Origin: ${req.get('origin') || 'No origin'}`)
  next()
})

// Middleware to remove trailing slashes from URLs
app.use((req, res, next) => {
  if (req.path.substr(-1) === '/' && req.path.length > 1) {
    const query = req.url.slice(req.path.length)
    res.redirect(301, req.path.slice(0, -1) + query)
  } else {
    next()
  }
})

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
app.use("/api/predictions", predictionsRoutes)
app.use("/api/market-insights", marketInsightsRoutes)

// Health check
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "API is running", 
    timestamp: new Date(),
    environment: process.env.NODE_ENV || 'development',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  })
})

// Root route
app.get("/", (req, res) => {
  res.json({ 
    message: "Stay Fresh API Server",
    version: "1.0.0",
    health: "/api/health"
  })
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
