import mongoose from "mongoose"

const trainingCourseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: ["Cold Storage", "Produce Quality", "Market Skills", "Technology", "Business"],
      required: true
    },
    
    // Course content
    level: { type: String, enum: ["Beginner", "Intermediate", "Advanced"], required: true },
    duration: { type: Number, required: true }, // in hours
    modules: [{
      title: String,
      description: String,
      duration: Number, // in minutes
      content: String,
      videoUrl: String,
      order: Number
    }],
    
    // Enrollment
    enrolledFarmers: [{ type: mongoose.Schema.Types.ObjectId, ref: "Farmer" }],
    totalEnrollments: { type: Number, default: 0 },
    completionRate: { type: Number, default: 0 }, // percentage
    
    // Content details
    objectives: [String],
    prerequisites: [String],
    whatYouWillLearn: [String],
    
    // Media
    thumbnail: { type: String },
    instructor: { type: String },
    
    // Ratings
    rating: { type: Number, min: 0, max: 5, default: 0 },
    reviewsCount: { type: Number, default: 0 },
    
    // Certificate
    providesCertificate: { type: Boolean, default: true },
    
    // Status
    isPublished: { type: Boolean, default: true },
    isPremium: { type: Boolean, default: false },
    
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
)

export default mongoose.model("TrainingCourse", trainingCourseSchema)
