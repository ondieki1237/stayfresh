"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import DashboardLayout from "@/components/layout/dashboard-layout"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface Farmer {
  _id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  location?: string
  farmerType?: string
  chamaId?: any
  rentedRooms?: any[]
  createdAt: string
}

export default function MyProfilePage() {
  const [farmer, setFarmer] = useState<Farmer | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    location: "",
  })
  const router = useRouter()

  useEffect(() => {
    const farmerId = localStorage.getItem("farmerId")
    const token = localStorage.getItem("token")

    if (!farmerId || !token) {
      router.push("/")
      return
    }

    fetchFarmerProfile(farmerId)
  }, [router])

  const fetchFarmerProfile = async (farmerId: string) => {
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api'
      const response = await fetch(`${API_BASE}/farmers/profile/${farmerId}`, {
        headers: { 
          Authorization: `Bearer ${localStorage.getItem("token")}` 
        },
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch profile')
      }

      const data = await response.json()
      setFarmer(data)
      setFormData({
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        phone: data.phone || "",
        location: data.location || "",
      })
    } catch (error) {
      console.error("Error fetching farmer profile:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSaveProfile = async () => {
    if (!farmer) return

    setSaving(true)
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api'
      const response = await fetch(`${API_BASE}/farmers/profile/${farmer._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        throw new Error('Failed to update profile')
      }

      const updatedData = await response.json()
      setFarmer(updatedData.farmer || updatedData)
      setEditing(false)
      alert('✅ Profile updated successfully!')
    } catch (error) {
      console.error("Error updating profile:", error)
      alert('❌ Failed to update profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleCancelEdit = () => {
    if (farmer) {
      setFormData({
        firstName: farmer.firstName || "",
        lastName: farmer.lastName || "",
        phone: farmer.phone || "",
        location: farmer.location || "",
      })
    }
    setEditing(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-green-500 rounded-full animate-pulse mx-auto" />
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    )
  }

  if (!farmer) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-red-600">Failed to load profile</p>
          <Button onClick={() => router.push('/dashboard')} className="mt-4">
            Go to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <DashboardLayout farmer={farmer}>
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Header with Brand Colors */}
        <div className="bg-gradient-to-r from-yellow-400 to-green-500 text-white rounded-lg p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">My Profile</h1>
              <p className="text-white/90 text-sm mt-1">Manage your account information</p>
            </div>
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-5xl">
              👤
            </div>
          </div>
        </div>

        {/* Profile Information Card */}
        <Card className="p-6 bg-white shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Personal Information</h2>
            {!editing ? (
              <Button 
                onClick={() => setEditing(true)}
                className="bg-gradient-to-r from-yellow-400 to-green-500 hover:from-yellow-500 hover:to-green-600 text-white"
              >
                ✏️ Edit Profile
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button 
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="bg-green-500 hover:bg-green-600 text-white"
                >
                  {saving ? "Saving..." : "💾 Save"}
                </Button>
                <Button 
                  onClick={handleCancelEdit}
                  disabled={saving}
                  variant="outline"
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* First Name */}
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-gray-700 font-semibold">
                First Name
              </Label>
              {editing ? (
                <Input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="border-gray-300"
                />
              ) : (
                <div className="px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-900 font-medium">{farmer.firstName}</p>
                </div>
              )}
            </div>

            {/* Last Name */}
            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-gray-700 font-semibold">
                Last Name
              </Label>
              {editing ? (
                <Input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="border-gray-300"
                />
              ) : (
                <div className="px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-900 font-medium">{farmer.lastName}</p>
                </div>
              )}
            </div>

            {/* Email (Read-only) */}
            <div className="space-y-2">
              <Label className="text-gray-700 font-semibold">
                Email Address
              </Label>
              <div className="px-4 py-3 bg-gray-100 rounded-lg border border-gray-300">
                <p className="text-gray-700 font-medium flex items-center gap-2">
                  📧 {farmer.email}
                </p>
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-gray-700 font-semibold">
                Phone Number
              </Label>
              {editing ? (
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+254 700 000 000"
                  className="border-gray-300"
                />
              ) : (
                <div className="px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-900 font-medium">
                    📱 {farmer.phone || "Not provided"}
                  </p>
                </div>
              )}
            </div>

            {/* Location */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="location" className="text-gray-700 font-semibold">
                Location
              </Label>
              {editing ? (
                <Input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="e.g., Kisumu, Kenya"
                  className="border-gray-300"
                />
              ) : (
                <div className="px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-900 font-medium">
                    📍 {farmer.location || "Not provided"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Account Statistics */}
        <Card className="p-6 bg-gradient-to-br from-green-50 to-yellow-50 shadow-lg">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Account Statistics</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4 shadow">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-2xl">
                  🏠
                </div>
                <div>
                  <p className="text-sm text-gray-600">Rented Rooms</p>
                  <p className="text-2xl font-bold text-green-600">
                    {farmer.rentedRooms?.length || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center text-2xl">
                  👥
                </div>
                <div>
                  <p className="text-sm text-gray-600">Account Type</p>
                  <Badge className="mt-1 bg-yellow-500">
                    {farmer.farmerType || "Individual"}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-2xl">
                  📅
                </div>
                <div>
                  <p className="text-sm text-gray-600">Member Since</p>
                  <p className="text-sm font-semibold text-gray-800">
                    {new Date(farmer.createdAt).toLocaleDateString('en-KE', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Chama Information (if applicable) */}
        {farmer.chamaId && (
          <Card className="p-6 bg-white shadow-lg">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Chama Membership</h2>
            <div className="flex items-center gap-4 p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-3xl">
                👥
              </div>
              <div>
                <p className="text-sm text-gray-600">Chama Name</p>
                <p className="text-lg font-bold text-green-700">
                  {typeof farmer.chamaId === 'object' ? farmer.chamaId.name : 'Member'}
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Security Information */}
        <Card className="p-6 bg-white shadow-lg">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Security</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🔒</span>
                <div>
                  <p className="font-semibold text-gray-800">Password</p>
                  <p className="text-sm text-gray-600">Last updated: Not tracked</p>
                </div>
              </div>
              <Button 
                variant="outline"
                className="border-yellow-500 text-yellow-600 hover:bg-yellow-50"
              >
                Change Password
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  )
}
