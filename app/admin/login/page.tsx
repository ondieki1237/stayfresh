"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export default function AdminLogin() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      // Admin login (in production, use a separate endpoint)
      localStorage.setItem("isAdmin", "true")
      localStorage.setItem("token", "admin-token")
      router.push("/admin")
    } catch (err) {
      setError("Login failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-chart-4/5 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-chart-4 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-3xl">🌱</span>
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-chart-4 bg-clip-text text-transparent mb-2">
            Stay Fresh
          </h1>
          <p className="text-muted-foreground">Admin Portal</p>
        </div>

        <div className="bg-card p-6 rounded-2xl border border-border shadow-xl space-y-4">
          {error && (
            <div className="bg-destructive/20 border border-destructive rounded-lg p-3 text-destructive text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Admin Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="admin@stayfresh.com"
                required
                className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-primary to-chart-4 hover:from-primary/90 hover:to-chart-4/90 text-white font-semibold py-3 rounded-lg shadow-md hover:shadow-lg transition-all"
            >
              {loading ? "Logging in..." : "Login to Admin"}
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Authorized personnel only
        </p>
      </div>
    </main>
  )
}
