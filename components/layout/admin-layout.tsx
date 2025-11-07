"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("isAdmin")
    localStorage.removeItem("userEmail")
    router.push("/admin/login")
  }

  const navItems = [
    { icon: "📊", label: "Dashboard", href: "/admin" },
    { icon: "👥", label: "Farmers", href: "/admin/farmers" },
    { icon: "🏠", label: "Rooms", href: "/admin/rooms" },
    { icon: "📦", label: "Produce", href: "/admin/produce" },
    { icon: "💳", label: "Billing", href: "/admin/billing" },
    { icon: "📡", label: "Sensors", href: "/admin/sensors" },
    { icon: "📈", label: "Analytics", href: "/admin/analytics" },
    { icon: "⚙️", label: "Settings", href: "/admin/settings" },
  ]

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-card border-r border-border shadow-lg flex flex-col transition-all duration-300`}
      >
        {/* Logo Header */}
        <div className="p-6 border-b border-border bg-gradient-to-r from-primary/10 to-chart-4/10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-chart-4 rounded-xl flex items-center justify-center shadow-md">
              <span className="text-white text-2xl">🌱</span>
            </div>
            {sidebarOpen && (
              <div>
                <span className="text-foreground font-bold text-lg block">Stay Fresh</span>
                <span className="text-muted-foreground text-xs">Admin Panel</span>
              </div>
            )}
          </div>
        </div>

        {/* Nav Items */}
        <nav className="space-y-2 flex-1 p-4 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? "bg-gradient-to-r from-primary to-chart-4 text-white shadow-md font-semibold"
                    : "text-muted-foreground hover:bg-primary/10 hover:text-foreground"
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                {sidebarOpen && <span className="text-sm">{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 space-y-2 border-t border-border">
          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-destructive hover:bg-destructive/10 rounded-xl transition-all font-medium"
          >
            <span className="text-xl">🚪</span>
            {sidebarOpen && <span className="text-sm">Logout</span>}
          </button>

          {/* Toggle Sidebar */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-all"
          >
            {sidebarOpen ? "◀️ Collapse" : "▶️"}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-background">
        {/* Top Bar */}
        <div className="bg-card border-b border-border shadow-sm sticky top-0 z-10">
          <div className="px-8 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-chart-4 bg-clip-text text-transparent">
                Stay Fresh Admin
              </h1>
              <p className="text-muted-foreground text-sm">Manage your cold storage system</p>
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
        <div className="p-8">{children}</div>
      </main>
    </div>
  )
}
