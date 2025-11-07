import express from "express"
import Farmer from "../models/Farmer.js"
import Room from "../models/Room.js"
import Billing from "../models/Billing.js"
import Produce from "../models/Produce.js"
import Sensor from "../models/Sensor.js"

const router = express.Router()

// Get all farmers
router.get("/farmers", async (req, res) => {
  try {
    const farmers = await Farmer.find()
      .select("-password")
      .populate("rentedRooms")
      .sort({ createdAt: -1 })
      
    res.json(farmers)
  } catch (error) {
    console.error("Get farmers error:", error)
    res.status(500).json({ message: error.message })
  }
})

// Get all rooms
router.get("/rooms", async (req, res) => {
  try {
    const rooms = await Room.find()
      .populate("owner", "-password")
      .populate("sensorId")
      .sort({ roomNumber: 1 })
      
    res.json(rooms)
  } catch (error) {
    console.error("Get rooms error:", error)
    res.status(500).json({ message: error.message })
  }
})

// Get dashboard statistics
router.get("/stats", async (req, res) => {
  try {
    // Count statistics
    const totalFarmers = await Farmer.countDocuments()
    const activeFarmers = await Farmer.countDocuments({ isActive: true })
    const totalRooms = await Room.countDocuments()
    const availableRooms = await Room.countDocuments({ status: "Available" })
    const occupiedRooms = await Room.countDocuments({ status: "Occupied" })
    const maintenanceRooms = await Room.countDocuments({ status: "Maintenance" })
    const totalProduce = await Produce.countDocuments()
    const activeProduce = await Produce.countDocuments({ status: "Active" })
    const soldProduce = await Produce.countDocuments({ sold: true })
    
    // Billing statistics
    const totalBilling = await Billing.aggregate([
      { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ])
    const totalRevenue = totalBilling[0]?.total || 0
    
    const paidBilling = await Billing.aggregate([
      { $match: { status: "Paid" } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ])
    const paidRevenue = paidBilling[0]?.total || 0
    
    const pendingBills = await Billing.countDocuments({ status: "Pending" })
    const overdueBills = await Billing.countDocuments({ status: "Overdue" })
    
    // Capacity statistics
    const capacityStats = await Room.aggregate([
      {
        $group: {
          _id: null,
          totalCapacity: { $sum: "$capacity" },
          totalOccupied: { $sum: "$currentOccupancy" }
        }
      }
    ])
    
    const totalCapacity = capacityStats[0]?.totalCapacity || 0
    const totalOccupied = capacityStats[0]?.totalOccupied || 0
    const occupancyRate = totalCapacity > 0 ? (totalOccupied / totalCapacity) * 100 : 0
    
    // Sensor statistics
    const onlineSensors = await Sensor.countDocuments({ isOnline: true })
    const offlineSensors = await Sensor.countDocuments({ isOnline: false })
    const totalAlerts = await Sensor.aggregate([
      { $unwind: "$activeAlerts" },
      { $match: { "activeAlerts.resolved": false } },
      { $count: "total" }
    ])
    
    // Recent activity
    const recentFarmers = await Farmer.find()
      .select("-password")
      .sort({ createdAt: -1 })
      .limit(5)
      
    const recentRooms = await Room.find()
      .populate("owner", "firstName lastName")
      .sort({ createdAt: -1 })
      .limit(5)
    
    res.json({
      farmers: {
        total: totalFarmers,
        active: activeFarmers,
        inactive: totalFarmers - activeFarmers
      },
      rooms: {
        total: totalRooms,
        available: availableRooms,
        occupied: occupiedRooms,
        maintenance: maintenanceRooms,
        occupancyRate: occupancyRate.toFixed(2)
      },
      produce: {
        total: totalProduce,
        active: activeProduce,
        sold: soldProduce
      },
      billing: {
        totalRevenue,
        paidRevenue,
        pendingRevenue: totalRevenue - paidRevenue,
        pendingBills,
        overdueBills
      },
      capacity: {
        total: totalCapacity,
        occupied: totalOccupied,
        available: totalCapacity - totalOccupied,
        occupancyRate: occupancyRate.toFixed(2)
      },
      sensors: {
        online: onlineSensors,
        offline: offlineSensors,
        activeAlerts: totalAlerts[0]?.total || 0
      },
      recentActivity: {
        farmers: recentFarmers,
        rooms: recentRooms
      }
    })
  } catch (error) {
    console.error("Get stats error:", error)
    res.status(500).json({ message: error.message })
  }
})

// Get system health
router.get("/health", async (req, res) => {
  try {
    const sensors = await Sensor.find()
    const rooms = await Room.find()
    
    const criticalAlerts = []
    const warnings = []
    
    // Check sensor alerts
    sensors.forEach(sensor => {
      const critical = sensor.activeAlerts.filter(
        alert => !alert.resolved && alert.severity === "Critical"
      )
      const high = sensor.activeAlerts.filter(
        alert => !alert.resolved && alert.severity === "High"
      )
      
      criticalAlerts.push(...critical)
      warnings.push(...high)
    })
    
    // Check rooms needing maintenance
    rooms.forEach(room => {
      if (room.needsMaintenance()) {
        warnings.push({
          type: "Maintenance",
          message: `Room ${room.roomNumber} needs maintenance`,
          severity: "High"
        })
      }
    })
    
    res.json({
      status: criticalAlerts.length > 0 ? "Critical" : warnings.length > 0 ? "Warning" : "Good",
      criticalAlerts: criticalAlerts.length,
      warnings: warnings.length,
      details: {
        critical: criticalAlerts,
        warnings: warnings
      }
    })
  } catch (error) {
    console.error("Get health error:", error)
    res.status(500).json({ message: error.message })
  }
})

// Get revenue analytics
router.get("/analytics/revenue", async (req, res) => {
  try {
    const { period = "month" } = req.query
    
    let dateFilter
    const now = new Date()
    
    switch (period) {
      case "week":
        dateFilter = new Date(now.setDate(now.getDate() - 7))
        break
      case "month":
        dateFilter = new Date(now.setMonth(now.getMonth() - 1))
        break
      case "year":
        dateFilter = new Date(now.setFullYear(now.getFullYear() - 1))
        break
      default:
        dateFilter = new Date(now.setMonth(now.getMonth() - 1))
    }
    
    const revenue = await Billing.aggregate([
      { $match: { createdAt: { $gte: dateFilter } } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" }
          },
          totalAmount: { $sum: "$totalAmount" },
          paidAmount: {
            $sum: {
              $cond: [{ $eq: ["$status", "Paid"] }, "$totalAmount", 0]
            }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } }
    ])
    
    res.json(revenue)
  } catch (error) {
    console.error("Get revenue analytics error:", error)
    res.status(500).json({ message: error.message })
  }
})

export default router
