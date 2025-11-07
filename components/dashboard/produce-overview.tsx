"use client"

import { useEffect, useState } from "react"

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

export default function ProduceOverview({ farmerId }: ProduceOverviewProps) {
  const [produce, setProduce] = useState<Produce[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!farmerId) return
    fetchProduce()
  }, [farmerId])

  const fetchProduce = async () => {
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';
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

  if (loading) return <div className="text-muted-foreground">Loading produce...</div>

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-foreground">My Produce</h2>

      {produce.length === 0 ? (
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
      )}
    </div>
  )
}
