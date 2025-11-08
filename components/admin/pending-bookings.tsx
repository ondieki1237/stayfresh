"use client"

import { useState, useEffect } from "react"
import { API_BASE } from "@/lib/api"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/hooks/use-toast"

interface Booking {
  _id: string
  farmer: {
    firstName: string
    lastName: string
    email: string
    phone: string
  }
  room: {
    roomNumber: string
    capacity: number
    currentOccupancy: number
  }
  produceType: string
  quantity: number
  estimatedValue: number
  condition: string
  targetPrice: number
  currentMarketPrice: number
  notes?: string
  status: string
  approvalStatus: string
  createdAt: string
}

export function PendingBookings() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    fetchPendingBookings()
  }, [])

  const fetchPendingBookings = async () => {
    try {
      const token = localStorage.getItem("token")
      const res = await fetch(`${API_BASE}/stocking/pending/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (res.ok) {
        const data = await res.json()
        setBookings(data)
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch pending bookings",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching bookings:", error)
      toast({
        title: "Error",
        description: "Failed to fetch pending bookings",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (bookingId: string) => {
    setProcessing(true)
    try {
      const token = localStorage.getItem("token")
      const res = await fetch(`${API_BASE}/stocking/${bookingId}/approve`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (res.ok) {
        toast({
          title: "Success",
          description: "Booking approved successfully",
        })
        fetchPendingBookings()
      } else {
        const error = await res.json()
        toast({
          title: "Error",
          description: error.message || "Failed to approve booking",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error approving booking:", error)
      toast({
        title: "Error",
        description: "Failed to approve booking",
        variant: "destructive",
      })
    } finally {
      setProcessing(false)
    }
  }

  const handleReject = async () => {
    if (!selectedBooking || !rejectionReason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a reason for rejection",
        variant: "destructive",
      })
      return
    }

    setProcessing(true)
    try {
      const token = localStorage.getItem("token")
      const res = await fetch(`${API_BASE}/stocking/${selectedBooking._id}/reject`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason: rejectionReason }),
      })

      if (res.ok) {
        toast({
          title: "Success",
          description: "Booking rejected",
        })
        setShowRejectDialog(false)
        setSelectedBooking(null)
        setRejectionReason("")
        fetchPendingBookings()
      } else {
        const error = await res.json()
        toast({
          title: "Error",
          description: error.message || "Failed to reject booking",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error rejecting booking:", error)
      toast({
        title: "Error",
        description: "Failed to reject booking",
        variant: "destructive",
      })
    } finally {
      setProcessing(false)
    }
  }

  const openRejectDialog = (booking: Booking) => {
    setSelectedBooking(booking)
    setShowRejectDialog(true)
    setRejectionReason("")
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Pending Booking Approvals</h2>
        <p className="text-muted-foreground">
          Review and approve farmer storage booking requests
        </p>
      </div>

      {bookings.length === 0 ? (
        <Alert>
          <AlertDescription>
            No pending bookings at the moment. All requests have been processed.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid gap-4">
          {bookings.map((booking) => {
            const availableSpace = booking.room.capacity - booking.room.currentOccupancy
            const hasCapacity = availableSpace >= booking.quantity

            return (
              <Card key={booking._id} className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">
                      {booking.farmer.firstName} {booking.farmer.lastName}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {booking.farmer.email} • {booking.farmer.phone}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Submitted: {new Date(booking.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <Badge variant="outline" className="bg-yellow-50">
                    Pending Approval
                  </Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Produce Type</p>
                    <p className="font-semibold">{booking.produceType}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Quantity</p>
                    <p className="font-semibold">{booking.quantity} kg</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Room</p>
                    <p className="font-semibold">Room {booking.room.roomNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Condition</p>
                    <Badge variant="secondary">{booking.condition}</Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Target Price</p>
                    <p className="font-semibold text-green-600">
                      KSH {booking.targetPrice.toLocaleString()}/kg
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Current Market Price</p>
                    <p className="font-semibold">
                      KSH {booking.currentMarketPrice.toLocaleString()}/kg
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Estimated Value</p>
                    <p className="font-semibold text-lg">
                      KSH {booking.estimatedValue.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-xs text-muted-foreground mb-2">Room Capacity</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-4 overflow-hidden">
                      <div
                        className={`h-full ${
                          hasCapacity ? "bg-green-500" : "bg-red-500"
                        }`}
                        style={{
                          width: `${Math.min(
                            ((booking.room.currentOccupancy + booking.quantity) /
                              booking.room.capacity) *
                              100,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium whitespace-nowrap">
                      {booking.room.currentOccupancy + booking.quantity} /{" "}
                      {booking.room.capacity} kg
                    </span>
                  </div>
                  {!hasCapacity && (
                    <p className="text-xs text-red-600 mt-1">
                      ⚠️ Insufficient capacity. Available: {availableSpace} kg, Requested:{" "}
                      {booking.quantity} kg
                    </p>
                  )}
                </div>

                {booking.notes && (
                  <div className="mb-4 p-3 bg-gray-50 rounded">
                    <p className="text-xs text-muted-foreground mb-1">Notes</p>
                    <p className="text-sm">{booking.notes}</p>
                  </div>
                )}

                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => openRejectDialog(booking)}
                    disabled={processing}
                  >
                    Reject
                  </Button>
                  <Button
                    onClick={() => handleApprove(booking._id)}
                    disabled={processing || !hasCapacity}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {processing ? "Processing..." : "Approve Booking"}
                  </Button>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Booking</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this booking. The farmer will be
              notified.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedBooking && (
              <div className="text-sm">
                <p>
                  <strong>Farmer:</strong> {selectedBooking.farmer.firstName}{" "}
                  {selectedBooking.farmer.lastName}
                </p>
                <p>
                  <strong>Produce:</strong> {selectedBooking.produceType} (
                  {selectedBooking.quantity} kg)
                </p>
              </div>
            )}
            <Textarea
              placeholder="Enter reason for rejection..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRejectDialog(false)}
              disabled={processing}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={processing || !rejectionReason.trim()}
            >
              {processing ? "Rejecting..." : "Reject Booking"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
