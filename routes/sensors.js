import express from "express"
import Sensor from "../models/Sensor.js"

const router = express.Router()

// Add sensor reading
router.post("/reading", async (req, res) => {
  try {
    const { sensorId, temperature, humidity, co2Level, ethyleneLevel } = req.body

    let sensor = await Sensor.findOne({ sensorId })
    if (!sensor) {
      sensor = new Sensor({ sensorId })
    }

    sensor.temperature = temperature
    sensor.humidity = humidity
    sensor.co2Level = co2Level
    sensor.ethyleneLevel = ethyleneLevel
    sensor.lastReading = new Date()

    sensor.readingHistory.push({
      temperature,
      humidity,
      co2Level,
      ethyleneLevel,
      timestamp: new Date(),
    })

    await sensor.save()
    res.status(201).json(sensor)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Get sensor data
router.get("/:sensorId", async (req, res) => {
  try {
    const sensor = await Sensor.findOne({ sensorId: req.params.sensorId })
    res.json(sensor)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export default router
