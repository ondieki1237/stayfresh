"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

interface ActiveListingsProps {
  farmerId: string
}

export default function ActiveListings({ farmerId }: ActiveListingsProps) {
  // Mock active listings
  const [listings] = useState([
    {
      id: 1,
      produce: "Tomato",
      quantity: 500,
      pricePerKg: 62,
      totalValue: 31000,
      condition: "Fresh",
      status: "Active",
      views: 24,
      interests: 5,
      createdAt: "2 days ago",
      sold: 0,
      image: "🍅",
    },
    {
      id: 2,
      produce: "Potato",
      quantity: 800,
      pricePerKg: 58,
      totalValue: 46400,
      condition: "Excellent",
      status: "Active",
      views: 18,
      interests: 3,
      createdAt: "1 day ago",
      sold: 200,
      image: "🥔",
    },
  ])

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <span className="text-green-600">📋</span>
          Your Active Listings
        </h2>
        <Button className="bg-gradient-to-r from-yellow-400 to-green-500 hover:from-yellow-500 hover:to-green-600 text-white shadow-md">
          Create New
        </Button>
      </div>

      {listings.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-yellow-300 rounded-lg p-8 text-center">
          <div className="text-6xl mb-4">📦</div>
          <p className="text-gray-600 mb-4">No active listings yet</p>
          <Button className="bg-gradient-to-r from-yellow-400 to-green-500 hover:from-yellow-500 hover:to-green-600 text-white shadow-md">
            Create First Listing
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {listings.map((listing) => (
            <div key={listing.id} className="bg-white border-2 border-yellow-200 rounded-lg p-4 hover:border-green-300 hover:shadow-lg transition-all">
              <div className="flex justify-between items-start gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-14 h-14 bg-gradient-to-br from-yellow-100 to-green-100 rounded-lg flex items-center justify-center text-3xl">
                    {listing.image}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-bold text-gray-800">{listing.produce}</h3>
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold border border-green-300">
                        {listing.status}
                      </span>
                    </div>
                    <p className="text-gray-700 text-sm mb-2 font-semibold">
                      {listing.quantity}kg @ KSH {listing.pricePerKg}/kg = KSH {listing.totalValue.toLocaleString()}
                    </p>
                    <div className="flex gap-4 text-gray-600 text-xs bg-gradient-to-r from-yellow-50 to-green-50 p-2 rounded border border-yellow-200">
                      <span className="flex items-center gap-1">👁️ {listing.views} views</span>
                      <span className="flex items-center gap-1">💬 {listing.interests} interests</span>
                      <span className="flex items-center gap-1">✓ {listing.sold}kg sold</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-gray-600 text-sm mb-3">{listing.createdAt}</p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="border-2 border-yellow-400 text-gray-700 hover:bg-yellow-50 text-xs"
                    >
                      Edit
                    </Button>
                    <Button className="bg-gradient-to-r from-yellow-400 to-green-500 hover:from-yellow-500 hover:to-green-600 text-white text-xs shadow-md">
                      View Inquiries
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
