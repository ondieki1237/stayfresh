import express from "express"
import PDFDocument from "pdfkit"
import Stocking from "../models/Stocking.js"
import Room from "../models/Room.js"
import Farmer from "../models/Farmer.js"
import MarketData from "../models/MarketData.js"
import { authMiddleware } from "../middleware/auth.js"

const router = express.Router()

// Book stocking (add produce to room)
router.post("/book", authMiddleware, async (req, res) => {
  try {
    const {
      roomId,
      farmerId,
      produceType,
      quantity,
      estimatedValue,
      condition,
      targetPrice,
      notes
    } = req.body

    // Validate room exists and belongs to farmer
    const room = await Room.findById(roomId)
    if (!room) {
      return res.status(404).json({ message: "Room not found" })
    }

    if (room.renter?.toString() !== farmerId) {
      return res.status(403).json({ message: "You don't have access to this room" })
    }

    // Check room capacity
    const currentStockings = await Stocking.find({ 
      room: roomId, 
      status: { $in: ["Stocked", "Monitoring", "Target Reached"] }
    })
    
    const totalStocked = currentStockings.reduce((sum, s) => sum + s.quantity, 0)
    if (totalStocked + quantity > room.capacity) {
      return res.status(400).json({ 
        message: `Room capacity exceeded. Available: ${room.capacity - totalStocked}kg, Requested: ${quantity}kg` 
      })
    }

    // Get current market price
    const latestMarketData = await MarketData.findOne({ produceType })
      .sort({ timestamp: -1 })
      .limit(1)
    
    const currentMarketPrice = latestMarketData?.currentPrice || 0

    // Create stocking with pending status
    const stocking = new Stocking({
      room: roomId,
      farmer: farmerId,
      produceType,
      quantity,
      estimatedValue,
      condition,
      targetPrice,
      currentMarketPrice,
      notes,
      status: "Pending",
      approvalStatus: "Pending",
      priceHistory: [{
        price: currentMarketPrice,
        checkedAt: new Date()
      }]
    })

    await stocking.save()

    // Don't update room occupancy until approved
    
    // Populate for response
    await stocking.populate("room farmer")

    res.status(201).json({
      message: "Booking submitted successfully! Waiting for admin approval.",
      stocking
    })
  } catch (error) {
    console.error("Book stocking error:", error)
    res.status(500).json({ message: error.message })
  }
})

// Get all stockings for a room
router.get("/room/:roomId", authMiddleware, async (req, res) => {
  try {
    const stockings = await Stocking.find({ room: req.params.roomId })
      .populate("farmer", "firstName lastName email")
      .sort({ stockedAt: -1 })

    // Get current market prices for each produce type
    const produceTypes = [...new Set(stockings.map(s => s.produceType))]
    const marketPrices = await MarketData.find({ 
      produceType: { $in: produceTypes } 
    })
      .sort({ timestamp: -1 })
      .limit(produceTypes.length)

    // Update current prices in stockings
    const stockingsWithPrices = stockings.map(stocking => {
      const marketData = marketPrices.find(m => m.produceType === stocking.produceType)
      const stockingObj = stocking.toObject({ virtuals: true })
      stockingObj.currentMarketPrice = marketData?.currentPrice || stocking.currentMarketPrice
      return stockingObj
    })

    res.json(stockingsWithPrices)
  } catch (error) {
    console.error("Get room stockings error:", error)
    res.status(500).json({ message: error.message })
  }
})

// Get all stockings for a farmer
router.get("/farmer/:farmerId", authMiddleware, async (req, res) => {
  try {
    const stockings = await Stocking.find({ farmer: req.params.farmerId })
      .populate("room", "roomNumber capacity status")
      .sort({ stockedAt: -1 })

    res.json(stockings)
  } catch (error) {
    console.error("Get farmer stockings error:", error)
    res.status(500).json({ message: error.message })
  }
})

// Get single stocking
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const stocking = await Stocking.findById(req.params.id)
      .populate("room", "roomNumber capacity")
      .populate("farmer", "firstName lastName email phone")

    if (!stocking) {
      return res.status(404).json({ message: "Stocking not found" })
    }

    res.json(stocking)
  } catch (error) {
    console.error("Get stocking error:", error)
    res.status(500).json({ message: error.message })
  }
})

