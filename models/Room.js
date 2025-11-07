import mongoose from "mongoose"

const roomSchema = new mongoose.Schema(
  {
    roomNumber: { type: String, required: true, unique: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "Farmer" },
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
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
)

export default mongoose.model("Room", roomSchema)
