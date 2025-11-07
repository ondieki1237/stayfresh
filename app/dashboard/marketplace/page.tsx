"use client"

import { useEffect, useState } from "react"
import DashboardLayout from "@/components/layout/dashboard-layout"
import ListingForm from "@/components/marketplace/listing-form"
import ActiveListings from "@/components/marketplace/active-listings"
import BuyerBrowser from "@/components/marketplace/buyer-browser"

export default function Marketplace() {
  const [farmer, setFarmer] = useState(null)
  const [activeTab, setActiveTab] = useState("browse")
  const [listings, setListings] = useState([])
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
          <h1 className="text-3xl font-bold text-balance">Marketplace</h1>
          <p className="text-white/90 text-sm mt-1">Connect directly with buyers for your produce</p>
        </div>

        {/* Tabs */}
        <div className="border-b border-yellow-200 flex gap-6">
          {["browse", "create", "mylistings"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 font-medium border-b-2 transition-colors capitalize ${
                activeTab === tab
                  ? "border-green-500 text-green-600"
                  : "border-transparent text-gray-600 hover:text-green-600"
              }`}
            >
              {tab === "browse" && "🔍 Browse"}
              {tab === "create" && "➕ Create Listing"}
              {tab === "mylistings" && "📋 My Listings"}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === "browse" && <BuyerBrowser />}
          {activeTab === "create" && <ListingForm farmerId={(farmer as any)?._id} />}
          {activeTab === "mylistings" && <ActiveListings farmerId={(farmer as any)?._id} />}
        </div>
      </div>
    </DashboardLayout>
  )
}
