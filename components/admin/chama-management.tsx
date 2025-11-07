"use client"

import { useState, useEffect } from "react"
import { API_BASE } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Users, MapPin, Phone, Mail, Home, Calendar, Zap, Plus, Edit, Trash2, UserPlus, Search } from "lucide-react"

interface MarketDay {
  day: string
  startTime: string
  endTime: string
  powerOffDuringMarket: boolean
}

interface Chama {
  _id: string
  name: string
  description?: string
  contactPerson: string
  phone: string
  email?: string
  location: string
  totalMembers: number
  monthlyFee: number
  isActive: boolean
  sharedRoom?: {
    _id: string
    roomNumber: string
    capacity: number
    currentOccupancy: number
    status: string
    powerStatus?: string
  }
  marketDays?: MarketDay[]
  notes?: string
}

interface Room {
  _id: string
  roomNumber: string
  capacity: number
  status: string
  roomType?: string
}

export default function ChamaManagement() {
  const [chamas, setChamas] = useState<Chama[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingChama, setEditingChama] = useState<Chama | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    contactPerson: "",
    phone: "",
    email: "",
    location: "",
    monthlyFee: "",
    notes: "",
  })
  const [membersList, setMembersList] = useState<{ name: string; phone: string; farmerId?: string }[]>([])
  const [marketDays, setMarketDays] = useState<MarketDay[]>([])

  useEffect(() => {
    fetchChamas()
    fetchRooms()
  }, [])

  const fetchChamas = async () => {
    try {
  const response = await fetch(`${API_BASE || "/api"}/chamas`)
      const data = await response.json()
      setChamas(data)
    } catch (error) {
      console.error("Error fetching chamas:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchRooms = async () => {
    try {
  const response = await fetch(`${API_BASE || "/api"}/rooms`)
      const data = await response.json()
      // Only show available rooms or rooms already assigned to this chama
      setRooms(data.filter((room: Room) => room.status === "Available" || room.roomType === "shared"))
    } catch (error) {
      console.error("Error fetching rooms:", error)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editingChama
        ? `${API_BASE || "/api"}/chamas/${editingChama._id}`
        : `${API_BASE || "/api"}/chamas`
      
      const method = editingChama ? "PUT" : "POST"
      
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          monthlyFee: parseFloat(formData.monthlyFee) || 0,
          marketDays,
          members: membersList,
        }),
      })

      if (response.ok) {
        fetchChamas()
        setIsCreateOpen(false)
        resetForm()
      }
    } catch (error) {
      console.error("Error saving chama:", error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this chama?")) return

    try {
      const response = await fetch(`${API_BASE || "/api"}/chamas/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchChamas()
      }
    } catch (error) {
      console.error("Error deleting chama:", error)
    }
  }

  const handleAssignRoom = async (chamaId: string, roomId: string) => {
    try {
      const response = await fetch(`${API_BASE || "/api"}/chamas/${chamaId}/assign-room`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId }),
      })

      if (response.ok) {
        fetchChamas()
        fetchRooms()
      }
    } catch (error) {
      console.error("Error assigning room:", error)
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      contactPerson: "",
      phone: "",
      email: "",
      location: "",
      monthlyFee: "",
      notes: "",
    })
    setMarketDays([])
    setEditingChama(null)
    setMembersList([])
  }

  const openEditDialog = (chama: Chama) => {
    setEditingChama(chama)
    setFormData({
      name: chama.name,
      description: chama.description || "",
      contactPerson: chama.contactPerson,
      phone: chama.phone,
      email: chama.email || "",
      location: chama.location,
      monthlyFee: chama.monthlyFee.toString(),
      notes: chama.notes || "",
    })
    setMarketDays(chama.marketDays || [])
    // Load members into membersList
    setMembersList((chama as any).members?.map((m: any) => ({ name: m.name || "", phone: m.phone || "", farmerId: m.farmer })) || [])
    setIsCreateOpen(true)
  }

  const addMember = () => setMembersList(prev => [...prev, { name: "", phone: "" }])
  const updateMember = (index: number, field: "name" | "phone", value: string) => {
    const copy = [...membersList]
    copy[index] = { ...copy[index], [field]: value }
    setMembersList(copy)
  }
  const removeMember = (index: number) => setMembersList(prev => prev.filter((_, i) => i !== index))

  const addMarketDay = () => {
    setMarketDays([...marketDays, { day: "Monday", startTime: "06:00", endTime: "18:00", powerOffDuringMarket: true }])
  }

  const updateMarketDay = (index: number, field: keyof MarketDay, value: string | boolean) => {
    const updated = [...marketDays]
    updated[index] = { ...updated[index], [field]: value }
    setMarketDays(updated)
  }

  const removeMarketDay = (index: number) => {
    setMarketDays(marketDays.filter((_, i) => i !== index))
  }

  const filteredChamas = chamas.filter(chama => {
    const matchesSearch = chama.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chama.contactPerson.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = filterStatus === "all" ||
      (filterStatus === "active" && chama.isActive) ||
      (filterStatus === "inactive" && !chama.isActive)
    
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Chama Management</h2>
          <p className="text-muted-foreground">Women's Groups with shared storage rooms</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={(open) => { setIsCreateOpen(open); if (!open) resetForm() }}>
          <DialogTrigger asChild>
            <Button className="bg-[oklch(0.65_0.22_145)] hover:bg-[oklch(0.6_0.22_145)]">
              <Plus className="w-4 h-4 mr-2" />
              New Chama
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingChama ? "Edit Chama" : "Create New Chama"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Chama Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contactPerson">Contact Person *</Label>
                  <Input
                    id="contactPerson"
                    name="contactPerson"
                    value={formData.contactPerson}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone *</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="monthlyFee">Monthly Fee (KES)</Label>
                  <Input
                    id="monthlyFee"
                    name="monthlyFee"
                    type="number"
                    value={formData.monthlyFee}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Market Days</Label>
                <div className="space-y-2">
                  {marketDays.map((md, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 border rounded-md">
                      <Select
                        value={md.day}
                        onValueChange={(value) => updateMarketDay(index, "day", value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(day => (
                            <SelectItem key={day} value={day}>{day}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        type="time"
                        value={md.startTime}
                        onChange={(e) => updateMarketDay(index, "startTime", e.target.value)}
                        className="w-32"
                      />
                      <span>to</span>
                      <Input
                        type="time"
                        value={md.endTime}
                        onChange={(e) => updateMarketDay(index, "endTime", e.target.value)}
                        className="w-32"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        onClick={() => removeMarketDay(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" onClick={addMarketDay} className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Market Day
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={2}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => { setIsCreateOpen(false); resetForm() }}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-[oklch(0.65_0.22_145)] hover:bg-[oklch(0.6_0.22_145)]">
                  {editingChama ? "Update" : "Create"} Chama
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search chamas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Chama Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredChamas.map((chama) => (
          <Card key={chama._id} className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-[oklch(0.65_0.22_145)] to-[oklch(0.828_0.189_84.429)] text-white">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{chama.name}</CardTitle>
                  <CardDescription className="text-white/80">
                    {chama.totalMembers} members
                  </CardDescription>
                </div>
                <Badge variant={chama.isActive ? "default" : "secondary"}>
                  {chama.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">{chama.contactPerson}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span>{chama.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span>{chama.location}</span>
              </div>
              
              {chama.sharedRoom ? (
                <div className="flex items-center gap-2 text-sm">
                  <Home className="w-4 h-4 text-[oklch(0.65_0.22_145)]" />
                  <span className="font-medium">Room {chama.sharedRoom.roomNumber}</span>
                  {chama.sharedRoom.powerStatus && (
                    <Badge variant={chama.sharedRoom.powerStatus === "on" ? "default" : "secondary"} className="ml-auto">
                      <Zap className="w-3 h-3 mr-1" />
                      {chama.sharedRoom.powerStatus.toUpperCase()}
                    </Badge>
                  )}
                </div>
              ) : (
                <Select onValueChange={(roomId) => handleAssignRoom(chama._id, roomId)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Assign Room" />
                  </SelectTrigger>
                  <SelectContent>
                    {rooms.map(room => (
                      <SelectItem key={room._id} value={room._id}>
                        Room {room.roomNumber} - {room.capacity}kg
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span>{chama.marketDays?.length || 0} market days/week</span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t">
                <span className="text-sm font-medium">KES {chama.monthlyFee.toLocaleString()}/month</span>
                <div className="flex gap-1">
                  <Button size="icon" variant="outline" onClick={() => openEditDialog(chama)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="destructive" onClick={() => handleDelete(chama._id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredChamas.length === 0 && (
        <Card className="p-12 text-center">
          <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No chamas found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm || filterStatus !== "all"
              ? "Try adjusting your filters"
              : "Create your first chama to get started"}
          </p>
        </Card>
      )}
    </div>
  )
}
