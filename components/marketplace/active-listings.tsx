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
        <h2 className="text-xl font-bold text-foreground">Your Active Listings</h2>
        <Button className="bg-primary hover:bg-primary-dark text-white">Create New</Button>
      </div>

      {listings.length === 0 ? (
        <div className="bg-[#1a1f26] border border-dashed border-border rounded-lg p-8 text-center">
          <p className="text-muted mb-4">No active listings yet</p>
          <Button className="bg-primary hover:bg-primary-dark text-white">Create First Listing</Button>
        </div>
      ) : (
        <div className="space-y-3">
          {listings.map((listing) => (
            <div key={listing.id} className="bg-[#1a1f26] border border-border rounded-lg p-4">
              <div className="flex justify-between items-start gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <span className="text-4xl">{listing.image}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-bold text-foreground">{listing.produce}</h3>
                      <span className="px-2 py-1 bg-success/20 text-success rounded text-xs font-medium">
                        {listing.status}
                      </span>
                    </div>
                    <p className="text-muted text-sm mb-2">
                      {listing.quantity}kg @ ${listing.pricePerKg}/kg = ${listing.totalValue.toLocaleString()}
                    </p>
                    <div className="flex gap-4 text-muted text-xs">
                      <span>👁️ {listing.views} views</span>
                      <span>💬 {listing.interests} interests</span>
                      <span>✓ {listing.sold}kg sold</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-foreground text-sm mb-3">{listing.createdAt}</p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="border-border text-foreground hover:bg-[#252b33] text-xs bg-transparent"
                    >
                      Edit
                    </Button>
                    <Button className="bg-primary hover:bg-primary-dark text-white text-xs">View Inquiries</Button>
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
