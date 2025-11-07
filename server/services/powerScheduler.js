const Room = require("./models/Chama")
const Chama = require("./models/Chama")

/**
 * Power Scheduler Service
 * Automatically manages room power based on market day schedules
 */

// Days of the week mapping
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

/**
 * Get current day name
 */
function getCurrentDay() {
  const now = new Date()
  return DAYS[now.getDay()]
}

/**
 * Get current time in HH:MM format
 */
function getCurrentTime() {
  const now = new Date()
  const hours = String(now.getHours()).padStart(2, "0")
  const minutes = String(now.getMinutes()).padStart(2, "0")
  return `${hours}:${minutes}`
}

/**
 * Compare time strings in HH:MM format
 * Returns: -1 if time1 < time2, 0 if equal, 1 if time1 > time2
 */
function compareTime(time1, time2) {
  const [h1, m1] = time1.split(":").map(Number)
  const [h2, m2] = time2.split(":").map(Number)
  
  if (h1 !== h2) return h1 - h2
  return m1 - m2
}

/**
 * Check if current time is within market hours for a given schedule
 */
function isMarketHours(marketDaySchedule, currentDay, currentTime) {
  const todaySchedule = marketDaySchedule.find((schedule) => schedule.day === currentDay)
  
  if (!todaySchedule || !todaySchedule.autoOff) {
    return false
  }
  
  const { offTime, onTime } = todaySchedule
  
  // Check if current time is between off time and on time
  const isAfterOffTime = compareTime(currentTime, offTime) >= 0
  const isBeforeOnTime = compareTime(currentTime, onTime) < 0
  
  return isAfterOffTime && isBeforeOnTime
}

/**
 * Calculate power savings when room is turned off
 * Assumes average consumption of 5 kWh per hour when running
 */
function calculatePowerSavings(offTime, onTime) {
  const [offH, offM] = offTime.split(":").map(Number)
  const [onH, onM] = onTime.split(":").map(Number)
  
  const offMinutes = offH * 60 + offM
  const onMinutes = onH * 60 + onM
  
  const hoursOff = (onMinutes - offMinutes) / 60
  const kWhPerHour = 5 // Average consumption
  
  return hoursOff * kWhPerHour
}

/**
 * Toggle room power based on schedule
 */
async function toggleRoomPower(room, newStatus) {
  const mongoose = require("mongoose")
  const Room = mongoose.model("Room")
  
  const oldStatus = room.powerStatus
  
  if (oldStatus === newStatus) {
    return { changed: false, room }
  }
  
  room.powerStatus = newStatus
  room.lastPowerToggle = new Date()
  
  // Calculate savings when turning off
  if (newStatus === "off") {
    const currentDay = getCurrentDay()
    const schedule = room.marketDaySchedule.find((s) => s.day === currentDay)
    
    if (schedule && schedule.offTime && schedule.onTime) {
      const savings = calculatePowerSavings(schedule.offTime, schedule.onTime)
      room.powerSavings = (room.powerSavings || 0) + savings
    }
  }
  
  await room.save()
  
  return { changed: true, room, oldStatus, newStatus }
}

/**
 * Process all shared rooms and manage their power
 */
async function processSharedRooms() {
  try {
    const mongoose = require("mongoose")
    const Room = mongoose.model("Room")
    
    // Find all shared rooms with chama assignments
    const sharedRooms = await Room.find({
      roomType: "shared",
      chamaId: { $ne: null },
    }).populate("chamaId")
    
    const currentDay = getCurrentDay()
    const currentTime = getCurrentTime()
    
    const results = {
      processed: 0,
      turnedOff: 0,
      turnedOn: 0,
      unchanged: 0,
      errors: [],
    }
    
    for (const room of sharedRooms) {
      try {
        results.processed++
        
        // Check if today is a market day and if we're in market hours
        const inMarketHours = isMarketHours(room.marketDaySchedule, currentDay, currentTime)
        
        if (inMarketHours && room.powerStatus !== "off") {
          // Turn off power during market hours
          const result = await toggleRoomPower(room, "off")
          if (result.changed) {
            results.turnedOff++
            console.log(
              `Room ${room.roomNumber} - Power turned OFF (Market day: ${currentDay})`
            )
          } else {
            results.unchanged++
          }
        } else if (!inMarketHours && room.powerStatus === "off") {
          // Turn on power outside market hours
          const result = await toggleRoomPower(room, "on")
          if (result.changed) {
            results.turnedOn++
            console.log(
              `Room ${room.roomNumber} - Power turned ON (Outside market hours)`
            )
          } else {
            results.unchanged++
          }
        } else {
          results.unchanged++
        }
      } catch (error) {
        results.errors.push({
          roomNumber: room.roomNumber,
          error: error.message,
        })
        console.error(`Error processing room ${room.roomNumber}:`, error)
      }
    }
    
    return results
  } catch (error) {
    console.error("Error in processSharedRooms:", error)
    throw error
  }
}

