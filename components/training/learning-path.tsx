"use client"

import { Button } from "@/components/ui/button"

export default function LearningPath() {
  const paths = [
    {
      id: 1,
      title: "Stay Fresh Mastery",
      description: "Complete guide to becoming a Stay Fresh expert",
      duration: "15 hours",
      courses: 8,
      progress: 35,
      level: "Beginner to Advanced",
      image: "🏆",
      courses_list: [
        "Cold Storage Basics",
        "Temperature Control",
        "Quality Assessment",
        "Pest & Disease Management",
        "Market Dynamics",
        "Supply Chain Optimization",
        "Financial Management",
        "Certification Exam",
      ],
    },
    {
      id: 2,
      title: "Profitable Farming",
      description: "Maximize profits through better storage and market strategies",
      duration: "8 hours",
      courses: 5,
      progress: 0,
      level: "Intermediate",
      image: "💰",
      courses_list: [
        "Market Dynamics",
        "Pricing Strategies",
        "Buyer Relations",
        "Financial Planning",
        "Advanced Analytics",
      ],
    },
    {
      id: 3,
      title: "Technology & Innovation",
      description: "Master modern Stay Fresh technology",
      duration: "12 hours",
      courses: 6,
      progress: 0,
      level: "Intermediate to Advanced",
      image: "⚙️",
      courses_list: [
        "IoT Sensors",
        "Data Analytics",
        "Mobile App Usage",
        "Automation Systems",
        "Blockchain Traceability",
        "AI-powered Predictions",
      ],
    },
  ]

  return (
    <div className="space-y-4">
      {paths.map((path) => (
        <div key={path.id} className="bg-white border-2 border-yellow-200 rounded-lg p-6 shadow-md hover:shadow-xl hover:border-green-300 transition-all">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-4 flex-1">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-green-500 rounded-full flex items-center justify-center text-3xl shadow-lg">
                {path.image}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-1">{path.title}</h3>
                <p className="text-gray-600 text-sm mb-3">{path.description}</p>
                <div className="flex gap-4 text-xs text-gray-600">
                  <span>⏱️ {path.duration}</span>
                  <span>📚 {path.courses} courses</span>
                  <span className="px-3 py-1 bg-gradient-to-r from-yellow-100 to-green-100 text-green-700 rounded border border-green-300 font-medium">
                    {path.level}
                  </span>
                </div>
              </div>
            </div>
            <Button className="bg-gradient-to-r from-yellow-400 to-green-500 hover:from-yellow-500 hover:to-green-600 text-white whitespace-nowrap shadow-md">
              {path.progress > 0 ? "Continue" : "Start Path"}
            </Button>
          </div>

          {/* Progress with Brand Colors */}
          {path.progress > 0 && (
            <div className="mb-4">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-600">Overall Progress</span>
                <span className="text-green-600 font-bold">{path.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-yellow-400 to-green-500 h-full transition-all" 
                  style={{ width: `${path.progress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Courses with Brand Colors */}
          <div className="border-t-2 border-yellow-100 pt-4">
            <p className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
              <span className="text-green-600">📋</span>
              Path Curriculum:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {path.courses_list.map((course, idx) => (
                <div 
                  key={idx} 
                  className="flex items-center gap-3 text-sm text-gray-700 bg-gradient-to-r from-yellow-50 to-green-50 p-2 rounded border border-yellow-200 hover:border-green-300 transition-colors"
                >
                  <span className="w-6 h-6 flex items-center justify-center bg-gradient-to-r from-yellow-400 to-green-500 text-white rounded font-bold text-xs shadow-sm">
                    {idx + 1}
                  </span>
                  <span className="font-medium">{course}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
