import express from "express"
const router = express.Router()
import ussdService from "../services/ussdService.js"

/**
 * USSD Routes for Chama Members
 * 
 * POST /api/ussd
 * Body: { sessionId, serviceCode, phoneNumber, text }
 * 
 * Supports Africa's Talking USSD format
 */

// Main USSD endpoint
router.post("/", async (req, res) => {
  try {
    const { sessionId, serviceCode, phoneNumber, text } = req.body

    // Log USSD request
    console.log("📱 USSD Request:", {
      sessionId,
      serviceCode,
      phoneNumber,
      text: text || "(empty)",
      timestamp: new Date().toISOString(),
    })

    // Validate required fields
    if (!phoneNumber) {
      return res.status(400).send("END Invalid request. Phone number required.")
    }

    // Handle USSD session
    const response = await ussdService.handleUSSD(phoneNumber, text || "")

    // Log response
    console.log("📤 USSD Response:", {
      sessionId,
      phoneNumber,
      continueSession: response.continueSession,
    })

    // Send response in Africa's Talking format
    res.set("Content-Type", "text/plain")
    res.send(response.response)
  } catch (error) {
    console.error("❌ USSD Error:", error)
    res.set("Content-Type", "text/plain")
    res.send("END Service error. Please try again later.")
  }
})

// Test endpoint (for development)
router.post("/test", async (req, res) => {
  try {
    const { phoneNumber, text } = req.body

    if (!phoneNumber) {
      return res.status(400).json({
        error: "Phone number is required",
      })
    }

    const response = await ussdService.handleUSSD(phoneNumber, text || "")

    res.json({
      success: true,
      phoneNumber,
      text: text || "",
      response: response.response,
      continueSession: response.continueSession,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Test USSD Error:", error)
    res.status(500).json({
      error: "Service error",
      message: error.message,
    })
  }
})

// Simulate USSD session (for development/testing)
router.get("/simulate/:phoneNumber", async (req, res) => {
  try {
    const { phoneNumber } = req.params
    const { text } = req.query

    const response = await ussdService.handleUSSD(phoneNumber, text || "")

    res.json({
      success: true,
      simulation: true,
      phoneNumber,
      input: text || "",
      output: response.response.replace(/^(CON|END)\s/, ""),
      continueSession: response.continueSession,
      rawResponse: response.response,
    })
  } catch (error) {
    console.error("Simulate USSD Error:", error)
    res.status(500).json({
      error: "Service error",
      message: error.message,
    })
  }
})

// Get USSD statistics
router.get("/stats", async (req, res) => {
  try {
    // In production, you'd track these stats in database
    const stats = {
      totalSessions: 0,
      activeSessions: 0,
      successfulRequests: 0,
      failedRequests: 0,
      popularMenus: {
        roomStatus: 0,
        marketSchedule: 0,
        produceInfo: 0,
        billing: 0,
        releaseRequest: 0,
        members: 0,
        powerSavings: 0,
      },
    }

    res.json(stats)
  } catch (error) {
    console.error("Stats Error:", error)
    res.status(500).json({
      error: "Failed to fetch statistics",
    })
  }
})

// USSD documentation endpoint
router.get("/docs", (req, res) => {
  res.json({
    service: "Stay Fresh USSD Service",
    version: "1.0.0",
    ussdCode: "*384*31306#",
    description: "USSD interface for Chama members to access room information",
    features: [
      "Check room status (temperature, humidity, power)",
      "View market day schedule",
      "Check produce quantity and prices",
      "View billing information",
      "Request produce release",
      "View chama members",
      "Track power savings",
    ],
    menuStructure: {
      1: "Room Status",
      2: "Market Schedule",
      3: "Produce Info",
      4: "Billing",
      5: "Request Release",
      6: "Members",
      7: "Power Savings",
    },
    apiEndpoints: {
      main: "POST /api/ussd",
      test: "POST /api/ussd/test",
      simulate: "GET /api/ussd/simulate/:phoneNumber?text=1",
      stats: "GET /api/ussd/stats",
      docs: "GET /api/ussd/docs",
    },
    requestFormat: {
      sessionId: "string (unique session identifier)",
      serviceCode: "string (*384*31306#)",
      phoneNumber: "string (+254712345678)",
      text: "string (user input, empty for main menu)",
    },
    responseFormat: {
      continueSession: "CON {message}",
      endSession: "END {message}",
    },
    integration: "Africa's Talking USSD API",
  })
})

export default router
