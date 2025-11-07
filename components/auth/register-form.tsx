"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"

interface RegisterFormProps {
  onSuccess: () => void
}

export default function RegisterForm({ onSuccess }: RegisterFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    phone: "",
    location: "",
    farmName: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch("http://localhost:5000/api/farmers/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.message || "Registration failed")
        return
      }

      localStorage.setItem("token", data.token)
      localStorage.setItem("farmerId", data.farmer._id)
      onSuccess()
    } catch (err) {
      setError("Connection error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-4 text-destructive text-sm flex items-start gap-2">
          <span className="text-lg">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="block text-xs font-medium text-foreground">First Name</label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            placeholder="John"
            className="w-full px-3 py-2.5 rounded-xl border border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
            required
          />
        </div>
        <div className="space-y-1">
          <label className="block text-xs font-medium text-foreground">Last Name</label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            placeholder="Doe"
            className="w-full px-3 py-2.5 rounded-xl border border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
            required
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="block text-xs font-medium text-foreground">Email Address</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="farmer@example.com"
          className="w-full px-3 py-2.5 rounded-xl border border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
          required
        />
      </div>

      <div className="space-y-1">
        <label className="block text-xs font-medium text-foreground">Password</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Minimum 6 characters"
          className="w-full px-3 py-2.5 rounded-xl border border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
          required
        />
      </div>

      <div className="space-y-1">
        <label className="block text-xs font-medium text-foreground">Phone</label>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="+1 (555) 000-0000"
          className="w-full px-3 py-2.5 rounded-xl border border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
          required
        />
      </div>

      <div className="space-y-1">
        <label className="block text-xs font-medium text-foreground">Location</label>
        <input
          type="text"
          name="location"
          value={formData.location}
          onChange={handleChange}
          placeholder="City, Region"
          className="w-full px-3 py-2.5 rounded-xl border border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
          required
        />
      </div>

      <div className="space-y-1">
        <label className="block text-xs font-medium text-foreground">Farm Name (Optional)</label>
        <input
          type="text"
          name="farmName"
          value={formData.farmName}
          onChange={handleChange}
          placeholder="Your Farm Name"
          className="w-full px-3 py-2.5 rounded-xl border border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
        />
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-primary to-chart-4 hover:from-primary/90 hover:to-chart-4/90 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all mt-4"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="animate-spin">⏳</span> Creating Account...
          </span>
        ) : (
          "Create Account"
        )}
      </Button>
    </form>
  )
}
