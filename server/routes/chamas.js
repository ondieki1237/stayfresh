const express = require("express")
const router = express.Router()
const Chama = require("../models/Chama")
const Room = require("../models/Room")
const Farmer = require("../models/Farmer")

// Get all chamas
router.get("/", async (req, res) => {
  try {
    const chamas = await Chama.find()
      .populate("sharedRoom", "roomNumber capacity currentOccupancy status powerStatus")
      .populate("members.farmer", "name email phone")
      .sort({ createdAt: -1 })
    
    res.json(chamas)
  } catch (error) {
    console.error("Error fetching chamas:", error)
    res.status(500).json({ message: "Error fetching chamas", error: error.message })
  }
})

// Get single chama by ID
router.get("/:id", async (req, res) => {
  try {
    const chama = await Chama.findById(req.params.id)
      .populate("sharedRoom")
      .populate("members.farmer", "name email phone location")
    
    if (!chama) {
      return res.status(404).json({ message: "Chama not found" })
    }
    
    res.json(chama)
  } catch (error) {
    console.error("Error fetching chama:", error)
    res.status(500).json({ message: "Error fetching chama", error: error.message })
  }
})

// Create new chama
router.post("/", async (req, res) => {
  try {
    const {
      name,
      description,
      contactPerson,
      phone,
      email,
      location,
      members,
      sharedRoom,
      marketDays,
      monthlyFee,
      notes,
    } = req.body

    // Validate required fields
    if (!name || !contactPerson || !phone || !location) {
      return res.status(400).json({
        message: "Please provide name, contact person, phone, and location"
      })
    }

    const newChama = new Chama({
      name,
      description,
      contactPerson,
      phone,
      email,
      location,
      members: members || [],
      sharedRoom,
      marketDays: marketDays || [],
      monthlyFee: monthlyFee || 0,
      notes,
    })

    await newChama.save()

    // If a room is assigned, update it
    if (sharedRoom) {
      await Room.findByIdAndUpdate(sharedRoom, {
        roomType: "shared",
        chamaId: newChama._id,
        status: "Occupied",
      })
    }

    res.status(201).json({
      message: "Chama created successfully",
      chama: newChama,
    })
  } catch (error) {
    console.error("Error creating chama:", error)
    res.status(500).json({ message: "Error creating chama", error: error.message })
  }
})

// Update chama
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params
    const updates = req.body

    const chama = await Chama.findById(id)
    if (!chama) {
      return res.status(404).json({ message: "Chama not found" })
    }

    // If room is being changed, update old and new rooms
    if (updates.sharedRoom && updates.sharedRoom !== chama.sharedRoom?.toString()) {
      // Remove chama from old room
      if (chama.sharedRoom) {
        await Room.findByIdAndUpdate(chama.sharedRoom, {
          roomType: "individual",
          chamaId: null,
          status: "Available",
        })
      }

      // Assign chama to new room
      await Room.findByIdAndUpdate(updates.sharedRoom, {
        roomType: "shared",
        chamaId: chama._id,
        status: "Occupied",
      })
    }

    const updatedChama = await Chama.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    })
      .populate("sharedRoom")
      .populate("members.farmer")

    res.json({
      message: "Chama updated successfully",
      chama: updatedChama,
    })
  } catch (error) {
    console.error("Error updating chama:", error)
    res.status(500).json({ message: "Error updating chama", error: error.message })
  }
})

// Delete chama
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params

    const chama = await Chama.findById(id)
    if (!chama) {
      return res.status(404).json({ message: "Chama not found" })
    }

    // Free up the room
    if (chama.sharedRoom) {
      await Room.findByIdAndUpdate(chama.sharedRoom, {
        roomType: "individual",
        chamaId: null,
        status: "Available",
      })
    }

    await Chama.findByIdAndDelete(id)

    res.json({ message: "Chama deleted successfully" })
  } catch (error) {
    console.error("Error deleting chama:", error)
    res.status(500).json({ message: "Error deleting chama", error: error.message })
  }
})

// Add member to chama
router.post("/:id/members", async (req, res) => {
  try {
    const { id } = req.params
    const { farmerId, name, phone } = req.body

    const chama = await Chama.findById(id)
    if (!chama) {
      return res.status(404).json({ message: "Chama not found" })
    }

    // Check if farmer exists
    if (farmerId) {
      const farmer = await Farmer.findById(farmerId)
      if (!farmer) {
        return res.status(404).json({ message: "Farmer not found" })
      }
    }

    // Check if member already exists
    const exists = chama.members.some(
      (m) => m.farmer?.toString() === farmerId || m.name === name
    )
    if (exists) {
      return res.status(400).json({ message: "Member already exists in this chama" })
    }

    chama.members.push({
      farmer: farmerId || null,
      name,
      phone,
      joinedDate: new Date(),
      isActive: true,
    })

    await chama.save()

    res.json({
      message: "Member added successfully",
      chama,
    })
  } catch (error) {
    console.error("Error adding member:", error)
    res.status(500).json({ message: "Error adding member", error: error.message })
  }
})

// Remove member from chama
router.delete("/:id/members/:memberId", async (req, res) => {
  try {
    const { id, memberId } = req.params

    const chama = await Chama.findById(id)
    if (!chama) {
      return res.status(404).json({ message: "Chama not found" })
    }

    chama.members = chama.members.filter((m) => m._id.toString() !== memberId)
    await chama.save()

    res.json({
      message: "Member removed successfully",
      chama,
    })
  } catch (error) {
    console.error("Error removing member:", error)
    res.status(500).json({ message: "Error removing member", error: error.message })
  }
})

