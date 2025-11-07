import nodemailer from "nodemailer"
import Stocking from "../models/Stocking.js"
import MarketData from "../models/MarketData.js"
import Farmer from "../models/Farmer.js"

// Email transporter configuration
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "bellarinseth@gmail.com",
    pass: process.env.EMAIL_PASSWORD || "your-app-password",
  },
})

// Check prices and send notifications
export async function monitorPrices() {
  try {
    console.log("🔍 Monitoring market prices...")

    // Get all active stockings that haven't reached target yet
    const activeStockings = await Stocking.find({
      status: { $in: ["Monitoring", "Stocked"] },
      priceAlertSent: false
    }).populate("farmer room")

    if (activeStockings.length === 0) {
      console.log("ℹ️  No active stockings to monitor")
      return
    }

    // Get unique produce types
    const produceTypes = [...new Set(activeStockings.map(s => s.produceType))]

    // Fetch latest market prices
    const latestPrices = await MarketData.find({
      produceType: { $in: produceTypes }
    })
      .sort({ timestamp: -1 })
      .limit(produceTypes.length)

    let notificationsSent = 0

    // Check each stocking
    for (const stocking of activeStockings) {
      const marketPrice = latestPrices.find(p => p.produceType === stocking.produceType)

      if (!marketPrice) {
        console.log(`⚠️  No market data for ${stocking.produceType}`)
        continue
      }

      // Update current market price
      stocking.currentMarketPrice = marketPrice.currentPrice
      
      // Add to price history
      stocking.priceHistory.push({
        price: marketPrice.currentPrice,
        checkedAt: new Date()
      })

      // Keep only last 100 price checks
      if (stocking.priceHistory.length > 100) {
        stocking.priceHistory = stocking.priceHistory.slice(-100)
      }

      // Check if target price reached or exceeded
      if (marketPrice.currentPrice >= stocking.targetPrice && !stocking.priceAlertSent) {
        console.log(`🎯 Target reached for ${stocking.produceType} in room ${stocking.room.roomNumber}`)
        
        // Send email notification
        await sendPriceAlert(stocking, marketPrice.currentPrice)
        
        // Update stocking status
        stocking.status = "Target Reached"
        stocking.priceAlertSent = true
        stocking.targetReachedAt = new Date()
        stocking.lastNotificationSent = new Date()
        stocking.notificationCount += 1

        notificationsSent++
      }

      await stocking.save()
    }

    console.log(`✅ Price monitoring complete. ${notificationsSent} notifications sent.`)
  } catch (error) {
    console.error("❌ Price monitoring error:", error)
  }
}

