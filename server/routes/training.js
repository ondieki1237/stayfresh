import express from "express"
import TrainingCourse from "../models/TrainingCourse.js"
import { authMiddleware } from "../middleware/auth.js"

const router = express.Router()

// Get all courses
router.get("/", async (req, res) => {
  try {
    const { category, level } = req.query
    let query = { isPublished: true }
    
    if (category) query.category = category
    if (level) query.level = level
    
    const courses = await TrainingCourse.find(query)
      .sort({ rating: -1, totalEnrollments: -1 })
      
    res.json(courses)
  } catch (error) {
    console.error("Get courses error:", error)
    res.status(500).json({ message: error.message })
  }
})

// Get single course
router.get("/:id", async (req, res) => {
  try {
    const course = await TrainingCourse.findById(req.params.id)
      
    if (!course) {
      return res.status(404).json({ message: "Course not found" })
    }
    
    res.json(course)
  } catch (error) {
    console.error("Get course error:", error)
    res.status(500).json({ message: error.message })
  }
})

// Get farmer's enrolled courses
router.get("/farmer/:farmerId/enrolled", authMiddleware, async (req, res) => {
  try {
    const courses = await TrainingCourse.find({ 
      enrolledFarmers: req.params.farmerId 
    })
    
    res.json(courses)
  } catch (error) {
    console.error("Get enrolled courses error:", error)
    res.status(500).json({ message: error.message })
  }
})

// Create course (admin only)
router.post("/", async (req, res) => {
  try {
    const course = new TrainingCourse(req.body)
    await course.save()
    
    res.status(201).json({ 
      message: "Course created successfully", 
      course 
    })
  } catch (error) {
    console.error("Create course error:", error)
    res.status(500).json({ message: error.message })
  }
})

// Update course
router.put("/:id", async (req, res) => {
  try {
    const course = await TrainingCourse.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
    
    if (!course) {
      return res.status(404).json({ message: "Course not found" })
    }
    
    res.json({ message: "Course updated successfully", course })
  } catch (error) {
    console.error("Update course error:", error)
    res.status(500).json({ message: error.message })
  }
})

// Enroll in course
router.post("/:id/enroll", authMiddleware, async (req, res) => {
  try {
    const { farmerId } = req.body
    
    const course = await TrainingCourse.findById(req.params.id)
    if (!course) {
      return res.status(404).json({ message: "Course not found" })
    }
    
    // Check if already enrolled
    if (course.enrolledFarmers.includes(farmerId)) {
      return res.status(400).json({ message: "Already enrolled in this course" })
    }
    
    course.enrolledFarmers.push(farmerId)
    course.totalEnrollments += 1
    await course.save()
    
    res.json({ message: "Enrolled successfully", course })
  } catch (error) {
    console.error("Enroll course error:", error)
    res.status(500).json({ message: error.message })
  }
})

// Get popular courses
router.get("/popular/top", async (req, res) => {
  try {
    const courses = await TrainingCourse.find({ isPublished: true })
      .sort({ totalEnrollments: -1, rating: -1 })
      .limit(10)
      
    res.json(courses)
  } catch (error) {
    console.error("Get popular courses error:", error)
    res.status(500).json({ message: error.message })
  }
})

// Get courses by category
router.get("/category/:category", async (req, res) => {
  try {
    const courses = await TrainingCourse.find({ 
      category: req.params.category,
      isPublished: true 
    })
    .sort({ rating: -1 })
    
    res.json(courses)
  } catch (error) {
    console.error("Get courses by category error:", error)
    res.status(500).json({ message: error.message })
  }
})

// Delete course
router.delete("/:id", async (req, res) => {
  try {
    const course = await TrainingCourse.findByIdAndDelete(req.params.id)
    
    if (!course) {
      return res.status(404).json({ message: "Course not found" })
    }
    
    res.json({ message: "Course deleted successfully" })
  } catch (error) {
    console.error("Delete course error:", error)
    res.status(500).json({ message: error.message })
  }
})

export default router
