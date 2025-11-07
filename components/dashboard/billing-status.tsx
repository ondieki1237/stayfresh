"use client"

import { useEffect, useState } from "react"

interface BillingStatusProps {
  farmerId: string
}

interface Billing {
  _id: string
  billingCycle: string
  amountDue: number
  totalAmount: number
  startDate: string
  endDate: string
  dueDate: string
  status: string
  room?: {
    roomNumber: string
  }
}

export default function BillingStatus({ farmerId }: BillingStatusProps) {
  const [billing, setBilling] = useState<Billing[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!farmerId) return
    fetchBilling()
  }, [farmerId])

  const fetchBilling = async () => {
    try {
      const response = await fetch(`https://www.kisumu.codewithseth.co.ke/api/billing/farmer/${farmerId}`)
      const data = await response.json()
      setBilling(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error fetching billing:", error)
      setBilling([])
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string, dueDate: string) => {
    if (status === "Paid") return "bg-primary/20 text-primary border-primary/30"
    if (new Date(dueDate) < new Date()) return "bg-destructive/20 text-destructive border-destructive/30"
    return "bg-chart-4/20 text-chart-4 border-chart-4/30"
  }

  if (loading) return <div className="text-muted-foreground">Loading billing...</div>

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-foreground">Billing & Payments</h2>

      {billing.length === 0 ? (
        <div className="bg-card border-2 border-dashed border-border rounded-lg p-8 text-center">
          <p className="text-muted-foreground">No billing records yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {billing.map((bill) => (
            <div
              key={bill._id}
              className="bg-card border border-border rounded-lg p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="text-foreground font-semibold text-lg">
                    ${bill.amountDue?.toFixed(2) || bill.totalAmount?.toFixed(2)}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    {bill.billingCycle}
                    {bill.room && <span className="ml-2">• Room {bill.room.roomNumber}</span>}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                    bill.status,
                    bill.dueDate
                  )}`}
                >
                  {bill.status}
                </span>
              </div>
              
              <div className="flex justify-between text-xs text-muted-foreground pt-3 border-t border-border">
                <span>Period: {new Date(bill.startDate).toLocaleDateString()} - {new Date(bill.endDate).toLocaleDateString()}</span>
                <span className={new Date(bill.dueDate) < new Date() && bill.status !== "Paid" ? "text-destructive font-medium" : ""}>
                  Due: {new Date(bill.dueDate).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