// Send price alert email
async function sendPriceAlert(stocking, currentPrice) {
  try {
    const farmer = stocking.farmer
    const room = stocking.room

    const potentialEarnings = (stocking.quantity * currentPrice).toFixed(2)
    const estimatedProfit = (potentialEarnings - stocking.estimatedValue).toFixed(2)
    const priceIncrease = (((currentPrice - (stocking.estimatedValue / stocking.quantity)) / (stocking.estimatedValue / stocking.quantity)) * 100).toFixed(1)

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, oklch(0.65 0.22 145), oklch(0.828 0.189 84.429));
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
          }
          .header .icon {
            font-size: 50px;
            margin-bottom: 10px;
          }
          .content {
            background: #f9f9f9;
            padding: 30px;
            border-radius: 0 0 10px 10px;
          }
          .alert-box {
            background: #fff;
            border-left: 4px solid oklch(0.65 0.22 145);
            padding: 20px;
            margin: 20px 0;
            border-radius: 5px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
          }
          .stats {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin: 20px 0;
          }
          .stat-box {
            background: white;
            padding: 15px;
            border-radius: 8px;
            text-align: center;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
          }
          .stat-box .label {
            color: #666;
            font-size: 12px;
            text-transform: uppercase;
            margin-bottom: 5px;
          }
          .stat-box .value {
            font-size: 24px;
            font-weight: bold;
            color: oklch(0.65 0.22 145);
          }
          .stat-box.highlight .value {
            color: oklch(0.828 0.189 84.429);
          }
          .details {
            background: white;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
          }
          .details h3 {
            margin-top: 0;
            color: oklch(0.65 0.22 145);
          }
          .detail-row {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #eee;
          }
          .detail-row:last-child {
            border-bottom: none;
          }
          .detail-label {
            color: #666;
          }
          .detail-value {
            font-weight: bold;
          }
          .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, oklch(0.65 0.22 145), oklch(0.828 0.189 84.429));
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 25px;
            margin: 20px 0;
            font-weight: bold;
            text-align: center;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            color: #666;
            font-size: 12px;
          }
          .success-icon {
            font-size: 40px;
            text-align: center;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="icon">🌱</div>
          <h1>Target Price Reached!</h1>
          <p style="margin: 10px 0 0 0;">Your produce has hit your target selling price</p>
        </div>
        
        <div class="content">
          <div class="success-icon">🎯✨</div>
          
          <div class="alert-box">
            <h2 style="margin-top: 0; color: oklch(0.65 0.22 145);">Great News, ${farmer.firstName}!</h2>
            <p style="font-size: 16px;">
              Your <strong>${stocking.produceType}</strong> in <strong>Room ${room.roomNumber}</strong> 
              has reached your target price of <strong>KSH ${stocking.targetPrice}/kg</strong>!
            </p>
          </div>

          <div class="stats">
            <div class="stat-box highlight">
              <div class="label">Current Market Price</div>
              <div class="value">KSH ${currentPrice}</div>
              <div style="font-size: 12px; color: #666;">/kg</div>
            </div>
            <div class="stat-box">
              <div class="label">Your Target</div>
              <div class="value">KSH ${stocking.targetPrice}</div>
              <div style="font-size: 12px; color: #666;">/kg</div>
            </div>
          </div>

          <div class="details">
            <h3>📊 Financial Summary</h3>
            <div class="detail-row">
              <span class="detail-label">Quantity Stocked</span>
              <span class="detail-value">${stocking.quantity} kg</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Initial Investment</span>
              <span class="detail-value">KSH ${stocking.estimatedValue.toFixed(2)}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Current Value</span>
              <span class="detail-value" style="color: oklch(0.65 0.22 145);">KSH ${potentialEarnings}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Estimated Profit</span>
              <span class="detail-value" style="color: oklch(0.828 0.189 84.429);">KSH ${estimatedProfit} (${priceIncrease}%)</span>
            </div>
          </div>

          <div class="details">
            <h3>📦 Storage Details</h3>
            <div class="detail-row">
              <span class="detail-label">Room Number</span>
              <span class="detail-value">${room.roomNumber}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Produce Type</span>
              <span class="detail-value">${stocking.produceType}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Condition</span>
              <span class="detail-value">${stocking.condition}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Stocked Date</span>
              <span class="detail-value">${new Date(stocking.stockedAt).toLocaleDateString()}</span>
            </div>
          </div>

          <div style="background: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <strong>💡 Recommendation:</strong> Market prices can fluctuate. Consider selling soon to maximize your profit, 
            or monitor for further increases if you believe the price will go higher.
          </div>

          <div style="text-align: center;">
            <a href="https://www.kisumu.codewithseth.co.ke/dashboard" class="cta-button">
              View Your Dashboard
            </a>
          </div>

          <div class="footer">
            <p><strong>🌱 Stay Fresh Cold Chain Management</strong></p>
            <p>This is an automated notification from the Stay Fresh price monitoring system.</p>
            <p>If you have any questions, please contact support at bellarinseth@gmail.com</p>
          </div>
        </div>
      </body>
      </html>
    `

    const mailOptions = {
      from: '"Stay Fresh 🌱" <bellarinseth@gmail.com>',
      to: farmer.email,
      subject: `🎯 Target Price Reached! ${stocking.produceType} - Room ${room.roomNumber}`,
      html: emailHtml,
    }

    await transporter.sendMail(mailOptions)
    console.log(`✅ Price alert email sent to ${farmer.email}`)
  } catch (error) {
    console.error("❌ Error sending price alert email:", error)
  }
}

// Send daily price summary to farmers with active stockings
export async function sendDailySummary() {
  try {
    console.log("📧 Sending daily price summaries...")

    // Group active stockings by farmer
    const activeStockings = await Stocking.find({
      status: { $in: ["Monitoring", "Stocked", "Target Reached"] }
    }).populate("farmer room")

    const farmerStockings = {}
    
    activeStockings.forEach(stocking => {
      const farmerId = stocking.farmer._id.toString()
      if (!farmerStockings[farmerId]) {
        farmerStockings[farmerId] = {
          farmer: stocking.farmer,
          stockings: []
        }
      }
      farmerStockings[farmerId].stockings.push(stocking)
    })

    let summariesSent = 0

    for (const [farmerId, data] of Object.entries(farmerStockings)) {
      await sendDailySummaryEmail(data.farmer, data.stockings)
      summariesSent++
    }

    console.log(`✅ ${summariesSent} daily summaries sent`)
  } catch (error) {
    console.error("❌ Error sending daily summaries:", error)
  }
}

async function sendDailySummaryEmail(farmer, stockings) {
  // Implementation for daily summary email (optional feature)
  // Can be added later if needed
  console.log(`📨 Would send daily summary to ${farmer.email}`)
}

// Start the monitoring service
export function startPriceMonitoring(intervalMinutes = 60) {
  console.log(`🚀 Starting price monitoring service (checking every ${intervalMinutes} minutes)`)
  
  // Run immediately on start
  monitorPrices()
  
  // Then run at specified interval
  const intervalMs = intervalMinutes * 60 * 1000
  setInterval(monitorPrices, intervalMs)
  
  // Optional: Send daily summary at 8 AM
  // scheduleDailySummary()
}

export default {
  monitorPrices,
  sendDailySummary,
  startPriceMonitoring
}
