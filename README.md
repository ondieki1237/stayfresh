# 🥶❄️ Cold Chain Management System

A comprehensive full-stack cold storage management platform designed for farmers to rent cold storage facilities, monitor produce, track market prices, and connect with buyers.

## 🌟 Features

### For Farmers
- **Room Rental Management**: Rent cold storage apartments with flexible billing cycles (1-12 months)
- **Real-time Monitoring**: Track temperature, humidity, CO2, and ethylene levels via IoT sensors
- **Produce Tracking**: Monitor stored produce quantity, condition, and storage duration
- **Market Insights**: Get real-time market prices, trends, and optimal selling recommendations
- **Direct Marketplace**: List produce and connect directly with buyers
- **Training & Learning**: Access educational courses on cold storage best practices
- **Billing Management**: Track payments with multiple cycle options and automatic discounts

### For Administrators
- **Dashboard Overview**: Comprehensive statistics and analytics
- **Farmer Management**: Monitor all registered farmers and their activities
- **Room Management**: Create and manage cold storage units
- **System Health Monitoring**: Track sensor status and system alerts
- **Revenue Analytics**: View billing trends and revenue reports

## 🏗️ Technology Stack

### Frontend
- **Next.js 16** with App Router
- **React 19** with TypeScript
- **Tailwind CSS 4** - Green-themed UI
- **Shadcn/ui** - Accessible component library
- **Recharts** - Data visualization

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** Authentication
- **bcryptjs** Password hashing
- **REST API** architecture

## 📁 Project Structure

```
coldroom/
├── app/                    # Next.js app directory
│   ├── dashboard/         # Farmer dashboard pages
│   ├── admin/             # Admin panel
│   └── globals.css        # Global styles (green theme)
├── components/            # React components
│   ├── auth/             # Login/Register forms
│   ├── dashboard/        # Dashboard components
│   ├── marketplace/      # Marketplace features
│   ├── training/         # Learning modules
│   └── ui/               # Reusable UI components
├── server/                # Backend API
│   ├── models/           # MongoDB schemas
│   │   ├── Farmer.js
│   │   ├── Room.js
│   │   ├── Produce.js
│   │   ├── Billing.js
│   │   ├── Sensor.js
│   │   ├── MarketData.js
│   │   ├── MarketplaceListing.js
│   │   ├── Buyer.js
│   │   └── TrainingCourse.js
│   ├── routes/           # API endpoints
│   │   ├── farmers.js
│   │   ├── rooms.js
│   │   ├── produce.js
│   │   ├── billing.js
│   │   ├── sensors.js
│   │   ├── market.js
│   │   ├── marketplace.js
│   │   ├── training.js
│   │   └── admin.js
│   ├── middleware/       # Auth middleware
│   ├── package.json
│   └── index.js          # Server entry point
├── .env.local            # Frontend environment variables
└── package.json          # Root dependencies
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- MongoDB (local or Atlas)
- npm or pnpm

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd coldroom
```

2. **Install dependencies**
```bash
# Install root dependencies
npm install

# Install server dependencies
cd server
npm install
cd ..
```

3. **Configure environment variables**

Create `.env.local` in the root directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Create `server/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/cold-chain
JWT_SECRET=your_super_secret_jwt_key_here
NODE_ENV=development
```

4. **Start MongoDB**
```bash
# Make sure MongoDB is running on localhost:27017
# Or use MongoDB Atlas and update MONGODB_URI
```

5. **Run the application**

**Option 1: Run both frontend and backend together**
```bash
npm run dev:all
```

**Option 2: Run separately**
```bash
# Terminal 1 - Frontend
npm run dev

# Terminal 2 - Backend
npm run dev:server
```

6. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api

## 📊 Database Models

### Farmer
- Authentication credentials
- Personal details (name, phone, location)
- Farm information
- Rented rooms
- Billing cycle preferences

### Room
- Room number and capacity
- Environmental parameters (temperature, humidity)
- Sterilization and conditioning status
- Current occupancy
- Rental information
- Sensor integration

### Produce
- Produce type and variety
- Quantity and quality tracking
- Market price information
- Storage duration
- Perishability tracking
- Sales information

### Billing
- Billing cycles (1-12 months)
- Amount breakdown with discounts
- Payment status tracking
- Due dates and reminders
- Late fee calculation

### Sensor
- Real-time environmental readings
- Alert thresholds
- Reading history (24 hours)
- Battery and online status
- Automatic alert generation

### MarketData
- Current and historical prices
- Demand and supply indicators
- Price trends and predictions
- Regional comparisons

