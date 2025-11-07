"use client"

import { useState } from "react"
import { API_BASE } from "@/lib/api"
import { getToken } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card } from "@/components/ui/card"

interface BookStockingProps {
  open: boolean
  onClose: () => void
  roomId: string
  roomNumber: string
  roomCapacity: number
  currentOccupancy: number
  farmerId: string
  onStockingBooked?: () => void
}

const PRODUCE_TYPES = [
  "Tomatoes", "Potatoes", "Onions", "Carrots", "Cabbage",
  "Spinach", "Kale", "Lettuce", "Broccoli", "Cauliflower",
  "Peppers", "Cucumbers", "Beans", "Peas", "Maize",
  "Bananas", "Mangoes", "Avocados", "Oranges", "Apples",
  "Strawberries", "Passion Fruit", "Pineapples", "Other"
]

const CONDITIONS = [
  { value: "Fresh", label: "Fresh ✨", desc: "Just harvested, excellent condition" },
  { value: "Good", label: "Good ✓", desc: "Well preserved, minor imperfections" },
  { value: "Fair", label: "Fair ~", desc: "Acceptable condition, needs monitoring" },
  { value: "Needs Attention", label: "Needs Attention ⚠️", desc: "Requires immediate action" }
]

export default function BookStocking({
  open,
  onClose,
  roomId,
  roomNumber,
  roomCapacity,
  currentOccupancy,
  farmerId,
  onStockingBooked
}: BookStockingProps) {
  const [produceType, setProduceType] = useState("")
  const [quantity, setQuantity] = useState("")
  const [estimatedValue, setEstimatedValue] = useState("")
  const [condition, setCondition] = useState("Fresh")
  const [targetPrice, setTargetPrice] = useState("")
  const [notes, setNotes] = useState("")
  const [booking, setBooking] = useState(false)

  const availableCapacity = roomCapacity - currentOccupancy

  const handleBookStocking = async () => {
    if (!produceType || !quantity || !estimatedValue || !targetPrice) {
      alert("⚠️ Please fill in all required fields")
      return
    }

    const quantityNum = parseFloat(quantity)
    if (quantityNum <= 0 || quantityNum > availableCapacity) {
      alert(`⚠️ Quantity must be between 1 and ${availableCapacity}kg`)
      return
    }

    setBooking(true)
    try {
      const token = getToken()
      
      if (!token) {
        alert("⚠️ Please login again to continue")
        return
      }
      
      console.log("Booking stocking with:", {
        url: `${API_BASE}/stocking/book`,
        roomId,
        farmerId,
        produceType,
        quantity: quantityNum,
      })
      
      const response = await fetch(`${API_BASE}/stocking/book`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          roomId,
          farmerId,
          produceType,
          quantity: quantityNum,
          estimatedValue: parseFloat(estimatedValue),
          condition,
          targetPrice: parseFloat(targetPrice),
          notes: notes.trim() || undefined
        }),
      })

      console.log("Response status:", response.status)
      
      if (response.ok) {
        const data = await response.json()
        alert(`✅ ${data.message}\n\nYou'll receive an email when the market price reaches KSH ${parseFloat(targetPrice).toFixed(2)}/kg`)
        
        // Reset form
        setProduceType("")
        setQuantity("")
        setEstimatedValue("")
        setCondition("Fresh")
        setTargetPrice("")
        setNotes("")
        
        onStockingBooked?.()
        onClose()
      } else {
        const errorText = await response.text()
        console.error("Error response:", errorText)
        try {
          const error = JSON.parse(errorText)
          alert(`❌ ${error.message || "Failed to book stocking"}`)
        } catch {
          alert(`❌ Server error: ${response.status} ${response.statusText}\n${errorText.substring(0, 200)}`)
        }
      }
    } catch (error: any) {
      console.error("Error booking stocking:", error)
      alert(`❌ Error booking stocking: ${error.message}\n\nPlease check:\n1. Backend server is running\n2. You're connected to internet\n3. API URL is correct: ${API_BASE}`)
    } finally {
      setBooking(false)
    }
  }

  const calculatePotentialEarnings = () => {
    const qty = parseFloat(quantity) || 0
    const price = parseFloat(targetPrice) || 0
    return (qty * price).toFixed(2)
  }

  const calculateProfit = () => {
    const earnings = parseFloat(calculatePotentialEarnings()) || 0
    const cost = parseFloat(estimatedValue) || 0
    return (earnings - cost).toFixed(2)
  }

  const pricePerKg = () => {
    const qty = parseFloat(quantity) || 0
    const value = parseFloat(estimatedValue) || 0
    if (qty === 0) return "0.00"
    return (value / qty).toFixed(2)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>📦</span> Book Stocking - Room {roomNumber}
          </DialogTitle>
          <DialogDescription>
            Add your produce to the cold room and set your target selling price
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Room Capacity Info */}
          <Card className="bg-gradient-to-r from-primary/5 to-chart-4/5 p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-muted-foreground">Room Capacity</span>
              <span className="text-sm font-bold">
                {currentOccupancy}kg / {roomCapacity}kg
              </span>
            </div>
            <div className="w-full bg-background/50 rounded-full h-2">
              <div
                className="h-full bg-gradient-to-r from-primary to-chart-4 rounded-full transition-all"
                style={{ width: `${(currentOccupancy / roomCapacity) * 100}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Available: <strong>{availableCapacity}kg</strong>
            </p>
          </Card>

          {/* Produce Type */}
          <div className="space-y-2">
            <Label htmlFor="produceType">
              Produce Type <span className="text-destructive">*</span>
            </Label>
            <Select value={produceType} onValueChange={setProduceType}>
              <SelectTrigger id="produceType">
                <SelectValue placeholder="Select produce type..." />
              </SelectTrigger>
              <SelectContent>
                {PRODUCE_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Quantity */}
          <div className="space-y-2">
            <Label htmlFor="quantity">
              Quantity (kg) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="quantity"
              type="number"
              min="0.1"
              max={availableCapacity}
              step="0.1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder={`Max: ${availableCapacity}kg`}
            />
            <p className="text-xs text-muted-foreground">
              Enter the weight of produce you want to store
            </p>
          </div>

          {/* Estimated Value */}
          <div className="space-y-2">
            <Label htmlFor="estimatedValue">
              Initial Investment/Value (KSH) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="estimatedValue"
              type="number"
              min="0"
              step="0.01"
              value={estimatedValue}
              onChange={(e) => setEstimatedValue(e.target.value)}
              placeholder="Total cost/value of produce"
            />
            {quantity && estimatedValue && (
                <p className="text-xs text-muted-foreground">
                Cost per kg: <strong>KSH {pricePerKg()}</strong>
              </p>
            )}
          </div>

          {/* Condition */}
          <div className="space-y-2">
            <Label htmlFor="condition">Produce Condition</Label>
            <Select value={condition} onValueChange={setCondition}>
              <SelectTrigger id="condition">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CONDITIONS.map((cond) => (
                  <SelectItem key={cond.value} value={cond.value}>
                    <div>
                      <div className="font-medium">{cond.label}</div>
                      <div className="text-xs text-muted-foreground">{cond.desc}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Target Price */}
          <div className="space-y-2">
            <Label htmlFor="targetPrice">
              Target Selling Price (KSH/kg) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="targetPrice"
              type="number"
              min="0"
              step="0.01"
              value={targetPrice}
              onChange={(e) => setTargetPrice(e.target.value)}
              placeholder="Price you want to sell at"
            />
            <p className="text-xs text-muted-foreground">
              📧 You'll receive an email when market price reaches this level
            </p>
          </div>

          {/* Profit Calculator */}
          {quantity && estimatedValue && targetPrice && (
            <Card className="bg-gradient-to-r from-chart-4/10 to-primary/10 p-4">
              <h4 className="font-semibold mb-3 text-foreground">💰 Potential Earnings</h4>
                <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Initial Investment</span>
                  <span className="font-semibold">KSH {parseFloat(estimatedValue).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Target Value</span>
                  <span className="font-semibold text-primary">KSH {calculatePotentialEarnings()}</span>
                </div>
                <div className="border-t pt-2 flex justify-between">
                  <span className="text-muted-foreground font-medium">Expected Profit</span>
                  <span className="font-bold text-chart-4 text-lg">
                    KSH {calculateProfit()}
                    {estimatedValue !== "0" && (
                      <span className="text-xs ml-1">
                        ({(((parseFloat(calculateProfit())) / parseFloat(estimatedValue)) * 100).toFixed(1)}%)
                      </span>
                    )}
                  </span>
                </div>
              </div>
            </Card>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any special requirements or observations..."
              rows={3}
              className="resize-none"
            />
          </div>

          {/* Important Notice */}
          <div className="bg-chart-4/10 border border-chart-4/30 rounded-lg p-4">
            <p className="text-sm font-semibold mb-2">📊 How Price Monitoring Works:</p>
            <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
              <li>Market prices are checked every hour automatically</li>
              <li>You'll receive an email when your target price is reached</li>
              <li>Price history is tracked for your analysis</li>
              <li>You can update your target price anytime</li>
              <li>Multiple produce types can be stored per room</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={booking}
          >
            Cancel
          </Button>
          <Button
            onClick={handleBookStocking}
            disabled={booking || !produceType || !quantity || !estimatedValue || !targetPrice}
            className="bg-gradient-to-r from-primary to-chart-4 hover:from-primary/90 hover:to-chart-4/90 text-white"
          >
            {booking ? "Booking..." : "Book Stocking"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
