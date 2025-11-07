import mongoose from "mongoose"

const billingSchema = new mongoose.Schema(
  {
    farmer: { type: mongoose.Schema.Types.ObjectId, ref: "Farmer", required: true },
    room: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true },
    billingCycle: {
      type: String,
      enum: ["1month", "2months", "3months", "4months", "6months", "12months"],
      required: true,
    },
    amount: { type: Number, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: { type: String, enum: ["Pending", "Paid", "Overdue"], default: "Pending" },
    paymentDate: { type: Date },
    paymentMethod: { type: String },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
)

export default mongoose.model("Billing", billingSchema)
