import express from "express"
import Sensor from "../models/Sensor.js"
import Room from "../models/Room.js"
import Farmer from "../models/Farmer.js"
import { sendSensorAlertNotification } from "../utils/emailService.js"

const router = express.Router()

// Get all sensors
router.get("/", async (req, res) => {
  try {
    const sensors = await Sensor.find()
      .populate("room")
      .sort({ sensorId: 1 })
      
    res.json(sensors)
  } catch (error) {
    console.error("Get sensors error:", error)
    res.status(500).json({ message: error.message })
  }
})

// Get sensor by room
router.get("/room/:roomId", async (req, res) => {
  try {
    const sensor = await Sensor.findOne({ room: req.params.roomId })
      .populate("room")
      
    if (!sensor) {
      return res.status(404).json({ message: "Sensor not found for this room" })
    }
    
    res.json(sensor)
  } catch (error) {
    console.error("Get sensor by room error:", error)
    res.status(500).json({ message: error.message })
  }
})

// Get single sensor
router.get("/:id", async (req, res) => {
  try {
    const sensor = await Sensor.findById(req.params.id)
      .populate("room")
      
    if (!sensor) {
      return res.status(404).json({ message: "Sensor not found" })
    }
    
    res.json(sensor)
  } catch (error) {
    console.error("Get sensor error:", error)
    res.status(500).json({ message: error.message })
  }
})

// Create sensor
router.post("/", async (req, res) => {
  try {
    const sensor = new Sensor(req.body)
    await sensor.save()
    
    // Update room with sensor ID
    if (req.body.room) {
      await Room.findByIdAndUpdate(
        req.body.room,
        { sensorId: sensor._id }
      )
    }
    
    res.status(201).json({ 
      message: "Sensor created successfully", 
      sensor 
    })
  } catch (error) {
    console.error("Create sensor error:", error)
    res.status(500).json({ message: error.message })
  }
})

// Update sensor reading
router.post("/:id/reading", async (req, res) => {
  try {
    const sensor = await Sensor.findById(req.params.id).populate("room")
    if (!sensor) {
      return res.status(404).json({ message: "Sensor not found" })
    }
    
    // Add new reading
    sensor.addReading(req.body)
    await sensor.save()
    
    // Update room environmental parameters
    if (sensor.room) {
      await Room.findByIdAndUpdate(sensor.room._id, {
        temperature: req.body.temperature,
        humidity: req.body.humidity,
        co2Level: req.body.co2Level,
        ethyleneLevel: req.body.ethyleneLevel
      })
    }
    
    // Check for critical or high severity alerts
    const criticalAlerts = sensor.activeAlerts.filter(
      a => !a.resolved && (a.severity === "Critical" || a.severity === "High")
    )
    
    // Send email notification if there are critical/high alerts
    if (criticalAlerts.length > 0 && sensor.room) {
      const room = await Room.findById(sensor.room._id).populate("renter")
      if (room && room.renter) {
        sendSensorAlertNotification(room.renter, room, criticalAlerts).catch(err => 
          console.error("Failed to send sensor alert email:", err)
        )
      }
    }
    
    res.json({ 
      message: "Sensor reading added successfully", 
      sensor,
      alerts: sensor.activeAlerts.filter(a => !a.resolved)
    })
  } catch (error) {
    console.error("Add sensor reading error:", error)
    res.status(500).json({ message: error.message })
  }
})

// Get sensor reading history
router.get("/:id/history", async (req, res) => {
  try {
    const { hours = 24 } = req.query
    const sensor = await Sensor.findById(req.params.id)
    
    if (!sensor) {
      return res.status(404).json({ message: "Sensor not found" })
    }
    
    // Filter history by time period
    const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000)
    const history = sensor.readingHistory.filter(
      reading => reading.timestamp >= cutoffTime
    )
    
    res.json(history)
  } catch (error) {
    console.error("Get sensor history error:", error)
    res.status(500).json({ message: error.message })
  }
})

// Get active alerts
router.get("/:id/alerts", async (req, res) => {
  try {
    const sensor = await Sensor.findById(req.params.id)
    
    if (!sensor) {
      return res.status(404).json({ message: "Sensor not found" })
    }
    
    const activeAlerts = sensor.activeAlerts.filter(alert => !alert.resolved)
    
    res.json(activeAlerts)
  } catch (error) {
    console.error("Get alerts error:", error)
    res.status(500).json({ message: error.message })
  }
})

// Resolve alert
router.post("/:id/alerts/:alertIndex/resolve", async (req, res) => {
  try {
    const sensor = await Sensor.findById(req.params.id)
    
    if (!sensor) {
      return res.status(404).json({ message: "Sensor not found" })
    }
    
    const alertIndex = parseInt(req.params.alertIndex)
    if (alertIndex >= 0 && alertIndex < sensor.activeAlerts.length) {
      sensor.activeAlerts[alertIndex].resolved = true
      await sensor.save()
    }
    
    res.json({ message: "Alert resolved successfully", sensor })
  } catch (error) {
    console.error("Resolve alert error:", error)
    res.status(500).json({ message: error.message })
  }
})

// Update sensor
router.put("/:id", async (req, res) => {
  try {
    const sensor = await Sensor.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
    
    if (!sensor) {
      return res.status(404).json({ message: "Sensor not found" })
    }
    
    res.json({ message: "Sensor updated successfully", sensor })
  } catch (error) {
    console.error("Update sensor error:", error)
    res.status(500).json({ message: error.message })
  }
})

// Delete sensor
router.delete("/:id", async (req, res) => {
  try {
    const sensor = await Sensor.findByIdAndDelete(req.params.id)
    
    if (!sensor) {
      return res.status(404).json({ message: "Sensor not found" })
    }
    
    // Remove sensor reference from room
    if (sensor.room) {
      await Room.findByIdAndUpdate(sensor.room, { sensorId: null })
    }
    
    res.json({ message: "Sensor deleted successfully" })
  } catch (error) {
    console.error("Delete sensor error:", error)
    res.status(500).json({ message: error.message })
  }
})

export default router
