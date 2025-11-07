"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import AdminLayout from "@/components/layout/admin-layout"
import AdminDashboard from "@/components/admin/admin-dashboard"
import FarmersList from "@/components/admin/farmers-list"
import RoomsManagement from "@/components/admin/rooms-management"
import ProduceManagement from "@/components/admin/produce-management"
import BillingManagement from "@/components/admin/billing-management"
import SensorsManagement from "@/components/admin/sensors-management"
import Analytics from "@/components/admin/analytics"
import Settings from "@/components/admin/settings"
import ChamaManagement from "@/components/admin/chama-management"

export default function AdminPage() {
  const router = useRouter()
  const [adminData, setAdminData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    const token = localStorage.getItem("token")
    const userEmail = localStorage.getItem("userEmail")

    // Check if user is admin
    const isAdmin = userEmail === "admin@stayfresh.com" || userEmail === "superuser@stayfresh.com"

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

  const tabs = [
    { id: "overview", icon: "📊", label: "Overview" },
    { id: "farmers", icon: "👥", label: "Farmers" },
    { id: "rooms", icon: "🏠", label: "Rooms" },
    { id: "chamas", icon: "👭", label: "Chamas" },
    { id: "produce", icon: "📦", label: "Produce" },
    { id: "billing", icon: "💳", label: "Billing" },
    { id: "sensors", icon: "📡", label: "Sensors" },
    { id: "analytics", icon: "📈", label: "Analytics" },
    { id: "settings", icon: "⚙️", label: "Settings" },
  ]

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-background">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-primary to-chart-4 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
          <span className="text-3xl">🌱</span>
        </div>
        <p className="text-muted-foreground">Loading Stay Fresh Admin...</p>
      </div>
    </div>
  )

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-br from-primary to-chart-4 rounded-3xl p-6 text-white shadow-xl">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <span>🌱</span> Stay Fresh Admin
          </h1>
          <p className="text-white/80 text-sm">Manage all cold storage operations</p>
        </div>

        {/* Tabs - Responsive Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-9 gap-2 bg-muted/30 p-2 rounded-xl">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center gap-2 py-3 px-2 font-medium rounded-lg transition-all ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-primary to-chart-4 text-white shadow-md scale-105"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <span className="text-2xl">{tab.icon}</span>
              <span className="text-xs">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === "overview" && <AdminDashboard stats={adminData} />}
          {activeTab === "farmers" && <FarmersList />}
          {activeTab === "rooms" && <RoomsManagement />}
          {activeTab === "chamas" && <ChamaManagement />}
          {activeTab === "produce" && <ProduceManagement />}
          {activeTab === "billing" && <BillingManagement />}
          {activeTab === "sensors" && <SensorsManagement />}
          {activeTab === "analytics" && <Analytics />}
          {activeTab === "settings" && <Settings />}
        </div>
      </div>
    </AdminLayout>
  )
}
