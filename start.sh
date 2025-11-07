#!/bin/bash

# Cold Chain Quick Start Script
# This script helps you get started quickly

echo "🥶❄️ Cold Chain Management System - Quick Start"
echo "=============================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✅ Node.js $(node --version) found"

# Check if MongoDB is running
if ! mongosh --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
    echo "⚠️  MongoDB is not running or not installed"
    echo "   Please start MongoDB or update MONGODB_URI in server/.env"
    echo ""
else
    echo "✅ MongoDB is running"
fi

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo ""
    echo "📦 Installing frontend dependencies..."
    npm install
fi

if [ ! -d "server/node_modules" ]; then
    echo ""
    echo "📦 Installing backend dependencies..."
    cd server && npm install && cd ..
fi

# Check for environment files
if [ ! -f ".env.local" ]; then
    echo ""
    echo "📝 Creating .env.local..."
    echo "NEXT_PUBLIC_API_URL=http://localhost:5000/api" > .env.local
    echo "✅ Created .env.local"
fi

if [ ! -f "server/.env" ]; then
    echo ""
    echo "📝 Creating server/.env..."
    cat > server/.env << EOF
PORT=5000
MONGODB_URI=mongodb://localhost:27017/cold-chain
JWT_SECRET=$(openssl rand -base64 32)
NODE_ENV=development
EOF
    echo "✅ Created server/.env with random JWT secret"
fi

# Ask about seeding database
echo ""
read -p "🌱 Would you like to seed the database with sample data? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🌱 Seeding database..."
    cd server && npm run seed && cd ..
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "🚀 Starting the application..."
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:5000/api"
echo ""
echo "Press Ctrl+C to stop the servers"
echo ""

# Start both servers
npm run dev:all
