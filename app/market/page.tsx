"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Phone, Mail, MapPin, Package, Loader2, Search, ShoppingCart } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Produce {
  _id: string
  name: string
  image: string
  price: number
  quantity: number
  condition: string
  farmer: {
    name: string
    phone: string
    email: string
  }
  room: string
  stockedAt: string
  estimatedValue: number
  source?: string // "stocking" or "legacy"
}

interface Stats {
  totalListings: number
  totalQuantity: number
  produceTypes: number
  breakdown?: {
    approved: number
    legacy: number
  }
}

export default function MarketPage() {
  const [produce, setProduce] = useState<Produce[]>([])
  const [filteredProduce, setFilteredProduce] = useState<Produce[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [conditionFilter, setConditionFilter] = useState("all")

  useEffect(() => {
    fetchProduce()
    fetchStats()
  }, [])

  useEffect(() => {
    filterProduce()
  }, [searchTerm, conditionFilter, produce])

  const fetchProduce = async () => {
    try {
      setLoading(true)
      const response = await fetch("http://localhost:5000/api/marketplace/produce")
      
      if (!response.ok) {
        throw new Error("Failed to fetch produce")
      }
      
      const data = await response.json()
      setProduce(data)
      setFilteredProduce(data)
    } catch (error) {
      console.error("Error fetching produce:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/marketplace/produce/stats")
      
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error("Error fetching stats:", error)
    }
  }

  const filterProduce = () => {
    let filtered = produce

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.farmer.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by condition
    if (conditionFilter !== "all") {
      filtered = filtered.filter(item => item.condition === conditionFilter)
    }

    setFilteredProduce(filtered)
  }

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case "Fresh": return "bg-green-100 text-green-800 border-green-300"
      case "Good": return "bg-blue-100 text-blue-800 border-blue-300"
      case "Fair": return "bg-yellow-100 text-yellow-800 border-yellow-300"
      case "Needs Attention": return "bg-red-100 text-red-800 border-red-300"
      default: return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  const handleContactSeller = (phone: string, produceName: string) => {
    window.location.href = `tel:${phone}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-green-50">
      {/* Header Section */}
      <header className="bg-gradient-to-r from-yellow-400 to-green-600 text-white py-8 shadow-lg">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-2 flex items-center gap-3">
            <ShoppingCart className="h-10 w-10" />
            Fresh Produce Market
          </h1>
          <p className="text-lg md:text-xl text-white/90">
            Quality farm produce stored in our cold storage facilities
          </p>
        </div>
      </header>

      {/* Stats Section */}
      {stats && (
        <div className="bg-white border-b shadow-sm">
          <div className="container mx-auto px-4 py-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-3 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <Package className="h-8 w-8 text-yellow-600" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalListings}</p>
                  <p className="text-sm text-gray-600">Available Products</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                <Package className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalQuantity.toLocaleString()} kg</p>
                  <p className="text-sm text-gray-600">Total Stock Available</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <Package className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.produceTypes}</p>
                  <p className="text-sm text-gray-600">Produce Categories</p>
                </div>
              </div>
              {stats.breakdown && (
                <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <Package className="h-8 w-8 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-600 mb-1">System</p>
                    <p className="text-xs text-gray-500">
                      <span className="font-semibold text-green-700">{stats.breakdown.approved}</span> Approved + 
                      <span className="font-semibold text-orange-700 ml-1">{stats.breakdown.legacy}</span> Legacy
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Search and Filter Section */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by produce name or farmer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 border-2 focus:border-green-500"
            />
          </div>
          <Select value={conditionFilter} onValueChange={setConditionFilter}>
            <SelectTrigger className="w-full md:w-[200px] h-12 border-2">
              <SelectValue placeholder="Filter by condition" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Conditions</SelectItem>
              <SelectItem value="Fresh">Fresh</SelectItem>
              <SelectItem value="Good">Good</SelectItem>
              <SelectItem value="Fair">Fair</SelectItem>
              <SelectItem value="Needs Attention">Needs Attention</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-green-600 mb-4" />
            <p className="text-gray-600 text-lg">Loading fresh produce...</p>
          </div>
        )}

        {/* No Results */}
        {!loading && filteredProduce.length === 0 && (
          <Alert className="max-w-2xl mx-auto my-12">
            <Package className="h-5 w-5" />
            <AlertDescription className="text-center text-lg">
              {produce.length === 0
                ? "No produce available at the moment. Check back soon!"
                : "No produce matches your search criteria."}
            </AlertDescription>
          </Alert>
        )}

        {/* Produce Grid */}
        {!loading && filteredProduce.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProduce.map((item) => (
              <Card key={item._id} className="overflow-hidden hover:shadow-xl transition-all duration-300 border-2 hover:border-green-400">
                {/* Product Image */}
                <div className="relative h-48 overflow-hidden bg-gray-100">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                    onError={(e) => {
                      e.currentTarget.src = "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=400"
                    }}
                  />
                  <div className="absolute top-3 right-3 flex gap-2">
                    <Badge className={`${getConditionColor(item.condition)} border`}>
                      {item.condition}
                    </Badge>
                    {item.source === "legacy" && (
                      <Badge className="bg-orange-100 text-orange-800 border-orange-300">
                        Legacy
                      </Badge>
                    )}
                  </div>
                </div>

                <CardHeader className="pb-3">
                  <CardTitle className="text-xl text-gray-900">{item.name}</CardTitle>
                  <CardDescription className="flex items-center gap-1 text-sm">
                    <MapPin className="h-3 w-3" />
                    Room {item.room}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-3">
                  {/* Price */}
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-green-600">
                      KSH {item.price.toLocaleString()}
                    </span>
                    <span className="text-sm text-gray-600">/kg</span>
                  </div>

                  {/* Quantity Available */}
                  <div className="flex items-center justify-between py-2 px-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <span className="text-sm font-medium text-gray-700">Available</span>
                    <span className="text-lg font-bold text-gray-900">{item.quantity} kg</span>
                  </div>

                  {/* Total Value */}
                  <div className="flex items-center justify-between py-2 px-3 bg-green-50 rounded-lg border border-green-200">
                    <span className="text-sm font-medium text-gray-700">Total Value</span>
                    <span className="text-lg font-bold text-green-700">
                      KSH {item.estimatedValue.toLocaleString()}
                    </span>
                  </div>

                  {/* Farmer Info */}
                  <div className="pt-2 border-t space-y-2">
                    <p className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                      👨‍🌾 {item.farmer.name}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="h-4 w-4" />
                      <span className="font-mono">{item.farmer.phone}</span>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="pt-0">
                  <Button
                    onClick={() => handleContactSeller(item.farmer.phone, item.name)}
                    className="w-full bg-gradient-to-r from-yellow-400 to-green-600 hover:from-yellow-500 hover:to-green-700 text-white font-semibold h-11"
                  >
                    <Phone className="mr-2 h-4 w-4" />
                    Contact Seller
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-12">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-2xl font-bold mb-2 text-yellow-400">Stay Fresh</h3>
          <p className="text-gray-400">Cold Storage Management System</p>
          <p className="text-sm text-gray-500 mt-4">
            Quality produce, properly stored, directly from farmers
          </p>
        </div>
      </footer>
    </div>
  )
}