// Update stocking
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { quantity, condition, targetPrice, status, notes } = req.body

    const stocking = await Stocking.findById(req.params.id)
    if (!stocking) {
      return res.status(404).json({ message: "Stocking not found" })
    }

    // Update fields
    if (quantity !== undefined) {
      // Check room capacity if quantity increased
      if (quantity > stocking.quantity) {
        const room = await Room.findById(stocking.room)
        const otherStockings = await Stocking.find({ 
          room: stocking.room,
          _id: { $ne: stocking._id },
          status: { $in: ["Stocked", "Monitoring", "Target Reached"] }
        })
        
        const totalOther = otherStockings.reduce((sum, s) => sum + s.quantity, 0)
        if (totalOther + quantity > room.capacity) {
          return res.status(400).json({ 
            message: `Room capacity exceeded. Available: ${room.capacity - totalOther}kg` 
          })
        }

        // Update room occupancy
        room.currentOccupancy = totalOther + quantity
        await room.save()
      }
      
      stocking.quantity = quantity
    }
    
    if (condition) stocking.condition = condition
    if (targetPrice) {
      stocking.targetPrice = targetPrice
      stocking.priceAlertSent = false // Reset alert
    }
    if (status) stocking.status = status
    if (notes !== undefined) stocking.notes = notes

    await stocking.save()

    res.json({ 
      message: "Stocking updated successfully", 
      stocking 
    })
  } catch (error) {
    console.error("Update stocking error:", error)
    res.status(500).json({ message: error.message })
  }
})

// Remove stocking (mark as removed)
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const stocking = await Stocking.findById(req.params.id)
    if (!stocking) {
      return res.status(404).json({ message: "Stocking not found" })
    }

    // Update room occupancy
    const room = await Room.findById(stocking.room)
    if (room) {
      room.currentOccupancy = Math.max(0, room.currentOccupancy - stocking.quantity)
      
      // Check if room is now empty
      const remainingStockings = await Stocking.find({
        room: room._id,
        _id: { $ne: stocking._id },
        status: { $in: ["Stocked", "Monitoring", "Target Reached"] }
      })
      
      if (remainingStockings.length === 0) {
        room.currentOccupancy = 0
      }
      
      await room.save()
    }

    stocking.status = "Removed"
    await stocking.save()

    res.json({ 
      message: "Stocking removed successfully",
      stocking
    })
  } catch (error) {
    console.error("Remove stocking error:", error)
    res.status(500).json({ message: error.message })
  }
})

// Get stocking statistics for farmer
router.get("/farmer/:farmerId/stats", authMiddleware, async (req, res) => {
  try {
    const stockings = await Stocking.find({ farmer: req.params.farmerId })

    const stats = {
      totalStockings: stockings.length,
      activeStockings: stockings.filter(s => 
        ["Stocked", "Monitoring", "Target Reached"].includes(s.status)
      ).length,
      totalQuantity: stockings.reduce((sum, s) => sum + s.quantity, 0),
      targetReached: stockings.filter(s => s.status === "Target Reached").length,
      averageTargetPrice: stockings.reduce((sum, s) => sum + s.targetPrice, 0) / stockings.length || 0,
      totalEstimatedValue: stockings.reduce((sum, s) => sum + s.estimatedValue, 0)
    }

    res.json(stats)
  } catch (error) {
    console.error("Get stocking stats error:", error)
    res.status(500).json({ message: error.message })
  }
})

// Get all pending bookings (admin only)
router.get("/pending/all", authMiddleware, async (req, res) => {
  try {
    const pendingBookings = await Stocking.find({ approvalStatus: "Pending" })
      .populate("farmer", "firstName lastName email phone")
      .populate("room", "roomNumber capacity currentOccupancy")
      .sort({ createdAt: -1 })

    res.json(pendingBookings)
  } catch (error) {
    console.error("Get pending bookings error:", error)
    res.status(500).json({ message: error.message })
  }
})

