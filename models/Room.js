import mongoose from "mongoose"

const roomSchema = new mongoose.Schema(
  {
    roomNumber: { type: String, required: true, unique: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "Farmer" }, // System owner
    renter: { type: mongoose.Schema.Types.ObjectId, ref: "Farmer" }, // Current renter/user
    capacity: { type: Number, required: true }, // in kg
    currentOccupancy: { type: Number, default: 0 }, // in kg
    temperature: { type: Number }, // in Celsius
    humidity: { type: Number }, // in percentage
    sterilization: { type: String, enum: ["Pending", "In Progress", "Completed"] },
    conditioning: { type: String, enum: ["Poor", "Fair", "Good", "Excellent"] },
    status: { type: String, enum: ["Available", "Occupied", "Maintenance"], default: "Available" },
    rentalRate: { type: Number }, // per month
    startDate: { type: Date },
    endDate: { type: Date },
    sensorId: { type: mongoose.Schema.Types.ObjectId, ref: "Sensor" },
    abandonmentRequest: {
      reason: { type: String },
      requestedAt: { type: Date },
      status: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" },
    },
    // Chama fields
    roomType: { type: String, enum: ["individual", "shared"], default: "individual" },
    chamaId: { type: mongoose.Schema.Types.ObjectId, ref: "Chama" },
    powerStatus: { type: String, enum: ["on", "off"], default: "on" },
    marketDaySchedule: [{ type: String }],
    powerSavings: {
      totalKwhSaved: { type: Number, default: 0 },
      costSavings: { type: Number, default: 0 },
      lastCalculated: { type: Date },
    },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
)

export default mongoose.model("Room", roomSchema)
