import nodemailer from "nodemailer"
import dotenv from "dotenv"

dotenv.config()

// Create reusable transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

// Verify transporter configuration
transporter.verify((error, success) => {
  if (error) {
    console.log("❌ Email service error:", error)
  } else {
    console.log("✅ Email service is ready")
  }
})

/**
 * Send email
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML content
 * @param {string} options.text - Plain text content (optional)
 */
export const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || "Stay Fresh System <bellarinseth@gmail.com>",
      to,
      subject,
      html,
      text: text || "", // Fallback to plain text
    }

    const info = await transporter.sendMail(mailOptions)
    console.log("📧 Email sent:", info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error("❌ Email error:", error)
    return { success: false, error: error.message }
  }
}

/**
 * Send welcome email to new farmer
 */
export const sendWelcomeEmail = async (farmer) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #22c55e; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        .feature { background: white; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 4px solid #22c55e; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🥶 Welcome to Stay Fresh!</h1>
        </div>
        <div class="content">
          <h2>Hello ${farmer.firstName} ${farmer.lastName}! 👋</h2>
          <p>Thank you for joining Stay Fresh Management System. We're excited to help you manage your cold storage facilities and produce efficiently.</p>
          
          <h3>Your Account Details:</h3>
          <ul>
            <li><strong>Name:</strong> ${farmer.firstName} ${farmer.lastName}</li>
            <li><strong>Email:</strong> ${farmer.email}</li>
            <li><strong>Location:</strong> ${farmer.location}</li>
            <li><strong>Phone:</strong> ${farmer.phone}</li>
          </ul>

          <h3>What You Can Do:</h3>
          <div class="feature">
            <strong>🏠 Rent Cold Storage Rooms</strong><br>
            Browse and rent temperature-controlled storage facilities with flexible billing cycles (1-12 months).
          </div>
          <div class="feature">
            <strong>📊 Real-Time Monitoring</strong><br>
            Track temperature, humidity, and other environmental conditions 24/7 with IoT sensors.
          </div>
          <div class="feature">
            <strong>📈 Market Insights</strong><br>
            Get real-time market prices, trends, and recommendations for optimal selling times.
          </div>
          <div class="feature">
            <strong>🛒 Direct Marketplace</strong><br>
            Connect directly with buyers and sell your produce without middlemen.
          </div>
          <div class="feature">
            <strong>📚 Training & Learning</strong><br>
            Access educational courses to improve your cold storage and farming skills.
          </div>

          <div style="text-align: center;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard" class="button">Go to Dashboard</a>
          </div>

          <p>If you have any questions or need assistance, feel free to reach out to our support team.</p>
          
          <p>Best regards,<br><strong>The Stay Fresh Team</strong></p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Stay Fresh Management System. All rights reserved.</p>
          <p>This email was sent to ${farmer.email}</p>
        </div>
      </div>
    </body>
    </html>
  `

  return sendEmail({
    to: farmer.email,
    subject: "Welcome to Stay Fresh! 🎉",
    html,
    text: `Welcome ${farmer.firstName}! Thank you for joining Stay Fresh Management System.`,
  })
}

/**
 * Send produce purchase notification to seller
 */
export const sendProduceSoldNotification = async (farmer, produce, saleDetails) => {
  const profitMargin = produce.profitMargin || 0
  const profit = (saleDetails.salePrice - (produce.purchasePrice || 0)) * produce.quantity

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .success { background: #22c55e; color: white; padding: 20px; border-radius: 5px; text-align: center; margin: 20px 0; }
        .details { background: white; padding: 20px; border-radius: 5px; margin: 15px 0; }
        .row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
        .highlight { font-size: 24px; font-weight: bold; color: #22c55e; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Your Produce Has Been Sold!</h1>
        </div>
        <div class="content">
          <h2>Great News, ${farmer.firstName}!</h2>
          
          <div class="success">
            <h3 style="margin: 0;">Sale Completed Successfully</h3>
            <p style="margin: 10px 0 0 0;">Your ${produce.produceType} has been sold!</p>
          </div>

          <div class="details">
            <h3>Sale Details:</h3>
            <div class="row">
              <span>Produce Type:</span>
              <strong>${produce.produceType} ${produce.variety ? `(${produce.variety})` : ''}</strong>
            </div>
            <div class="row">
              <span>Quantity Sold:</span>
              <strong>${produce.quantity} kg</strong>
            </div>
            <div class="row">
              <span>Sale Price:</span>
              <strong>KSH ${saleDetails.salePrice}/kg</strong>
            </div>
            <div class="row">
              <span>Total Revenue:</span>
              <strong class="highlight">KSH ${(saleDetails.salePrice * produce.quantity).toFixed(2)}</strong>
            </div>
            ${produce.purchasePrice ? `
            <div class="row">
              <span>Purchase Cost:</span>
              <strong>KSH ${produce.purchasePrice}/kg</strong>
            </div>
            <div class="row">
              <span>Total Profit:</span>
              <strong style="color: #22c55e;">KSH ${profit.toFixed(2)}</strong>
            </div>
            <div class="row">
              <span>Profit Margin:</span>
              <strong style="color: #22c55e;">${profitMargin.toFixed(2)}%</strong>
            </div>
            ` : ''}
            <div class="row">
              <span>Storage Duration:</span>
              <strong>${produce.daysInStorage} days</strong>
            </div>
            <div class="row">
              <span>Sale Date:</span>
              <strong>${new Date().toLocaleDateString()}</strong>
            </div>
          </div>

          <p>The produce has been marked as sold in your inventory, and the room capacity has been updated.</p>
          
          <p>Keep up the great work! 💪</p>
          
          <p>Best regards,<br><strong>The Stay Fresh Team</strong></p>
        </div>
      </div>
    </body>
    </html>
  `

  return sendEmail({
    to: farmer.email,
    subject: `✅ Produce Sold - ${produce.produceType} (${produce.quantity}kg)`,
    html,
  })
}

