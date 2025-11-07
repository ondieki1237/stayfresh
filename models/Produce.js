import mongoose from "mongoose"

const produceSchema = new mongoose.Schema(
  {
    farmer: { type: mongoose.Schema.Types.ObjectId, ref: "Farmer", required: true },
    room: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true },
    produceType: { type: String, required: true },
    quantity: { type: Number, required: true }, // in kg
    currentMarketPrice: { type: Number, required: true },
    expectedPeakPrice: { type: Number },
    condition: { type: String, enum: ["Fresh", "Good", "Fair", "Poor"], default: "Fresh" },
    storageDate: { type: Date, default: Date.now },
    expectedHarvestDate: { type: Date },
    sold: { type: Boolean, default: false },
    soldDate: { type: Date },
    salePrice: { type: Number },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
)

export default mongoose.model("Produce", produceSchema)
