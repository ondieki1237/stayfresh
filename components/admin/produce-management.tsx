"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function ProduceManagement() {
  const [produce, setProduce] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<"all" | "Fresh" | "Sold" | "Spoiled">("all")

  useEffect(() => {
    fetchProduce()
  }, [])

  const fetchProduce = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/produce")
      const data = await response.json()
      setProduce(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error fetching produce:", error)
      setProduce([])
    } finally {
      setLoading(false)
    }
  }

  const filteredProduce = produce.filter((item: any) => {
    const searchLower = searchTerm.toLowerCase()
    const matchesSearch = 
      item.produceType?.toLowerCase().includes(searchLower) ||
      item.farmer?.firstName?.toLowerCase().includes(searchLower) ||
      item.farmer?.lastName?.toLowerCase().includes(searchLower)
    const matchesStatus = filterStatus === "all" || item.status === filterStatus
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-gradient-to-r from-primary to-chart-4 rounded-full animate-pulse mx-auto" />
          <p className="text-muted-foreground">Loading produce...</p>
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
            <span>📦</span> Produce Management
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            {produce.length} total item{produce.length !== 1 ? "s" : ""}
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
            placeholder="Search by produce type or farmer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 border-border bg-background focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Status Filter Pills */}
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={() => setFilterStatus("all")}
            className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
              filterStatus === "all"
                ? "bg-gradient-to-r from-primary to-chart-4 text-white shadow-md"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            All Produce ({produce.length})
          </button>
          <button
            onClick={() => setFilterStatus("Fresh")}
            className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
              filterStatus === "Fresh"
                ? "bg-gradient-to-r from-primary to-chart-4 text-white shadow-md"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            ✅ Fresh ({produce.filter(p => p.status === "Fresh").length})
          </button>
          <button
            onClick={() => setFilterStatus("Sold")}
            className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
              filterStatus === "Sold"
                ? "bg-gradient-to-r from-primary to-chart-4 text-white shadow-md"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            💰 Sold ({produce.filter(p => p.status === "Sold").length})
          </button>
          <button
            onClick={() => setFilterStatus("Spoiled")}
            className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
              filterStatus === "Spoiled"
                ? "bg-gradient-to-r from-primary to-chart-4 text-white shadow-md"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            ⚠️ Spoiled ({produce.filter(p => p.status === "Spoiled").length})
          </button>
        </div>
      </div>

      {/* Produce Grid */}
      {filteredProduce.length === 0 ? (
        <div className="bg-card border border-dashed border-border rounded-xl p-12 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-chart-4/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">📦</span>
          </div>
          <p className="text-muted-foreground text-lg">
            {searchTerm || filterStatus !== "all" ? "No produce found matching your filters" : "No produce items yet"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProduce.map((item: any) => (
            <div 
              key={item._id} 
              className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all"
            >
              {/* Produce Header */}
              <div className={`p-5 bg-gradient-to-br ${
                item.status === "Fresh" ? "from-primary/20 to-chart-4/20" :
                item.status === "Sold" ? "from-chart-4/20 to-primary/20" :
                "from-destructive/20 to-destructive/10"
              }`}>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-xl font-bold text-foreground capitalize">
                      {item.produceType}
                    </h3>
                    <p className="text-muted-foreground text-xs mt-1">
                      Farmer: {item.farmer?.firstName} {item.farmer?.lastName}
                    </p>
                  </div>
                  <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${
                    item.status === "Fresh" ? "bg-primary/20 text-primary border-primary/30" :
                    item.status === "Sold" ? "bg-chart-4/20 text-chart-4 border-chart-4/30" :
                    "bg-destructive/20 text-destructive border-destructive/30"
                  }`}>
                    {item.status}
                  </span>
                </div>
              </div>

              {/* Produce Details */}
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-primary/5 p-3 rounded-xl border border-primary/10">
                    <p className="text-muted-foreground text-xs mb-1">Quantity</p>
                    <p className="text-foreground font-bold text-lg">{item.quantity}kg</p>
                  </div>
                  <div className="bg-chart-4/5 p-3 rounded-xl border border-chart-4/10">
                    <p className="text-muted-foreground text-xs mb-1">Room</p>
                    <p className="text-foreground font-bold text-sm">{item.room?.roomNumber || "N/A"}</p>
                  </div>
                </div>

                {item.storageDate && (
                  <div className="text-xs text-muted-foreground">
                    Stored: {new Date(item.storageDate).toLocaleDateString()}
                  </div>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-primary/30 text-primary hover:bg-primary/10 rounded-xl"
                >
                  View Details
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
