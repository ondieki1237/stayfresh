# 🚀 Stay Fresh Setup Guide

Complete step-by-step guide to set up and run the Stay Fresh Management System.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **MongoDB** - Choose one:
  - Local: [Download MongoDB Community](https://www.mongodb.com/try/download/community)
  - Cloud: [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (Free tier available)
- **Git** - [Download](https://git-scm.com/)
- **Code Editor** - VS Code recommended

## 🛠️ Installation Steps

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd coldroom
```

### Step 2: Install Dependencies

Install both frontend and backend dependencies:

```bash
# Install root dependencies (frontend)
npm install

# Install server dependencies (backend)
cd server
npm install
cd ..
```

### Step 3: Setup MongoDB

#### Option A: Local MongoDB

1. Install MongoDB Community Edition
2. Start MongoDB service:
   ```bash
   # On macOS
   brew services start mongodb-community
   
   # On Linux
   sudo systemctl start mongod
   
   # On Windows
   # MongoDB runs as a service by default
   ```
3. Verify MongoDB is running:
   ```bash
   mongosh
   # Should connect to mongodb://localhost:27017
   ```

#### Option B: MongoDB Atlas (Cloud)

1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster (Free M0 tier)
3. Create a database user
4. Whitelist your IP address (or allow from anywhere for development: 0.0.0.0/0)
5. Get your connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/`)

### Step 4: Configure Environment Variables

#### Frontend Environment (.env.local)

Create `.env.local` in the root directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

#### Backend Environment (server/.env)

Create `server/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/cold-chain
# For Atlas, use: mongodb+srv://username:password@cluster.mongodb.net/cold-chain
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
NODE_ENV=development
```

**Important:** Change the `JWT_SECRET` to a secure random string in production!

### Step 5: Seed the Database (Optional but Recommended)

Populate the database with sample data:

```bash
cd server
npm run seed
cd ..
```

This will create:
- 20 cold storage rooms
- 20 IoT sensors
- Market data for 8 produce types across 5 regions
- 5 training courses

### Step 6: Start the Application

#### Option A: Run Both Frontend and Backend Together (Recommended)

```bash
npm run dev:all
```

This uses `concurrently` to run both servers at once.

#### Option B: Run Separately

**Terminal 1 - Frontend:**
```bash
npm run dev
```

**Terminal 2 - Backend:**
```bash
npm run dev:server
```

### Step 7: Access the Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000/api
- **Health Check:** http://localhost:5000/api/health

## 🎯 First Steps

### Create Your First Farmer Account

1. Open http://localhost:3000
2. Click on "Register" tab
3. Fill in the form:
   - Email: farmer@example.com
   - Password: password123
   - First Name: John
   - Last Name: Doe
   - Phone: +1234567890
   - Location: New York
4. Click "Register"
5. You'll be redirected to the dashboard

### Rent Your First Room

1. In the dashboard, go to "My Rooms" tab
2. You'll see available rooms (if you ran the seed script)
3. Or create rooms via admin panel

### Add Produce

1. After renting a room, go to "My Produce" tab
2. Click "Add Produce"
3. Fill in produce details
4. System will start tracking storage duration and conditions

## 🔧 Troubleshooting

### MongoDB Connection Issues

**Error: `connect ECONNREFUSED 127.0.0.1:27017`**

- MongoDB is not running
- Start MongoDB: `brew services start mongodb-community` (macOS)
- Or check MongoDB service status

**Error: `Authentication failed`**

- Check MongoDB Atlas credentials in `MONGODB_URI`
- Ensure IP address is whitelisted
- Verify database user permissions

### Port Already in Use

**Error: `Port 3000/5000 is already in use`**

Find and kill the process:
```bash
# macOS/Linux
lsof -ti:3000 | xargs kill -9
lsof -ti:5000 | xargs kill -9

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

Or change ports in:
- Frontend: Next.js automatically uses next available port
- Backend: Change `PORT` in `server/.env`

### Module Not Found

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

cd server
rm -rf node_modules package-lock.json
npm install
```

### Tailwind CSS Not Working

```bash
# Rebuild Tailwind CSS
npm run build
```

## 📚 API Testing

Test the API using curl or Postman:

### Health Check
```bash
curl http://localhost:5000/api/health
```

### Register a Farmer
```bash
curl -X POST http://localhost:5000/api/farmers/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User",
    "phone": "+1234567890",
    "location": "Test City"
  }'
```

### Get Available Rooms
```bash
curl http://localhost:5000/api/rooms/available
```

### Get Market Data
```bash
curl http://localhost:5000/api/market/produce/tomato
```

## 🎨 Customization

### Change Theme Colors

Edit `app/globals.css` to customize the green color scheme:

```css
--primary: oklch(0.65 0.22 145); /* Change the hue (145) for different colors */
```

### Add New Produce Types

Edit the seed file or add through admin panel.

### Modify Room Capacity

Edit `server/models/Room.js` to change default values.

## 📊 Database Management

### View Database

Using MongoDB Compass (GUI):
1. Download [MongoDB Compass](https://www.mongodb.com/products/compass)
2. Connect to `mongodb://localhost:27017`
3. Browse the `cold-chain` database

Using mongosh (CLI):
```bash
mongosh
use cold-chain
db.farmers.find()
db.rooms.find()
```

### Reset Database

```bash
# Drop the database
mongosh cold-chain --eval "db.dropDatabase()"

# Re-seed
cd server
npm run seed
```

## 🚀 Production Deployment

### Environment Variables for Production

Update these in your hosting platform:

```env
# Frontend (.env.production)
NEXT_PUBLIC_API_URL=https://your-api-domain.com/api

# Backend
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/cold-chain
JWT_SECRET=very_secure_random_string_at_least_32_characters
NODE_ENV=production
```

### Build for Production

```bash
# Build frontend
npm run build

# Start production server
npm start

# Backend (in server directory)
npm start
```

### Hosting Recommendations

**Frontend:**
- Vercel (recommended for Next.js)
- Netlify
- AWS Amplify

**Backend:**
- Railway
- Render
- Heroku
- DigitalOcean App Platform
- AWS EC2/ECS

**Database:**
- MongoDB Atlas (managed, recommended)
- Self-hosted MongoDB on VPS

## 📖 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Express.js Guide](https://expressjs.com/)
- [MongoDB Manual](https://docs.mongodb.com/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

## 🆘 Getting Help

If you encounter issues:

1. Check the console for error messages
2. Verify all environment variables are set correctly
3. Ensure MongoDB is running
4. Check that ports 3000 and 5000 are available
5. Review the API endpoints in the README
6. Check server logs for backend errors

## 📝 Development Tips

### Hot Reload

Both frontend and backend support hot reload:
- Frontend: Automatically reloads on file changes
- Backend: Uses nodemon for automatic restart

### Database Queries

Use MongoDB Compass to test queries visually before implementing them in code.

### API Testing

Use Postman or Thunder Client VS Code extension for testing API endpoints.

### Code Formatting

```bash
npm run lint
```

## ✅ Checklist

Before considering setup complete:

- [ ] MongoDB is running and accessible
- [ ] Frontend runs on http://localhost:3000
- [ ] Backend runs on http://localhost:5000
- [ ] Can register a new farmer
- [ ] Can login successfully
- [ ] Dashboard loads without errors
- [ ] Can view available rooms
- [ ] Market data displays correctly

---

**Happy Farming! 🌱❄️**
