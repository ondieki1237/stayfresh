"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface RentRoomProps {
  farmerId: string
  onRoomRented?: () => void
}

interface Room {
  _id: string
  roomNumber: string
  capacity: number
  temperature?: number
  humidity?: number
  status: string
  rentalRate: number
  conditioning?: string
}

const BILLING_CYCLES = [
  { value: "1month", label: "1 Month", discount: 0 },
  { value: "2months", label: "2 Months", discount: 5 },
  { value: "3months", label: "3 Months", discount: 10 },
  { value: "4months", label: "4 Months", discount: 12 },
  { value: "6months", label: "6 Months", discount: 15 },
  { value: "12months", label: "12 Months", discount: 20 },
]

export default function RentRoom({ farmerId, onRoomRented }: RentRoomProps) {
  const [availableRooms, setAvailableRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [showRentDialog, setShowRentDialog] = useState(false)
  const [billingCycle, setBillingCycle] = useState("3months")
  const [renting, setRenting] = useState(false)

  useEffect(() => {
    fetchAvailableRooms()
  }, [])

  const fetchAvailableRooms = async () => {
    try {
      const token = localStorage.getItem("token")
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';
      const response = await fetch(`${API_BASE}/rooms/available`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      setAvailableRooms(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error fetching available rooms:", error)
      setAvailableRooms([])
    } finally {
      setLoading(false)
    }
  }

  const handleRentRoom = (room: Room) => {
    setSelectedRoom(room)
    setShowRentDialog(true)
  }

  const confirmRent = async () => {
    if (!selectedRoom || !farmerId) return

    setRenting(true)
    try {
      const token = localStorage.getItem("token")
      const cycleMonths = parseInt(billingCycle.replace("month", "").replace("s", ""))
      const startDate = new Date()
      const endDate = new Date()
      endDate.setMonth(endDate.getMonth() + cycleMonths)

      const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';
      const response = await fetch(
        `${API_BASE}/rooms/${selectedRoom._id}/rent`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            farmerId,
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            billingCycle,
          }),
        }
      )

      if (response.ok) {
        const data = await response.json()
  alert(`✅ Room ${selectedRoom.roomNumber} rented successfully!\n\nBilling details:\n- Cycle: ${billingCycle}\n- Amount: KSH ${data.billing?.totalAmount || "N/A"}\n- Due Date: ${new Date(data.billing?.dueDate).toLocaleDateString() || "N/A"}`)
        setShowRentDialog(false)
        setSelectedRoom(null)
        fetchAvailableRooms()
        onRoomRented?.()
      } else {
        const error = await response.json()
        alert(`❌ Failed to rent room: ${error.message || "Unknown error"}`)
      }
    } catch (error) {
      console.error("Error renting room:", error)
      alert("❌ Error renting room. Please try again.")
    } finally {
      setRenting(false)
    }
  }

  const calculateTotal = () => {
    if (!selectedRoom) return 0
    const cycleInfo = BILLING_CYCLES.find((c) => c.value === billingCycle)
    const cycleMonths = parseInt(billingCycle.replace("month", "").replace("s", ""))
    const baseAmount = selectedRoom.rentalRate * cycleMonths
    const discount = cycleInfo ? (baseAmount * cycleInfo.discount) / 100 : 0
    return baseAmount - discount
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-gradient-to-r from-primary to-chart-4 rounded-full animate-pulse mx-auto" />
          <p className="text-muted-foreground">Loading available rooms...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-foreground">Available Rooms</h2>
          <p className="text-sm text-muted-foreground">
            {availableRooms.length} room{availableRooms.length !== 1 ? "s" : ""} available
            for rent
          </p>
        </div>
      </div>

      {availableRooms.length === 0 ? (
        <Card className="border-2 border-dashed p-8 text-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🏠</span>
          </div>
          <p className="text-muted-foreground mb-2">No rooms available at the moment</p>
          <p className="text-sm text-muted-foreground">
            Please check back later or contact support
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {availableRooms.map((room) => (
            <Card key={room._id} className="overflow-hidden hover:shadow-lg transition-all">
              {/* Room Header */}
              <div className="bg-gradient-to-r from-primary/10 to-chart-4/10 p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                      <span>🏠</span> Room {room.roomNumber}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Capacity: {room.capacity}kg
                    </p>
                  </div>
                  <Badge className="bg-primary/20 text-primary border-primary/30">
                    ✅ Available
                  </Badge>
                </div>

                <div className="text-2xl font-bold text-foreground mt-3">
                  KSH {room.rentalRate}
                  <span className="text-sm font-normal text-muted-foreground">/month</span>
                </div>
              </div>

              {/* Room Details */}
              <div className="p-4 space-y-3">
                {/* Environmental Metrics */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-primary/5 border border-primary/10 rounded-lg p-2">
                    <p className="text-xs text-muted-foreground mb-1">🌡️ Temp</p>
                    <p className="text-sm font-semibold text-foreground">
                      {room.temperature || "N/A"}°C
                    </p>
                  </div>
                  <div className="bg-chart-4/5 border border-chart-4/10 rounded-lg p-2">
                    <p className="text-xs text-muted-foreground mb-1">💧 Humidity</p>
                    <p className="text-sm font-semibold text-foreground">
                      {room.humidity || "N/A"}%
                    </p>
                  </div>
                </div>

                {/* Conditioning */}
                {room.conditioning && (
                  <div className="bg-muted/50 rounded-lg p-2">
                    <p className="text-xs text-muted-foreground mb-1">Condition</p>
                    <p className="text-sm font-semibold text-foreground capitalize">
                      {room.conditioning}
                    </p>
                  </div>
                )}

                {/* Rent Button */}
                <Button
                  onClick={() => handleRentRoom(room)}
                  className="w-full bg-gradient-to-r from-primary to-chart-4 hover:from-primary/90 hover:to-chart-4/90 text-white rounded-lg shadow-sm"
                >
                  <span className="mr-1">🔑</span>
                  Rent This Room
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Rent Confirmation Dialog */}
      <Dialog open={showRentDialog} onOpenChange={setShowRentDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span>🏠</span> Rent Room {selectedRoom?.roomNumber}
            </DialogTitle>
            <DialogDescription>
              Select your billing cycle and confirm rental details
            </DialogDescription>
          </DialogHeader>

          {selectedRoom && (
            <div className="space-y-4 py-4">
              {/* Room Details Summary */}
              <Card className="bg-gradient-to-r from-primary/5 to-chart-4/5 p-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Capacity</p>
                    <p className="font-semibold">{selectedRoom.capacity}kg</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Monthly Rate</p>
                    <p className="font-semibold">KSH {selectedRoom.rentalRate}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Temperature</p>
                    <p className="font-semibold">{selectedRoom.temperature || "N/A"}°C</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Humidity</p>
                    <p className="font-semibold">{selectedRoom.humidity || "N/A"}%</p>
                  </div>
                </div>
              </Card>

              {/* Billing Cycle Selection */}
              <div className="space-y-2">
                <Label htmlFor="billingCycle">Billing Cycle</Label>
                <Select value={billingCycle} onValueChange={setBillingCycle}>
                  <SelectTrigger id="billingCycle">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BILLING_CYCLES.map((cycle) => (
                      <SelectItem key={cycle.value} value={cycle.value}>
                        {cycle.label}
                        {cycle.discount > 0 && (
                          <span className="ml-2 text-primary font-semibold">
                            ({cycle.discount}% off)
                          </span>
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Longer billing cycles offer better discounts
                </p>
              </div>

              {/* Price Breakdown */}
              <Card className="bg-gradient-to-r from-chart-4/10 to-primary/10 p-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Base Amount</span>
                    <span className="font-semibold">
                      KSH {selectedRoom.rentalRate *
                        parseInt(billingCycle.replace("month", "").replace("s", ""))}
                    </span>
                  </div>
                  {BILLING_CYCLES.find((c) => c.value === billingCycle)?.discount! > 0 && (
                    <div className="flex justify-between text-sm text-primary">
                      <span>
                        Discount (
                        {BILLING_CYCLES.find((c) => c.value === billingCycle)?.discount}%)
                      </span>
                      <span>
                        -KSH {(
                          (selectedRoom.rentalRate *
                            parseInt(billingCycle.replace("month", "").replace("s", "")) *
                            BILLING_CYCLES.find((c) => c.value === billingCycle)!.discount) /
                          100
                        ).toFixed(2)}
                      </span>
                    </div>
                  )}
                  <div className="border-t pt-2 flex justify-between text-lg font-bold">
                    <span>Total Amount</span>
                    <span className="text-primary">KSH {calculateTotal().toFixed(2)}</span>
                  </div>
                </div>
              </Card>

              <p className="text-xs text-muted-foreground bg-muted p-3 rounded-lg">
                ℹ️ Payment is due within 7 days. Your room will be reserved immediately
                upon confirmation.
              </p>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRentDialog(false)}
              disabled={renting}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmRent}
              disabled={renting}
              className="bg-gradient-to-r from-primary to-chart-4 hover:from-primary/90 hover:to-chart-4/90 text-white"
            >
              {renting ? "Processing..." : "Confirm Rental"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
