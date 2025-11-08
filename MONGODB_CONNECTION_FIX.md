# MongoDB Connection Issues - Solutions

## Problem
Your server is getting `ETIMEDOUT` errors when connecting to MongoDB Atlas:
```
MongoNetworkError: connect ETIMEDOUT 159.41.79.31:27017
```

## Root Causes

### 1. MongoDB Atlas Network Issues
- Remote server unreachable
- Firewall blocking connections
- IP address not whitelisted in Atlas

### 2. Connection String Issues
- Using Atlas in development (slower)
- Network latency
- Intermittent connectivity

## Solutions

### ✅ Solution 1: Use Local MongoDB (Recommended for Development)

You have MongoDB running locally (PID: 1099). Use it for development:

**Step 1: Update `.env` file**
```bash
# Backup current .env
cp server/.env server/.env.backup

# Update MongoDB URI
# Replace the Atlas URI with local MongoDB
```

**Step 2: Create `.env.local` for local development**
```properties
PORT=5000
MONGODB_URI=mongodb://localhost:27017/coldchain
JWT_SECRET=coldchain_secret_key_2024_production
NODE_ENV=development

# Email Configuration
EMAIL_USER=bellarinseth@gmail.com
EMAIL_PASS=kept qqvc demi yfxc
EMAIL_FROM=Stay Fresh System <bellarinseth@gmail.com>

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

**Step 3: Use `.env.local` in development**
```bash
# Add to .gitignore
echo "server/.env.local" >> .gitignore

# Update package.json dev script to use .env.local
```

### ✅ Solution 2: Fix MongoDB Atlas Connection

If you want to continue using Atlas:

**Step 1: Whitelist Your IP Address**
1. Go to MongoDB Atlas Dashboard
2. Navigate to Network Access
3. Click "Add IP Address"
4. Choose "Add Current IP Address" or "Allow Access from Anywhere" (0.0.0.0/0)

**Step 2: Verify Connection String**
Your current string:
```
mongodb+srv://bellarinseth_db_user:5h6VvqUTNxxjGcDU@cluster0.osrkr5q.mongodb.net/coldchain
```

Check:
- Username is correct: `bellarinseth_db_user`
- Password is correct: `5h6VvqUTNxxjGcDU`
- Cluster URL is correct: `cluster0.osrkr5q.mongodb.net`

**Step 3: Test Connection**
```bash
mongosh "mongodb+srv://bellarinseth_db_user:5h6VvqUTNxxjGcDU@cluster0.osrkr5q.mongodb.net/coldchain"
```

### ✅ Solution 3: Hybrid Approach (Best of Both)

Use local for development, Atlas for production:

**Create `server/.env.development`:**
```properties
PORT=5000
MONGODB_URI=mongodb://localhost:27017/coldchain
JWT_SECRET=coldchain_secret_key_2024_development
NODE_ENV=development
EMAIL_USER=bellarinseth@gmail.com
EMAIL_PASS=kept qqvc demi yfxc
EMAIL_FROM=Stay Fresh System <bellarinseth@gmail.com>
FRONTEND_URL=http://localhost:3000
```

**Keep `server/.env` for production:**
```properties
PORT=5000
MONGODB_URI=mongodb+srv://bellarinseth_db_user:5h6VvqUTNxxjGcDU@cluster0.osrkr5q.mongodb.net/coldchain
JWT_SECRET=coldchain_secret_key_2024_production
NODE_ENV=production
EMAIL_USER=bellarinseth@gmail.com
EMAIL_PASS=kept qqvc demi yfxc
EMAIL_FROM=Stay Fresh System <bellarinseth@gmail.com>
FRONTEND_URL=https://stayfresh.co.ke
```

**Update `server/package.json`:**
```json
{
  "scripts": {
    "dev": "NODE_ENV=development node -r dotenv/config index.js dotenv_config_path=.env.development",
    "start": "NODE_ENV=production node -r dotenv/config index.js dotenv_config_path=.env"
  }
}
```

## Quick Fix (Immediate)

Run this command to use local MongoDB right now:

```bash
cd server
MONGODB_URI=mongodb://localhost:27017/coldchain npm run dev
```

Or create a quick start script:

```bash
# Create start-local.sh
cat > server/start-local.sh << 'EOF'
#!/bin/bash
export MONGODB_URI=mongodb://localhost:27017/coldchain
npm run dev
EOF

chmod +x server/start-local.sh

# Run it
./server/start-local.sh
```

## Verify Local MongoDB

Check if local MongoDB is accessible:

```bash
# Test connection
mongosh mongodb://localhost:27017/coldchain

# Check databases
mongosh --eval "show dbs"

# Check if coldchain database exists
mongosh coldchain --eval "db.stats()"
```

## Migrate Data from Atlas to Local (Optional)

If you have important data in Atlas:

```bash
# Export from Atlas
mongodump --uri="mongodb+srv://bellarinseth_db_user:5h6VvqUTNxxjGcDU@cluster0.osrkr5q.mongodb.net/coldchain" --out=./backup

# Import to local
mongorestore --db=coldchain ./backup/coldchain/
```

## Network Diagnostics

Test Atlas connectivity:

```bash
# Ping the server
ping 159.41.79.31

# Test MongoDB port
nc -zv 159.41.79.31 27017

# DNS lookup
nslookup cluster0.osrkr5q.mongodb.net

# Traceroute
traceroute cluster0.osrkr5q.mongodb.net
```

## Error Handling in Code

Add better error handling in `server/index.js`:

```javascript
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
  socketTimeoutMS: 45000,
})
.then(() => {
  console.log('✅ MongoDB connected successfully')
  console.log(`📍 Connected to: ${process.env.MONGODB_URI.includes('localhost') ? 'Local MongoDB' : 'MongoDB Atlas'}`)
})
.catch((err) => {
  console.error('❌ MongoDB connection error:', err.message)
  console.error('💡 Suggestion: Check if MongoDB is running or try local connection')
  console.error('   Run: MONGODB_URI=mongodb://localhost:27017/coldchain npm run dev')
  process.exit(1) // Exit if can't connect
})
```

## Recommended Solution

For your use case (development + occasional Atlas sync):

1. **Use local MongoDB for development** ✅
2. **Keep Atlas for production** ✅
3. **Sync data when needed** ✅

This gives you:
- ⚡ Faster development
- 💰 No Atlas data transfer costs
- 🔒 Work offline
- 🚀 Better performance

---

**Next Step:** Choose a solution and I'll help you implement it!
