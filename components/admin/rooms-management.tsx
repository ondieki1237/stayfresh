"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function RoomsManagement() {
  const [rooms, setRooms] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<"all" | "Available" | "Occupied">("all")

  useEffect(() => {
    fetchRooms()
  }, [])

  const fetchRooms = async () => {
    try {
      const response = await fetch("https://www.kisumu.codewithseth.co.ke/api/rooms")
      const data = await response.json()
      setRooms(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error fetching rooms:", error)
      setRooms([])
    } finally {
      setLoading(false)
    }
  }

  const filteredRooms = rooms.filter((room: any) => {
    const matchesSearch = room.roomNumber?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
                         room.owner?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         room.owner?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         room.renter?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         room.renter?.lastName?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === "all" || room.status === filterStatus
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-gradient-to-r from-primary to-chart-4 rounded-full animate-pulse mx-auto" />
          <p className="text-muted-foreground">Loading rooms...</p>
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
            <span>🏠</span> Rooms Management
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            {rooms.length} total room{rooms.length !== 1 ? "s" : ""} · {rooms.filter(r => r.status === "Occupied").length} occupied
          </p>
        </div>
        <Button className="bg-gradient-to-r from-primary to-chart-4 hover:from-primary/90 hover:to-chart-4/90 text-white font-semibold shadow-md hover:shadow-lg transition-all">
          <span className="mr-2">➕</span> Create New Room
        </Button>
      </div>

      {/* Filters Section */}
      <div className="bg-card border border-border rounded-xl p-4 shadow-sm space-y-4">
        {/* Search Bar */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-chart-4 rounded-lg flex items-center justify-center">
            <span className="text-lg">🔍</span>
          </div>
          <Input
            type="text"
            placeholder="Search by room number, owner, or renter..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 border-border bg-background focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Status Filter Pills */}
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={() => setFilterStatus("all")}
            className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
              filterStatus === "all"
                ? "bg-gradient-to-r from-primary to-chart-4 text-white shadow-md"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            All Rooms ({rooms.length})
          </button>
          <button
            onClick={() => setFilterStatus("Available")}
            className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
              filterStatus === "Available"
                ? "bg-gradient-to-r from-primary to-chart-4 text-white shadow-md"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            ✅ Available ({rooms.filter(r => r.status === "Available").length})
          </button>
          <button
            onClick={() => setFilterStatus("Occupied")}
            className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
              filterStatus === "Occupied"
                ? "bg-gradient-to-r from-primary to-chart-4 text-white shadow-md"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            📦 Occupied ({rooms.filter(r => r.status === "Occupied").length})
          </button>
        </div>
      </div>

      {/* Rooms Grid */}
      {filteredRooms.length === 0 ? (
        <div className="bg-card border border-dashed border-border rounded-xl p-12 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-chart-4/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">🏠</span>
          </div>
          <p className="text-muted-foreground text-lg">
            {searchTerm || filterStatus !== "all" ? "No rooms found matching your filters" : "No rooms created yet"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRooms.map((room: any) => (
            <div 
              key={room._id} 
              className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all"
            >
              {/* Room Header with Gradient */}
              <div className={`p-6 bg-gradient-to-br ${
                room.status === "Occupied" 
                  ? "from-primary/20 to-chart-4/20" 
                  : "from-primary/10 to-chart-4/10"
              }`}>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                      <span>🏠</span> Room {room.roomNumber}
                    </h3>
                    <p className="text-muted-foreground text-sm mt-1">
                      Owner: {room.owner?.firstName} {room.owner?.lastName}
                    </p>
                    {room.renter && (
                      <p className="text-foreground text-sm font-medium mt-1">
                        Rented by: {room.renter.firstName} {room.renter.lastName}
                      </p>
                    )}
                  </div>
                  <span
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${
                      room.status === "Occupied"
                        ? "bg-primary/20 text-primary border-primary/30"
                        : "bg-chart-4/20 text-chart-4 border-chart-4/30"
                    }`}
                  >
                    {room.status === "Occupied" ? "📦 Occupied" : "✅ Available"}
                  </span>
                </div>
                
                {/* Capacity Progress Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Capacity</span>
                    <span className="font-semibold text-foreground">
                      {room.currentOccupancy || 0}kg / {room.capacity}kg
                    </span>
                  </div>
                  <div className="w-full bg-background/50 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-chart-4 rounded-full transition-all"
                      style={{ width: `${Math.min(((room.currentOccupancy || 0) / room.capacity) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Room Details */}
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-primary/5 p-3 rounded-xl border border-primary/10">
                    <p className="text-muted-foreground text-xs mb-1">🌡️ Temperature</p>
                    <p className="text-foreground font-bold">{room.temperature || "N/A"}°C</p>
                  </div>
                  <div className="bg-chart-4/5 p-3 rounded-xl border border-chart-4/10">
                    <p className="text-muted-foreground text-xs mb-1">💧 Humidity</p>
                    <p className="text-foreground font-bold">{room.humidity || "N/A"}%</p>
                  </div>
                  <div className="bg-primary/5 p-3 rounded-xl border border-primary/10">
                    <p className="text-muted-foreground text-xs mb-1">🧼 Sterilization</p>
                    <p className="text-foreground font-bold capitalize">{room.sterilization || "N/A"}</p>
                  </div>
                  <div className="bg-chart-4/5 p-3 rounded-xl border border-chart-4/10">
                    <p className="text-muted-foreground text-xs mb-1">❄️ Conditioning</p>
                    <p className="text-foreground font-bold capitalize">{room.conditioning || "N/A"}</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    className="flex-1 border-border hover:bg-muted transition-all"
                  >
                    ✏️ Edit
                  </Button>
                  <Button className="flex-1 bg-gradient-to-r from-primary to-chart-4 hover:from-primary/90 hover:to-chart-4/90 text-white shadow-md hover:shadow-lg transition-all">
                    📊 Sensors
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
