"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import AdminLayout from "@/components/layout/admin-layout"
import AdminDashboard from "@/components/admin/admin-dashboard"
import FarmersList from "@/components/admin/farmers-list"
import RoomsManagement from "@/components/admin/rooms-management"

export default function AdminPage() {
  const router = useRouter()
  const [adminData, setAdminData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    const token = localStorage.getItem("token")
    const userEmail = localStorage.getItem("userEmail")

    // Check if user is admin
    const isAdmin = userEmail === "admin@coldchain.com" || userEmail === "superuser@coldchain.com"

    if (!token || !isAdmin) {
      router.push("/")
      return
    }

    fetchAdminData()
  }, [router])

  const fetchAdminData = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/admin/stats", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      
      if (response.ok) {
        const data = await response.json()
        setAdminData(data)
      }
    } catch (error) {
      console.error("Error fetching admin data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-background">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-primary to-chart-4 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
          <span className="text-3xl">🔐</span>
        </div>
        <p className="text-muted-foreground">Loading Admin Panel...</p>
      </div>
    </div>
  )

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-br from-primary to-chart-4 rounded-3xl p-6 text-white shadow-xl">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard 🔐</h1>
          <p className="text-white/80 text-sm">Manage all cold chain operations</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 bg-muted/30 p-1 rounded-xl">
          {["overview", "farmers", "rooms"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 font-medium rounded-lg transition-all ${
                activeTab === tab
                  ? "bg-primary text-white shadow-md"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab === "overview" && "📊 Overview"}
              {tab === "farmers" && "👥 Farmers"}
              {tab === "rooms" && "🏠 Rooms"}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === "overview" && <AdminDashboard stats={adminData} />}
          {activeTab === "farmers" && <FarmersList />}
          {activeTab === "rooms" && <RoomsManagement />}
        </div>
      </div>
    </AdminLayout>
  )
}
