# Produce Stocking & Price Monitoring System - Documentation

## Overview
A comprehensive produce stocking system with automated market price monitoring and email notifications for Stay Fresh cold storage application.

## Features Implemented

### 1. **Stocking Model** (`server/models/Stocking.js`)

Complete tracking system for stored produce with price monitoring:

**Key Fields:**
- `room`: Reference to cold room
- `farmer`: Who owns the produce
- `produceType`: 24 types including Tomatoes, Potatoes, Mangoes, etc.
- `quantity`: Weight in kg
- `estimatedValue`: Initial investment/cost
- `condition`: Fresh, Good, Fair, Needs Attention
- `targetPrice`: Desired selling price per kg
- `currentMarketPrice`: Live market price per kg
- `priceAlertSent`: Whether notification was sent
- `status`: Monitoring, Target Reached, Sold, Removed
- `priceHistory`: Array of historical prices with timestamps
- `notificationCount`: Track how many alerts sent

**Virtual Fields:**
- `pricePercentage`: Current price as % of target
- `potentialEarnings`: Current value (quantity × current price)
- `targetEarnings`: Target value (quantity × target price)

### 2. **Backend API** (`server/routes/stocking.js`)

#### Endpoints:

**`POST /api/stocking/book`** - Book produce stocking
```javascript
Body: {
  roomId: string,
  farmerId: string,
  produceType: string,
  quantity: number,
  estimatedValue: number,
  condition: string,
  targetPrice: number,
  notes?: string
}
```
- Validates room ownership
- Checks room capacity
- Fetches current market price
- Creates stocking record
- Updates room occupancy
- Returns: Stocking with success message

**`GET /api/stocking/room/:roomId`** - Get all stockings in a room
- Returns all produce stocked in room
- Includes current market prices
- Shows virtual fields (earnings, percentage)

**`GET /api/stocking/farmer/:farmerId`** - Get farmer's all stockings
- Returns stockings across all farmer's rooms
- Sorted by stocked date

**`GET /api/stocking/:id`** - Get single stocking details
- Full stocking information
- Populated room and farmer data

**`PUT /api/stocking/:id`** - Update stocking
```javascript
Body: {
  quantity?: number,
  condition?: string,
  targetPrice?: number,
  status?: string,
  notes?: string
}
```
- Validates capacity on quantity increase
- Resets alert if target price changed
- Updates room occupancy

**`DELETE /api/stocking/:id`** - Remove stocking
- Marks as "Removed" (soft delete)
- Updates room occupancy
- Checks if room is now empty

**`GET /api/stocking/farmer/:farmerId/stats`** - Get farmer statistics
Returns:
- Total stockings count
- Active stockings count
- Total quantity stocked
- Target reached count
- Average target price
- Total estimated value

### 3. **Price Monitoring Service** (`server/services/priceMonitor.js`)

Automated system that runs every hour to:

**Main Function: `monitorPrices()`**
1. Fetches all active stockings (Monitoring/Stocked status)
2. Gets latest market prices for each produce type
3. Updates `currentMarketPrice` for each stocking
4. Adds price to `priceHistory`
5. Checks if price >= target price
6. Sends email notification if target reached
7. Updates status to "Target Reached"

**Email Notification:**
- Beautiful HTML email template
- Green/Yellow gradient Stay Fresh branding
- Shows:
  - Current market price vs target
  - Quantity stocked
  - Initial investment vs current value
  - Estimated profit with percentage
  - Room and produce details
  - Recommendation text
  - Link to dashboard
- Sent to farmer's registered email
- Only sent once per target reached

**Starting the Service:**
```javascript
startPriceMonitoring(60) // Check every 60 minutes
```

**Scheduling:**
- Runs immediately on server start
- Then repeats at specified interval
- Checks market data from MarketData collection
- Logs all activities to console

### 4. **Frontend Components**

#### **`components/dashboard/book-stocking.tsx`**

Beautiful stocking booking interface with:

**Form Fields:**
- Produce Type dropdown (24 options)
- Quantity input with max validation
- Initial Investment/Value input
- Condition selector with descriptions
- Target Price input
- Optional notes textarea

**Real-time Calculations:**
- Cost per kg display
- Potential earnings at target price
- Expected profit calculation
- Profit percentage

