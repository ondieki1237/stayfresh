import Chama from "../models/Chama.js"
import Room from "../models/Room.js"
import Farmer from "../models/Farmer.js"
import Produce from "../models/Produce.js"
import Billing from "../models/Billing.js"

/**
 * USSD Service for Chama Members
 * Provides access to room and chama information via USSD codes
 * 
 * Main USSD Code: *384*5000#
 * 
 * Menu Structure:
 * 1. Room Status (Temperature, Humidity, Power)
 * 2. Market Schedule (Next market day, power schedule)
 * 3. Produce Info (Quantity, types, status)
 * 4. Billing (Shared costs, payment status)
 * 5. Request Release (Notify admin)
 * 6. Members (View chama members)
 * 7. Power Savings (Electricity savings)
 */

class USSDService {
  /**
   * Main USSD handler
   * @param {string} phoneNumber - User's phone number
   * @param {string} text - USSD input text
   * @returns {object} - USSD response
   */
  async handleUSSD(phoneNumber, text) {
    try {
      // Find chama member by phone number
      const chama = await this.findChamaByPhone(phoneNumber)
      
      if (!chama) {
        return this.endSession("You are not registered in any Chama. Contact admin for assistance.")
      }

      // Parse USSD input
      const textArray = text.split("*")
      const level = textArray.length

      // Main menu
      if (text === "") {
        return this.showMainMenu(chama)
      }

      // Handle menu selections
      const mainChoice = textArray[0]

      switch (mainChoice) {
        case "1":
          return await this.handleRoomStatus(chama, textArray)
        case "2":
          return await this.handleMarketSchedule(chama, textArray)
        case "3":
          return await this.handleProduceInfo(chama, textArray)
        case "4":
          return await this.handleBilling(chama, textArray)
        case "5":
          return await this.handleReleaseRequest(chama, textArray, phoneNumber)
        case "6":
          return await this.handleMembers(chama, textArray)
        case "7":
          return await this.handlePowerSavings(chama, textArray)
        default:
          return this.endSession("Invalid option. Please try again.")
      }
    } catch (error) {
      console.error("USSD Error:", error)
      return this.endSession("Service error. Please try again later.")
    }
  }

  /**
   * Find chama by member phone number
   */
  async findChamaByPhone(phoneNumber) {
    // Normalize phone number (remove spaces, +, etc.)
    const normalizedPhone = phoneNumber.replace(/[\s\+\-\(\)]/g, "")

    const chama = await Chama.findOne({
      $or: [
        { phone: { $regex: normalizedPhone, $options: "i" } },
        { "members.phone": { $regex: normalizedPhone, $options: "i" } },
      ],
      isActive: true,
    }).populate("sharedRoom")

    return chama
  }

  /**
   * Show main menu
   */
  showMainMenu(chama) {
    const menu = `CON Welcome to Stay Fresh - ${chama.name}\n\n` +
      `1. Room Status\n` +
      `2. Market Schedule\n` +
      `3. Produce Info\n` +
      `4. Billing\n` +
      `5. Request Release\n` +
      `6. Members\n` +
      `7. Power Savings`

    return { response: menu, continueSession: true }
  }

  /**
   * Handle Room Status (Option 1)
   */
  async handleRoomStatus(chama, textArray) {
    if (!chama.sharedRoom) {
      return this.endSession("No room assigned to your Chama yet.")
    }

    const room = chama.sharedRoom

    const status = `END Room ${room.roomNumber} Status:\n\n` +
      `🌡️ Temperature: ${room.temperature}°C\n` +
      `💧 Humidity: ${room.humidity}%\n` +
      `⚡ Power: ${room.powerStatus?.toUpperCase() || "ON"}\n` +
      `📦 Capacity: ${room.currentOccupancy}/${room.capacity}kg\n` +
      `📊 Occupancy: ${Math.round((room.currentOccupancy / room.capacity) * 100)}%\n` +
      `✅ Status: ${room.status}`

    return this.endSession(status)
  }

  /**
   * Handle Market Schedule (Option 2)
   */
  async handleMarketSchedule(chama, textArray) {
    if (!chama.marketDays || chama.marketDays.length === 0) {
      return this.endSession("No market days scheduled.")
    }

    const today = new Date().toLocaleDateString("en-US", { weekday: "long" })
    const nextMarketDay = this.getNextMarketDay(chama.marketDays, today)

    let schedule = `END Market Schedule:\n\n`
    
    if (nextMarketDay) {
      schedule += `📅 Next Market: ${nextMarketDay.day}\n`
      schedule += `🕐 Time: ${nextMarketDay.startTime} - ${nextMarketDay.endTime}\n`
      schedule += `⚡ Power: ${nextMarketDay.powerOffDuringMarket ? "OFF" : "ON"}\n\n`
    }

    schedule += `All Market Days:\n`
    chama.marketDays.forEach((md, index) => {
      schedule += `${index + 1}. ${md.day} (${md.startTime}-${md.endTime})\n`
    })

    return this.endSession(schedule)
  }

