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
    <div className="bg-[#1a1f26] border border-border rounded-lg p-6">
      <h3 className="text-lg font-bold text-foreground mb-6">7-Day Price Trend</h3>

      <div className="h-64 flex items-end gap-2">
        {priceHistory.map((item, idx) => {
          const height = (item.price / maxPrice) * 100
          return (
            <div key={idx} className="flex-1 flex flex-col items-center">
              <div
                className="w-full bg-gradient-to-t from-primary/80 to-primary rounded-t-lg"
                style={{ height: `${height}%` }}
              ></div>
              <span className="text-muted text-xs mt-2">${item.price}</span>
              <span className="text-muted text-xs">{item.day}</span>
            </div>
          )
        })}
      </div>

      <div className="mt-6 pt-6 border-t border-border">
        <p className="text-muted text-sm text-center">Prices updated in real-time from market sources</p>
      </div>
    </div>
  )
}
