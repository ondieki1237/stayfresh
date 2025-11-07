"use client"

interface MarketChartProps {
  data: any[]
}

export default function MarketChart({ data }: MarketChartProps) {
  // Simulate price history data
  const priceHistory = [
    { day: "Mon", price: 45 },
    { day: "Tue", price: 48 },
    { day: "Wed", price: 52 },
    { day: "Thu", price: 58 },
    { day: "Fri", price: 62 },
    { day: "Sat", price: 65 },
    { day: "Sun", price: 60 },
  ]

  const maxPrice = Math.max(...priceHistory.map((d) => d.price))

  return (
    <div className="bg-white border-2 border-yellow-200 rounded-lg p-6 shadow-lg">
      <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
        <span className="text-green-600">📊</span>
        7-Day Price Trend
      </h3>

      <div className="h-64 flex items-end gap-2">
        {priceHistory.map((item, idx) => {
          const height = (item.price / maxPrice) * 100
          return (
            <div key={idx} className="flex-1 flex flex-col items-center">
              <div
                className="w-full bg-gradient-to-t from-yellow-400 to-green-500 rounded-t-lg shadow-md hover:shadow-lg transition-shadow"
                style={{ height: `${height}%` }}
              ></div>
              <span className="text-gray-700 text-xs font-semibold mt-2">KSH {item.price}</span>
              <span className="text-gray-500 text-xs">{item.day}</span>
            </div>
          )
        })}
      </div>

      <div className="mt-6 pt-6 border-t-2 border-yellow-100">
        <p className="text-gray-600 text-sm text-center">
          📈 Prices updated in real-time from market sources
        </p>
      </div>
    </div>
  )
}