  /**
   * Handle Produce Info (Option 3)
   */
  async handleProduceInfo(chama, textArray) {
    if (!chama.sharedRoom) {
      return this.endSession("No room assigned to your Chama yet.")
    }

    const produce = await Produce.find({
      room: chama.sharedRoom._id,
      status: { $in: ["Stored", "Fresh"] },
    })

    if (produce.length === 0) {
      return this.endSession("No produce currently stored.")
    }

    let info = `END Produce in Room ${chama.sharedRoom.roomNumber}:\n\n`
    
    const totalQuantity = produce.reduce((sum, p) => sum + p.quantity, 0)
    info += `📦 Total: ${totalQuantity}kg\n\n`

    produce.slice(0, 5).forEach((p, index) => {
      info += `${index + 1}. ${p.name}\n`
      info += `   ${p.quantity}kg - KES ${p.currentPrice}/kg\n`
    })

    if (produce.length > 5) {
      info += `\n...and ${produce.length - 5} more items`
    }

    return this.endSession(info)
  }

  /**
   * Handle Billing (Option 4)
   */
  async handleBilling(chama, textArray) {
    if (!chama.sharedRoom) {
      return this.endSession("No room assigned to your Chama yet.")
    }

    const billing = await Billing.findOne({
      room: chama.sharedRoom._id,
    }).sort({ billingDate: -1 })

    if (!billing) {
      return this.endSession("No billing information available.")
    }

    const perMember = chama.totalMembers > 0 
      ? (billing.amountDue / chama.totalMembers).toFixed(2)
      : "0.00"

    const info = `END Billing Information:\n\n` +
      `💳 Total Bill: KES ${billing.amountDue.toFixed(2)}\n` +
      `👥 Members: ${chama.totalMembers}\n` +
      `💰 Per Member: KES ${perMember}\n` +
      `⚡ Energy Used: ${billing.energyUsed}kWh\n` +
      `📅 Period: ${new Date(billing.billingDate).toLocaleDateString()}\n` +
      `✅ Status: ${billing.paymentStatus}\n\n` +
      `Monthly Fee: KES ${chama.monthlyFee.toLocaleString()}`

    return this.endSession(info)
  }

  /**
   * Handle Release Request (Option 5)
   */
  async handleReleaseRequest(chama, textArray, phoneNumber) {
    if (textArray.length === 1) {
      return this.continueSession(
        "Enter quantity to release (kg):"
      )
    }

    if (textArray.length === 2) {
      const quantity = parseFloat(textArray[1])
      
      if (isNaN(quantity) || quantity <= 0) {
        return this.endSession("Invalid quantity. Please try again.")
      }

      // Find member
      const member = chama.members.find(m => 
        m.phone && m.phone.includes(phoneNumber.replace(/[\s\+\-\(\)]/g, ""))
      )

      // Create release request notification
      const notification = {
        chamaName: chama.name,
        memberName: member?.name || "Unknown Member",
        phone: phoneNumber,
        quantity: quantity,
        room: chama.sharedRoom?.roomNumber,
        timestamp: new Date(),
      }

      // Here you would send notification to admin (SMS/Email)
      console.log("Release Request:", notification)

      return this.endSession(
        `Release request submitted!\n\n` +
        `📦 Quantity: ${quantity}kg\n` +
        `🏠 Room: ${chama.sharedRoom?.roomNumber || "N/A"}\n\n` +
        `Admin will be notified shortly.`
      )
    }

    return this.endSession("Invalid input.")
  }

  /**
   * Handle Members (Option 6)
   */
  async handleMembers(chama, textArray) {
    const activeMembers = chama.members.filter(m => m.isActive)

    if (activeMembers.length === 0) {
      return this.endSession("No active members found.")
    }

    let info = `END ${chama.name} Members:\n\n`
    info += `👥 Total: ${activeMembers.length}\n\n`

    activeMembers.slice(0, 8).forEach((member, index) => {
      info += `${index + 1}. ${member.name}\n`
      if (member.phone) {
        info += `   📞 ${member.phone}\n`
      }
    })

    if (activeMembers.length > 8) {
      info += `\n...and ${activeMembers.length - 8} more members`
    }

    return this.endSession(info)
  }

  /**
   * Handle Power Savings (Option 7)
   */
  async handlePowerSavings(chama, textArray) {
    if (!chama.sharedRoom) {
      return this.endSession("No room assigned to your Chama yet.")
    }

    const room = chama.sharedRoom
    const savings = room.powerSavings || 0
    const costPerKwh = 25 // KES per kWh
    const moneySaved = savings * costPerKwh
    const marketDaysPerMonth = chama.marketDays?.length * 4 || 0

    const info = `END Power Savings Report:\n\n` +
      `⚡ Energy Saved: ${savings.toFixed(2)}kWh\n` +
      `💰 Money Saved: KES ${moneySaved.toFixed(2)}\n` +
      `📅 Market Days/Month: ${marketDaysPerMonth}\n` +
      `🌱 CO2 Reduced: ${(savings * 0.5).toFixed(2)}kg\n\n` +
      `Your Chama is saving money and helping the environment!`

    return this.endSession(info)
  }

  /**
   * Get next market day from schedule
   */
  getNextMarketDay(marketDays, today) {
    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    const todayIndex = daysOfWeek.indexOf(today)

    // Find next market day in sequence
    for (let i = 0; i < 7; i++) {
      const checkIndex = (todayIndex + i) % 7
      const checkDay = daysOfWeek[checkIndex]
      const marketDay = marketDays.find(md => md.day === checkDay)
      
      if (marketDay) {
        return marketDay
      }
    }

    return marketDays[0] // Fallback to first market day
  }

  /**
   * End USSD session with message
   */
  endSession(message) {
    return {
      response: `END ${message}`,
      continueSession: false,
    }
  }

  /**
   * Continue USSD session with message
   */
  continueSession(message) {
    return {
      response: `CON ${message}`,
      continueSession: true,
    }
  }
}

export default new USSDService()
