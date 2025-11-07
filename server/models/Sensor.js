import mongoose from "mongoose"

const sensorSchema = new mongoose.Schema(
  {
    sensorId: { type: String, required: true, unique: true },
    room: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true },
    
    // Current readings
    temperature: { type: Number },
    humidity: { type: Number },
    co2Level: { type: Number }, // ppm
    ethyleneLevel: { type: Number }, // ppm
    airPressure: { type: Number }, // Pascal
    
    // Sensor status
    isOnline: { type: Boolean, default: true },
    batteryLevel: { type: Number }, // percentage
    lastReading: { type: Date, default: Date.now },
    
    // Alert thresholds
    temperatureMin: { type: Number, default: 2 },
    temperatureMax: { type: Number, default: 6 },
    humidityMin: { type: Number, default: 80 },
    humidityMax: { type: Number, default: 95 },
    co2Max: { type: Number, default: 5000 },
    ethyleneMax: { type: Number, default: 100 },
    
    // Alerts
    activeAlerts: [{
      type: String,
      message: String,
      severity: { type: String, enum: ["Low", "Medium", "High", "Critical"] },
      triggeredAt: Date,
      resolved: { type: Boolean, default: false }
    }],
    
    // Reading history (last 24 hours stored in detail)
    readingHistory: [
      {
        temperature: Number,
        humidity: Number,
        co2Level: Number,
        ethyleneLevel: Number,
        airPressure: Number,
        timestamp: { type: Date, default: Date.now },
      },
    ],
    
    // Maintenance
    lastCalibration: { type: Date },
    nextCalibrationDue: { type: Date },
    
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
)

// Add new reading and maintain history
sensorSchema.methods.addReading = function(reading) {
  this.temperature = reading.temperature
  this.humidity = reading.humidity
  this.co2Level = reading.co2Level
  this.ethyleneLevel = reading.ethyleneLevel
  this.airPressure = reading.airPressure
  this.lastReading = new Date()
  
  // Add to history
  this.readingHistory.push({
    temperature: reading.temperature,
    humidity: reading.humidity,
    co2Level: reading.co2Level,
    ethyleneLevel: reading.ethyleneLevel,
    airPressure: reading.airPressure,
    timestamp: new Date()
  })
  
  // Keep only last 288 readings (24 hours at 5-min intervals)
  if (this.readingHistory.length > 288) {
    this.readingHistory = this.readingHistory.slice(-288)
  }
  
  // Check for alerts
  this.checkAlerts()
}

// Check if readings are within normal range
sensorSchema.methods.checkAlerts = function() {
  const alerts = []
  
  if (this.temperature < this.temperatureMin) {
    alerts.push({
      type: "Temperature",
      message: `Temperature too low: ${this.temperature}°C`,
      severity: "High",
      triggeredAt: new Date()
    })
  }
  
  if (this.temperature > this.temperatureMax) {
    alerts.push({
      type: "Temperature",
      message: `Temperature too high: ${this.temperature}°C`,
      severity: "Critical",
      triggeredAt: new Date()
    })
  }
  
  if (this.humidity < this.humidityMin || this.humidity > this.humidityMax) {
    alerts.push({
      type: "Humidity",
      message: `Humidity out of range: ${this.humidity}%`,
      severity: "Medium",
      triggeredAt: new Date()
    })
  }
  
  if (this.co2Level > this.co2Max) {
    alerts.push({
      type: "CO2",
      message: `CO2 level too high: ${this.co2Level} ppm`,
      severity: "Medium",
      triggeredAt: new Date()
    })
  }
  
  if (this.ethyleneLevel > this.ethyleneMax) {
    alerts.push({
      type: "Ethylene",
      message: `Ethylene level too high: ${this.ethyleneLevel} ppm`,
      severity: "High",
      triggeredAt: new Date()
    })
  }
  
  // Add new alerts
  if (alerts.length > 0) {
    this.activeAlerts.push(...alerts)
  }
}

export default mongoose.model("Sensor", sensorSchema)
