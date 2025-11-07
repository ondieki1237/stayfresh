# Email Notification System Documentation

## Overview

The Stay Fresh Management System now includes a comprehensive email notification system using **Nodemailer** with Gmail SMTP. Emails are automatically sent for key events to keep farmers informed about their operations.

## Email Configuration

### Environment Variables

Located in `server/.env`:

```env
EMAIL_USER=bellarinseth@gmail.com
EMAIL_PASS=kept qqvc demi yfxc
EMAIL_FROM=Stay Fresh System <bellarinseth@gmail.com>
FRONTEND_URL=http://localhost:3000
```

### Gmail App Password

The system uses a Gmail App Password (`kept qqvc demi yfxc`) for secure authentication. This is configured in the Gmail account settings under "2-Step Verification" → "App passwords".

## Email Types

### 1. Welcome Email
**Trigger:** New farmer registration  
**Endpoint:** `POST /api/farmers/register`  
**Recipients:** New farmer  
**Content:**
- Personalized greeting with farmer's name
- Account details (name, email, location, phone)
- Overview of platform features:
  - 🏠 Rent Cold Storage Rooms
  - 📊 Real-Time Monitoring
  - 📈 Market Insights
  - 🛒 Direct Marketplace
  - 📚 Training & Learning
- Call-to-action button to dashboard
- Professional green-themed HTML template

**Example:**
```json
POST /api/farmers/register
{
  "email": "farmer@example.com",
  "password": "securepass123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "location": "California"
}
```

### 2. Produce Sold Notification
**Trigger:** Produce marked as sold  
**Endpoint:** `POST /api/produce/:id/sell`  
**Recipients:** Selling farmer  
**Content:**
- Sale success confirmation
- Detailed sale information:
  - Produce type and variety
  - Quantity sold
  - Sale price per kg
  - Total revenue
  - Purchase cost (if available)
  - Total profit
  - Profit margin percentage
  - Storage duration
  - Sale date
- Professional financial breakdown

**Example:**
```json
POST /api/produce/abc123/sell
{
  "salePrice": 5.50,
  "buyerId": "buyer123"
}
```

### 3. Sensor Alert Notification
**Trigger:** Critical or High severity sensor alerts  
**Endpoint:** `POST /api/sensors/:id/reading`  
**Recipients:** Room renter (farmer)  
**Content:**
- 🚨 Urgent attention notice
- Room details (number, capacity, occupancy)
- List of all triggered alerts with:
  - Severity indicator (Critical 🚨 / High ⚠️)
  - Alert type (Temperature, Humidity, CO2, Ethylene)
  - Detailed message
  - Timestamp
- Recommended actions checklist
- Dashboard access button

**Example:**
```json
POST /api/sensors/sensor123/reading
{
  "temperature": 8.5,
  "humidity": 92,
  "co2Level": 600,
  "ethyleneLevel": 0.8
}
```
*Triggers email if values exceed safe thresholds*

### 4. Billing Reminder
**Trigger:** Manual reminder sent  
**Endpoint:** `POST /api/billing/:id/remind`  
**Recipients:** Farmer with pending/overdue bill  
**Content:**
- Payment reminder or overdue notice
- Invoice details:
  - Room number
  - Billing cycle (1-12 months)
  - Period dates
  - Base amount
  - Discounts (if applicable)
  - Late fees (if overdue)
  - Total amount due
  - Due date
- Payment status indication
- "Pay Now" call-to-action button
- Professional invoice-style layout

**Example:**
```json
POST /api/billing/bill123/remind
```

### 5. Marketplace Offer Received
**Trigger:** Buyer makes offer on listing  
**Recipients:** Listing owner (farmer)  
**Content:**
- New offer notification
- Listing title
- Buyer information (name, phone)
- Offer details:
  - Offered price per kg
  - Quantity requested
  - Total value
  - Buyer's message
- Comparison with listed price
- "View Offer" dashboard link

### 6. Urgent Produce Sale Alert
**Trigger:** Produce approaching expiry  
**Recipients:** Farmer  
**Content:**
- ⏰ Urgent warning
- Days until perish countdown
- Produce details (type, quantity, condition)
- Current market price
- Recommended actions:
  - List on marketplace
  - Price competitively
  - Contact buyers
  - Consider processing
- "List on Marketplace" button

## Email Service Architecture

### Location
`server/utils/emailService.js`

### Core Functions

