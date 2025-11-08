"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import LoginForm from "@/components/auth/login-form"
import RegisterForm from "@/components/auth/register-form"
import { Button } from "@/components/ui/button"
import { ShoppingCart } from "lucide-react"

export default function Home() {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login")
  const router = useRouter()

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-chart-4/5 p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-chart-4 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-3xl">🌱</span>
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-chart-4 bg-clip-text text-transparent mb-2">
            Stay Fresh
          </h1>
          <p className="text-muted-foreground">Smart cold storage for farmers</p>
          
          {/* Market Link */}
          <Button
            onClick={() => router.push("/market")}
            variant="outline"
            className="mt-4 bg-gradient-to-r from-yellow-400 to-green-600 text-white border-0 hover:from-yellow-500 hover:to-green-700"
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            Browse Market
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-muted/30 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab("login")}
            className={`flex-1 py-3 font-medium rounded-lg transition-all ${
              activeTab === "login"
                ? "bg-primary text-primary-foreground shadow-md"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setActiveTab("register")}
            className={`flex-1 py-3 font-medium rounded-lg transition-all ${
              activeTab === "register"
                ? "bg-primary text-primary-foreground shadow-md"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Register
          </button>
        </div>

        {/* Forms */}
        <div className="bg-card p-6 rounded-2xl border border-border shadow-xl">
          {activeTab === "login" ? <LoginForm /> : <RegisterForm onSuccess={() => setActiveTab("login")} />}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          Manage your produce with confidence
        </p>
      </div>
    </main>
  )
}
