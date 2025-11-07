"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"

interface ListingFormProps {
  farmerId: string
}

export default function ListingForm({ farmerId }: ListingFormProps) {
  const [formData, setFormData] = useState({
    produceType: "",
    quantity: "",
    pricePerKg: "",
    condition: "Fresh",
    description: "",
    minOrder: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // In production, submit to backend
      console.log("Listing created:", formData)
      alert("Listing created successfully!")
      setFormData({
        produceType: "",
        quantity: "",
        pricePerKg: "",
        condition: "Fresh",
        description: "",
        minOrder: "",
      })
    } catch (error) {
      console.error("Error creating listing:", error)
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="bg-[#1a1f26] border border-border rounded-lg p-6">
        <h2 className="text-xl font-bold text-foreground mb-6">Create New Listing</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Produce Type */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Produce Type</label>
            <input
              type="text"
              name="produceType"
              value={formData.produceType}
              onChange={handleChange}
              placeholder="e.g., Tomato, Potato"
              required
              className="w-full bg-[#252b33] border border-border text-foreground rounded-lg px-4 py-2"
            />
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Quantity Available (kg)</label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              placeholder="500"
              required
              className="w-full bg-[#252b33] border border-border text-foreground rounded-lg px-4 py-2"
            />
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Price Per Kg ($)</label>
            <input
              type="number"
              name="pricePerKg"
              value={formData.pricePerKg}
              onChange={handleChange}
              placeholder="65"
              required
              className="w-full bg-[#252b33] border border-border text-foreground rounded-lg px-4 py-2"
            />
          </div>

          {/* Condition */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Condition</label>
            <select
              name="condition"
              value={formData.condition}
              onChange={handleChange}
              className="w-full bg-[#252b33] border border-border text-foreground rounded-lg px-4 py-2"
            >
              <option>Fresh</option>
              <option>Excellent</option>
              <option>Good</option>
              <option>Fair</option>
            </select>
          </div>

          {/* Minimum Order */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Minimum Order (kg)</label>
            <input
              type="number"
              name="minOrder"
              value={formData.minOrder}
              onChange={handleChange}
              placeholder="50"
              className="w-full bg-[#252b33] border border-border text-foreground rounded-lg px-4 py-2"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Add details about your produce (storage conditions, harvest date, etc.)"
              rows={4}
              className="w-full bg-[#252b33] border border-border text-foreground rounded-lg px-4 py-2"
            />
          </div>

          {/* Pricing Summary */}
          <div className="bg-[#252b33] border border-border rounded-lg p-4">
            <p className="text-muted text-sm mb-1">Total Value</p>
            <p className="text-2xl font-bold text-primary">
              $
              {(Number.parseInt(formData.quantity || 0) * Number.parseFloat(formData.pricePerKg || 0)).toLocaleString()}
            </p>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1 bg-primary hover:bg-primary-dark text-white">
              Create Listing
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex-1 border-border text-foreground hover:bg-[#252b33] bg-transparent"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
