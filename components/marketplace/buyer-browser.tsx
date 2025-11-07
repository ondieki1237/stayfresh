"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

export default function BuyerBrowser() {
  const [selectedListing, setSelectedListing] = useState(null)

  // Mock marketplace listings
  const listings = [
    {
      id: 1,
      farmer: "John Doe",
      location: "North Region",
      produce: "Tomato",
      quantity: 500,
      price: 65,
      totalPrice: 32500,
      condition: "Fresh",
      storageTime: "2 days",
      rating: 4.8,
      reviews: 24,
      image: "🍅",
    },
    {
      id: 2,
      farmer: "Mary Smith",
      location: "East Region",
      produce: "Potato",
      quantity: 800,
      price: 58,
      totalPrice: 46400,
      condition: "Excellent",
      storageTime: "1 day",
      rating: 4.9,
      reviews: 18,
      image: "🥔",
    },
    {
      id: 3,
      farmer: "Ahmed Hassan",
      location: "Central Region",
      produce: "Carrot",
      quantity: 300,
      price: 45,
      totalPrice: 13500,
      condition: "Good",
      storageTime: "3 days",
      rating: 4.6,
      reviews: 12,
      image: "🥕",
    },
    {
      id: 4,
      farmer: "Sarah Johnson",
      location: "West Region",
      produce: "Onion",
      quantity: 600,
      price: 40,
      totalPrice: 24000,
      condition: "Good",
      storageTime: "4 days",
      rating: 4.7,
      reviews: 15,
      image: "🧅",
    },
  ]

  return (
    <div className="space-y-4">
      {/* Search & Filters with Brand Colors */}
      <div className="flex gap-4 flex-wrap">
        <input
          type="text"
          placeholder="🔍 Search by produce type..."
          className="flex-1 min-w-[250px] bg-white border-2 border-yellow-300 text-gray-800 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 placeholder:text-gray-500"
        />
        <select className="bg-white border-2 border-yellow-300 text-gray-800 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500">
          <option>All Conditions</option>
          <option>Fresh</option>
          <option>Excellent</option>
          <option>Good</option>
        </select>
        <select className="bg-white border-2 border-yellow-300 text-gray-800 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500">
          <option>Any Region</option>
          <option>North</option>
          <option>South</option>
          <option>East</option>
          <option>West</option>
          <option>Central</option>
        </select>
      </div>

      {/* Listings Grid with Brand Colors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {listings.map((listing) => (
          <div
            key={listing.id}
            className="bg-white border-2 border-yellow-200 rounded-lg overflow-hidden hover:border-green-400 hover:shadow-xl transition-all"
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 bg-gradient-to-br from-yellow-100 to-green-100 rounded-full flex items-center justify-center text-3xl">
                    {listing.image}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">{listing.produce}</h3>
                    <p className="text-gray-600 text-xs flex items-center gap-1">
                      📍 {listing.location}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">KSH {listing.price}/kg</p>
                  <p className="text-gray-600 text-xs">{listing.quantity}kg available</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                <div className="bg-gradient-to-r from-yellow-50 to-green-50 border border-yellow-200 rounded p-2">
                  <p className="text-gray-600 text-xs">Condition</p>
                  <p className="text-gray-800 font-semibold">{listing.condition}</p>
                </div>
                <div className="bg-gradient-to-r from-green-50 to-yellow-50 border border-green-200 rounded p-2">
                  <p className="text-gray-600 text-xs">Storage Age</p>
                  <p className="text-gray-800 font-semibold">{listing.storageTime}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-4 text-xs bg-yellow-50 p-2 rounded border border-yellow-200">
                <span className="text-yellow-500">⭐ {listing.rating}</span>
                <span className="text-gray-600">({listing.reviews} reviews)</span>
                <span className="text-gray-700">👤 {listing.farmer}</span>
              </div>

              <div className="mb-4 p-3 bg-gradient-to-r from-yellow-100 to-green-100 rounded border-2 border-green-300 shadow-sm">
                <p className="text-gray-800 font-bold text-sm">Total: KSH {listing.totalPrice.toLocaleString()}</p>
                <p className="text-gray-700 text-xs">Order {listing.quantity}kg</p>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 border-2 border-yellow-400 text-gray-700 hover:bg-yellow-50"
                >
                  View Details
                </Button>
                <Button className="flex-1 bg-gradient-to-r from-yellow-400 to-green-500 hover:from-yellow-500 hover:to-green-600 text-white shadow-md">
                  Contact Farmer
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
