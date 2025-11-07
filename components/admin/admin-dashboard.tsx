"use client"

import { useState, useEffect } from "react"

interface AdminDashboardProps {
  stats: any
}

export default function AdminDashboard({ stats }: AdminDashboardProps) {
  const [systemStats, setSystemStats] = useState({
    totalFarmers: 0,
    totalRooms: 0,
    occupiedRooms: 0,
    availableRooms: 0,
    totalProduce: 0,
    totalRevenue: 0,
    activeAlerts: 0,
    pendingBills: 0,
  })

  useEffect(() => {
    if (stats) {
      setSystemStats(stats)
    } else {
      // Fetch stats if not provided
      fetchStats()
    }
  }, [stats])

  const fetchStats = async () => {
    try {
      const [farmersRes, roomsRes, produceRes, billingRes] = await Promise.all([
        fetch("https://www.kisumu.codewithseth.co.ke/api/farmers"),
        fetch("https://www.kisumu.codewithseth.co.ke/api/rooms"),
        fetch("https://www.kisumu.codewithseth.co.ke/api/produce"),
        fetch("https://www.kisumu.codewithseth.co.ke/api/billing"),
      ])

      const [farmers, rooms, produce, billing] = await Promise.all([
        farmersRes.json(),
        roomsRes.json(),
        produceRes.json(),
        billingRes.json(),
      ])

      setSystemStats({
        totalFarmers: Array.isArray(farmers) ? farmers.length : 0,
        totalRooms: Array.isArray(rooms) ? rooms.length : 0,
        occupiedRooms: Array.isArray(rooms) ? rooms.filter((r: any) => r.status === "Occupied").length : 0,
        availableRooms: Array.isArray(rooms) ? rooms.filter((r: any) => r.status === "Available").length : 0,
        totalProduce: Array.isArray(produce) ? produce.length : 0,
        totalRevenue: Array.isArray(billing) 
          ? billing.filter((b: any) => b.status === "Paid").reduce((sum: number, b: any) => sum + (b.amountDue || 0), 0)
          : 0,
        activeAlerts: 0,
        pendingBills: Array.isArray(billing) ? billing.filter((b: any) => b.status === "Pending").length : 0,
      })
    } catch (error) {
      console.error("Error fetching stats:", error)
    }
  }

  const statCards = [
    {
      title: "Total Farmers",
      value: systemStats.totalFarmers,
      icon: "👥",
      gradient: "from-primary to-primary/70",
      bgGradient: "from-primary/20 to-primary/5",
    },
    {
      title: "Total Rooms",
      value: systemStats.totalRooms,
      icon: "🏠",
      gradient: "from-chart-4 to-chart-4/70",
      bgGradient: "from-chart-4/20 to-chart-4/5",
    },
    {
      title: "Occupied Rooms",
      value: systemStats.occupiedRooms,
      icon: "📦",
      gradient: "from-primary to-chart-4",
      bgGradient: "from-primary/10 to-chart-4/10",
    },
    {
      title: "Available Rooms",
      value: systemStats.availableRooms,
      icon: "✅",
      gradient: "from-chart-4 to-primary",
      bgGradient: "from-chart-4/10 to-primary/10",
    },
    {
      title: "Total Produce",
      value: systemStats.totalProduce,
      icon: "🥕",
      gradient: "from-primary to-primary/70",
      bgGradient: "from-primary/20 to-primary/5",
    },
    {
      title: "Revenue (Paid)",
  value: `KSH ${(systemStats.totalRevenue || 0).toFixed(0)}`,
      icon: "💰",
      gradient: "from-chart-4 to-chart-4/70",
      bgGradient: "from-chart-4/20 to-chart-4/5",
    },
    {
      title: "Pending Bills",
      value: systemStats.pendingBills,
      icon: "💳",
      gradient: "from-primary to-chart-4",
      bgGradient: "from-primary/10 to-chart-4/10",
    },
    {
      title: "Active Alerts",
      value: systemStats.activeAlerts,
      icon: "🚨",
      gradient: "from-destructive to-destructive/70",
      bgGradient: "from-destructive/20 to-destructive/5",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, idx) => (
          <div 
            key={idx} 
            className={`bg-gradient-to-br ${stat.bgGradient} border border-border rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all`}
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <p className="text-muted-foreground text-sm mb-2">{stat.title}</p>
                <p className={`text-4xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>
                  {stat.value}
                </p>
              </div>
              <div className={`w-14 h-14 bg-gradient-to-br ${stat.gradient} rounded-xl flex items-center justify-center shadow-md`}>
                <span className="text-2xl">{stat.icon}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
          <span>⚡</span> Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="bg-gradient-to-r from-primary to-chart-4 hover:from-primary/90 hover:to-chart-4/90 text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2">
            <span>➕</span> Add New Room
          </button>
          <button className="bg-gradient-to-r from-chart-4 to-primary hover:from-chart-4/90 hover:to-primary/90 text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2">
            <span>📊</span> Generate Reports
          </button>
          <button className="bg-gradient-to-r from-primary to-chart-4 hover:from-primary/90 hover:to-chart-4/90 text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2">
            <span>📈</span> Update Market Data
          </button>
        </div>
      </div>

      {/* System Health & Revenue Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* System Health */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <span>🏥</span> System Health
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-primary/5 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-chart-4 rounded-lg flex items-center justify-center">
                  <span className="text-lg">🔌</span>
                </div>
                <p className="text-foreground font-medium">API Status</p>
              </div>
              <span className="px-4 py-1.5 bg-primary/20 text-primary rounded-full text-xs font-semibold border border-primary/30">
                ● Operational
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-primary/5 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-chart-4 rounded-lg flex items-center justify-center">
                  <span className="text-lg">💾</span>
                </div>
                <p className="text-foreground font-medium">Database</p>
              </div>
              <span className="px-4 py-1.5 bg-primary/20 text-primary rounded-full text-xs font-semibold border border-primary/30">
                ● Connected
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-primary/5 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-chart-4 rounded-lg flex items-center justify-center">
                  <span className="text-lg">📡</span>
                </div>
                <p className="text-foreground font-medium">Sensor Network</p>
              </div>
              <span className="px-4 py-1.5 bg-primary/20 text-primary rounded-full text-xs font-semibold border border-primary/30">
                ● Active
              </span>
            </div>
          </div>
        </div>

        {/* Revenue Breakdown */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <span>💰</span> Revenue Overview
          </h2>
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-primary/10 to-chart-4/10 p-4 rounded-xl border border-primary/20">
              <p className="text-muted-foreground text-sm mb-1">Total Paid</p>
              <p className="text-3xl font-bold bg-gradient-to-r from-primary to-chart-4 bg-clip-text text-transparent">
                ${(systemStats.totalRevenue || 0).toFixed(2)}
              </p>
            </div>
            <div className="bg-chart-4/5 p-4 rounded-xl border border-chart-4/20">
              <p className="text-muted-foreground text-sm mb-1">Pending Bills</p>
              <p className="text-2xl font-bold text-chart-4">{systemStats.pendingBills} invoices</p>
            </div>
            <div className="bg-primary/5 p-4 rounded-xl border border-primary/20">
              <p className="text-muted-foreground text-sm mb-1">Active Subscriptions</p>
              <p className="text-2xl font-bold text-primary">{systemStats.occupiedRooms} rooms</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
