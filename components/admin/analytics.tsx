"use client"

import { useEffect, useState } from "react"

export default function Analytics() {
  const [stats, setStats] = useState<any>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      // Fetch all data for analytics
      const [roomsRes, produceRes, billingsRes, farmersRes] = await Promise.all([
        fetch("http://localhost:5000/api/rooms"),
        fetch("http://localhost:5000/api/produce"),
        fetch("http://localhost:5000/api/billing"),
        fetch("http://localhost:5000/api/farmers"),
      ])

      const [rooms, produce, billings, farmers] = await Promise.all([
        roomsRes.json(),
        produceRes.json(),
        billingsRes.json(),
        farmersRes.json(),
      ])

      setStats({
        rooms: Array.isArray(rooms) ? rooms : [],
        produce: Array.isArray(produce) ? produce : [],
        billings: Array.isArray(billings) ? billings : [],
        farmers: Array.isArray(farmers) ? farmers : [],
      })
    } catch (error) {
      console.error("Error fetching analytics:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-gradient-to-r from-primary to-chart-4 rounded-full animate-pulse mx-auto" />
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    )
  }

  const occupancyRate = stats.rooms.length > 0
    ? (stats.rooms.filter((r: any) => r.status === "Occupied").length / stats.rooms.length) * 100
    : 0

  const totalRevenue = stats.billings
    .filter((b: any) => b.status === "Paid")
    .reduce((sum: number, b: any) => sum + (b.amountDue || 0), 0)

  const avgEnergyUsage = stats.billings.length > 0
    ? stats.billings.reduce((sum: number, b: any) => sum + (b.energyUsed || 0), 0) / stats.billings.length
    : 0

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div>
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <span>📈</span> Analytics & Reports
        </h2>
        <p className="text-muted-foreground text-sm mt-1">
          System performance and insights
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-primary/10 to-chart-4/10 border border-primary/20 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-chart-4 rounded-xl flex items-center justify-center">
              <span className="text-2xl">📊</span>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Occupancy Rate</p>
              <p className="text-3xl font-bold bg-gradient-to-r from-primary to-chart-4 bg-clip-text text-transparent">
                {occupancyRate.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-chart-4 rounded-xl flex items-center justify-center">
              <span className="text-2xl">💰</span>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Total Revenue</p>
              <p className="text-3xl font-bold text-primary">
                ${totalRevenue.toFixed(0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-chart-4 rounded-xl flex items-center justify-center">
              <span className="text-2xl">⚡</span>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Avg Energy</p>
              <p className="text-3xl font-bold text-chart-4">
                {avgEnergyUsage.toFixed(0)} kWh
              </p>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-chart-4 rounded-xl flex items-center justify-center">
              <span className="text-2xl">📦</span>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Total Produce</p>
              <p className="text-3xl font-bold text-foreground">
                {stats.produce.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Room Statistics */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <span>🏠</span> Room Statistics
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-primary/5 rounded-xl">
              <span className="text-foreground">Total Rooms</span>
              <span className="font-bold text-primary">{stats.rooms.length}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-chart-4/5 rounded-xl">
              <span className="text-foreground">Occupied</span>
              <span className="font-bold text-chart-4">
                {stats.rooms.filter((r: any) => r.status === "Occupied").length}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-primary/5 rounded-xl">
              <span className="text-foreground">Available</span>
              <span className="font-bold text-primary">
                {stats.rooms.filter((r: any) => r.status === "Available").length}
              </span>
            </div>
          </div>
        </div>

        {/* Produce Statistics */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <span>📦</span> Produce Statistics
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-primary/5 rounded-xl">
              <span className="text-foreground">Fresh</span>
              <span className="font-bold text-primary">
                {stats.produce.filter((p: any) => p.status === "Fresh").length}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-chart-4/5 rounded-xl">
              <span className="text-foreground">Sold</span>
              <span className="font-bold text-chart-4">
                {stats.produce.filter((p: any) => p.status === "Sold").length}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-primary/5 rounded-xl">
              <span className="text-foreground">In Storage</span>
              <span className="font-bold text-primary">
                {stats.produce.filter((p: any) => p.status === "Fresh" || p.status === "Stored").length}
              </span>
            </div>
          </div>
        </div>

        {/* Farmer Activity */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <span>👥</span> Farmer Activity
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-primary/5 rounded-xl">
              <span className="text-foreground">Total Farmers</span>
              <span className="font-bold text-primary">{stats.farmers.length}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-chart-4/5 rounded-xl">
              <span className="text-foreground">Active Farmers</span>
              <span className="font-bold text-chart-4">
                {stats.farmers.filter((f: any) => f.rentedRooms?.length > 0).length}
              </span>
            </div>
          </div>
        </div>

        {/* Revenue Breakdown */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <span>💰</span> Revenue Breakdown
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gradient-to-r from-primary/10 to-chart-4/10 rounded-xl">
              <span className="text-foreground">Paid Invoices</span>
              <span className="font-bold text-primary">
                ${stats.billings
                  .filter((b: any) => b.status === "Paid")
                  .reduce((sum: number, b: any) => sum + (b.amountDue || 0), 0)
                  .toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-chart-4/5 rounded-xl">
              <span className="text-foreground">Pending</span>
              <span className="font-bold text-chart-4">
                ${stats.billings
                  .filter((b: any) => b.status === "Pending")
                  .reduce((sum: number, b: any) => sum + (b.amountDue || 0), 0)
                  .toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