#### 1. `sendEmail({ to, subject, html, text })`
Base email sending function using Nodemailer.

#### 2. `sendWelcomeEmail(farmer)`
Sends welcome email to new farmers.

#### 3. `sendProduceSoldNotification(farmer, produce, saleDetails)`
Notifies farmer when their produce is sold.

#### 4. `sendOfferReceivedNotification(farmer, listing, offer)`
Alerts farmer of new marketplace offers.

#### 5. `sendSensorAlertNotification(farmer, room, alerts)`
Sends urgent sensor alert emails.

#### 6. `sendBillingReminderNotification(farmer, billing, room)`
Sends billing reminders and overdue notices.

#### 7. `sendUrgentProduceNotification(farmer, produce)`
Warns about produce approaching expiry.

### Transporter Configuration
```javascript
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})
```

## Email Templates

All emails use professional HTML templates with:
- **Green theme** matching platform colors (#22c55e)
- Responsive design (max-width: 600px)
- Header with gradient background
- Clean content area with white cards
- Call-to-action buttons
- Footer with copyright and unsubscribe info
- Proper typography and spacing

### Template Structure
```html
<!DOCTYPE html>
<html>
<head>
  <style>
    /* Inline CSS for email compatibility */
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <!-- Gradient green header -->
    </div>
    <div class="content">
      <!-- Email body -->
    </div>
    <div class="footer">
      <!-- Footer info -->
    </div>
  </div>
</body>
</html>
```

## Integration Points

### 1. Farmer Registration (`server/routes/farmers.js`)
```javascript
import { sendWelcomeEmail } from "../utils/emailService.js"

// After farmer registration
sendWelcomeEmail(farmerResponse).catch(err => 
  console.error("Failed to send welcome email:", err)
)
```

### 2. Produce Sale (`server/routes/produce.js`)
```javascript
import { sendProduceSoldNotification } from "../utils/emailService.js"

// After marking produce as sold
const farmer = await Farmer.findById(produce.farmer)
if (farmer) {
  sendProduceSoldNotification(farmer, produce, { salePrice }).catch(err => 
    console.error("Failed to send produce sold email:", err)
  )
}
```

### 3. Sensor Alerts (`server/routes/sensors.js`)
```javascript
import { sendSensorAlertNotification } from "../utils/emailService.js"

// After adding sensor reading with alerts
const criticalAlerts = sensor.activeAlerts.filter(
  a => !a.resolved && (a.severity === "Critical" || a.severity === "High")
)

if (criticalAlerts.length > 0) {
  const room = await Room.findById(sensor.room._id).populate("renter")
  if (room && room.renter) {
    sendSensorAlertNotification(room.renter, room, criticalAlerts).catch(err => 
      console.error("Failed to send sensor alert email:", err)
    )
  }
}
```

### 4. Billing Reminders (`server/routes/billing.js`)
```javascript
import { sendBillingReminderNotification } from "../utils/emailService.js"

// When sending payment reminder
const billing = await Billing.findById(req.params.id)
  .populate("farmer")
  .populate("room")

if (billing.farmer && billing.room) {
  sendBillingReminderNotification(billing.farmer, billing, billing.room).catch(err => 
    console.error("Failed to send billing reminder email:", err)
  )
}
```

## Error Handling

All email operations are **non-blocking** with proper error handling:

```javascript
sendWelcomeEmail(farmer).catch(err => 
  console.error("Failed to send welcome email:", err)
)
```

- Emails are sent asynchronously
- Failures don't interrupt API responses
- Errors are logged to console
- System continues operating even if email fails

## Testing

### Manual Testing

1. **Start the server:**
```bash
cd server
npm start
```

2. **Test Welcome Email:**
```bash
curl -X POST https://www.kisumu.codewithseth.co.ke/api/farmers/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "Farmer",
    "phone": "+1234567890",
    "location": "California"
  }'
```

3. **Test Produce Sold Email:**
First create produce, then:
```bash
curl -X POST https://www.kisumu.codewithseth.co.ke/api/produce/PRODUCE_ID/sell \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "salePrice": 5.50,
    "buyerId": "buyer123"
  }'
```

4. **Test Sensor Alert:**
```bash
curl -X POST https://www.kisumu.codewithseth.co.ke/api/sensors/SENSOR_ID/reading \
  -H "Content-Type: application/json" \
  -d '{
    "temperature": 8.5,
    "humidity": 92,
    "co2Level": 600,
    "ethyleneLevel": 0.8
  }'
```

5. **Test Billing Reminder:**
```bash
curl -X POST https://www.kisumu.codewithseth.co.ke/api/billing/BILLING_ID/remind \
  -H "Content-Type: application/json"
```

### Verify Email Delivery

1. Check the terminal for log messages:
   - `✅ Email service is ready` - Service initialized
   - `📧 Email sent: <message-id>` - Email sent successfully
   - `❌ Email error: ...` - Email failed

2. Check recipient inbox (may take 1-2 minutes)

3. Check spam folder if email not received

## Production Considerations

### 1. Email Rate Limits
Gmail has sending limits:
- **Free Gmail:** 500 emails/day
- **Google Workspace:** 2,000 emails/day

For higher volumes, consider:
- SendGrid
- AWS SES
- Mailgun
- Postmark

### 2. Email Queue
For production, implement email queue using:
- **Bull** (Redis-based queue)
- **BullMQ** (modern Bull alternative)
- **Agenda** (MongoDB-based queue)

Example with Bull:
```javascript
import Bull from 'bull'

const emailQueue = new Bull('emails', process.env.REDIS_URL)

emailQueue.process(async (job) => {
  await sendEmail(job.data)
})

// Add to queue instead of sending directly
emailQueue.add({ to, subject, html })
```

### 3. Email Analytics
Track email metrics:
- Delivery rate
- Open rate
- Click-through rate
- Bounce rate

Use services like:
- SendGrid Analytics
- Mailgun Analytics
- Custom tracking pixels

### 4. Unsubscribe Mechanism
Add unsubscribe links to all marketing/notification emails to comply with:
- CAN-SPAM Act
- GDPR
- Best practices

### 5. Template Management
For larger scale, use:
- **Handlebars** for template engine
- External template files
- Template versioning
- A/B testing

### 6. Monitoring
- Set up alerts for email failures
- Monitor delivery rates
- Track bounce rates
- Log all email activities

## Troubleshooting

### Email Not Sending

**1. Check Gmail App Password:**
- Must be 16 characters without spaces
- Format: `xxxx xxxx xxxx xxxx`

**2. Verify Environment Variables:**
```bash
cat server/.env | grep EMAIL
```

**3. Check Server Logs:**
Look for initialization message:
```
✅ Email service is ready
```

**4. Test Gmail Connection:**
```javascript
transporter.verify((error, success) => {
  if (error) {
    console.log("❌ Email service error:", error)
  } else {
    console.log("✅ Email service is ready")
  }
})
```

### Common Issues

**Issue: "Invalid login" error**
- Solution: Generate new Gmail App Password
- Ensure 2-Step Verification is enabled

**Issue: Emails in spam**
- Solution: Verify SPF/DKIM records (if using custom domain)
- Request recipients to whitelist sender

**Issue: Emails not received**
- Check spam folder
- Verify email address is correct
- Check Gmail sending limits (500/day)

**Issue: Connection timeout**
- Check firewall settings
- Verify port 587 is open
- Try alternative port (465 for SSL)

## Security Best Practices

1. **Never commit .env file:**
   - Add to `.gitignore`
   - Use `.env.example` for template

2. **Use App Passwords:**
   - Never use actual Gmail password
   - Rotate passwords regularly

3. **Encrypt sensitive data:**
   - Store passwords encrypted in database
   - Use environment variables for secrets

4. **Validate email inputs:**
   - Sanitize user-provided content
   - Prevent email injection attacks

5. **Rate limiting:**
   - Limit emails per user
   - Prevent spam/abuse

## Future Enhancements

1. **Email Preferences:**
   - Allow users to opt-in/out
   - Customize notification frequency
   - Choose email types

2. **SMS Notifications:**
   - Use Twilio for critical alerts
   - Backup for email failures

3. **Push Notifications:**
   - Web push for instant alerts
   - Mobile app notifications

4. **Email Templates Dashboard:**
   - Admin panel to edit templates
   - Preview before sending
   - A/B testing interface

5. **Batch Operations:**
   - Send bulk notifications
   - Newsletter functionality
   - Scheduled campaigns

## Support

For issues or questions about the email system:
- Check server logs: `tail -f server/logs/email.log`
- Review this documentation
- Contact system administrator

---

**Last Updated:** 2024  
**Version:** 1.0.0  
**Maintained by:** Stay Fresh Development Team