**Visual Features:**
- Room capacity bar showing available space
- Color-coded capacity indicator
- Price monitoring explanation card
- Responsive design
- Input validation
- Loading states

#### **`components/dashboard/room-list.tsx`** (Updated)

Enhanced with stocking display:

**New Section: "Stocked Produce (Price Monitored)"**
Shows for each stocking:
- Produce name and "Target Reached" badge
- Quantity and condition
- Status badge
- Three-column price display:
  - Current market price
  - Target price  
  - Progress percentage
- Visual progress bar (green when target met)
- Stocked date
- "Target Met" indicator

**"Book Stocking" Button:**
- Prominent placement in action buttons
- Only visible for occupied rooms
- Opens booking dialog
- Refreshes data after booking

**Capacity Display:**
- Shows X kg / Y kg format
- Visual progress bar
- Color changes based on usage

### 5. **Email System**

**Email Template Features:**
- Responsive HTML design
- Stay Fresh branding with 🌱 icon
- Gradient headers (green to yellow)
- Professional layout
- Clear call-to-action button
- Financial summary table
- Storage details table
- Helpful recommendation box
- Footer with contact info

**Email Content:**
- Subject: "🎯 Target Price Reached! [Produce] - Room [Number]"
- From: "Stay Fresh 🌱 <bellarinseth@gmail.com>"
- Personalized greeting
- Success celebration messaging
- Complete financial breakdown
- Dashboard link
- Support contact

## User Flow

### Booking Produce Stocking:

1. **User logs into dashboard**
2. **Views "My Rooms"**
3. **Clicks "Book Stocking" on desired room**
4. **Dialog opens showing:**
   - Available capacity
   - Produce type selection
   - Quantity input (validated against capacity)
   - Initial value input
   - Condition selection
   - Target price input
5. **Real-time calculation shows:**
   - Cost per kg
   - Potential earnings
   - Expected profit
6. **User confirms booking**
7. **System:**
   - Validates all inputs
   - Checks room capacity
   - Fetches current market price
   - Creates stocking record
   - Updates room occupancy
   - Returns confirmation
8. **User sees success message**
9. **Stocking appears in room card**

### Price Monitoring & Notification:

1. **Service runs every hour automatically**
2. **Checks all active stockings**
3. **Fetches latest market prices**
4. **For each stocking:**
   - Updates current price
   - Adds to price history
   - Checks if target reached
5. **If price >= target:**
   - Sends beautiful email to farmer
   - Updates status to "Target Reached"
   - Marks alert as sent
   - Shows "Target Reached" badge in UI
6. **Farmer receives email:**
   - Opens email notification
   - Sees financial summary
   - Clicks dashboard link
   - Views updated stocking status

### Viewing Stocked Produce:

1. **User views room in dashboard**
2. **Sees "Stocked Produce" section**
3. **Each stocking shows:**
   - Produce type and badge
   - Current vs target price
   - Progress percentage
   - Visual progress bar
   - Condition and quantity
4. **Color-coded indicators:**
   - Red/Orange: Below target
   - Green: At or above target
5. **"Target Reached" badge displayed**

## Technical Details

### Database Schema:

```javascript
Stocking {
  room: ObjectId,
  farmer: ObjectId,
  produceType: String (enum),
  quantity: Number,
  estimatedValue: Number,
  condition: String (enum),
  targetPrice: Number,
  currentMarketPrice: Number,
  priceAlertSent: Boolean,
  status: String (enum),
  stockedAt: Date,
  targetReachedAt: Date,
  notes: String,
  priceHistory: [{
    price: Number,
    checkedAt: Date
  }],
  lastNotificationSent: Date,
  notificationCount: Number
}
```

### Indexes:
- `{ room: 1, status: 1 }` - Fast room queries
- `{ farmer: 1 }` - Fast farmer queries
- `{ status: 1, priceAlertSent: 1 }` - Fast monitoring queries

### Market Price Integration:
- Reads from `MarketData` collection
- Queries by `produceType`
- Sorts by timestamp (newest first)
- Updates stocking's `currentMarketPrice`

### Capacity Management:
- Room capacity tracked in real-time
- Booking validates available space
- Multiple produce types per room
- Updates on booking/removal

