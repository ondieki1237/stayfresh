# User Room Rental System - Documentation

## Overview
A comprehensive room rental system for Stay Fresh cold storage application that allows users to browse, rent, manage, and abandon rooms.

## Features Implemented

### 1. **Room Model Updates** (`models/Room.js`)
- **Added `renter` field**: Separate from `owner` to distinguish system owner from current user/renter
- **Added `abandonmentRequest` object**:
  - `reason`: User's explanation for wanting to abandon
  - `requestedAt`: Timestamp of the request
  - `status`: "Pending", "Approved", or "Rejected"

### 2. **Backend API Endpoints** (`server/routes/rooms.js`)

#### Existing Endpoints:
- `GET /api/rooms/available` - List all available rooms for rent
- `GET /api/rooms/farmer/:farmerId` - Get all rooms rented by a specific farmer
- `POST /api/rooms/:id/rent` - Rent a room with billing cycle

#### New Endpoints:
- **`POST /api/rooms/:id/abandon`** - Submit abandonment request
  - Body: `{ reason: string, farmerId: string }`
  - Creates a pending abandonment request
  - Returns success message

- **`POST /api/rooms/:id/abandon/:action`** - Admin: Approve/Reject abandonment
  - Params: action = 'approve' or 'reject'
  - If approved: Removes farmer from room, resets room to Available
  - If rejected: Updates status to Rejected

- **`POST /api/rooms/:id/request-release`** - Request produce release from room

### 3. **User Components**

#### **`components/dashboard/rent-room.tsx`**
A beautiful room browsing and rental interface featuring:
- **Grid Display**: Shows all available rooms with key details
- **Room Cards**: 
  - Room number, capacity
  - Temperature and humidity monitoring
  - Conditioning status
  - Monthly rental rate
- **Rental Dialog**: 
  - Billing cycle selection (1-12 months)
  - Automatic discount calculation (up to 20% for 12 months)
  - Price breakdown showing base amount and discount
  - Payment terms (7 days due)
- **Real-time Updates**: Refreshes list after successful rental

#### **`components/dashboard/room-list.tsx`** (Updated)
Enhanced user room management:
- **"Rent More" Button**: Opens room browsing interface
- **Abandon Room Button**: For each rented room
- **Abandonment Dialog**:
  - Requires reason input (textarea)
  - Shows important warnings
  - Validates reason before submission
- **Environmental Monitoring**: Shows temp, humidity for each room
- **Produce Information**: Displays produce stored in room
- **Billing Information**: Toggle view for electricity consumption

#### **`app/dashboard/page.tsx`** (Updated)
Integrated rental flow:
- **Toggle View**: Switch between "My Rooms" and "Browse Available Rooms"
- **Back Navigation**: Easy return from browsing to owned rooms
- **Auto-Refresh**: Updates farmer data after renting
- **Empty State**: Shows browse button when no rooms rented

### 4. **Admin Components**

#### **`components/admin/abandonment-requests.tsx`** (New)
Complete admin interface for managing abandonment requests:
- **Request List**: Shows all pending abandonment requests
- **Request Cards**:
  - Room details
  - Renter information (name, email, phone)
  - Request date and time
  - Reason preview
- **Details Dialog**:
  - Full request details
  - Complete abandonment reason
  - Warnings and checklist
  - Approve/Reject buttons
- **Process Actions**:
  - Approve: Releases room immediately
  - Reject: Keeps current rental active

#### **`app/admin/page.tsx`** (Updated)
- Added new "Abandonment" tab (🚪 icon)
- Updated grid to accommodate 10 tabs
- Integrated AbandonmentRequests component

## User Flow

### Renting a Room:
1. User logs into dashboard
2. Clicks "Rent More" or "Browse Available Rooms"
3. Views available rooms with details
4. Clicks "Rent This Room" on desired room
5. Selects billing cycle (longer = more discount)
6. Reviews price breakdown
7. Confirms rental
8. Room added to "My Rooms"
9. Billing record created automatically

