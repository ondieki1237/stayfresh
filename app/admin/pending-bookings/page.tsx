"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import AdminLayout from "@/components/layout/admin-layout"
import { PendingBookings } from "@/components/admin/pending-bookings"

export default function PendingBookingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check admin authentication
    const token = localStorage.getItem("token")
    const isAdmin = localStorage.getItem("isAdmin")

    if (!token || isAdmin !== "true") {
      router.push("/admin/login")
      return
    }

    setLoading(false)
  }, [router])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <AdminLayout>
      <PendingBookings />
    </AdminLayout>
  )
}
