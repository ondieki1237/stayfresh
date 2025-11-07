"use client"

import { useEffect, useState } from "react"
import DashboardLayout from "@/components/layout/dashboard-layout"
import CourseGrid from "@/components/training/course-grid"
import LearningPath from "@/components/training/learning-path"

export default function Training() {
  const [farmer, setFarmer] = useState(null)
  const [activeTab, setActiveTab] = useState("courses")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const farmerId = localStorage.getItem("farmerId")
    if (farmerId) {
      fetchFarmerData(farmerId)
    }
  }, [])

  const fetchFarmerData = async (farmerId: string) => {
    try {
      const res = await fetch(`http://localhost:5000/api/farmers/profile/${farmerId}`)
      const data = await res.json()
      setFarmer(data)
    } catch (error) {
      console.error("Error fetching farmer:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="flex items-center justify-center h-screen text-foreground">Loading...</div>

  return (
    <DashboardLayout farmer={farmer}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground text-balance">Training & Learning</h1>
          <p className="text-muted text-sm mt-1">Improve your cold chain farming skills</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#1a1f26] border border-border rounded-lg p-4">
            <p className="text-muted text-sm mb-1">Courses Completed</p>
            <p className="text-2xl font-bold text-primary">3</p>
          </div>
          <div className="bg-[#1a1f26] border border-border rounded-lg p-4">
            <p className="text-muted text-sm mb-1">Learning Hours</p>
            <p className="text-2xl font-bold text-primary">12</p>
          </div>
          <div className="bg-[#1a1f26] border border-border rounded-lg p-4">
            <p className="text-muted text-sm mb-1">Certificates Earned</p>
            <p className="text-2xl font-bold text-primary">2</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-border flex gap-6">
          {["courses", "paths"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 font-medium border-b-2 transition-colors capitalize ${
                activeTab === tab
                  ? "border-primary text-primary"
                  : "border-transparent text-muted hover:text-foreground"
              }`}
            >
              {tab === "courses" && "📚 All Courses"}
              {tab === "paths" && "🎯 Learning Paths"}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === "courses" && <CourseGrid />}
          {activeTab === "paths" && <LearningPath />}
        </div>
      </div>
    </DashboardLayout>
  )
}
