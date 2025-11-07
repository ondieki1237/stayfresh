"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function BillingManagement() {
  const [billings, setBillings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<"all" | "Paid" | "Pending" | "Overdue">("all")

  useEffect(() => {
    fetchBillings()
  }, [])

  const fetchBillings = async () => {
    try {
      const response = await fetch("https://www.kisumu.codewithseth.co.ke/api/billing")
      const data = await response.json()
      setBillings(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error fetching billings:", error)
      setBillings([])
    } finally {
      setLoading(false)
    }
  }

  const filteredBillings = billings.filter((billing: any) => {
    const searchLower = searchTerm.toLowerCase()
    const matchesSearch = 
      billing.farmer?.firstName?.toLowerCase().includes(searchLower) ||
      billing.farmer?.lastName?.toLowerCase().includes(searchLower) ||
      billing.room?.roomNumber?.toLowerCase().includes(searchLower)
    const matchesStatus = filterStatus === "all" || billing.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const totalRevenue = billings
    .filter(b => b.status === "Paid")
    .reduce((sum, b) => sum + (b.amountDue || 0), 0)

  const totalPending = billings
    .filter(b => b.status === "Pending")
    .reduce((sum, b) => sum + (b.amountDue || 0), 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-gradient-to-r from-primary to-chart-4 rounded-full animate-pulse mx-auto" />
          <p className="text-muted-foreground">Loading billing data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <span>💳</span> Billing Management
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            {billings.length} total invoice{billings.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-primary/10 to-chart-4/10 border border-primary/20 rounded-2xl p-5 shadow-sm">
          <p className="text-muted-foreground text-sm mb-2 flex items-center gap-2">
            <span>💰</span> Total Revenue
          </p>
          <p className="text-4xl font-bold bg-gradient-to-r from-primary to-chart-4 bg-clip-text text-transparent">
            ${totalRevenue.toFixed(2)}
          </p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
          <p className="text-muted-foreground text-sm mb-2 flex items-center gap-2">
            <span>⏳</span> Pending
          </p>
          <p className="text-4xl font-bold text-chart-4">
            ${totalPending.toFixed(2)}
          </p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
          <p className="text-muted-foreground text-sm mb-2 flex items-center gap-2">
            <span>📊</span> Total Invoices
          </p>
          <p className="text-4xl font-bold text-foreground">
            {billings.length}
          </p>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-card border border-border rounded-xl p-4 shadow-sm space-y-4">
        {/* Search Bar */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-chart-4 rounded-lg flex items-center justify-center">
            <span className="text-lg">🔍</span>
          </div>
          <Input
            type="text"
            placeholder="Search by farmer or room..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 border-border bg-background focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Status Filter Pills */}
        <div className="flex gap-3 flex-wrap">
          {["all", "Paid", "Pending", "Overdue"].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status as any)}
              className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
                filterStatus === status
                  ? "bg-gradient-to-r from-primary to-chart-4 text-white shadow-md"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {status === "all" ? `All (${billings.length})` : 
               `${status} (${billings.filter(b => b.status === status).length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Billings Table */}
      {filteredBillings.length === 0 ? (
        <div className="bg-card border border-dashed border-border rounded-xl p-12 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-chart-4/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">💳</span>
          </div>
          <p className="text-muted-foreground text-lg">
            {searchTerm || filterStatus !== "all" ? "No billings found matching your filters" : "No billing records yet"}
          </p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gradient-to-r from-primary/10 to-chart-4/10 border-b border-border">
                <tr>
                  <th className="text-left py-4 px-6 text-foreground font-semibold">👤 Farmer</th>
                  <th className="text-left py-4 px-6 text-foreground font-semibold">🏠 Room</th>
                  <th className="text-left py-4 px-6 text-foreground font-semibold">⚡ Energy (kWh)</th>
                  <th className="text-left py-4 px-6 text-foreground font-semibold">💰 Amount</th>
                  <th className="text-left py-4 px-6 text-foreground font-semibold">📅 Due Date</th>
                  <th className="text-left py-4 px-6 text-foreground font-semibold">📊 Status</th>
                  <th className="text-left py-4 px-6 text-foreground font-semibold">⚙️ Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBillings.map((billing: any, idx) => (
                  <tr 
                    key={billing._id} 
                    className={`border-b border-border hover:bg-primary/5 transition-colors ${
                      idx % 2 === 0 ? "bg-card" : "bg-muted/5"
                    }`}
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary to-chart-4 rounded-full flex items-center justify-center text-white font-bold">
                          {billing.farmer?.firstName?.[0]}{billing.farmer?.lastName?.[0]}
                        </div>
                        <div>
                          <p className="text-foreground font-semibold">
                            {billing.farmer?.firstName} {billing.farmer?.lastName}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-foreground font-medium">{billing.room?.roomNumber || "N/A"}</td>
                    <td className="py-4 px-6 text-foreground">{billing.energyUsed || 0} kWh</td>
                    <td className="py-4 px-6">
                      <span className="font-bold text-foreground">${(billing.amountDue || 0).toFixed(2)}</span>
                    </td>
                    <td className="py-4 px-6 text-foreground">
                      {billing.dueDate ? new Date(billing.dueDate).toLocaleDateString() : "N/A"}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${
                        billing.status === "Paid" ? "bg-primary/20 text-primary border-primary/30" :
                        billing.status === "Pending" ? "bg-chart-4/20 text-chart-4 border-chart-4/30" :
                        "bg-destructive/20 text-destructive border-destructive/30"
                      }`}>
                        {billing.status || "Pending"}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex gap-2">
                        <button className="px-3 py-1.5 bg-gradient-to-r from-primary to-chart-4 text-white rounded-lg text-xs font-semibold hover:shadow-md transition-all">
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
