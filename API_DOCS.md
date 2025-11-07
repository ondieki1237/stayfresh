# 📡 Cold Chain API Documentation

Complete API reference for the Cold Chain Management System backend.

**Base URL:** `http://localhost:5000/api`

## 🔐 Authentication

Most endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

Get a token by registering or logging in.

---

## 👤 Farmers API

### Register Farmer
```http
POST /api/farmers/register
```

**Body:**
```json
{
  "email": "farmer@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "location": "New York"
}
```

**Response:**
```json
{
  "message": "Registration successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "farmer": { /* farmer object */ }
}
```

### Login
```http
POST /api/farmers/login
```

**Body:**
```json
{
  "email": "farmer@example.com",
  "password": "password123"
}
```

### Get Farmer Profile
```http
GET /api/farmers/profile/:id
Authorization: Bearer <token>
```

### Update Farmer Profile
```http
PUT /api/farmers/profile/:id
Authorization: Bearer <token>
```

**Body:** Partial farmer object

### Get Farmer Statistics
```http
GET /api/farmers/stats/:id
Authorization: Bearer <token>
```

---

## 🏠 Rooms API

### Get All Rooms
```http
GET /api/rooms?status=Available&minCapacity=500&maxCapacity=2000
```

**Query Parameters:**
- `status`: Available | Occupied | Maintenance
- `minCapacity`: Minimum capacity in kg
- `maxCapacity`: Maximum capacity in kg

### Get Available Rooms
```http
GET /api/rooms/available
```

### Get Farmer's Rooms
```http
GET /api/rooms/farmer/:farmerId
Authorization: Bearer <token>
```

### Get Single Room
```http
GET /api/rooms/:id
```

### Create Room (Admin)
```http
POST /api/rooms
```

**Body:**
```json
{
  "roomNumber": "R001",
  "capacity": 1000,
  "size": 50,
  "temperature": 4,
  "targetTemperature": 4,
  "humidity": 85,
  "targetHumidity": 85,
  "sterilization": "Completed",
  "conditioning": "Good",
  "status": "Available",
  "rentalRate": 300,
  "airCirculation": "Good",
  "lightExposure": "None"
}
```

### Rent a Room
```http
POST /api/rooms/:id/rent
Authorization: Bearer <token>
```

**Body:**
```json
{
  "farmerId": "farmer_id",
  "startDate": "2024-01-01",
  "endDate": "2024-12-31",
  "billingCycle": "6months"
}
```

**Response:** Returns room and billing record

### Release a Room
```http
POST /api/rooms/:id/release
Authorization: Bearer <token>
```

### Update Room
```http
PUT /api/rooms/:id
Authorization: Bearer <token>
```

### Delete Room (Admin)
```http
DELETE /api/rooms/:id
```

---

## 🥕 Produce API

### Get All Produce
```http
GET /api/produce?farmer=farmerId&room=roomId&produceType=tomato&status=Active
```

### Get Farmer's Produce
```http
GET /api/produce/farmer/:farmerId
Authorization: Bearer <token>
```

### Get Room's Produce
```http
GET /api/produce/room/:roomId
```

### Get Single Produce
```http
GET /api/produce/:id
```

### Add Produce
```http
POST /api/produce
Authorization: Bearer <token>
```

**Body:**
```json
{
  "farmer": "farmer_id",
  "room": "room_id",
  "produceType": "tomato",
  "variety": "Cherry Tomatoes",
  "quantity": 500,
  "currentMarketPrice": 50,
  "expectedPeakPrice": 75,
  "expectedPeakDate": "2024-06-15",
  "minimumSellingPrice": 45,
  "condition": "Fresh",
  "qualityScore": 90,
  "gradeLevel": "A",
  "harvestDate": "2024-01-15",
  "isOrganic": true,
  "perishabilityLevel": "High",
  "daysUntilPerish": 14,
  "expectsPeakPrice": true
}
```

### Update Produce
```http
PUT /api/produce/:id
Authorization: Bearer <token>
```

### Mark as Sold
```http
POST /api/produce/:id/sell
Authorization: Bearer <token>
```

**Body:**
```json
{
  "salePrice": 65,
  "buyerId": "buyer_id"
}
```

### Get Urgent Produce
```http
GET /api/produce/alerts/urgent
```

Returns produce that needs urgent sale (close to perishing).

### Delete Produce
```http
DELETE /api/produce/:id
Authorization: Bearer <token>
```

---

## 💳 Billing API

### Get All Billing Records
```http
GET /api/billing?farmer=farmerId&status=Pending
```

### Get Farmer's Billing
```http
GET /api/billing/farmer/:farmerId
Authorization: Bearer <token>
```

### Get Single Billing Record
```http
GET /api/billing/:id
Authorization: Bearer <token>
```

### Create Billing Record
```http
POST /api/billing
```

