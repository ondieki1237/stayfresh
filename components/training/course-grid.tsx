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
      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {["all", "beginner", "intermediate", "advanced"].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
              filter === cat
                ? "bg-primary text-white"
                : "bg-[#1a1f26] border border-border text-foreground hover:border-primary"
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
            className={`bg-[#1a1f26] border rounded-lg overflow-hidden hover:border-primary transition-all ${
              course.completed ? "border-success/50" : "border-border"
            }`}
          >
            {/* Course Header */}
            <div className="bg-[#252b33] p-4 text-center">
              <span className="text-4xl">{course.image}</span>
            </div>

            {/* Course Info */}
            <div className="p-4 space-y-3">
              <div>
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-bold text-foreground flex-1">{course.title}</h3>
                  {course.completed && (
                    <span className="text-xs bg-success/20 text-success rounded px-2 py-1">✓ Done</span>
                  )}
                </div>
                <p className="text-muted text-sm mb-2">{course.description}</p>
              </div>

              {/* Metadata */}
              <div className="flex items-center gap-4 text-xs text-muted">
                <span>⏱️ {course.duration}</span>
                <span>📖 {course.lessons} lessons</span>
                <span className="px-2 py-1 bg-[#252b33] rounded">{course.level}</span>
              </div>

              {/* Progress Bar */}
              {course.progress > 0 && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted">Progress</span>
                    <span className="text-primary font-medium">{course.progress}%</span>
                  </div>
                  <div className="w-full bg-[#252b33] rounded-full h-2 overflow-hidden">
                    <div className="bg-primary h-full transition-all" style={{ width: `${course.progress}%` }}></div>
                  </div>
                </div>
              )}

              {/* Button */}
              <Button
                className={`w-full ${
                  course.completed
                    ? "bg-[#252b33] text-foreground hover:bg-[#2a2f36]"
                    : "bg-primary hover:bg-primary-dark text-white"
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
