"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import DashboardLayout from "@/components/layout/dashboard-layout"
import RoomList from "@/components/dashboard/room-list"

export default function MyRoomsPage() {
  const [farmer, setFarmer] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const farmerId = localStorage.getItem("farmerId")
    const token = localStorage.getItem("token")

    if (!farmerId || !token) {
      router.push("/")
      return
    }

    fetchFarmerData(farmerId)
  }, [router])

  const fetchFarmerData = async (farmerId: string) => {
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';
      const response = await fetch(`${API_BASE}/farmers/profile/${farmerId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      const data = await response.json()
      setFarmer(data)
    } catch (error) {
      console.error("Error fetching farmer data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-green-500 rounded-full animate-pulse mx-auto" />
          <p className="text-gray-600">Loading your rooms...</p>
        </div>
      </div>
    )
  }

  return (
    <DashboardLayout farmer={farmer}>
      <div className="space-y-6">
        {/* Header with Brand Colors */}
        <div className="bg-gradient-to-r from-yellow-400 to-green-500 text-white rounded-lg p-6 shadow-lg">
          <h1 className="text-3xl font-bold">My Rooms</h1>
          <p className="text-white/90 text-sm mt-1">Manage your rented cold storage rooms</p>
        </div>

        {/* Room List */}
        <RoomList farmerId={(farmer as any)?._id || ""} />
      </div>
    </DashboardLayout>
  )
}