### Abandoning a Room:
1. User views their rented rooms
2. Clicks "Abandon Room" button
3. Sees warning about requirements
4. Enters detailed reason
5. Submits request
6. Admin receives notification
7. Admin reviews and approves/rejects
8. If approved: Room released, user notified
9. If rejected: Rental continues

### Admin Processing:
1. Admin opens "Abandonment" tab
2. Sees count of pending requests
3. Clicks "View Details & Process"
4. Reviews full information
5. Checks produce removal and billing
6. Approves or rejects with one click
7. System updates room status automatically

## Billing Cycles & Discounts

| Cycle    | Discount | Ideal For                |
|----------|----------|--------------------------|
| 1 month  | 0%       | Short-term storage       |
| 2 months | 5%       | Seasonal produce         |
| 3 months | 10%      | Medium-term storage      |
| 4 months | 12%      | Extended storage         |
| 6 months | 15%      | Long-term planning       |
| 12 months| 20%      | Annual commitment        |

**Example**: Room at KSH 100/month
- 1 month: KSH 100
- 3 months: KSH 270 (save KSH 30)
- 12 months: KSH 960 (save KSH 240)

## Database Schema Changes

### Room Model:
```javascript
{
  renter: ObjectId, // Farmer who rents the room
  abandonmentRequest: {
    reason: String,
    requestedAt: Date,
    status: "Pending" | "Approved" | "Rejected"
  }
}
```

## API Request Examples

### Rent a Room:
```javascript
POST /api/rooms/64abc123.../rent
Headers: { Authorization: "Bearer <token>" }
Body: {
  farmerId: "64abc...",
  startDate: "2025-11-07T...",
  endDate: "2026-02-07T...",
  billingCycle: "3months"
}
```

### Request Abandonment:
```javascript
POST /api/rooms/64abc123.../abandon
Headers: { Authorization: "Bearer <token>" }
Body: {
  reason: "I need to downsize my operations due to...",
  farmerId: "64abc..."
}
```

### Approve/Reject (Admin):
```javascript
POST /api/rooms/64abc123.../abandon/approve
Headers: { Authorization: "Bearer <token>" }
```

## UI/UX Features

### Visual Design:
- **Gradient Accents**: Green to yellow for primary actions
- **Card-Based Layout**: Clean, modern room cards
- **Responsive Grid**: Adapts to screen size
- **Color-Coded Status**: 
  - Available: Green
  - Occupied: Blue
  - Pending: Yellow/Orange
  - Abandoned: Red

### User Feedback:
- Success alerts with emoji (✅)
- Error alerts with context (❌)
- Warning cards before critical actions (⚠️)
- Loading states with animations
- Disabled states during processing

### Mobile Optimization:
- Touch-friendly buttons
- Readable text sizes
- Proper spacing
- Grid adapts to small screens

## Testing Checklist

- [ ] Browse available rooms as user
- [ ] Rent a room with different billing cycles
- [ ] Verify discount calculations
- [ ] View rented rooms in dashboard
- [ ] Request produce release
- [ ] Submit abandonment request with reason
- [ ] View abandonment in admin panel
- [ ] Approve abandonment as admin
- [ ] Verify room returns to Available
- [ ] Reject abandonment as admin
- [ ] Rent multiple rooms
- [ ] Test empty states (no rooms available/rented)

## Future Enhancements

1. **Email Notifications**:
   - Rental confirmation
   - Abandonment request submitted
   - Admin decision notification

2. **Payment Integration**:
   - Online payment processing
   - Payment history
   - Invoice generation

3. **Room Reviews**:
   - Rate room condition after rental
   - Feedback system

4. **Waitlist**:
   - Join waitlist for fully booked rooms
   - Auto-notify when available

5. **Room Comparison**:
   - Side-by-side comparison
   - Filter by features
   - Sort by price/capacity

6. **Analytics**:
   - Track abandonment rates
   - Popular billing cycles
   - Average rental duration

## Notes

- All monetary values in KSH
- Dates use ISO 8601 format
- Authorization required for all endpoints
- Admin role checked server-side
- Optimistic UI updates with error handling
- Proper cleanup on room release

---

**Created**: November 7, 2025
**Version**: 1.0
**Status**: ✅ Complete & Ready for Testing
