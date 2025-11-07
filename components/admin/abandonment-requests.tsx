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

interface Room {
  _id: string
  roomNumber: string
  capacity: number
  renter?: {
    _id: string
    firstName: string
    lastName: string
    email: string
    phone: string
  }
  abandonmentRequest?: {
    reason: string
    requestedAt: string
    status: "Pending" | "Approved" | "Rejected"
  }
}

export default function AbandonmentRequests() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    fetchAbandonmentRequests()
  }, [])

  const fetchAbandonmentRequests = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`https://www.kisumu.codewithseth.co.ke/api/rooms`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      
      // Filter rooms with abandonment requests
      const roomsWithRequests = (Array.isArray(data) ? data : []).filter(
        (room: Room) => room.abandonmentRequest && room.abandonmentRequest.status === "Pending"
      )
      
      setRooms(roomsWithRequests)
    } catch (error) {
      console.error("Error fetching abandonment requests:", error)
      setRooms([])
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetails = (room: Room) => {
    setSelectedRoom(room)
    setShowDetailsDialog(true)
  }

  const handleProcessRequest = async (action: "approve" | "reject") => {
    if (!selectedRoom) return

    setProcessing(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(
        `https://www.kisumu.codewithseth.co.ke/api/rooms/${selectedRoom._id}/abandon/${action}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )

      if (response.ok) {
        alert(`✅ Abandonment request ${action}d successfully!`)
        setShowDetailsDialog(false)
        setSelectedRoom(null)
        fetchAbandonmentRequests() // Refresh list
      } else {
        const error = await response.json()
        alert(`❌ Failed to ${action} request: ${error.message || "Unknown error"}`)
      }
    } catch (error) {
      console.error(`Error ${action}ing request:`, error)
      alert(`❌ Error ${action}ing request. Please try again.`)
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-gradient-to-r from-primary to-chart-4 rounded-full animate-pulse mx-auto" />
          <p className="text-muted-foreground">Loading abandonment requests...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Abandonment Requests</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Review and process room abandonment requests
          </p>
        </div>
        <Badge variant="outline" className="text-lg px-3 py-1">
          {rooms.length} Pending
        </Badge>
      </div>

      {rooms.length === 0 ? (
        <Card className="border-2 border-dashed p-8 text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">✅</span>
          </div>
          <p className="text-muted-foreground">No pending abandonment requests</p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {rooms.map((room) => (
            <Card key={room._id} className="overflow-hidden hover:shadow-lg transition-all">
              {/* Header */}
              <div className="bg-gradient-to-r from-destructive/10 to-destructive/5 p-4 border-b">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-lg font-bold text-foreground">
                      🏠 Room {room.roomNumber}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Capacity: {room.capacity}kg
                    </p>
                  </div>
                  <Badge className="bg-destructive/20 text-destructive border-destructive/30">
                    ⚠️ Pending
                  </Badge>
                </div>
              </div>

              {/* Renter Info */}
              <div className="p-4 space-y-3">
                {room.renter && (
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-1">Current Renter</p>
                    <p className="font-semibold text-foreground">
                      {room.renter.firstName} {room.renter.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">{room.renter.email}</p>
                    <p className="text-xs text-muted-foreground">{room.renter.phone}</p>
                  </div>
                )}

                {/* Request Date */}
                {room.abandonmentRequest && (
                  <div className="text-sm">
                    <p className="text-muted-foreground">Requested:</p>
                    <p className="font-medium">
                      {new Date(room.abandonmentRequest.requestedAt).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </p>
                  </div>
                )}

                {/* Reason Preview */}
                {room.abandonmentRequest && (
                  <div className="bg-primary/5 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-1">Reason:</p>
                    <p className="text-sm text-foreground line-clamp-3">
                      {room.abandonmentRequest.reason}
                    </p>
                  </div>
                )}

                {/* View Details Button */}
                <Button
                  onClick={() => handleViewDetails(room)}
                  className="w-full bg-gradient-to-r from-primary to-chart-4 hover:from-primary/90 hover:to-chart-4/90 text-white"
                >
                  View Details & Process
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span>🏠</span> Room {selectedRoom?.roomNumber} - Abandonment Request
            </DialogTitle>
            <DialogDescription>
              Review the request details and decide whether to approve or reject
            </DialogDescription>
          </DialogHeader>

          {selectedRoom && (
            <div className="space-y-4 py-4">
              {/* Room Info */}
              <Card className="bg-gradient-to-r from-primary/5 to-chart-4/5 p-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Room Number</p>
                    <p className="font-semibold">{selectedRoom.roomNumber}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Capacity</p>
                    <p className="font-semibold">{selectedRoom.capacity}kg</p>
                  </div>
                </div>
              </Card>

              {/* Renter Info */}
              {selectedRoom.renter && (
                <Card className="bg-muted/50 p-4">
                  <h4 className="font-semibold mb-2">Current Renter</h4>
                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="text-muted-foreground">Name: </span>
                      <span className="font-medium">
                        {selectedRoom.renter.firstName} {selectedRoom.renter.lastName}
                      </span>
                    </p>
                    <p>
                      <span className="text-muted-foreground">Email: </span>
                      <span className="font-medium">{selectedRoom.renter.email}</span>
                    </p>
                    <p>
                      <span className="text-muted-foreground">Phone: </span>
                      <span className="font-medium">{selectedRoom.renter.phone}</span>
                    </p>
                  </div>
                </Card>
              )}

              {/* Request Details */}
              {selectedRoom.abandonmentRequest && (
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Requested Date:</p>
                    <p className="font-medium">
                      {new Date(selectedRoom.abandonmentRequest.requestedAt).toLocaleString()}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Reason for Abandonment:</p>
                    <Card className="bg-destructive/5 border-destructive/20 p-4">
                      <p className="text-sm whitespace-pre-wrap">
                        {selectedRoom.abandonmentRequest.reason}
                      </p>
                    </Card>
                  </div>
                </div>
              )}

              {/* Warning */}
              <div className="bg-chart-4/10 border border-chart-4/30 rounded-lg p-4">
                <p className="text-sm font-semibold mb-2">⚠️ Before Approving</p>
                <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Verify all produce has been removed from the room</li>
                  <li>Confirm all billing has been settled</li>
                  <li>Check for any outstanding issues or damages</li>
                  <li>Approval will immediately release the room</li>
                </ul>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowDetailsDialog(false)
                setSelectedRoom(null)
              }}
              disabled={processing}
            >
              Cancel
            </Button>
            <Button
              variant="outline"
              onClick={() => handleProcessRequest("reject")}
              disabled={processing}
              className="border-destructive text-destructive hover:bg-destructive/10"
            >
              {processing ? "Processing..." : "Reject Request"}
            </Button>
            <Button
              onClick={() => handleProcessRequest("approve")}
              disabled={processing}
              className="bg-gradient-to-r from-primary to-chart-4 hover:from-primary/90 hover:to-chart-4/90 text-white"
            >
              {processing ? "Processing..." : "Approve & Release Room"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
