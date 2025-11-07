"use client"

interface PriceComparisonProps {
  selectedProduce: string
}

export default function PriceComparison({ selectedProduce }: PriceComparisonProps) {
  const regionPrices = [
    { region: "North", price: 62, buyerCount: 12 },
    { region: "South", price: 58, buyerCount: 8 },
    { region: "East", price: 65, buyerCount: 15 },
    { region: "West", price: 60, buyerCount: 10 },
    { region: "Central", price: 64, buyerCount: 11 },
  ]

  const maxPrice = Math.max(...regionPrices.map((r) => r.price))

  return (
    <div className="bg-[#1a1f26] border border-border rounded-lg p-6">
      <h2 className="text-lg font-bold text-foreground mb-4">Regional Price Comparison</h2>

      <div className="space-y-4">
        {regionPrices.map((item) => {
          const percentage = (item.price / maxPrice) * 100
          return (
            <div key={item.region}>
              <div className="flex justify-between items-center mb-2">
                <p className="text-foreground font-medium">{item.region}</p>
                <div className="text-right">
                  <p className="text-primary font-bold">${item.price}/kg</p>
                  <p className="text-muted text-xs">{item.buyerCount} active buyers</p>
                </div>
              </div>
              <div className="w-full bg-[#252b33] rounded-full h-2 overflow-hidden">
                <div
                  className="bg-primary rounded-full h-full transition-all"
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