### MarketplaceListing
- Produce listings for sale
- Buyer offers management
- Urgency tracking for perishables
- Delivery options

### TrainingCourse
- Educational content
- Categories and levels
- Enrollment tracking
- Certificates

## 🔌 API Endpoints

### Authentication
- `POST /api/farmers/register` - Register new farmer
- `POST /api/farmers/login` - Login

### Rooms
- `GET /api/rooms` - Get all rooms
- `GET /api/rooms/available` - Get available rooms
- `GET /api/rooms/farmer/:farmerId` - Get farmer's rooms
- `POST /api/rooms` - Create room (admin)
- `POST /api/rooms/:id/rent` - Rent a room
- `POST /api/rooms/:id/release` - Release a room

### Produce
- `GET /api/produce` - Get all produce
- `GET /api/produce/farmer/:farmerId` - Get farmer's produce
- `POST /api/produce` - Add produce
- `PUT /api/produce/:id` - Update produce
- `POST /api/produce/:id/sell` - Mark as sold

### Billing
- `GET /api/billing/farmer/:farmerId` - Get farmer's bills
- `POST /api/billing/:id/pay` - Process payment
- `GET /api/billing/status/pending` - Get pending bills
- `GET /api/billing/status/overdue` - Get overdue bills

### Sensors
- `GET /api/sensors` - Get all sensors
- `GET /api/sensors/room/:roomId` - Get room sensor
- `POST /api/sensors/:id/reading` - Add sensor reading
- `GET /api/sensors/:id/history` - Get reading history
- `GET /api/sensors/:id/alerts` - Get active alerts

### Market Data
- `GET /api/market/produce/:produceType` - Get market data
- `GET /api/market/insights/:produceType` - Get insights
- `GET /api/market/compare/:produceType` - Compare prices by region

### Marketplace
- `GET /api/marketplace` - Get all listings
- `GET /api/marketplace/farmer/:farmerId` - Get farmer's listings
- `POST /api/marketplace` - Create listing
- `POST /api/marketplace/:id/offer` - Submit offer
- `PUT /api/marketplace/:id/offer/:offerIndex` - Accept/reject offer

### Training
- `GET /api/training` - Get all courses
- `GET /api/training/farmer/:farmerId/enrolled` - Get enrolled courses
- `POST /api/training/:id/enroll` - Enroll in course

### Admin
- `GET /api/admin/stats` - Get dashboard statistics
- `GET /api/admin/farmers` - Get all farmers
- `GET /api/admin/rooms` - Get all rooms
- `GET /api/admin/health` - Get system health

## 🎨 Design Features

- **Green Theme**: Eco-friendly green color scheme throughout
- **Dark Mode**: Full dark mode support
- **Responsive**: Mobile-first design
- **Accessible**: ARIA-compliant components
- **User-Friendly**: Simple interface for farmers

## 🔐 Security

- JWT-based authentication
- Password hashing with bcryptjs
- Protected routes with middleware
- Input validation
- CORS configuration

## 📱 Key User Flows

### Farmer Registration & Room Rental
1. Register/Login
2. Browse available rooms
3. Select room and billing cycle
4. Automatic billing record creation
5. Access dashboard to monitor room

### Produce Management
1. Add produce to rented room
2. System tracks storage duration
3. Real-time condition monitoring
4. Market price alerts
5. Sell when price is optimal

### Marketplace Transaction
1. Create listing for produce
2. Buyers submit offers
3. Accept offer
4. Update produce status
5. Complete transaction

## 🛠️ Development Scripts

```bash
# Development
npm run dev              # Run frontend only
npm run dev:server       # Run backend only
npm run dev:all          # Run both concurrently

# Production
npm run build            # Build frontend
npm run start            # Start production frontend
npm run server           # Start production backend

# Utilities
npm run lint             # Run ESLint
```

## 📈 Future Enhancements

- [ ] Real-time WebSocket updates for sensor data
- [ ] Mobile app (React Native)
- [ ] Advanced analytics and reporting
- [ ] SMS/Email notifications
- [ ] Payment gateway integration
- [ ] Multi-language support
- [ ] Blockchain for supply chain tracking
- [ ] AI-based price predictions

## 🤝 Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

MIT License - see LICENSE file for details

## 👥 Support

For support, email support@coldchain.com or create an issue in the repository.

## 🙏 Acknowledgments

- Farmers for their invaluable feedback
- Open source community for amazing tools
- Contributors and testers

---

**Built with ❤️ for sustainable agriculture and reduced food waste**
# stayfresh
