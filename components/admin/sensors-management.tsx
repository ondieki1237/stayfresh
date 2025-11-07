"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"

export default function SensorsManagement() {
  const [sensors, setSensors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSensors()
  }, [])

  const fetchSensors = async () => {
    try {
      const response = await fetch("https://www.kisumu.codewithseth.co.ke/api/sensors")
      const data = await response.json()
      setSensors(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error fetching sensors:", error)
      setSensors([])
    } finally {
      setLoading(false)
    }
  }

  const getSensorStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "bg-primary/20 text-primary border-primary/30"
      case "warning":
        return "bg-chart-4/20 text-chart-4 border-chart-4/30"
      case "critical":
        return "bg-destructive/20 text-destructive border-destructive/30"
      default:
        return "bg-muted text-muted-foreground border-muted"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-gradient-to-r from-primary to-chart-4 rounded-full animate-pulse mx-auto" />
          <p className="text-muted-foreground">Loading sensors...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <span>📡</span> Sensors Management
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            {sensors.length} sensor{sensors.length !== 1 ? "s" : ""} · {sensors.filter(s => s.status === "Active").length} active
          </p>
        </div>
        <Button className="bg-gradient-to-r from-primary to-chart-4 hover:from-primary/90 hover:to-chart-4/90 text-white font-semibold shadow-md hover:shadow-lg transition-all">
          <span className="mr-2">➕</span> Add Sensor
        </Button>
      </div>

      {/* Sensor Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-primary/10 to-chart-4/10 border border-primary/20 rounded-2xl p-5 shadow-sm">
          <p className="text-muted-foreground text-sm mb-2">✅ Active</p>
          <p className="text-3xl font-bold text-primary">
            {sensors.filter(s => s.status === "Active").length}
          </p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
          <p className="text-muted-foreground text-sm mb-2">⚠️ Warning</p>
          <p className="text-3xl font-bold text-chart-4">
            {sensors.filter(s => s.status === "Warning").length}
          </p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
          <p className="text-muted-foreground text-sm mb-2">🚨 Critical</p>
          <p className="text-3xl font-bold text-destructive">
            {sensors.filter(s => s.status === "Critical").length}
          </p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
          <p className="text-muted-foreground text-sm mb-2">📊 Total</p>
          <p className="text-3xl font-bold text-foreground">
            {sensors.length}
          </p>
        </div>
      </div>

      {/* Sensors Grid */}
      {sensors.length === 0 ? (
        <div className="bg-card border border-dashed border-border rounded-xl p-12 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-chart-4/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">📡</span>
          </div>
          <p className="text-muted-foreground text-lg">No sensors registered yet</p>
          <Button className="mt-4 bg-gradient-to-r from-primary to-chart-4 text-white">
            Add Your First Sensor
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sensors.map((sensor: any) => (
            <div 
              key={sensor._id} 
              className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all"
            >
              {/* Sensor Header */}
              <div className={`p-5 ${
                sensor.status === "Active" ? "bg-gradient-to-br from-primary/20 to-chart-4/20" :
                sensor.status === "Warning" ? "bg-gradient-to-br from-chart-4/20 to-chart-4/10" :
                "bg-gradient-to-br from-destructive/20 to-destructive/10"
              }`}>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                      <span>📡</span> {sensor.sensorType || "Sensor"}
                    </h3>
                    <p className="text-muted-foreground text-xs mt-1">
                      Room: {sensor.room?.roomNumber || "N/A"}
                    </p>
                  </div>
                  <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${getSensorStatusColor(sensor.status)}`}>
                    {sensor.status || "Unknown"}
                  </span>
                </div>
              </div>

              {/* Sensor Readings */}
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-primary/5 p-3 rounded-xl border border-primary/10">
                    <p className="text-muted-foreground text-xs mb-1">🌡️ Temp</p>
                    <p className="text-foreground font-bold text-lg">
                      {sensor.currentValue || sensor.temperature || "N/A"}°C
                    </p>
                  </div>
                  <div className="bg-chart-4/5 p-3 rounded-xl border border-chart-4/10">
                    <p className="text-muted-foreground text-xs mb-1">💧 Humidity</p>
                    <p className="text-foreground font-bold text-lg">
                      {sensor.humidity || "N/A"}%
                    </p>
                  </div>
                </div>

                {sensor.lastReading && (
                  <div className="text-xs text-muted-foreground">
                    Last reading: {new Date(sensor.lastReading).toLocaleString()}
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 border-primary/30 text-primary hover:bg-primary/10 rounded-xl"
                  >
                    View Logs
                  </Button>
                  <Button 
                    size="sm"
                    className="flex-1 bg-gradient-to-r from-primary to-chart-4 text-white rounded-xl shadow-sm"
                  >
                    Configure
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