// Update member status (activate/deactivate)
router.put("/:id/members/:memberId", async (req, res) => {
  try {
    const { id, memberId } = req.params
    const { isActive } = req.body

    const chama = await Chama.findById(id)
    if (!chama) {
      return res.status(404).json({ message: "Chama not found" })
    }

    const member = chama.members.find((m) => m._id.toString() === memberId)
    if (!member) {
      return res.status(404).json({ message: "Member not found" })
    }

    member.isActive = isActive
    await chama.save()

    res.json({
      message: "Member status updated successfully",
      chama,
    })
  } catch (error) {
    console.error("Error updating member status:", error)
    res.status(500).json({ message: "Error updating member status", error: error.message })
  }
})

// Assign room to chama
router.post("/:id/assign-room", async (req, res) => {
  try {
    const { id } = req.params
    const { roomId } = req.body

    const chama = await Chama.findById(id)
    if (!chama) {
      return res.status(404).json({ message: "Chama not found" })
    }

    const room = await Room.findById(roomId)
    if (!room) {
      return res.status(404).json({ message: "Room not found" })
    }

    // Check if room is available
    if (room.status === "Occupied" && room.chamaId?.toString() !== id) {
      return res.status(400).json({ message: "Room is already occupied" })
    }

    // Free up old room if exists
    if (chama.sharedRoom && chama.sharedRoom.toString() !== roomId) {
      await Room.findByIdAndUpdate(chama.sharedRoom, {
        roomType: "individual",
        chamaId: null,
        status: "Available",
      })
    }

    // Assign new room
    chama.sharedRoom = roomId
    await chama.save()

    // Update room
    room.roomType = "shared"
    room.chamaId = chama._id
    room.status = "Occupied"
    room.marketDaySchedule = chama.marketDays.map((md) => ({
      day: md.day,
      autoOff: md.powerOffDuringMarket,
      offTime: md.startTime,
      onTime: md.endTime,
    }))
    await room.save()

    res.json({
      message: "Room assigned successfully",
      chama,
      room,
    })
  } catch (error) {
    console.error("Error assigning room:", error)
    res.status(500).json({ message: "Error assigning room", error: error.message })
  }
})

// Update market days
router.put("/:id/market-days", async (req, res) => {
  try {
    const { id } = req.params
    const { marketDays } = req.body

    const chama = await Chama.findById(id).populate("sharedRoom")
    if (!chama) {
      return res.status(404).json({ message: "Chama not found" })
    }

    chama.marketDays = marketDays
    await chama.save()

    // Update room schedule if room is assigned
    if (chama.sharedRoom) {
      await Room.findByIdAndUpdate(chama.sharedRoom._id, {
        marketDaySchedule: marketDays.map((md) => ({
          day: md.day,
          autoOff: md.powerOffDuringMarket,
          offTime: md.startTime,
          onTime: md.endTime,
        })),
      })
    }

    res.json({
      message: "Market days updated successfully",
      chama,
    })
  } catch (error) {
    console.error("Error updating market days:", error)
    res.status(500).json({ message: "Error updating market days", error: error.message })
  }
})

// Get chama power schedule
router.get("/:id/power-schedule", async (req, res) => {
  try {
    const { id } = req.params

    const chama = await Chama.findById(id).populate("sharedRoom")
    if (!chama) {
      return res.status(404).json({ message: "Chama not found" })
    }

    if (!chama.sharedRoom) {
      return res.status(404).json({ message: "No room assigned to this chama" })
    }

    const schedule = {
      roomNumber: chama.sharedRoom.roomNumber,
      powerStatus: chama.sharedRoom.powerStatus,
      lastPowerToggle: chama.sharedRoom.lastPowerToggle,
      marketDays: chama.marketDays,
      marketDaySchedule: chama.sharedRoom.marketDaySchedule,
      powerSavings: chama.sharedRoom.powerSavings,
    }

    res.json(schedule)
  } catch (error) {
    console.error("Error fetching power schedule:", error)
    res.status(500).json({ message: "Error fetching power schedule", error: error.message })
  }
})

// Get chama statistics
router.get("/:id/stats", async (req, res) => {
  try {
    const { id } = req.params

    const chama = await Chama.findById(id).populate("sharedRoom")
    if (!chama) {
      return res.status(404).json({ message: "Chama not found" })
    }

    const stats = {
      totalMembers: chama.totalMembers,
      activeMembers: chama.members.filter((m) => m.isActive).length,
      totalProduce: chama.totalProduce,
      roomOccupancy: chama.sharedRoom
        ? (chama.sharedRoom.currentOccupancy / chama.sharedRoom.capacity) * 100
        : 0,
      monthlyFee: chama.monthlyFee,
      powerSavings: chama.sharedRoom?.powerSavings || 0,
      marketDaysCount: chama.marketDays.length,
      registrationDate: chama.registrationDate,
    }

    res.json(stats)
  } catch (error) {
    console.error("Error fetching chama stats:", error)
    res.status(500).json({ message: "Error fetching chama stats", error: error.message })
  }
})

module.exports = router
