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
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';
      const [farmerRes, marketRes] = await Promise.all([
        fetch(`${API_BASE}/farmers/profile/${farmerId}`),
        fetch(`${API_BASE}/market/produce/tomato`),
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
        {/* Header with Brand Colors */}
        <div className="bg-gradient-to-r from-yellow-400 to-green-500 text-white rounded-lg p-6 shadow-lg">
          <h1 className="text-3xl font-bold">
            📈 Market Insights & Pricing
          </h1>
          <p className="text-white/90 text-sm mt-2">Real-time market data for your region</p>
        </div>

        {/* Filters with Brand Colors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white border-2 border-yellow-200 rounded-xl p-4 shadow-sm hover:border-green-300 transition-colors">
            <label className="block text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <span>🥕</span> Produce Type
            </label>
            <select
              value={selectedProduce}
              onChange={(e) => setSelectedProduce(e.target.value)}
              className="w-full bg-white border-2 border-yellow-300 text-gray-800 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              {produceOptions.map((prod) => (
                <option key={prod} value={prod}>
                  {prod.charAt(0).toUpperCase() + prod.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div className="bg-white border-2 border-yellow-200 rounded-xl p-4 shadow-sm hover:border-green-300 transition-colors">
            <label className="block text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <span>📍</span> Region
            </label>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="w-full bg-white border-2 border-yellow-300 text-gray-800 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              {regions.map((reg) => (
                <option key={reg} value={reg}>
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

          {/* Quick Info with Brand Colors */}
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-yellow-100 to-green-100 border-2 border-green-300 rounded-2xl p-5 shadow-lg">
              <p className="text-gray-700 text-sm mb-2 flex items-center gap-2">
                <span>💰</span> Current Price
              </p>
              <p className="text-4xl font-bold text-green-600">
                KSH {marketData[0]?.currentPrice || "0"}
              </p>
              <p className="text-gray-600 text-xs mt-2">per kg</p>
            </div>

            <div className="bg-white border-2 border-yellow-200 rounded-2xl p-5 shadow-md">
              <p className="text-gray-700 text-sm mb-2 flex items-center gap-2">
                <span>📊</span> Market Trend
              </p>
              <div className="flex items-center gap-2">
                <span
                  className={`text-3xl font-bold ${
                    (marketData[0]?.trendPercentage || 0) > 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {(marketData[0]?.trendPercentage || 0) > 0 ? "+" : ""}
                  {marketData[0]?.trendPercentage || 0}%
                </span>
                <span className="text-gray-600 text-xs">vs last week</span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-300 rounded-2xl p-5 shadow-md">
              <p className="text-gray-700 text-sm mb-2 flex items-center gap-2">
                <span>📈</span> Demand Level
              </p>
              <p className="text-2xl font-bold text-green-600">{marketData[0]?.demand || "Medium"}</p>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-300 rounded-2xl p-5 shadow-md">
              <p className="text-gray-700 text-sm mb-2 flex items-center gap-2">
                <span>📦</span> Supply Level
              </p>
              <p className="text-2xl font-bold text-yellow-600">{marketData[0]?.supply || "Medium"}</p>
            </div>
          </div>
        </div>

        {/* Price Comparison */}
        <PriceComparison selectedProduce={selectedProduce} />

        {/* Market Recommendations with Brand Colors */}
        <div className="bg-white border-2 border-yellow-200 rounded-2xl p-6 shadow-lg">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span>💡</span> Smart Recommendations
          </h2>
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-yellow-100 to-green-100 rounded-xl border-2 border-green-300 shadow-sm">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-green-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md">
                <span className="text-xl">💡</span>
              </div>
              <div>
                <p className="text-gray-800 font-semibold">Peak Price Expected</p>
                <p className="text-gray-600 text-sm mt-1">
                  Market prices are trending upward. Consider waiting 2-3 days for peak prices.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-green-100 to-yellow-100 rounded-xl border-2 border-yellow-300 shadow-sm">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-yellow-400 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md">
                <span className="text-xl">📊</span>
              </div>
              <div>
                <p className="text-gray-800 font-semibold">High Demand in {region}</p>
                <p className="text-gray-600 text-sm mt-1">
                  Buyers in {region} region are actively seeking {selectedProduce}. Direct sales available.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-yellow-100 to-green-100 rounded-xl border-2 border-green-300 shadow-sm">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-green-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md">
                <span className="text-xl">🎯</span>
              </div>
              <div>
                <p className="text-gray-800 font-semibold">Optimal Storage Time</p>
                <p className="text-gray-600 text-sm mt-1">
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