// Approve booking (admin only)
router.patch("/:id/approve", authMiddleware, async (req, res) => {
  try {
    const stocking = await Stocking.findById(req.params.id)
      .populate("room")
      .populate("farmer")
    
    if (!stocking) {
      return res.status(404).json({ message: "Booking not found" })
    }

    if (stocking.approvalStatus !== "Pending") {
      return res.status(400).json({ 
        message: `Booking already ${stocking.approvalStatus.toLowerCase()}` 
      })
    }

    // Check room capacity again
    const currentStockings = await Stocking.find({ 
      room: stocking.room._id, 
      status: { $in: ["Approved", "Stocked", "Monitoring", "Target Reached"] }
    })
    
    const totalStocked = currentStockings.reduce((sum, s) => sum + s.quantity, 0)
    if (totalStocked + stocking.quantity > stocking.room.capacity) {
      return res.status(400).json({ 
        message: `Room capacity exceeded. Available: ${stocking.room.capacity - totalStocked}kg, Requested: ${stocking.quantity}kg` 
      })
    }

    // Update stocking
    stocking.approvalStatus = "Approved"
    stocking.status = "Monitoring"
    stocking.approvedBy = req.user.id
    stocking.approvedAt = new Date()
    await stocking.save()

    // Update room occupancy
    const room = stocking.room
    room.currentOccupancy = totalStocked + stocking.quantity
    if (room.status === "Available") {
      room.status = "Occupied"
    }
    await room.save()

    await stocking.populate("approvedBy", "firstName lastName")

    res.json({
      message: "Booking approved successfully",
      stocking
    })
  } catch (error) {
    console.error("Approve booking error:", error)
    res.status(500).json({ message: error.message })
  }
})

// Reject booking (admin only)
router.patch("/:id/reject", authMiddleware, async (req, res) => {
  try {
    const { reason } = req.body
    
    const stocking = await Stocking.findById(req.params.id)
      .populate("farmer")
      .populate("room")
    
    if (!stocking) {
      return res.status(404).json({ message: "Booking not found" })
    }

    if (stocking.approvalStatus !== "Pending") {
      return res.status(400).json({ 
        message: `Booking already ${stocking.approvalStatus.toLowerCase()}` 
      })
    }

    // Update stocking
    stocking.approvalStatus = "Rejected"
    stocking.status = "Rejected"
    stocking.rejectionReason = reason || "No reason provided"
    stocking.approvedBy = req.user.id
    stocking.approvedAt = new Date()
    await stocking.save()

    await stocking.populate("approvedBy", "firstName lastName")

    res.json({
      message: "Booking rejected",
      stocking
    })
  } catch (error) {
    console.error("Reject booking error:", error)
    res.status(500).json({ message: error.message })
  }
})

// Get all approved stockings (for produce section)
router.get("/approved/all", authMiddleware, async (req, res) => {
  try {
    const approvedStockings = await Stocking.find({ 
      approvalStatus: "Approved",
      status: { $in: ["Approved", "Monitoring", "Target Reached", "Stocked"] }
    })
      .populate("farmer", "firstName lastName email")
      .populate("room", "roomNumber capacity")
      .sort({ approvedAt: -1 })

    res.json(approvedStockings)
  } catch (error) {
    console.error("Get approved stockings error:", error)
    res.status(500).json({ message: error.message })
  }
})

export default router