### Service Intervals:
- Power Scheduler: Every 5 minutes
- Price Monitor: Every 60 minutes
- Both start on server boot
- Run in background continuously

## API Request Examples

### Book Stocking:
```javascript
POST /api/stocking/book
Headers: { Authorization: "Bearer <token>" }
Body: {
  roomId: "64abc...",
  farmerId: "64def...",
  produceType: "Tomatoes",
  quantity: 50,
  estimatedValue: 500,
  condition: "Fresh",
  targetPrice: 12.50,
  notes: "Premium quality"
}

Response: {
  message: "Stocking booked successfully! You'll be notified when target price is reached.",
  stocking: { ... }
}
```

### Get Room Stockings:
```javascript
GET /api/stocking/room/64abc...
Headers: { Authorization: "Bearer <token>" }

Response: [
  {
    _id: "...",
    produceType: "Tomatoes",
    quantity: 50,
    targetPrice: 12.50,
    currentMarketPrice: 10.75,
    pricePercentage: "86.0",
    potentialEarnings: "537.50",
    targetEarnings: "625.00",
    status: "Monitoring",
    ...
  }
]
```

## Configuration

### Email Setup:
```javascript
// server/services/priceMonitor.js
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "bellarinseth@gmail.com",
    pass: process.env.EMAIL_PASSWORD
  }
})
```

### Monitoring Interval:
```javascript
// server/index.js
startPriceMonitoring(60) // Minutes
```

### Produce Types:
24 types available including:
- Vegetables: Tomatoes, Potatoes, Onions, Carrots, Cabbage, etc.
- Fruits: Bananas, Mangoes, Avocados, Oranges, Apples, etc.
- Other: Custom entry option

## UI/UX Features

### Visual Design:
- Card-based stocking display
- Progress bars with gradient fills
- Color-coded status badges
- Responsive grid layouts
- Smooth animations
- Clear typography

### User Feedback:
- Success alerts with confirmation
- Error messages with context
- Loading states during booking
- Real-time capacity checking
- Input validation feedback
- Email notification confirmation

### Mobile Optimization:
- Touch-friendly inputs
- Readable text sizes
- Proper spacing
- Grid adapts to screen size
- Scrollable dialogs

## Monitoring Dashboard

### Room Card Shows:
- Room capacity bar (X/Y kg)
- All stocked produce list
- Current vs target prices
- Progress percentages
- Visual progress bars
- Target reached badges
- Book Stocking button

### Color Coding:
- **Green**: Target reached or exceeded
- **Yellow/Orange**: 50-99% of target
- **Red**: Below 50% of target
- **Badges**: Status indicators

## Future Enhancements

1. **Advanced Analytics:**
   - Price trend charts
   - Best selling times
   - Profit reports
   - Historical comparisons

2. **Smart Recommendations:**
   - AI-powered price predictions
   - Optimal selling time suggestions
   - Market trend analysis
   - Seasonal insights

3. **Mobile Push Notifications:**
   - Instant alerts on phone
   - Progressive Web App support
   - Background notifications

4. **Multiple Target Prices:**
   - Set multiple price targets
   - Partial sale support
   - Graduated pricing

5. **Market Integration:**
   - Direct marketplace listing
   - Buyer matching
   - Automated selling

6. **Reporting:**
   - PDF export
   - Excel reports
   - Tax documentation
   - Profit/loss statements

## Testing Checklist

- [ ] Book stocking with valid data
- [ ] Validate capacity checking
- [ ] Test with room at full capacity
- [ ] Update target price
- [ ] Remove stocking
- [ ] Check room occupancy updates
- [ ] Verify price monitoring runs
- [ ] Confirm email notifications sent
- [ ] Test with multiple produce types
- [ ] Check progress calculations
- [ ] Verify virtual fields
- [ ] Test market price integration
- [ ] Check price history tracking
- [ ] Validate status transitions
- [ ] Test farmer statistics

## Notes

- Prices checked every hour automatically
- Email sent only once per target reached
- Market prices from MarketData collection
- Room capacity updated in real-time
- Multiple stockings per room supported
- Soft delete (status = "Removed")
- Price history limited to last 100 checks

---

**Created**: November 7, 2025  
**Version**: 1.0  
**Status**: ✅ Complete & Ready for Testing  
**Services**: Price Monitor running every 60 minutes