**Body:**
```json
{
  "farmer": "farmer_id",
  "room": "room_id",
  "billingCycle": "6months",
  "cycleMonths": 6,
  "baseAmount": 1800,
  "discount": 270,
  "totalAmount": 1530,
  "startDate": "2024-01-01",
  "endDate": "2024-06-30",
  "dueDate": "2024-01-08"
}
```

### Process Payment
```http
POST /api/billing/:id/pay
Authorization: Bearer <token>
```

**Body:**
```json
{
  "amount": 1530,
  "paymentMethod": "mobile",
  "transactionId": "TXN123456"
}
```

### Get Pending Bills
```http
GET /api/billing/status/pending
```

### Get Overdue Bills
```http
GET /api/billing/status/overdue
```

### Send Payment Reminder
```http
POST /api/billing/:id/remind
```

---

## 📊 Sensors API

### Get All Sensors
```http
GET /api/sensors
```

### Get Sensor by Room
```http
GET /api/sensors/room/:roomId
```

### Get Single Sensor
```http
GET /api/sensors/:id
```

### Create Sensor
```http
POST /api/sensors
```

**Body:**
```json
{
  "sensorId": "SEN-R001",
  "room": "room_id",
  "temperature": 4.2,
  "humidity": 85,
  "co2Level": 450,
  "ethyleneLevel": 20,
  "airPressure": 101325,
  "isOnline": true,
  "batteryLevel": 95,
  "temperatureMin": 2,
  "temperatureMax": 6,
  "humidityMin": 80,
  "humidityMax": 95
}
```

### Add Sensor Reading
```http
POST /api/sensors/:id/reading
```

**Body:**
```json
{
  "temperature": 4.5,
  "humidity": 87,
  "co2Level": 500,
  "ethyleneLevel": 25,
  "airPressure": 101300
}
```

**Response:** Includes any new alerts generated

### Get Reading History
```http
GET /api/sensors/:id/history?hours=24
```

**Query Parameters:**
- `hours`: Number of hours of history (default: 24)

### Get Active Alerts
```http
GET /api/sensors/:id/alerts
```

### Resolve Alert
```http
POST /api/sensors/:id/alerts/:alertIndex/resolve
```

---

## 📈 Market Data API

### Get All Market Data
```http
GET /api/market
```

### Get Market Data by Produce Type
```http
GET /api/market/produce/:produceType
```

Example: `/api/market/produce/tomato`

### Get Market Data by Produce and Region
```http
GET /api/market/:produceType/:region
```

Example: `/api/market/tomato/North`

### Get Price History
```http
GET /api/market/:produceType/history?days=30
```

### Create/Update Market Data
```http
POST /api/market
```

**Body:**
```json
{
  "produceType": "tomato",
  "region": "North",
  "currentPrice": 55,
  "previousPrice": 50,
  "lowestPrice": 40,
  "highestPrice": 65,
  "averagePrice": 52,
  "demand": "High",
  "supply": "Medium",
  "trendDirection": "Rising",
  "trendPercentage": 10,
  "predictedPeakPrice": 70,
  "predictedPeakDate": "2024-06-15",
  "bestTimeToSell": "Next 3-5 days",
  "marketConfidence": "High",
  "activeBuyers": 45
}
```

### Get Market Insights
```http
GET /api/market/insights/:produceType
```

**Response:**
```json
{
  "produceType": "tomato",
  "currentMarketPrice": 55,
  "averagePrice": 52,
  "highestPrice": 65,
  "lowestPrice": 40,
  "priceRange": 25,
  "trend": "Rising",
  "demand": "High",
  "supply": "Medium",
  "bestRegion": "North",
  "bestRegionPrice": 60,
  "recommendation": "Sell Soon",
  "confidence": "High",
  "lastUpdated": "2024-01-15T10:30:00Z"
}
```

### Compare Prices Across Regions
```http
GET /api/market/compare/:produceType
```

---

## 🛒 Marketplace API

### Get All Listings
```http
GET /api/marketplace?produceType=tomato&region=North&maxPrice=60&isUrgent=true
```

**Query Parameters:**
- `produceType`: Filter by produce type
- `region`: Filter by location/region
- `maxPrice`: Maximum price per kg
- `isUrgent`: Show only urgent listings

### Get Farmer's Listings
```http
GET /api/marketplace/farmer/:farmerId
Authorization: Bearer <token>
```

### Get Single Listing
```http
GET /api/marketplace/:id
```

Auto-increments view count.

### Create Listing
```http
POST /api/marketplace
Authorization: Bearer <token>
```

**Body:**
```json
{
  "farmer": "farmer_id",
  "produce": "produce_id",
  "title": "Fresh Organic Tomatoes",
  "description": "High quality cherry tomatoes",
  "produceType": "tomato",
  "quantity": 500,
  "availableQuantity": 500,
  "pricePerKg": 55,
  "totalValue": 27500,
  "minOrderQuantity": 10,
  "negotiable": true,
  "quality": "Excellent",
  "isOrganic": true,
  "certifications": ["Organic", "FDA Approved"],
  "availableUntil": "2024-02-15",
  "location": "New York",
  "deliveryAvailable": true,
  "pickupAvailable": true,
  "deliveryRadius": 50,
  "deliveryFee": 20,
  "isUrgent": false,
  "daysUntilPerish": 14
}
```

