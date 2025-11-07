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
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';
      const res = await fetch(`${API_BASE}/farmers/profile/${farmerId}`)
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
        {/* Header with Brand Colors */}
        <div className="bg-gradient-to-r from-yellow-400 to-green-500 text-white rounded-lg p-6 shadow-lg">
          <h1 className="text-3xl font-bold text-balance">Training & Learning</h1>
          <p className="text-white/90 text-sm mt-1">Improve your Stay Fresh farming skills</p>
        </div>

        {/* Quick Stats with Brand Colors */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-yellow-200 rounded-lg p-4 shadow-sm">
            <p className="text-gray-600 text-sm mb-1">Courses Completed</p>
            <p className="text-2xl font-bold text-green-600">3</p>
          </div>
          <div className="bg-white border border-yellow-200 rounded-lg p-4 shadow-sm">
            <p className="text-gray-600 text-sm mb-1">Learning Hours</p>
            <p className="text-2xl font-bold text-green-600">12</p>
          </div>
          <div className="bg-white border border-yellow-200 rounded-lg p-4 shadow-sm">
            <p className="text-gray-600 text-sm mb-1">Certificates Earned</p>
            <p className="text-2xl font-bold text-green-600">2</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-yellow-200 flex gap-6">
          {["courses", "paths"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 font-medium border-b-2 transition-colors capitalize ${
                activeTab === tab
                  ? "border-green-500 text-green-600"
                  : "border-transparent text-gray-600 hover:text-green-600"
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
