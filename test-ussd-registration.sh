#!/bin/bash

# USSD Registration Testing Script
# Tests the complete registration flow for non-members

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
API_URL="${API_URL:-http://localhost:5000}"
PHONE="+254712999888"

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}   USSD Self-Registration Testing${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""
echo -e "${YELLOW}Testing API:${NC} $API_URL"
echo -e "${YELLOW}Test Phone:${NC} $PHONE"
echo ""

# Test 1: Initial Menu (Non-Member)
echo -e "${GREEN}Test 1: Show Registration Menu${NC}"
echo -e "${YELLOW}Simulating: User dials *384*31306#${NC}"
curl -s -X POST "$API_URL/api/ussd/test" \
  -H "Content-Type: application/json" \
  -d "{\"phoneNumber\": \"$PHONE\", \"text\": \"\"}" | jq -r '.response'
echo ""
echo "---"
echo ""

# Test 2: Select Register New Chama
echo -e "${GREEN}Test 2: Select 'Register New Chama'${NC}"
echo -e "${YELLOW}User presses: 1${NC}"
curl -s -X POST "$API_URL/api/ussd/test" \
  -H "Content-Type: application/json" \
  -d "{\"phoneNumber\": \"$PHONE\", \"text\": \"1\"}" | jq -r '.response'
echo ""
echo "---"
echo ""

# Test 3: Enter Chama Name
echo -e "${GREEN}Test 3: Enter Chama Name${NC}"
echo -e "${YELLOW}User enters: Test Farmers Chama${NC}"
curl -s -X POST "$API_URL/api/ussd/test" \
  -H "Content-Type: application/json" \
  -d "{\"phoneNumber\": \"$PHONE\", \"text\": \"1*Test Farmers Chama\"}" | jq -r '.response'
echo ""
echo "---"
echo ""

# Test 4: Enter Location
echo -e "${GREEN}Test 4: Enter Location${NC}"
echo -e "${YELLOW}User enters: Kisumu Central${NC}"
curl -s -X POST "$API_URL/api/ussd/test" \
  -H "Content-Type: application/json" \
  -d "{\"phoneNumber\": \"$PHONE\", \"text\": \"1*Test Farmers Chama*Kisumu Central\"}" | jq -r '.response'
echo ""
echo "---"
echo ""

# Test 5: Enter Leader Name
echo -e "${GREEN}Test 5: Enter Leader Name${NC}"
echo -e "${YELLOW}User enters: John Omondi${NC}"
curl -s -X POST "$API_URL/api/ussd/test" \
  -H "Content-Type: application/json" \
  -d "{\"phoneNumber\": \"$PHONE\", \"text\": \"1*Test Farmers Chama*Kisumu Central*John Omondi\"}" | jq -r '.response'
echo ""
echo "---"
echo ""

# Test 6: Enter Member Count
echo -e "${GREEN}Test 6: Enter Member Count${NC}"
echo -e "${YELLOW}User enters: 15${NC}"
curl -s -X POST "$API_URL/api/ussd/test" \
  -H "Content-Type: application/json" \
  -d "{\"phoneNumber\": \"$PHONE\", \"text\": \"1*Test Farmers Chama*Kisumu Central*John Omondi*15\"}" | jq -r '.response'
echo ""
echo "---"
echo ""

# Test 7: Confirm Registration
echo -e "${GREEN}Test 7: Confirm Registration${NC}"
echo -e "${YELLOW}User presses: 1 (Confirm)${NC}"
RESPONSE=$(curl -s -X POST "$API_URL/api/ussd/test" \
  -H "Content-Type: application/json" \
  -d "{\"phoneNumber\": \"$PHONE\", \"text\": \"1*Test Farmers Chama*Kisumu Central*John Omondi*15*1\"}")

echo "$RESPONSE" | jq -r '.response'
echo ""

# Check if registration was successful
if echo "$RESPONSE" | grep -q "Registered Successfully"; then
  echo -e "${GREEN}✅ Registration Successful!${NC}"
else
  echo -e "${RED}❌ Registration Failed${NC}"
fi

echo ""
echo "---"
echo ""

# Test 8: Join Existing Chama
echo -e "${GREEN}Test 8: Join Existing Chama${NC}"
echo -e "${YELLOW}User selects: 2 (Join Existing)${NC}"
curl -s -X POST "$API_URL/api/ussd/test" \
  -H "Content-Type: application/json" \
  -d "{\"phoneNumber\": \"+254712888999\", \"text\": \"2\"}" | jq -r '.response'
echo ""
echo "---"
echo ""

# Test 9: Contact Support
echo -e "${GREEN}Test 9: Contact Support${NC}"
echo -e "${YELLOW}User selects: 3 (Contact Support)${NC}"
curl -s -X POST "$API_URL/api/ussd/test" \
  -H "Content-Type: application/json" \
  -d "{\"phoneNumber\": \"+254712777888\", \"text\": \"3\"}" | jq -r '.response'
echo ""
echo "---"
echo ""

# Test 10: Validation - Short Name
echo -e "${GREEN}Test 10: Validation - Name Too Short${NC}"
echo -e "${YELLOW}User enters: AB (only 2 chars)${NC}"
curl -s -X POST "$API_URL/api/ussd/test" \
  -H "Content-Type: application/json" \
  -d "{\"phoneNumber\": \"+254712666777\", \"text\": \"1*AB\"}" | jq -r '.response'
echo ""
echo "---"
echo ""

# Test 11: Validation - Invalid Member Count
echo -e "${GREEN}Test 11: Validation - Invalid Member Count${NC}"
echo -e "${YELLOW}User enters: 1 (below minimum of 2)${NC}"
curl -s -X POST "$API_URL/api/ussd/test" \
  -H "Content-Type: application/json" \
  -d "{\"phoneNumber\": \"+254712555666\", \"text\": \"1*Valid Chama*Valid Location*Valid Leader*1\"}" | jq -r '.response'
echo ""
echo "---"
echo ""

# Test 12: Existing Member Access
echo -e "${GREEN}Test 12: Existing Member Access${NC}"
echo -e "${YELLOW}Simulating: Registered member dials code${NC}"
echo -e "${YELLOW}Note: This will fail if no existing members in DB${NC}"
curl -s -X POST "$API_URL/api/ussd/test" \
  -H "Content-Type: application/json" \
  -d "{\"phoneNumber\": \"+254712345678\", \"text\": \"\"}" | jq -r '.response'
echo ""

echo ""
echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}   Testing Complete${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Check MongoDB for new chama with status='pending'"
echo "2. Test admin approval workflow"
echo "3. Verify SMS notifications (if implemented)"
echo "4. Test on production with: API_URL=https://www.kisumu.codewithseth.co.ke ./test-ussd-registration.sh"
echo ""
