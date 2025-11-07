const mongoose = require("mongoose")

const chamaSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
    },
    contactPerson: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    email: {
      type: String,
    },
    location: {
      type: String,
      required: true,
    },
    members: [
      {
        farmer: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Farmer",
        },
        name: String,
        phone: String,
        joinedDate: {
          type: Date,
          default: Date.now,
        },
        isActive: {
          type: Boolean,
          default: true,
        },
      },
    ],
    sharedRoom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
    },
    marketDays: [
      {
        day: {
          type: String,
          enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        },
        startTime: String, // e.g., "06:00"
        endTime: String, // e.g., "18:00"
        powerOffDuringMarket: {
          type: Boolean,
          default: true,
        },
      },
    ],
    totalMembers: {
      type: Number,
      default: 0,
    },
    totalProduce: {
      type: Number,
      default: 0,
    },
    monthlyFee: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    registrationDate: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
)

// Update totalMembers before saving
chamaSchema.pre("save", function (next) {
  this.totalMembers = this.members.filter((m) => m.isActive).length
  next()
})

const Chama = mongoose.model("Chama", chamaSchema)

module.exports = Chama
