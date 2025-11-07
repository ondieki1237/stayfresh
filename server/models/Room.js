import mongoose from "mongoose"

const roomSchema = new mongoose.Schema(
  {
    roomNumber: { type: String, required: true, unique: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "Farmer" },
    renter: { type: mongoose.Schema.Types.ObjectId, ref: "Farmer" }, // Farmer currently renting
    
    // Room type and sharing
    roomType: {
      type: String,
      enum: ["individual", "shared"],
      default: "individual"
    },
    chamaId: { type: mongoose.Schema.Types.ObjectId, ref: "Chama" }, // For shared rooms
    
    // Physical specifications
    capacity: { type: Number, required: true }, // in kg
    currentOccupancy: { type: Number, default: 0 }, // in kg
    size: { type: Number }, // in cubic meters
    
    // Environmental parameters
    temperature: { type: Number, default: 4 }, // in Celsius
    targetTemperature: { type: Number, default: 4 }, // ideal temperature
    humidity: { type: Number, default: 85 }, // in percentage
    targetHumidity: { type: Number, default: 85 }, // ideal humidity
    
    // Room condition parameters
    sterilization: { 
      type: String, 
      enum: ["Pending", "In Progress", "Completed", "Not Required"], 
      default: "Completed" 
    },
    sterilizationDate: { type: Date },
    nextSterilizationDue: { type: Date },
    
    conditioning: { 
      type: String, 
      enum: ["Poor", "Fair", "Good", "Excellent"], 
      default: "Good" 
    },
    conditioningScore: { type: Number, min: 0, max: 100, default: 85 }, // 0-100 scale
    
    // Operational status
    status: { 
      type: String, 
      enum: ["Available", "Occupied", "Maintenance", "Cleaning"], 
      default: "Available" 
    },
    
    // Power management
    powerStatus: {
      type: String,
      enum: ["on", "off", "scheduled"],
      default: "on"
    },
    lastPowerToggle: { type: Date },
    marketDaySchedule: [{
      day: String, // "Monday", "Tuesday", etc.
      autoOff: { type: Boolean, default: true },
      offTime: String, // "06:00"
      onTime: String, // "18:00"
    }],
    powerSavings: { type: Number, default: 0 }, // Total kWh saved,
    
    // Rental information
    rentalRate: { type: Number, required: true }, // per month
    startDate: { type: Date },
    endDate: { type: Date },
    
    // Sensor integration
    sensorId: { type: mongoose.Schema.Types.ObjectId, ref: "Sensor" },
    
    // Additional parameters affecting food quality
    airCirculation: { type: String, enum: ["Poor", "Fair", "Good", "Excellent"], default: "Good" },
    lightExposure: { type: String, enum: ["None", "Low", "Medium", "High"], default: "None" },
    co2Level: { type: Number }, // ppm
    ethyleneLevel: { type: Number }, // ppm (affects ripening)
    
    // Maintenance tracking
    lastMaintenance: { type: Date },
    nextMaintenanceDue: { type: Date },
    maintenanceHistory: [{
      date: Date,
      type: String,
      description: String,
      performedBy: String
    }],
    
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
)

// Calculate occupancy percentage
roomSchema.virtual("occupancyPercentage").get(function() {
  return (this.currentOccupancy / this.capacity) * 100
})

// Check if room needs maintenance
roomSchema.methods.needsMaintenance = function() {
  if (!this.nextMaintenanceDue) return false
  return new Date() >= this.nextMaintenanceDue
}

export default mongoose.model("Room", roomSchema)
