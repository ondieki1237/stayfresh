#!/bin/bash

# Stay Fresh Email System Test Script

echo "🧪 Stay Fresh Email System - Test Suite"
echo "========================================"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
API_URL="http://localhost:5000/api"
TEST_EMAIL="test@example.com"

echo -e "${BLUE}Testing backend server...${NC}"
if curl -s "$API_URL/health" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Server is running${NC}"
else
    echo -e "${RED}❌ Server is not running${NC}"
    echo -e "${YELLOW}Please start the server first:${NC}"
    echo "  cd server && npm start"
    exit 1
fi

echo ""
echo -e "${BLUE}1. Testing Farmer Registration (Welcome Email)${NC}"
echo "-------------------------------------------"

REGISTER_RESPONSE=$(curl -s -X POST "$API_URL/farmers/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "'"$TEST_EMAIL"'",
    "password": "TestPassword123!",
    "firstName": "Test",
    "lastName": "Farmer",
    "phone": "+1234567890",
    "location": "California"
  }')

if echo "$REGISTER_RESPONSE" | grep -q "token"; then
    echo -e "${GREEN}✅ Registration successful${NC}"
    echo "📧 Welcome email should be sent to: $TEST_EMAIL"
    
    # Extract token
    TOKEN=$(echo "$REGISTER_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
    FARMER_ID=$(echo "$REGISTER_RESPONSE" | grep -o '"_id":"[^"]*' | cut -d'"' -f4)
    
    echo "Token: ${TOKEN:0:20}..."
    echo "Farmer ID: $FARMER_ID"
else
    echo -e "${YELLOW}⚠️  Registration response:${NC}"
    echo "$REGISTER_RESPONSE"
fi

echo ""
echo -e "${BLUE}2. Email System Logs${NC}"
echo "-------------------------------------------"
echo "Check server console for email logs:"
echo "  ✅ Email service is ready"
echo "  📧 Email sent: <message-id>"
echo ""

echo -e "${BLUE}3. Manual Testing Steps${NC}"
echo "-------------------------------------------"
echo "To test other email types, you need to:"
echo ""
echo -e "${YELLOW}A. Produce Sold Email:${NC}"
echo "   1. Create a room (POST /api/rooms)"
echo "   2. Add produce (POST /api/produce)"
echo "   3. Mark as sold (POST /api/produce/:id/sell)"
echo ""
echo -e "${YELLOW}B. Sensor Alert Email:${NC}"
echo "   1. Create a sensor for a room (POST /api/sensors)"
echo "   2. Send abnormal reading (POST /api/sensors/:id/reading)"
echo "      Example: {\"temperature\": 8.5, \"humidity\": 92}"
echo ""
echo -e "${YELLOW}C. Billing Reminder Email:${NC}"
echo "   1. Create a billing record (POST /api/billing)"
echo "   2. Send reminder (POST /api/billing/:id/remind)"
echo ""

echo -e "${BLUE}4. Email Configuration${NC}"
echo "-------------------------------------------"
echo "Check your server/.env file:"
echo "  EMAIL_USER=bellarinseth@gmail.com"
echo "  EMAIL_PASS=kept qqvc demi yfxc"
echo "  EMAIL_FROM=Stay Fresh System <bellarinseth@gmail.com>"
echo ""

echo -e "${BLUE}5. Where to Check Emails${NC}"
echo "-------------------------------------------"
echo "Emails are sent to: $TEST_EMAIL"
echo "For testing, you can:"
echo "  • Use your own email address"
echo "  • Check spam folder"
echo "  • Wait 1-2 minutes for delivery"
echo "  • Check server logs for 📧 confirmation"
echo ""

echo -e "${GREEN}========================================"
echo "Test Complete! 🎉"
echo "========================================${NC}"
echo ""
echo "For detailed documentation, see:"
echo "  📄 server/EMAIL_SYSTEM.md"
echo ""
