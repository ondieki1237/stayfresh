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
        <div key={path.id} className="bg-[#1a1f26] border border-border rounded-lg p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-4 flex-1">
              <span className="text-4xl">{path.image}</span>
              <div>
                <h3 className="text-xl font-bold text-foreground mb-1">{path.title}</h3>
                <p className="text-muted text-sm mb-3">{path.description}</p>
                <div className="flex gap-4 text-xs text-muted">
                  <span>⏱️ {path.duration}</span>
                  <span>📚 {path.courses} courses</span>
                  <span className="px-2 py-1 bg-[#252b33] rounded">{path.level}</span>
                </div>
              </div>
            </div>
            <Button className="bg-primary hover:bg-primary-dark text-white whitespace-nowrap">
              {path.progress > 0 ? "Continue" : "Start Path"}
            </Button>
          </div>

          {/* Progress */}
          {path.progress > 0 && (
            <div className="mb-4">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted">Overall Progress</span>
                <span className="text-primary font-medium">{path.progress}%</span>
              </div>
              <div className="w-full bg-[#252b33] rounded-full h-2 overflow-hidden">
                <div className="bg-primary h-full transition-all" style={{ width: `${path.progress}%` }}></div>
              </div>
            </div>
          )}

          {/* Courses */}
          <div className="border-t border-border pt-4">
            <p className="text-sm font-medium text-foreground mb-3">Path Curriculum:</p>
            <div className="space-y-2">
              {path.courses_list.map((course, idx) => (
                <div key={idx} className="flex items-center gap-3 text-sm text-muted">
                  <span className="text-[#252b33] w-6 h-6 flex items-center justify-center bg-[#252b33] rounded">
                    {idx + 1}
                  </span>
                  <span>{course}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
