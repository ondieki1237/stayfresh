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
      <div className="bg-white border-2 border-yellow-200 rounded-lg p-6 shadow-lg">
        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <span className="text-green-600">➕</span>
          Create New Listing
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Produce Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">🥕 Produce Type</label>
            <input
              type="text"
              name="produceType"
              value={formData.produceType}
              onChange={handleChange}
              placeholder="e.g., Tomato, Potato"
              required
              className="w-full bg-white border-2 border-yellow-300 text-gray-800 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">⚖️ Quantity Available (kg)</label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              placeholder="500"
              required
              className="w-full bg-white border-2 border-yellow-300 text-gray-800 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">💰 Price Per Kg (KSH)</label>
            <input
              type="number"
              name="pricePerKg"
              value={formData.pricePerKg}
              onChange={handleChange}
              placeholder="65"
              required
              className="w-full bg-white border-2 border-yellow-300 text-gray-800 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>

          {/* Condition */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">✨ Condition</label>
            <select
              name="condition"
              value={formData.condition}
              onChange={handleChange}
              className="w-full bg-white border-2 border-yellow-300 text-gray-800 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option>Fresh</option>
              <option>Excellent</option>
              <option>Good</option>
              <option>Fair</option>
            </select>
          </div>

          {/* Minimum Order */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">📦 Minimum Order (kg)</label>
            <input
              type="number"
              name="minOrder"
              value={formData.minOrder}
              onChange={handleChange}
              placeholder="50"
              className="w-full bg-white border-2 border-yellow-300 text-gray-800 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">📝 Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Add details about your produce (storage conditions, harvest date, etc.)"
              rows={4}
              className="w-full bg-white border-2 border-yellow-300 text-gray-800 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>

          {/* Pricing Summary */}
          <div className="bg-gradient-to-r from-yellow-100 to-green-100 border-2 border-green-300 rounded-lg p-4 shadow-sm">
            <p className="text-gray-700 text-sm mb-1 font-semibold">💵 Total Value</p>
            <p className="text-3xl font-bold text-green-600">
              KSH {(Number.parseInt(formData.quantity || "0") * Number.parseFloat(formData.pricePerKg || "0")).toLocaleString()}
            </p>
            <p className="text-gray-600 text-xs mt-1">
              {formData.quantity || "0"}kg × KSH {formData.pricePerKg || "0"}/kg
            </p>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1 bg-gradient-to-r from-yellow-400 to-green-500 hover:from-yellow-500 hover:to-green-600 text-white shadow-md">
              Create Listing
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex-1 border-2 border-yellow-400 text-gray-700 hover:bg-yellow-50"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
