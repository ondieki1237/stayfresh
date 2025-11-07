"use client"

import { useEffect, useState } from "react"
import DashboardLayout from "@/components/layout/dashboard-layout"
import MarketChart from "@/components/market/market-chart"
import PriceComparison from "@/components/market/price-comparison"

export default function MarketInsights() {
  const [farmer, setFarmer] = useState(null)
  const [marketData, setMarketData] = useState<any[]>([])
  const [selectedProduce, setSelectedProduce] = useState("tomato")
  const [region, setRegion] = useState("North")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const farmerId = localStorage.getItem("farmerId")
    if (farmerId) {
      fetchFarmerAndMarketData(farmerId)
    }
  }, [])

  const fetchFarmerAndMarketData = async (farmerId: string) => {
    try {
      const [farmerRes, marketRes] = await Promise.all([
        fetch(`http://localhost:5000/api/farmers/profile/${farmerId}`),
        fetch(`http://localhost:5000/api/market/produce/tomato`),
      ])

      const farmerData = await farmerRes.json()
      const marketDataResp = await marketRes.json()

      setFarmer(farmerData)
      setMarketData(Array.isArray(marketDataResp) ? marketDataResp : [marketDataResp])
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="flex items-center justify-center h-screen text-foreground">Loading...</div>

  const produceOptions = ["tomato", "potato", "onion", "carrot", "cabbage", "beans"]
  const regions = ["North", "South", "East", "West", "Central"]

  return (
    <DashboardLayout farmer={farmer}>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary/10 to-chart-4/10 rounded-2xl p-6 border border-border">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-chart-4 bg-clip-text text-transparent">
            📈 Market Insights & Pricing
          </h1>
          <p className="text-muted-foreground text-sm mt-2">Real-time market data for your region</p>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
            <label className="block text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
              <span>🥕</span> Produce Type
            </label>
            <select
              value={selectedProduce}
              onChange={(e) => setSelectedProduce(e.target.value)}
              className="w-full bg-background border border-border text-foreground rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary focus:border-primary"
            >
              {produceOptions.map((prod) => (
                <option key={prod} value={prod} className="bg-background">
                  {prod.charAt(0).toUpperCase() + prod.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
            <label className="block text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
              <span>📍</span> Region
            </label>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="w-full bg-background border border-border text-foreground rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary focus:border-primary"
            >
              {regions.map((reg) => (
                <option key={reg} value={reg} className="bg-background">
                  {reg}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Main Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart */}
          <div className="lg:col-span-2">
            <MarketChart data={marketData} />
          </div>

          {/* Quick Info */}
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-primary/10 to-chart-4/10 border border-primary/20 rounded-2xl p-5 shadow-sm">
              <p className="text-muted-foreground text-sm mb-2 flex items-center gap-2">
                <span>💰</span> Current Price
              </p>
              <p className="text-4xl font-bold bg-gradient-to-r from-primary to-chart-4 bg-clip-text text-transparent">
                ${marketData[0]?.currentPrice || "0"}
              </p>
              <p className="text-muted-foreground text-xs mt-2">per kg</p>
            </div>

            <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
              <p className="text-muted-foreground text-sm mb-2 flex items-center gap-2">
                <span>📊</span> Market Trend
              </p>
              <div className="flex items-center gap-2">
                <span
                  className={`text-3xl font-bold ${
                    (marketData[0]?.trendPercentage || 0) > 0 ? "text-primary" : "text-destructive"
                  }`}
                >
                  {(marketData[0]?.trendPercentage || 0) > 0 ? "+" : ""}
                  {marketData[0]?.trendPercentage || 0}%
                </span>
                <span className="text-muted-foreground text-xs">vs last week</span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-2xl p-5 shadow-sm">
              <p className="text-muted-foreground text-sm mb-2 flex items-center gap-2">
                <span>📈</span> Demand Level
              </p>
              <p className="text-2xl font-bold text-primary">{marketData[0]?.demand || "Medium"}</p>
            </div>

            <div className="bg-gradient-to-br from-chart-4/5 to-chart-4/10 border border-chart-4/20 rounded-2xl p-5 shadow-sm">
              <p className="text-muted-foreground text-sm mb-2 flex items-center gap-2">
                <span>📦</span> Supply Level
              </p>
              <p className="text-2xl font-bold text-chart-4">{marketData[0]?.supply || "Medium"}</p>
            </div>
          </div>
        </div>

        {/* Price Comparison */}
        <PriceComparison selectedProduce={selectedProduce} />

        {/* Market Recommendations */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <span>💡</span> Smart Recommendations
          </h2>
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-primary/5 to-chart-4/5 rounded-xl border border-primary/10">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-chart-4 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-xl">💡</span>
              </div>
              <div>
                <p className="text-foreground font-semibold">Peak Price Expected</p>
                <p className="text-muted-foreground text-sm mt-1">
                  Market prices are trending upward. Consider waiting 2-3 days for peak prices.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-chart-4/5 to-primary/5 rounded-xl border border-chart-4/10">
              <div className="w-10 h-10 bg-gradient-to-br from-chart-4 to-primary rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-xl">📊</span>
              </div>
              <div>
                <p className="text-foreground font-semibold">High Demand in {region}</p>
                <p className="text-muted-foreground text-sm mt-1">
                  Buyers in {region} region are actively seeking {selectedProduce}. Direct sales available.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-primary/5 to-chart-4/5 rounded-xl border border-primary/10">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-chart-4 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-xl">🎯</span>
              </div>
              <div>
                <p className="text-foreground font-semibold">Optimal Storage Time</p>
                <p className="text-muted-foreground text-sm mt-1">
                  Your {selectedProduce} quality can be maintained for 4-5 more days at current conditions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
