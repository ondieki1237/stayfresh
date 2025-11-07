"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import DashboardLayout from "@/components/layout/dashboard-layout"
import RoomList from "@/components/dashboard/room-list"
import ProduceOverview from "@/components/dashboard/produce-overview"
import BillingStatus from "@/components/dashboard/billing-status"

interface Farmer {
  _id: string
  firstName: string
  lastName: string
  email: string
  location: string
  phone: string
  rentedRooms?: string[]
  billingCycle?: string
}

export default function Dashboard() {
  const router = useRouter()
  const [farmer, setFarmer] = useState<Farmer | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("rooms")

  useEffect(() => {
    const token = localStorage.getItem("token")
    const farmerId = localStorage.getItem("farmerId")

    if (!token || !farmerId) {
      router.push("/")
      return
    }

    fetchFarmerData(farmerId)
  }, [router])

  const fetchFarmerData = async (farmerId: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/farmers/profile/${farmerId}`, {
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

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-background">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-primary to-chart-4 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
          <span className="text-3xl">🌱</span>
        </div>
        <p className="text-muted-foreground">Loading Stay Fresh...</p>
      </div>
    </div>
  )

  return (
    <DashboardLayout farmer={farmer}>
      <div className="pb-20 space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-br from-primary to-chart-4 rounded-3xl p-6 text-white shadow-xl">
          <h1 className="text-2xl font-bold mb-1">Welcome back! 👋</h1>
          <p className="text-white/80 text-sm">{farmer?.firstName} {farmer?.lastName}</p>
          <div className="flex items-center gap-2 mt-3 text-sm">
            <span className="flex items-center gap-1">
              <span>📍</span>
              {farmer?.location}
            </span>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-card border border-border rounded-2xl p-4 text-center shadow-sm">
            <p className="text-3xl font-bold text-primary mb-1">{farmer?.rentedRooms?.length || 0}</p>
            <p className="text-xs text-muted-foreground">Active Rooms</p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-4 text-center shadow-sm">
            <p className="text-3xl font-bold text-chart-4 mb-1">0</p>
            <p className="text-xs text-muted-foreground">Produce Items</p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-4 text-center shadow-sm">
            <p className="text-3xl font-bold text-foreground mb-1">$0</p>
            <p className="text-xs text-muted-foreground">This Month</p>
          </div>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === "rooms" && farmer && <RoomList farmerId={farmer._id} />}
          {activeTab === "produce" && farmer && <ProduceOverview farmerId={farmer._id} />}
          {activeTab === "billing" && farmer && <BillingStatus farmerId={farmer._id} />}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-2xl">
        <div className="max-w-lg mx-auto px-2 py-3">
          <div className="flex justify-around items-center">
            {[
              { id: "rooms", icon: "🏠", label: "Rooms" },
              { id: "produce", icon: "🥕", label: "Produce" },
              { id: "billing", icon: "💳", label: "Billing" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center gap-1 px-6 py-2 rounded-xl transition-all ${
                  activeTab === tab.id
                    ? "bg-primary text-white shadow-lg scale-105"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span className="text-xl">{tab.icon}</span>
                <span className="text-xs font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
