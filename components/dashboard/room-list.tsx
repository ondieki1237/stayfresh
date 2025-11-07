"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

interface RoomListProps {
  farmerId: string
}

interface Room {
  _id: string
  roomNumber: string
  capacity: number
  currentOccupancy: number
  status: string
  temperature?: number
  humidity?: number
  co2Level?: number
  ethyleneLevel?: number
  renter?: {
    _id: string
    firstName: string
    lastName: string
  }
}

interface ProduceData {
  _id: string
  produceType: string
  quantity: number
  status: string
  currentPrice?: number
  marketPrice?: number
  room: string
}

export default function RoomList({ farmerId }: RoomListProps) {
  const [rooms, setRooms] = useState<Room[]>([])
  const [produceData, setProduceData] = useState<{ [key: string]: ProduceData[] }>({})
  const [billingData, setBillingData] = useState<{ [key: string]: any }>({})
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [expandedRoom, setExpandedRoom] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    if (!farmerId) return
    
    // Check if user is admin (superuser)
    const userEmail = localStorage.getItem("userEmail")
    setIsAdmin(userEmail === "admin@stayfresh.com" || userEmail === "superuser@stayfresh.com")
    
    fetchRooms()
  }, [farmerId])

  const fetchRooms = async () => {
    try {
      const token = localStorage.getItem("token")
      const userEmail = localStorage.getItem("userEmail")
      const checkIsAdmin = userEmail === "admin@stayfresh.com" || userEmail === "superuser@stayfresh.com"
      
      // Admin can see all rooms, regular users see only their rented rooms
      const endpoint = checkIsAdmin 
        ? `http://localhost:5000/api/rooms`
        : `http://localhost:5000/api/rooms/farmer/${farmerId}`
      
      const response = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await response.json()
      
      // Ensure data is an array
      let roomsArray: Room[] = []
      if (Array.isArray(data)) {
        roomsArray = data
      } else if (data.rooms && Array.isArray(data.rooms)) {
        roomsArray = data.rooms
      } else {
        console.error("Unexpected data format:", data)
      }
      
      setRooms(roomsArray)
      
      // Fetch produce and billing data for each room
      roomsArray.forEach(room => {
        fetchProduceForRoom(room._id)
        fetchBillingForRoom(room._id)
      })
    } catch (error) {
      console.error("Error fetching rooms:", error)
      setRooms([])
    } finally {
      setLoading(false)
    }
  }

  const fetchProduceForRoom = async (roomId: string) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`http://localhost:5000/api/produce/room/${roomId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      setProduceData(prev => ({
        ...prev,
        [roomId]: Array.isArray(data) ? data : []
      }))
    } catch (error) {
      console.error(`Error fetching produce for room ${roomId}:`, error)
    }
  }

  const fetchBillingForRoom = async (roomId: string) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`http://localhost:5000/api/billing/room/${roomId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      setBillingData(prev => ({
        ...prev,
        [roomId]: data
      }))
    } catch (error) {
      console.error(`Error fetching billing for room ${roomId}:`, error)
    }
  }

  const handleRequestRelease = async (roomId: string) => {
    if (!confirm("Request produce release from this room?")) return
    
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`http://localhost:5000/api/rooms/${roomId}/request-release`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      })
      
      if (response.ok) {
        alert("Release request submitted successfully!")
      } else {
        alert("Failed to submit release request")
      }
    } catch (error) {
      console.error("Error requesting release:", error)
      alert("Error submitting release request")
    }
  }

  const handleViewBilling = (roomId: string) => {
    setExpandedRoom(expandedRoom === roomId ? null : roomId)
  }

  const handleViewDetails = (roomId: string) => {
    router.push(`/dashboard/rooms/${roomId}`)
  }

  if (loading) return (
    <div className="flex items-center justify-center py-12">
      <div className="text-center space-y-3">
        <div className="w-16 h-16 bg-gradient-to-r from-primary to-chart-4 rounded-full animate-pulse mx-auto" />
        <p className="text-muted-foreground">Loading rooms...</p>
      </div>
    </div>
  )

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold text-foreground">
          {isAdmin ? "All Rooms" : "My Rooms"}
        </h2>
        {!isAdmin && (
          <Button size="sm" className="bg-gradient-to-r from-primary to-chart-4 hover:from-primary/90 hover:to-chart-4/90 text-white rounded-full shadow-md">
            + Rent Room
          </Button>
        )}
      </div>

      {rooms.length === 0 ? (
        <div className="bg-card border-2 border-dashed border-border rounded-2xl p-8 text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🏠</span>
          </div>
          <p className="text-muted-foreground mb-4">
            {isAdmin ? "No rooms in the system yet" : "No rooms rented yet"}
          </p>
          {!isAdmin && (
            <Button className="bg-gradient-to-r from-primary to-chart-4 hover:from-primary/90 hover:to-chart-4/90 text-white rounded-full shadow-md">
              Browse Available Rooms
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {rooms.map((room) => {
            const roomProduce = produceData[room._id] || []
            const roomBilling = billingData[room._id]
            const isExpanded = expandedRoom === room._id
            
            return (
              <div 
                key={room._id} 
                className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all"
              >
                {/* Room Header */}
                <div className="bg-gradient-to-r from-primary/10 to-chart-4/10 p-5">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                        <span>🏠</span> Room {room.roomNumber}
                      </h3>
                      <p className="text-muted-foreground text-xs mt-1">Capacity: {room.capacity}kg</p>
                      {isAdmin && room.renter && (
                        <p className="text-xs text-primary mt-1 font-medium">
                          👤 {room.renter.firstName} {room.renter.lastName}
                        </p>
                      )}
                    </div>
                    <span
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${
                        room.status === "Occupied" 
                          ? "bg-primary/20 text-primary border-primary/30" 
                          : room.status === "Available"
                          ? "bg-chart-4/20 text-chart-4 border-chart-4/30"
                          : "bg-muted text-muted-foreground border-muted"
                      }`}
                    >
                      {room.status === "Occupied" ? "📦 Occupied" : "✅ Available"}
                    </span>
                  </div>

                  {/* Occupancy Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Capacity Usage</span>
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

                {/* Monitoring Section */}
                <div className="p-5 space-y-4">
                  {/* Environmental Metrics */}
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                      <span>📊</span> Environmental Monitoring
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-3">
                        <p className="text-muted-foreground text-xs mb-1">🌡️ Temperature</p>
                        <p className="text-foreground font-bold text-lg">{room.temperature || "N/A"}°C</p>
                      </div>
                      <div className="bg-gradient-to-br from-chart-4/10 to-chart-4/5 border border-chart-4/20 rounded-xl p-3">
                        <p className="text-muted-foreground text-xs mb-1">💧 Humidity</p>
                        <p className="text-foreground font-bold text-lg">{room.humidity || "N/A"}%</p>
                      </div>
                    </div>
                  </div>

                  {/* Produce Information */}
                  {roomProduce.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                        <span>🥕</span> Produce Information
                      </h4>
                      <div className="space-y-3">
                        {roomProduce.map((produce) => (
                          <div key={produce._id} className="bg-gradient-to-r from-primary/5 to-chart-4/5 border border-border rounded-xl p-4">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <p className="font-semibold text-foreground capitalize">{produce.produceType}</p>
                                <p className="text-xs text-muted-foreground">Quantity: {produce.quantity}kg</p>
                              </div>
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                produce.status === "Fresh" ? "bg-primary/20 text-primary" :
                                produce.status === "Sold" ? "bg-chart-4/20 text-chart-4" :
                                "bg-muted text-muted-foreground"
                              }`}>
                                {produce.status}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="bg-card/50 rounded-lg p-2">
                                <p className="text-xs text-muted-foreground">Current Price</p>
                                <p className="text-lg font-bold text-primary">
                                  ${produce.currentPrice || "0.00"}/kg
                                </p>
                              </div>
                              <div className="bg-card/50 rounded-lg p-2">
                                <p className="text-xs text-muted-foreground">Market Price</p>
                                <p className="text-lg font-bold text-chart-4">
                                  ${produce.marketPrice || "0.00"}/kg
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Billing Information (Expandable) */}
                  {roomBilling && isExpanded && (
                    <div className="border border-border rounded-xl p-4 bg-gradient-to-r from-chart-4/5 to-primary/5">
                      <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                        <span>⚡</span> Electricity Consumption
                      </h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground text-sm">Energy Used</span>
                          <span className="font-bold text-foreground">{roomBilling.energyUsed || "0"} kWh</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground text-sm">Amount Due</span>
                          <span className="font-bold text-chart-4">${roomBilling.amountDue || "0.00"}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground text-sm">Status</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            roomBilling.status === "Paid" ? "bg-primary/20 text-primary" : "bg-destructive/20 text-destructive"
                          }`}>
                            {roomBilling.status || "Pending"}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-primary/30 text-primary hover:bg-primary/10 rounded-xl"
                      onClick={() => handleViewBilling(room._id)}
                    >
                      <span className="mr-1">⚡</span>
                      {isExpanded ? "Hide" : "View"} Billing
                    </Button>
                    {!isAdmin && room.status === "Occupied" && (
                      <Button 
                        size="sm"
                        className="bg-gradient-to-r from-chart-4 to-primary hover:from-chart-4/90 hover:to-primary/90 text-white rounded-xl shadow-sm"
                        onClick={() => handleRequestRelease(room._id)}
                      >
                        <span className="mr-1">📤</span>
                        Request Release
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
