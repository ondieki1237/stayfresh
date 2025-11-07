import mongoose from "mongoose"

const sensorSchema = new mongoose.Schema(
  {
    sensorId: { type: String, required: true, unique: true },
    room: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true },
    temperature: { type: Number },
    humidity: { type: Number },
    co2Level: { type: Number },
    ethyleneLevel: { type: Number },
    lastReading: { type: Date, default: Date.now },
    readingHistory: [
      {
        temperature: Number,
        humidity: Number,
        co2Level: Number,
        ethyleneLevel: Number,
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true },
)

export default mongoose.model("Sensor", sensorSchema)