/**
 * Send marketplace offer notification to farmer
 */
export const sendOfferReceivedNotification = async (farmer, listing, offer) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .offer-box { background: white; padding: 20px; border-radius: 5px; border: 2px solid #22c55e; margin: 20px 0; }
        .button { display: inline-block; background: #22c55e; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 10px 5px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>💰 New Offer Received!</h1>
        </div>
        <div class="content">
          <h2>Hello ${farmer.firstName}!</h2>
          <p>You have received a new offer for your marketplace listing:</p>
          
          <div class="offer-box">
            <h3>📦 ${listing.title}</h3>
            <p><strong>Buyer:</strong> ${offer.buyerName}</p>
            <p><strong>Contact:</strong> ${offer.buyerPhone}</p>
            <p><strong>Offered Price:</strong> KSH ${offer.offeredPrice}/kg</p>
            <p><strong>Quantity:</strong> ${offer.quantity} kg</p>
            <p><strong>Total Value:</strong> KSH ${(offer.offeredPrice * offer.quantity).toFixed(2)}</p>
            ${offer.message ? `<p><strong>Message:</strong> "${offer.message}"</p>` : ''}
          </div>

          <p><strong>Your Listed Price:</strong> KSH ${listing.pricePerKg}/kg</p>
          ${offer.offeredPrice < listing.pricePerKg 
            ? `<p style="color: #f59e0b;">⚠️ This offer is below your listed price.</p>` 
            : `<p style="color: #22c55e;">✅ This offer matches or exceeds your listed price!</p>`
          }

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/marketplace" class="button">View Offer</a>
          </div>

          <p>Log in to your dashboard to accept or reject this offer.</p>
          
          <p>Best regards,<br><strong>The Stay Fresh Team</strong></p>
        </div>
      </div>
    </body>
    </html>
  `

  return sendEmail({
    to: farmer.email,
    subject: `💰 New Offer - ${listing.title}`,
    html,
  })
}

/**
 * Send sensor alert notification
 */
export const sendSensorAlertNotification = async (farmer, room, alerts) => {
  const criticalAlerts = alerts.filter(a => a.severity === "Critical")
  const highAlerts = alerts.filter(a => a.severity === "High")

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .alert { padding: 15px; border-radius: 5px; margin: 10px 0; }
        .critical { background: #fee; border-left: 4px solid #ef4444; }
        .high { background: #fef3c7; border-left: 4px solid #f59e0b; }
        .button { display: inline-block; background: #ef4444; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⚠️ Sensor Alert - Room ${room.roomNumber}</h1>
        </div>
        <div class="content">
          <h2>Urgent Attention Required, ${farmer.firstName}!</h2>
          <p>We've detected ${alerts.length} abnormal reading(s) in your cold storage room:</p>
          
          <div style="background: white; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <strong>Room:</strong> ${room.roomNumber}<br>
            <strong>Capacity:</strong> ${room.capacity} kg<br>
            <strong>Current Occupancy:</strong> ${room.currentOccupancy} kg
          </div>

          <h3>Alerts:</h3>
          ${alerts.map(alert => `
            <div class="alert ${alert.severity === 'Critical' ? 'critical' : 'high'}">
              <strong>${alert.severity === 'Critical' ? '🚨' : '⚠️'} ${alert.type} Alert</strong><br>
              ${alert.message}<br>
              <small>Time: ${new Date(alert.triggeredAt).toLocaleString()}</small>
            </div>
          `).join('')}

          <h3>Recommended Actions:</h3>
          <ul>
            ${criticalAlerts.length > 0 ? '<li><strong>IMMEDIATE:</strong> Check refrigeration system</li>' : ''}
            <li>Inspect the cold storage unit</li>
            <li>Verify door seals are intact</li>
            <li>Check for any equipment malfunctions</li>
            <li>Monitor produce condition</li>
          </ul>

          <div style="text-align: center;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard" class="button">View Dashboard</a>
          </div>

          <p><strong>Note:</strong> Prolonged abnormal conditions can affect produce quality and safety.</p>
          
          <p>Best regards,<br><strong>The Stay Fresh Team</strong></p>
        </div>
      </div>
    </body>
    </html>
  `

  return sendEmail({
    to: farmer.email,
    subject: `🚨 ALERT: Abnormal Conditions in Room ${room.roomNumber}`,
    html,
  })
}

/**
 * Send billing reminder
 */
export const sendBillingReminderNotification = async (farmer, billing, room) => {
  const daysUntilDue = Math.ceil((new Date(billing.dueDate) - new Date()) / (1000 * 60 * 60 * 24))
  const isOverdue = daysUntilDue < 0

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, ${isOverdue ? '#ef4444' : '#f59e0b'} 0%, ${isOverdue ? '#dc2626' : '#d97706'} 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .bill-details { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
        .row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
        .total { font-size: 24px; color: ${isOverdue ? '#ef4444' : '#f59e0b'}; font-weight: bold; }
        .button { display: inline-block; background: #22c55e; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${isOverdue ? '🚨 Payment Overdue!' : '💳 Payment Reminder'}</h1>
        </div>
        <div class="content">
          <h2>Hello ${farmer.firstName}!</h2>
          <p>${isOverdue 
            ? `Your payment for Room ${room.roomNumber} is <strong>${Math.abs(daysUntilDue)} days overdue</strong>.` 
            : `Your payment for Room ${room.roomNumber} is due in <strong>${daysUntilDue} days</strong>.`
          }</p>
          
          <div class="bill-details">
            <h3>Invoice Details:</h3>
            <div class="row">
              <span>Room Number:</span>
              <strong>${room.roomNumber}</strong>
            </div>
            <div class="row">
              <span>Billing Cycle:</span>
              <strong>${billing.billingCycle}</strong>
            </div>
            <div class="row">
              <span>Period:</span>
              <strong>${new Date(billing.startDate).toLocaleDateString()} - ${new Date(billing.endDate).toLocaleDateString()}</strong>
            </div>
            <div class="row">
              <span>Base Amount:</span>
              <strong>KSH ${billing.baseAmount.toFixed(2)}</strong>
            </div>
            ${billing.discount > 0 ? `
            <div class="row">
              <span>Discount:</span>
              <strong style="color: #22c55e;">-KSH ${billing.discount.toFixed(2)}</strong>
            </div>
            ` : ''}
            ${billing.lateFee > 0 ? `
            <div class="row">
              <span>Late Fee:</span>
              <strong style="color: #ef4444;">+KSH ${billing.lateFee.toFixed(2)}</strong>
            </div>
            ` : ''}
            <div class="row">
              <span>Amount Due:</span>
              <strong class="total">KSH ${billing.amountDue.toFixed(2)}</strong>
            </div>
            <div class="row">
              <span>Due Date:</span>
              <strong style="color: ${isOverdue ? '#ef4444' : '#333'};">${new Date(billing.dueDate).toLocaleDateString()}</strong>
            </div>
          </div>

          ${isOverdue ? `
            <div style="background: #fee2e2; padding: 15px; border-radius: 5px; border-left: 4px solid #ef4444; margin: 20px 0;">
              <strong>⚠️ Overdue Notice:</strong><br>
              Late fees may apply. Please make payment as soon as possible to avoid service interruption.
            </div>
          ` : ''}

          <div style="text-align: center;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard" class="button">Pay Now</a>
          </div>

          <p>If you have already made this payment, please disregard this reminder.</p>
          
          <p>Best regards,<br><strong>The Stay Fresh Team</strong></p>
        </div>
      </div>
    </body>
    </html>
  `

  return sendEmail({
    to: farmer.email,
    subject: `${isOverdue ? '🚨 OVERDUE' : '💳 Reminder'}: Payment for Room ${room.roomNumber}`,
    html,
  })
}

/**
 * Send urgent produce sale notification
 */
export const sendUrgentProduceNotification = async (farmer, produce) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .warning { background: #fef3c7; padding: 20px; border-radius: 5px; border-left: 4px solid #f59e0b; margin: 20px 0; }
        .button { display: inline-block; background: #f59e0b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 10px 5px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⏰ Urgent: Produce Approaching Expiry</h1>
        </div>
        <div class="content">
          <h2>Hello ${farmer.firstName}!</h2>
          
          <div class="warning">
            <h3>⚠️ Action Required</h3>
            <p>Your ${produce.produceType} will perish in <strong>${produce.daysUntilPerish} days</strong>!</p>
          </div>

          <div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3>Produce Details:</h3>
            <p><strong>Type:</strong> ${produce.produceType} ${produce.variety ? `(${produce.variety})` : ''}</p>
            <p><strong>Quantity:</strong> ${produce.quantity} kg</p>
            <p><strong>Current Market Price:</strong> KSH ${produce.currentMarketPrice}/kg</p>
            <p><strong>Days in Storage:</strong> ${produce.daysInStorage} days</p>
            <p><strong>Condition:</strong> ${produce.condition}</p>
          </div>

          <h3>Recommended Actions:</h3>
          <ul>
            <li><strong>List on Marketplace:</strong> Connect with buyers immediately</li>
            <li><strong>Price Competitively:</strong> Consider urgent sale pricing</li>
            <li><strong>Contact Regular Buyers:</strong> Reach out to your network</li>
            <li><strong>Consider Processing:</strong> If applicable, process for preservation</li>
          </ul>

          <div style="text-align: center;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/marketplace" class="button">List on Marketplace</a>
          </div>

          <p><strong>Time is of the essence!</strong> Act now to avoid losses.</p>
          
          <p>Best regards,<br><strong>The Stay Fresh Team</strong></p>
        </div>
      </div>
    </body>
    </html>
  `

  return sendEmail({
    to: farmer.email,
    subject: `⏰ URGENT: ${produce.produceType} expiring in ${produce.daysUntilPerish} days`,
    html,
  })
}

export default {
  sendEmail,
  sendWelcomeEmail,
  sendProduceSoldNotification,
  sendOfferReceivedNotification,
  sendSensorAlertNotification,
  sendBillingReminderNotification,
  sendUrgentProduceNotification,
}
