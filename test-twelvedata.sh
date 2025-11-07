#!/bin/bash

# TwelveData API Test Script
# Tests the market insights endpoints

echo "🧪 Testing TwelveData Market Insights Integration"
echo "=================================================="
echo ""

# Check if server is running
SERVER_URL="http://localhost:5000"
echo "📡 Checking server status..."

# You'll need to replace YOUR_JWT_TOKEN with an actual token
# Get a token by logging in first
TOKEN="YOUR_JWT_TOKEN"

echo ""
echo "⚠️  NOTE: Replace YOUR_JWT_TOKEN in this script with a real JWT token"
echo "   You can get one by:"
echo "   1. POST to /api/farmers/login with your credentials"
echo "   2. Copy the token from the response"
echo ""

# Test 1: API Status
echo "1️⃣  Testing API Status..."
curl -s -X GET "${SERVER_URL}/api/market-insights/api-status" \
  -H "Authorization: Bearer ${TOKEN}" \
  | jq '.' || echo "❌ Failed"
echo ""

# Test 2: Get Quote for Corn
echo "2️⃣  Testing Real-Time Quote (Corn)..."
curl -s -X GET "${SERVER_URL}/api/market-insights/quote/corn" \
  -H "Authorization: Bearer ${TOKEN}" \
  | jq '.' || echo "❌ Failed"
echo ""

# Test 3: Get Market Movers
echo "3️⃣  Testing Market Movers..."
curl -s -X GET "${SERVER_URL}/api/market-insights/movers" \
  -H "Authorization: Bearer ${TOKEN}" \
  | jq '.' || echo "❌ Failed"
echo ""

# Test 4: Get Time Series
echo "4️⃣  Testing Time Series (Wheat, 7 days)..."
curl -s -X GET "${SERVER_URL}/api/market-insights/timeseries/wheat?interval=1day&days=7" \
  -H "Authorization: Bearer ${TOKEN}" \
  | jq '.' || echo "❌ Failed"
echo ""

# Test 5: Enhanced Analysis
echo "5️⃣  Testing Enhanced Market Analysis (Rice)..."
curl -s -X GET "${SERVER_URL}/api/market-insights/analysis/rice" \
  -H "Authorization: Bearer ${TOKEN}" \
  | jq '.' || echo "❌ Failed"
echo ""

# Test 6: Bulk Quotes
echo "6️⃣  Testing Bulk Quotes (Corn, Wheat, Rice)..."
curl -s -X GET "${SERVER_URL}/api/market-insights/bulk?produces=corn,wheat,rice" \
  -H "Authorization: Bearer ${TOKEN}" \
  | jq '.' || echo "❌ Failed"
echo ""

# Test 7: Technical Indicators
echo "7️⃣  Testing Technical Indicators (RSI for Coffee)..."
curl -s -X GET "${SERVER_URL}/api/market-insights/technical/coffee?indicator=rsi" \
  -H "Authorization: Bearer ${TOKEN}" \
  | jq '.' || echo "❌ Failed"
echo ""

echo "=================================================="
echo "✅ Testing complete!"
echo ""
echo "💡 Tips:"
echo "   - Make sure server is running: npm run dev"
echo "   - Update TOKEN variable with real JWT token"
echo "   - Install jq for pretty JSON output: sudo apt install jq"
echo ""