### Submit Offer
```http
POST /api/marketplace/:id/offer
```

**Body:**
```json
{
  "buyerName": "John's Restaurant",
  "buyerPhone": "+1234567890",
  "offeredPrice": 52,
  "quantity": 100,
  "message": "Interested in regular supply"
}
```

### Accept/Reject Offer
```http
PUT /api/marketplace/:id/offer/:offerIndex
Authorization: Bearer <token>
```

**Body:**
```json
{
  "status": "Accepted"
}
```

### Mark as Sold
```http
POST /api/marketplace/:id/sold
Authorization: Bearer <token>
```

### Cancel Listing
```http
POST /api/marketplace/:id/cancel
Authorization: Bearer <token>
```

### Get Urgent Listings
```http
GET /api/marketplace/urgent/all
```

---

## 📚 Training API

### Get All Courses
```http
GET /api/training?category=Cold%20Storage&level=Beginner
```

**Query Parameters:**
- `category`: Cold Storage | Produce Quality | Market Skills | Technology | Business
- `level`: Beginner | Intermediate | Advanced

### Get Single Course
```http
GET /api/training/:id
```

### Get Enrolled Courses
```http
GET /api/training/farmer/:farmerId/enrolled
Authorization: Bearer <token>
```

### Create Course (Admin)
```http
POST /api/training
```

**Body:**
```json
{
  "title": "Advanced Cold Storage Techniques",
  "description": "Master advanced cold storage methods",
  "category": "Cold Storage",
  "level": "Advanced",
  "duration": 5,
  "modules": [
    {
      "title": "Module 1",
      "description": "Introduction",
      "duration": 60,
      "content": "Module content here",
      "order": 1
    }
  ],
  "objectives": ["Learn X", "Master Y"],
  "whatYouWillLearn": ["Technique A", "Method B"],
  "instructor": "Dr. Expert",
  "providesCertificate": true,
  "isPublished": true
}
```

### Enroll in Course
```http
POST /api/training/:id/enroll
Authorization: Bearer <token>
```

**Body:**
```json
{
  "farmerId": "farmer_id"
}
```

### Get Popular Courses
```http
GET /api/training/popular/top
```

### Get Courses by Category
```http
GET /api/training/category/:category
```

---

## 👨‍💼 Admin API

### Get Dashboard Statistics
```http
GET /api/admin/stats
```

**Response:**
```json
{
  "farmers": {
    "total": 150,
    "active": 142,
    "inactive": 8
  },
  "rooms": {
    "total": 50,
    "available": 20,
    "occupied": 28,
    "maintenance": 2,
    "occupancyRate": "82.50"
  },
  "produce": {
    "total": 350,
    "active": 320,
    "sold": 30
  },
  "billing": {
    "totalRevenue": 125000,
    "paidRevenue": 110000,
    "pendingRevenue": 15000,
    "pendingBills": 25,
    "overdueBills": 3
  },
  "capacity": {
    "total": 50000,
    "occupied": 41250,
    "available": 8750,
    "occupancyRate": "82.50"
  },
  "sensors": {
    "online": 48,
    "offline": 2,
    "activeAlerts": 5
  }
}
```

### Get All Farmers
```http
GET /api/admin/farmers
```

### Get All Rooms
```http
GET /api/admin/rooms
```

### Get System Health
```http
GET /api/admin/health
```

**Response:**
```json
{
  "status": "Good",
  "criticalAlerts": 0,
  "warnings": 2,
  "details": {
    "critical": [],
    "warnings": [/* array of warnings */]
  }
}
```

### Get Revenue Analytics
```http
GET /api/admin/analytics/revenue?period=month
```

**Query Parameters:**
- `period`: week | month | year

---

## 🔍 Common Response Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Server Error

## 📝 Notes

1. All timestamps are in ISO 8601 format
2. IDs are MongoDB ObjectIds
3. Prices are in your local currency (configure as needed)
4. Quantities are in kilograms (kg)
5. Temperature is in Celsius (°C)
6. JWT tokens expire after 30 days

## 🧪 Example Usage (cURL)

### Register and Login
```bash
# Register
curl -X POST http://localhost:5000/api/farmers/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"pass123","firstName":"John","lastName":"Doe","phone":"+1234567890","location":"NY"}'

# Login
curl -X POST http://localhost:5000/api/farmers/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"pass123"}'
```

### Get Available Rooms
```bash
curl http://localhost:5000/api/rooms/available
```

### Add Produce (with token)
```bash
curl -X POST http://localhost:5000/api/produce \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"farmer":"FARMER_ID","room":"ROOM_ID","produceType":"tomato","quantity":100,"currentMarketPrice":50}'
```

---

**For more examples, see the README.md file.**
