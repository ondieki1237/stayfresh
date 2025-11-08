"use client"

import { useEffect, useState } from "react"
import { API_BASE } from "@/lib/api"
import { Badge } from "@/components/ui/badge"

interface ProduceOverviewProps {
  farmerId: string
}

interface Produce {
  _id: string
  produceType: string
  quantity: number
  currentMarketPrice: number
  condition: string
  sold: boolean
  variety?: string
}

interface Stocking {
  _id: string
  produceType: string
  quantity: number
  targetPrice: number
  currentMarketPrice: number
  condition: string
  status: string
  approvalStatus: string
  estimatedValue: number
  room: {
    roomNumber: string
  }
  stockedAt: string
  approvedAt?: string
}

export default function ProduceOverview({ farmerId }: ProduceOverviewProps) {
  const [produce, setProduce] = useState<Produce[]>([])
  const [stockings, setStockings] = useState<Stocking[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<"stockings" | "legacy">("stockings")

  useEffect(() => {
    if (!farmerId) return
    fetchProduce()
    fetchStockings()
  }, [farmerId])

  const fetchProduce = async () => {
    try {
      const response = await fetch(`${API_BASE}/produce/farmer/${farmerId}`)
      const data = await response.json()
      setProduce(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error fetching produce:", error)
      setProduce([])
    } finally {
      setLoading(false)
    }
  }

  const fetchStockings = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_BASE}/stocking/farmer/${farmerId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await response.json()
      setStockings(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error fetching stockings:", error)
      setStockings([])
    }
  }

  if (loading) return <div className="text-muted-foreground">Loading produce...</div>

  const approvedStockings = stockings.filter(s => s.approvalStatus === "Approved")
  const pendingStockings = stockings.filter(s => s.approvalStatus === "Pending")
  const rejectedStockings = stockings.filter(s => s.approvalStatus === "Rejected")

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-foreground">My Produce</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setView("stockings")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              view === "stockings"
                ? "bg-primary text-white"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            Stockings ({stockings.length})
          </button>
          <button
            onClick={() => setView("legacy")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              view === "legacy"
                ? "bg-primary text-white"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            Legacy ({produce.length})
          </button>
        </div>
      </div>

      {view === "stockings" ? (
        <>
          {/* Stockings Summary */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Approved</p>
              <p className="text-2xl font-bold text-green-600">{approvedStockings.length}</p>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{pendingStockings.length}</p>
            </div>
            <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Rejected</p>
              <p className="text-2xl font-bold text-red-600">{rejectedStockings.length}</p>
            </div>
          </div>

          {stockings.length === 0 ? (
            <div className="bg-card border-2 border-dashed border-border rounded-lg p-8 text-center">
              <p className="text-muted-foreground">No bookings yet. Book your first stocking!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {stockings.map((item) => (
                <div
                  key={item._id}
                  className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-lg">{item.produceType}</h3>
                      <p className="text-sm text-muted-foreground">Room {item.room?.roomNumber}</p>
                    </div>
                    <div className="flex gap-2">
                      <Badge
                        variant={
                          item.approvalStatus === "Approved"
                            ? "default"
                            : item.approvalStatus === "Pending"
                            ? "secondary"
                            : "destructive"
                        }
                        className={
                          item.approvalStatus === "Approved"
                            ? "bg-green-600"
                            : item.approvalStatus === "Pending"
                            ? "bg-yellow-600"
                            : ""
                        }
                      >
                        {item.approvalStatus}
                      </Badge>
                      <Badge variant="outline">{item.status}</Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">Quantity</p>
                      <p className="font-semibold">{item.quantity} kg</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Condition</p>
                      <p className="font-semibold">{item.condition}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Target Price</p>
                      <p className="font-semibold text-green-600">
                        KSH {item.targetPrice.toLocaleString()}/kg
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Total Value</p>
                      <p className="font-semibold text-primary">
                        KSH {item.estimatedValue.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {item.approvedAt && (
                    <p className="text-xs text-muted-foreground mt-3">
                      Approved: {new Date(item.approvedAt).toLocaleDateString()}
                    </p>
                  )}
                  {!item.approvedAt && item.approvalStatus === "Pending" && (
                    <p className="text-xs text-yellow-600 mt-3">
                      ⏳ Waiting for admin approval
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        // Legacy produce view
        produce.length === 0 ? (
          <div className="bg-card border-2 border-dashed border-border rounded-lg p-8 text-center">
            <p className="text-muted-foreground">No produce stored yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto bg-card border border-border rounded-lg">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Type</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Quantity</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Current Price</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Condition</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {produce.map((item) => (
                  <tr key={item._id} className="border-b border-border hover:bg-primary/5 transition-colors">
                    <td className="py-3 px-4 text-foreground font-medium">
                      {item.produceType}
                      {item.variety && <span className="text-muted-foreground text-xs ml-2">({item.variety})</span>}
                    </td>
                    <td className="py-3 px-4 text-foreground">{item.quantity}kg</td>
                    <td className="py-3 px-4 text-foreground font-semibold">${item.currentMarketPrice}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          item.condition === "Fresh" 
                            ? "bg-primary/20 text-primary" 
                            : item.condition === "Good"
                            ? "bg-chart-4/20 text-chart-4"
                            : "bg-destructive/20 text-destructive"
                        }`}
                      >
                        {item.condition}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-xs font-medium ${item.sold ? 'text-muted-foreground' : 'text-primary'}`}>
                        {item.sold ? "✓ Sold" : "📦 In Storage"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  )
}