/**
 * Manual power toggle for a specific room
 */
async function manualPowerToggle(roomId, newStatus) {
  try {
    const mongoose = require("mongoose")
    const Room = mongoose.model("Room")
    
    const room = await Room.findById(roomId)
    
    if (!room) {
      throw new Error("Room not found")
    }
    
    const result = await toggleRoomPower(room, newStatus)
    
    return result
  } catch (error) {
    console.error("Error in manualPowerToggle:", error)
    throw error
  }
}

/**
 * Get power status for a chama's room
 */
async function getChamaPowerStatus(chamaId) {
  try {
    const mongoose = require("mongoose")
    const Room = mongoose.model("Room")
    const Chama = mongoose.model("Chama")
    
    const chama = await Chama.findById(chamaId).populate("sharedRoom")
    
    if (!chama || !chama.sharedRoom) {
      throw new Error("Chama or room not found")
    }
    
    const room = chama.sharedRoom
    const currentDay = getCurrentDay()
    const currentTime = getCurrentTime()
    
    const inMarketHours = isMarketHours(room.marketDaySchedule, currentDay, currentTime)
    
    return {
      roomNumber: room.roomNumber,
      powerStatus: room.powerStatus,
      lastPowerToggle: room.lastPowerToggle,
      powerSavings: room.powerSavings,
      currentDay,
      currentTime,
      inMarketHours,
      nextScheduledToggle: getNextScheduledToggle(room.marketDaySchedule, currentDay, currentTime),
    }
  } catch (error) {
    console.error("Error in getChamaPowerStatus:", error)
    throw error
  }
}

/**
 * Get the next scheduled power toggle time
 */
function getNextScheduledToggle(marketDaySchedule, currentDay, currentTime) {
  // Find today's schedule
  const todaySchedule = marketDaySchedule.find((s) => s.day === currentDay)
  
  if (todaySchedule) {
    // Check if we're before the off time
    if (compareTime(currentTime, todaySchedule.offTime) < 0) {
      return {
        action: "OFF",
        day: currentDay,
        time: todaySchedule.offTime,
      }
    }
    
    // Check if we're between off and on time
    if (compareTime(currentTime, todaySchedule.onTime) < 0) {
      return {
        action: "ON",
        day: currentDay,
        time: todaySchedule.onTime,
      }
    }
  }
  
  // Find next market day
  const dayIndex = DAYS.indexOf(currentDay)
  for (let i = 1; i <= 7; i++) {
    const nextDayIndex = (dayIndex + i) % 7
    const nextDay = DAYS[nextDayIndex]
    const nextSchedule = marketDaySchedule.find((s) => s.day === nextDay)
    
    if (nextSchedule) {
      return {
        action: "OFF",
        day: nextDay,
        time: nextSchedule.offTime,
      }
    }
  }
  
  return null
}

/**
 * Start the power scheduler (runs every 5 minutes)
 */
function startPowerScheduler(intervalMinutes = 5) {
  console.log(`Power scheduler started - Running every ${intervalMinutes} minutes`)
  
  // Run immediately on start
  processSharedRooms()
    .then((results) => {
      console.log("Initial power schedule check completed:", results)
    })
    .catch((error) => {
      console.error("Error in initial power schedule check:", error)
    })
  
  // Then run at intervals
  const intervalMs = intervalMinutes * 60 * 1000
  setInterval(() => {
    processSharedRooms()
      .then((results) => {
        console.log("Scheduled power check completed:", results)
      })
      .catch((error) => {
        console.error("Error in scheduled power check:", error)
      })
  }, intervalMs)
}

module.exports = {
  processSharedRooms,
  manualPowerToggle,
  getChamaPowerStatus,
  startPowerScheduler,
  getCurrentDay,
  getCurrentTime,
  isMarketHours,
}
