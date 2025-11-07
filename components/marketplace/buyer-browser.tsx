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
      {/* Search & Filters */}
      <div className="flex gap-4 flex-wrap">
        <input
          type="text"
          placeholder="Search by produce type..."
          className="flex-1 min-w-[250px] bg-[#1a1f26] border border-border text-foreground rounded-lg px-4 py-2"
        />
        <select className="bg-[#1a1f26] border border-border text-foreground rounded-lg px-4 py-2">
          <option>All Conditions</option>
          <option>Fresh</option>
          <option>Excellent</option>
          <option>Good</option>
        </select>
        <select className="bg-[#1a1f26] border border-border text-foreground rounded-lg px-4 py-2">
          <option>Any Region</option>
          <option>North</option>
          <option>South</option>
          <option>East</option>
          <option>West</option>
          <option>Central</option>
        </select>
      </div>

      {/* Listings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {listings.map((listing) => (
          <div
            key={listing.id}
            className="bg-[#1a1f26] border border-border rounded-lg overflow-hidden hover:border-primary transition-colors"
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{listing.image}</span>
                  <div>
                    <h3 className="text-lg font-bold text-foreground">{listing.produce}</h3>
                    <p className="text-muted text-xs">{listing.location}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary">${listing.price}/kg</p>
                  <p className="text-muted text-xs">{listing.quantity}kg available</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                <div className="bg-[#252b33] rounded p-2">
                  <p className="text-muted text-xs">Condition</p>
                  <p className="text-foreground font-medium">{listing.condition}</p>
                </div>
                <div className="bg-[#252b33] rounded p-2">
                  <p className="text-muted text-xs">Storage Age</p>
                  <p className="text-foreground font-medium">{listing.storageTime}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-4 text-xs">
                <span className="text-yellow-400">⭐ {listing.rating}</span>
                <span className="text-muted">({listing.reviews} reviews)</span>
                <span className="text-muted">Farmer: {listing.farmer}</span>
              </div>

              <div className="mb-4 p-3 bg-primary/10 rounded border border-primary/20">
                <p className="text-foreground font-semibold text-sm">Total: ${listing.totalPrice}</p>
                <p className="text-muted text-xs">Order {listing.quantity}kg</p>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 border-border text-foreground hover:bg-[#252b33] bg-transparent"
                >
                  View Details
                </Button>
                <Button className="flex-1 bg-primary hover:bg-primary-dark text-white">Contact Farmer</Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
