"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

export default function CourseGrid() {
  const [filter, setFilter] = useState("all")

  const courses = [
    {
      id: 1,
      title: "Cold Storage Basics",
      category: "beginner",
      duration: "45 min",
      level: "Beginner",
      lessons: 5,
      description: "Learn the fundamentals of Stay Fresh management",
      image: "❄️",
      completed: true,
      progress: 100,
    },
    {
      id: 2,
      title: "Temperature Control",
      category: "intermediate",
      duration: "1.5 hours",
      level: "Intermediate",
      lessons: 8,
      description: "Master temperature monitoring and control techniques",
      image: "🌡️",
      completed: false,
      progress: 60,
    },
    {
      id: 3,
      title: "Quality Assessment",
      category: "intermediate",
      duration: "1 hour",
      level: "Intermediate",
      lessons: 6,
      description: "How to assess and maintain produce quality",
      image: "✅",
      completed: false,
      progress: 30,
    },
    {
      id: 4,
      title: "Market Dynamics",
      category: "advanced",
      duration: "2 hours",
      level: "Advanced",
      lessons: 10,
      description: "Understanding market trends and pricing strategies",
      image: "📊",
      completed: false,
      progress: 0,
    },
    {
      id: 5,
      title: "Pest & Disease Management",
      category: "intermediate",
      duration: "1.5 hours",
      level: "Intermediate",
      lessons: 7,
      description: "Prevent and manage storage pests and diseases",
      image: "🐛",
      completed: false,
      progress: 0,
    },
    {
      id: 6,
      title: "Supply Chain Optimization",
      category: "advanced",
      duration: "2.5 hours",
      level: "Advanced",
      lessons: 12,
      description: "Optimize your entire supply chain for maximum profits",
      image: "🚚",
      completed: false,
      progress: 0,
    },
  ]

  const filteredCourses = filter === "all" ? courses : courses.filter((c) => c.category === filter)

  return (
    <div className="space-y-4">
      {/* Filters with Brand Colors */}
      <div className="flex gap-2 flex-wrap">
        {["all", "beginner", "intermediate", "advanced"].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
              filter === cat
                ? "bg-gradient-to-r from-yellow-400 to-green-500 text-white shadow-md"
                : "bg-white border-2 border-yellow-300 text-gray-700 hover:border-green-400 hover:text-green-600"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCourses.map((course) => (
          <div
            key={course.id}
            className={`bg-white border-2 rounded-lg overflow-hidden hover:shadow-xl transition-all ${
              course.completed ? "border-green-400 shadow-lg" : "border-yellow-200 hover:border-green-300"
            }`}
          >
            {/* Course Header with Brand Gradient */}
            <div className={`p-4 text-center ${
              course.completed 
                ? "bg-gradient-to-r from-green-400 to-green-500" 
                : "bg-gradient-to-r from-yellow-100 to-green-100"
            }`}>
              <span className="text-4xl">{course.image}</span>
            </div>

            {/* Course Info */}
            <div className="p-4 space-y-3">
              <div>
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-bold text-gray-800 flex-1">{course.title}</h3>
                  {course.completed && (
                    <span className="text-xs bg-green-100 text-green-700 rounded px-2 py-1 font-semibold border border-green-300">
                      ✓ Done
                    </span>
                  )}
                </div>
                <p className="text-gray-600 text-sm mb-2">{course.description}</p>
              </div>

              {/* Metadata */}
              <div className="flex items-center gap-4 text-xs text-gray-600">
                <span>⏱️ {course.duration}</span>
                <span>📖 {course.lessons} lessons</span>
                <span className={`px-2 py-1 rounded font-medium ${
                  course.level === "Beginner" 
                    ? "bg-yellow-100 text-yellow-700 border border-yellow-300"
                    : course.level === "Intermediate"
                    ? "bg-green-100 text-green-700 border border-green-300"
                    : "bg-blue-100 text-blue-700 border border-blue-300"
                }`}>
                  {course.level}
                </span>
              </div>

              {/* Progress Bar with Brand Colors */}
              {course.progress > 0 && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Progress</span>
                    <span className="text-green-600 font-bold">{course.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-yellow-400 to-green-500 h-full transition-all" 
                      style={{ width: `${course.progress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Button with Brand Colors */}
              <Button
                className={`w-full ${
                  course.completed
                    ? "bg-white border-2 border-green-500 text-green-600 hover:bg-green-50"
                    : "bg-gradient-to-r from-yellow-400 to-green-500 hover:from-yellow-500 hover:to-green-600 text-white shadow-md"
                }`}
              >
                {course.completed ? "Review" : course.progress > 0 ? "Continue" : "Start"}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
