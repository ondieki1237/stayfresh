import mongoose from "mongoose"
import bcryptjs from "bcryptjs"

const farmerSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phone: { type: String, required: true },
    location: { type: String, required: true },
    farmName: { type: String },
    yearsOfExperience: { type: Number },
    produceTypes: [String],
    profileImage: { type: String },
    rentedRooms: [{ type: mongoose.Schema.Types.ObjectId, ref: "Room" }],
    billingCycle: { type: String, enum: ["1month", "2months", "3months", "4months", "6months", "12months"] },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
)

// Hash password before saving
farmerSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next()
  const salt = await bcryptjs.genSalt(10)
  this.password = await bcryptjs.hash(this.password, salt)
  next()
})

// Method to compare passwords
farmerSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcryptjs.compare(enteredPassword, this.password)
}

export default mongoose.model("Farmer", farmerSchema)
