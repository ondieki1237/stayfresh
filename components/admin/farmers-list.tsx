"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function FarmersList() {
  const [farmers, setFarmers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchFarmers()
  }, [])

  const fetchFarmers = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/farmers")
      const data = await response.json()
      setFarmers(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error fetching farmers:", error)
      setFarmers([])
    } finally {
      setLoading(false)
    }
  }

  const filteredFarmers = farmers.filter((farmer: any) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      farmer.firstName?.toLowerCase().includes(searchLower) ||
      farmer.lastName?.toLowerCase().includes(searchLower) ||
      farmer.email?.toLowerCase().includes(searchLower) ||
      farmer.location?.toLowerCase().includes(searchLower)
    )
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-gradient-to-r from-primary to-chart-4 rounded-full animate-pulse mx-auto" />
          <p className="text-muted-foreground">Loading farmers...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <span>👥</span> All Farmers
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            {farmers.length} registered farmer{farmers.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button className="bg-gradient-to-r from-primary to-chart-4 hover:from-primary/90 hover:to-chart-4/90 text-white font-semibold shadow-md hover:shadow-lg transition-all">
          <span className="mr-2">➕</span> Add Farmer
        </Button>
      </div>

      {/* Search Bar */}
      <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-chart-4 rounded-lg flex items-center justify-center">
            <span className="text-lg">🔍</span>
          </div>
          <Input
            type="text"
            placeholder="Search farmers by name, email, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 border-border bg-background focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Farmers Table */}
      {filteredFarmers.length === 0 ? (
        <div className="bg-card border border-dashed border-border rounded-xl p-12 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-chart-4/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">👥</span>
          </div>
          <p className="text-muted-foreground text-lg">
            {searchTerm ? "No farmers found matching your search" : "No farmers registered yet"}
          </p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gradient-to-r from-primary/10 to-chart-4/10 border-b border-border">
                <tr>
                  <th className="text-left py-4 px-6 text-foreground font-semibold">👤 Farmer</th>
                  <th className="text-left py-4 px-6 text-foreground font-semibold">📧 Email</th>
                  <th className="text-left py-4 px-6 text-foreground font-semibold">📍 Location</th>
                  <th className="text-left py-4 px-6 text-foreground font-semibold">🏠 Rooms</th>
                  <th className="text-left py-4 px-6 text-foreground font-semibold">📊 Status</th>
                  <th className="text-left py-4 px-6 text-foreground font-semibold">⚙️ Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredFarmers.map((farmer: any, idx) => (
                  <tr 
                    key={farmer._id} 
                    className={`border-b border-border hover:bg-primary/5 transition-colors ${
                      idx % 2 === 0 ? "bg-card" : "bg-muted/5"
                    }`}
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary to-chart-4 rounded-full flex items-center justify-center text-white font-bold">
                          {farmer.firstName?.[0]}{farmer.lastName?.[0]}
                        </div>
                        <div>
                          <p className="text-foreground font-semibold">
                            {farmer.firstName} {farmer.lastName}
                          </p>
                          <p className="text-muted-foreground text-xs">ID: {farmer._id.slice(-6)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-foreground">{farmer.email}</td>
                    <td className="py-4 px-6 text-foreground">{farmer.location || "N/A"}</td>
                    <td className="py-4 px-6">
                      <span className="px-3 py-1.5 bg-primary/20 text-primary rounded-full text-xs font-semibold border border-primary/30">
                        {farmer.rentedRooms?.length || 0} room{farmer.rentedRooms?.length !== 1 ? "s" : ""}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-3 py-1.5 bg-primary/20 text-primary rounded-full text-xs font-semibold border border-primary/30 flex items-center gap-1 w-fit">
                        <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                        Active
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex gap-2">
                        <button className="px-3 py-1.5 bg-gradient-to-r from-primary to-chart-4 text-white rounded-lg text-xs font-semibold hover:shadow-md transition-all">
                          View
                        </button>
                        <button className="px-3 py-1.5 bg-card border border-border text-foreground rounded-lg text-xs font-semibold hover:bg-muted transition-all">
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
