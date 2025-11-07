"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"

interface DashboardLayoutProps {
  children: React.ReactNode
  farmer: any
}

export default function DashboardLayout({ children, farmer }: DashboardLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false) // Default closed for mobile

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("farmerId")
    localStorage.removeItem("userEmail")
    router.push("/")
  }

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 fixed md:static inset-y-0 left-0 z-50 w-64 bg-card border-r border-border shadow-xl flex flex-col transition-transform duration-300`}
      >
        {/* Logo Header */}
        <div className="p-6 border-b border-border bg-gradient-to-r from-primary/10 to-chart-4/10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-chart-4 rounded-xl flex items-center justify-center shadow-md">
              <span className="text-white text-2xl">🌱</span>
            </div>
            <div>
              <span className="text-foreground font-bold text-lg block">Stay Fresh</span>
              <span className="text-muted-foreground text-xs">Cold Storage System</span>
            </div>
          </div>
        </div>

        {/* Nav Items */}
        <nav className="space-y-2 flex-1 p-4 overflow-y-auto">
          {[
            { icon: "📊", label: "Dashboard", href: "/dashboard" },
            { icon: "🏠", label: "My Rooms", href: "/dashboard/rooms" },
            { icon: "🥕", label: "My Produce", href: "/dashboard/produce" },
            { icon: "📈", label: "Market Insights", href: "/dashboard/market" },
            { icon: "🌍", label: "Global Prices", href: "/dashboard/global-prices" },
            { icon: "🛒", label: "Marketplace", href: "/dashboard/marketplace" },
            { icon: "📚", label: "Training", href: "/dashboard/training" },
            { icon: "👤", label: "My Profile", href: "/dashboard/profile" },
          ].map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? "bg-gradient-to-r from-primary to-chart-4 text-white shadow-md font-semibold"
                    : "text-muted-foreground hover:bg-primary/10 hover:text-foreground"
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="text-sm">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 space-y-2 border-t border-border">
          {/* User Info */}
          {farmer && (
            <div className="px-4 py-3 bg-gradient-to-r from-primary/10 to-chart-4/10 rounded-xl mb-2">
              <p className="text-foreground font-semibold text-sm">
                {farmer.firstName} {farmer.lastName}
              </p>
              <p className="text-muted-foreground text-xs">{farmer.email}</p>
            </div>
          )}

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-destructive hover:bg-destructive/10 rounded-xl transition-all font-medium"
          >
            <span className="text-xl">🚪</span>
            <span className="text-sm">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-background">
        {/* Mobile Header with Hamburger */}
        <div className="sticky top-0 z-30 bg-card border-b border-border shadow-sm md:hidden">
          <div className="px-4 py-3 flex items-center justify-between">
            <button
              onClick={toggleSidebar}
              className="w-10 h-10 bg-gradient-to-br from-primary to-chart-4 rounded-lg flex items-center justify-center shadow-md active:scale-95 transition-transform"
            >
              <span className="text-white text-xl">{sidebarOpen ? "✕" : "☰"}</span>
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-chart-4 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">🌱</span>
              </div>
              <span className="text-foreground font-bold">Stay Fresh</span>
            </div>
            <div className="w-10" /> {/* Spacer for centering */}
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden md:block bg-card border-b border-border shadow-sm">
          <div className="px-8 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-chart-4 bg-clip-text text-transparent">
                Stay Fresh Dashboard
              </h1>
              <p className="text-muted-foreground text-sm">Manage your cold storage</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="px-4 py-2 bg-primary/10 rounded-xl border border-primary/20">
                <span className="text-xs text-muted-foreground">Status: </span>
                <span className="text-sm font-semibold text-primary">● Online</span>
              </div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-4 md:p-8">{children}</div>
      </main>
    </div>
  )
}
