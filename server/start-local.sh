#!/bin/bash

# Quick fix script for MongoDB connection issues
# This script starts the server with local MongoDB

echo "🔧 Starting Stay Fresh server with LOCAL MongoDB..."
echo "================================================"
echo ""
echo "📍 MongoDB: localhost:27017"
echo "🌐 Server: localhost:5000"
echo "💻 Frontend: localhost:3000"
echo ""
echo "================================================"
echo ""

# Use .env.local which has local MongoDB URI
if [ -f .env.local ]; then
    echo "✅ Using .env.local configuration"
    node -r dotenv/config index.js dotenv_config_path=.env.local
else
    echo "❌ .env.local not found, using environment variable"
    export MONGODB_URI=mongodb://localhost:27017/coldchain
    npm run dev
fi