// Receipt endpoint - returns a PDF receipt for a stocking
router.get("/:id/receipt", authMiddleware, async (req, res) => {
  try {
    const stocking = await Stocking.findById(req.params.id)
      .populate("room", "roomNumber capacity")
      .populate("farmer", "firstName lastName email phone")

    if (!stocking) return res.status(404).json({ message: "Stocking not found" })

    // Create PDF document with better styling
    const doc = new PDFDocument({ 
      size: "A4", 
      margin: 50,
      bufferPages: true 
    })

    res.setHeader("Content-Type", "application/pdf")
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=StayFresh-Receipt-${stocking._id}.pdf`
    )

    doc.pipe(res)

    // Colors
    const brandYellow = '#FBBF24'
    const brandGreen = '#10B981'
    const darkGray = '#374151'
    const lightGray = '#F3F4F6'

    // Helper function to draw a colored box
    const drawBox = (x, y, width, height, color) => {
      doc.rect(x, y, width, height).fill(color)
    }

    // Header with gradient effect (simulated with rectangles)
    const headerHeight = 80
    drawBox(0, 0, doc.page.width, headerHeight, brandGreen)
    
    // Company name in header
    doc.fillColor('#FFFFFF')
       .fontSize(28)
       .font('Helvetica-Bold')
       .text('STAY FRESH', 50, 25, { align: 'left' })
    
    doc.fillColor('#FFFFFF')
       .fontSize(11)
       .font('Helvetica')
       .text('Cold Storage Management System', 50, 55)

    // Receipt title badge
    doc.fillColor(brandYellow)
       .fontSize(24)
       .font('Helvetica-Bold')
       .text('RECEIPT', doc.page.width - 200, 30, { align: 'right', width: 150 })

    // Reset position after header
    doc.fillColor(darkGray)
    let currentY = headerHeight + 30

    // Receipt information box
    doc.fontSize(10)
       .font('Helvetica')
       .fillColor('#6B7280')
       .text('Receipt No:', 50, currentY)
       .fillColor(darkGray)
       .font('Helvetica-Bold')
       .text(stocking._id.toString().substring(0, 16).toUpperCase(), 150, currentY)

    currentY += 20
    doc.font('Helvetica')
       .fillColor('#6B7280')
       .text('Date Issued:', 50, currentY)
       .fillColor(darkGray)
       .font('Helvetica-Bold')
       .text(new Date().toLocaleDateString('en-KE', { 
         year: 'numeric', 
         month: 'long', 
         day: 'numeric',
         hour: '2-digit',
         minute: '2-digit'
       }), 150, currentY)

    currentY += 20
    doc.font('Helvetica')
       .fillColor('#6B7280')
       .text('Stocking Date:', 50, currentY)
       .fillColor(darkGray)
       .font('Helvetica-Bold')
       .text(new Date(stocking.stockedAt).toLocaleDateString('en-KE', { 
         year: 'numeric', 
         month: 'long', 
         day: 'numeric' 
       }), 150, currentY)

    currentY += 35

    // Farmer details section with background
    drawBox(50, currentY, doc.page.width - 100, 110, lightGray)
    currentY += 15

    doc.fontSize(14)
       .font('Helvetica-Bold')
       .fillColor(brandGreen)
       .text('FARMER INFORMATION', 60, currentY)

    currentY += 25
    doc.fontSize(11)
       .font('Helvetica-Bold')
       .fillColor(darkGray)
       .text(`${stocking.farmer?.firstName || ""} ${stocking.farmer?.lastName || ""}`, 60, currentY)

    currentY += 18
    doc.fontSize(10)
       .font('Helvetica')
       .fillColor('#6B7280')
       .text('📧', 60, currentY)
       .fillColor(darkGray)
       .text(stocking.farmer?.email || "N/A", 80, currentY)

    currentY += 18
    doc.fillColor('#6B7280')
       .text('📱', 60, currentY)
       .fillColor(darkGray)
       .text(stocking.farmer?.phone || "N/A", 80, currentY)

    currentY += 18
    doc.fillColor('#6B7280')
       .text('🏠', 60, currentY)
       .fillColor(darkGray)
       .text(`Room ${stocking.room?.roomNumber || "N/A"} (Capacity: ${stocking.room?.capacity || 0}kg)`, 80, currentY)

    currentY += 35

    // Divider line
    doc.moveTo(50, currentY)
       .lineTo(doc.page.width - 50, currentY)
       .strokeColor(brandYellow)
       .lineWidth(2)
       .stroke()

    currentY += 25

    // Stocking details header
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .fillColor(brandGreen)
       .text('STOCKING DETAILS', 50, currentY)

    currentY += 30

    // Table header
    const tableTop = currentY
    const col1 = 50
    const col2 = 250
    const col3 = 420

    // Table header background
    drawBox(col1, tableTop, doc.page.width - 100, 25, brandGreen)

    doc.fontSize(10)
       .font('Helvetica-Bold')
       .fillColor('#FFFFFF')
       .text('ITEM', col1 + 10, tableTop + 8)
       .text('DETAILS', col2 + 10, tableTop + 8)
       .text('AMOUNT', col3 + 10, tableTop + 8)

    currentY = tableTop + 35

    // Table rows
    const addTableRow = (label, value, amount = null, isHighlight = false) => {
      if (isHighlight) {
        drawBox(col1, currentY - 5, doc.page.width - 100, 25, lightGray)
      }

      doc.fontSize(10)
         .font('Helvetica-Bold')
         .fillColor(darkGray)
         .text(label, col1 + 10, currentY)
         .font('Helvetica')
         .text(value, col2 + 10, currentY)

      if (amount !== null) {
        doc.font('Helvetica-Bold')
           .fillColor(brandGreen)
           .text(amount, col3 + 10, currentY)
      }

      currentY += 25
    }

    addTableRow('Produce Type', stocking.produceType.toUpperCase())
    addTableRow('Quantity', `${stocking.quantity} kg`, null, true)
    addTableRow('Condition', (stocking.condition || "Good").toUpperCase())
    addTableRow('Status', stocking.status.toUpperCase(), null, true)

    currentY += 10

    // Pricing section with highlight
    drawBox(col1, currentY - 5, doc.page.width - 100, 25, '#FEF3C7')
    doc.fontSize(10)
       .font('Helvetica')
       .fillColor(darkGray)
       .text('Current Market Price (per kg)', col1 + 10, currentY)
       .font('Helvetica-Bold')
       .fillColor(brandGreen)
       .text(`KSH ${Number(stocking.currentMarketPrice || 0).toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, col3 + 10, currentY)

    currentY += 30

    doc.fontSize(10)
       .font('Helvetica')
       .fillColor(darkGray)
       .text('Target Price (per kg)', col1 + 10, currentY)
       .font('Helvetica-Bold')
       .fillColor(brandYellow)
       .text(`KSH ${Number(stocking.targetPrice || 0).toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, col3 + 10, currentY)

    currentY += 35

    // Total value box
    drawBox(col1, currentY - 5, doc.page.width - 100, 35, brandGreen)
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .fillColor('#FFFFFF')
       .text('ESTIMATED TOTAL VALUE', col1 + 10, currentY + 8)
       .fontSize(16)
       .text(`KSH ${Number(stocking.estimatedValue || 0).toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, col3 + 10, currentY + 8)

    currentY += 50

    // Notes section if available
    if (stocking.notes) {
      currentY += 10
      drawBox(50, currentY, doc.page.width - 100, 80, lightGray)
      currentY += 15

      doc.fontSize(11)
         .font('Helvetica-Bold')
         .fillColor(brandGreen)
         .text('ADDITIONAL NOTES', 60, currentY)

      currentY += 20
      doc.fontSize(9)
         .font('Helvetica')
         .fillColor(darkGray)
         .text(stocking.notes, 60, currentY, { 
           width: doc.page.width - 120,
           align: 'left'
         })

      currentY += 65
    }

    // Footer
    const footerY = doc.page.height - 80
    
    // Footer line
    doc.moveTo(50, footerY)
       .lineTo(doc.page.width - 50, footerY)
       .strokeColor('#E5E7EB')
       .lineWidth(1)
       .stroke()

    doc.fontSize(9)
       .font('Helvetica')
       .fillColor('#6B7280')
       .text('Stay Fresh Cold Storage Management System', 50, footerY + 15, { align: 'center' })
       .text('📧 info@stayfresh.co.ke  |  📱 +254 700 000 000  |  🌐 www.stayfresh.co.ke', 50, footerY + 30, { align: 'center' })

    // Watermark
    doc.fontSize(60)
       .font('Helvetica-Bold')
       .fillColor('#F3F4F6')
       .opacity(0.1)
       .text('STAY FRESH', 0, doc.page.height / 2 - 30, {
         align: 'center',
         width: doc.page.width
       })

    doc.end()
  } catch (error) {
    console.error("Error generating receipt:", error)
    res.status(500).json({ message: error.message })
  }
})
