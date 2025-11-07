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
    <div className="bg-white border-2 border-yellow-200 rounded-lg p-6 shadow-lg">
      <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
        <span className="text-green-600">🌍</span>
        Regional Price Comparison
      </h2>

      <div className="space-y-4">
        {regionPrices.map((item) => {
          const percentage = (item.price / maxPrice) * 100
          const isHighest = item.price === maxPrice
          return (
            <div 
              key={item.region}
              className={`p-4 rounded-lg border-2 transition-all ${
                isHighest 
                  ? "bg-gradient-to-r from-yellow-50 to-green-50 border-green-300 shadow-md" 
                  : "bg-white border-yellow-200"
              }`}
            >
              <div className="flex justify-between items-center mb-2">
                <p className="text-gray-800 font-semibold flex items-center gap-2">
                  <span className={isHighest ? "text-green-600" : "text-gray-600"}>📍</span>
                  {item.region}
                  {isHighest && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-bold border border-green-300">
                      Best Price
                    </span>
                  )}
                </p>
                <div className="text-right">
                  <p className={`font-bold text-lg ${isHighest ? "text-green-600" : "text-gray-800"}`}>
                    KSH {item.price}/kg
                  </p>
                  <p className="text-gray-600 text-xs flex items-center gap-1 justify-end">
                    <span>👥</span>
                    {item.buyerCount} active buyers
                  </p>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-yellow-400 to-green-500 rounded-full h-full transition-all shadow-sm"
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-4 p-4 bg-gradient-to-r from-yellow-50 to-green-50 rounded-lg border border-yellow-200">
        <p className="text-sm text-gray-700 flex items-center gap-2">
          <span className="text-green-600">💡</span>
          <span className="font-semibold">Tip:</span>
          Higher buyer count indicates better selling opportunities
        </p>
      </div>
    </div>
  )
}
