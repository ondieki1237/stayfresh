# USSD System for Stay Fresh Chamas

## Overview
The USSD (Unstructured Supplementary Service Data) system provides feature phone access to Stay Fresh services for Chama members who may not have smartphones or internet connectivity.

## USSD Code
# USSD Integration Documentation

## Overview

The Stay Fresh USSD service allows chama members to access their cold storage information using basic feature phones. Members can dial a USSD code to check room status, market schedules, produce information, and more.

## USSD Code

**Main Service Code:** `*384*31306#`

## Features

### 1. Room Status
- Real-time temperature monitoring
- Humidity levels
- Power status (ON/OFF)
- Room capacity and occupancy
- Overall room condition

### 2. Market Schedule
- View upcoming market days
- Check market hours
- See power management schedule
- Know when room will be off

### 3. Produce Information
- Total produce quantity stored
- List of produce items
- Current prices
- Produce status

### 4. Billing
- View total monthly bill
- See cost per member
- Energy consumption details
- Payment status
- Monthly fee information

### 5. Request Release
- Submit produce release requests
- Specify quantity needed
- Automatic admin notification
- Confirmation message

### 6. Members
- View list of chama members
- See contact information
- Check total active members

### 7. Power Savings
- Track electricity savings
- Calculate money saved
- View environmental impact (CO2 reduction)
- Monthly statistics

## Menu Flow

```
## Example Flow

1. User dials `*384*31306#`
2. System checks if phone number is registered in any chama
3. If found, shows main menu with 7 options
4. User selects option (e.g., "1" for Room Status)
```

## API Integration

### Africa's Talking Integration

#### Endpoint
```
POST https://yourdomain.com/api/ussd
```

#### Request Format
```json
```json
{
  "sessionId": "ATUid_session_id",
  "serviceCode": "*384*31306#",
  "phoneNumber": "+254712345678",
  "text": ""
}
```

#### Response Format
- **Continue Session:** `CON Your message here`
- **End Session:** `END Your final message`

### Setup Instructions

1. **Register with Africa's Talking**
   - Sign up at https://africastalking.com
   - Get USSD short code
   - Configure callback URL

2. **Configure Environment Variables**
   ```bash
   # Add to .env
   USSD_SERVICE_CODE=*384*31306#
   USSD_CALLBACK_URL=https://yourdomain.com/api/ussd
   AFRICASTALKING_USERNAME=your_username
   AFRICASTALKING_API_KEY=your_api_key
   ```

3. **Set Callback URL**
   - Go to Africa's Talking dashboard
   - Navigate to USSD → Channels
   - Set callback URL: `https://yourdomain.com/api/ussd`

## Testing

### 1. Test Endpoint
```bash
curl -X POST https://www.kisumu.codewithseth.co.ke/api/ussd/test \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+254712345678",
    "text": "1"
  }'
```

### 2. Simulation Endpoint
```bash
# Main menu
curl https://www.kisumu.codewithseth.co.ke/api/ussd/simulate/+254712345678

# Room status
curl https://www.kisumu.codewithseth.co.ke/api/ussd/simulate/+254712345678?text=1

# Market schedule
curl https://www.kisumu.codewithseth.co.ke/api/ussd/simulate/+254712345678?text=2

# Request release (enter quantity)
curl https://www.kisumu.codewithseth.co.ke/api/ussd/simulate/+254712345678?text=5*50
```

### 3. Documentation
```bash
curl https://www.kisumu.codewithseth.co.ke/api/ussd/docs
```

## Phone Number Registration

Chama members must be registered in the database with their phone numbers:

```javascript
// Member phone format in Chama model
{
  "members": [
    {
      "name": "Jane Doe",
      "phone": "+254712345678", // or "0712345678"
      "isActive": true
    }
  ]
}
```

## Phone Number Matching

The system normalizes phone numbers to handle various formats:
- `+254712345678`
- `0712345678`
- `254712345678`
- `(071) 234-5678`

## Response Messages

### Success Messages
- ✅ Clear and concise information
- 📊 Visual indicators (emojis for better UX)
- 💰 Monetary values formatted with KSH
- 📅 Dates in readable format

### Error Messages
- ❌ "You are not registered in any Chama"
- ❌ "No room assigned to your Chama yet"
- ❌ "Invalid option. Please try again"
- ❌ "Service error. Please try again later"

## Monitoring & Analytics

### Track USSD Usage
```javascript
// Statistics endpoint
GET /api/ussd/stats

Response:
{
  "totalSessions": 1250,
  "activeSessions": 12,
  "popularMenus": {
    "roomStatus": 450,
    "marketSchedule": 320,
    "produceInfo": 280,
    "billing": 150,
    "releaseRequest": 50
  }
}
```

## Best Practices

### 1. Message Length
- Keep messages under 160 characters when possible
- Use abbreviations for better display
- Break long content into pages

### 2. Session Management
- Sessions timeout after inactivity (usually 30-60s)
- Always provide clear navigation
- Allow users to return to main menu

### 3. Error Handling
- Validate user input
- Provide helpful error messages
- Log errors for debugging

### 4. Performance
- Cache frequently accessed data
- Use database indexing on phone numbers
- Minimize API calls

## Security Considerations

1. **Phone Verification**
   - Verify caller is registered member
   - Match phone number with chama records

2. **Rate Limiting**
   - Prevent abuse with rate limits
   - Max 10 requests per minute per phone

3. **Data Privacy**
   - Don't display sensitive information
   - Log minimal PII
   - Comply with data protection laws

4. **Authentication**
   - Africa's Talking validates requests
   - Check request origin
   - Use HTTPS for callbacks

## Troubleshooting

### Issue: "Not registered in any Chama"
**Solution:** Ensure phone number is added to chama members array

### Issue: USSD not responding
**Solution:** 
- Check callback URL is publicly accessible
- Verify Africa's Talking configuration
- Check server logs for errors

### Issue: Wrong information displayed
**Solution:**
- Verify chama has assigned room
- Check database relationships (populate)
- Ensure data is up to date

## Future Enhancements

1. **Multi-language Support**
   - Swahili translations
   - Language selection menu

2. **Payment Integration**
   - M-Pesa integration for bills
   - Payment confirmations via USSD

3. **Notifications**
   - Power status changes
   - Billing reminders
   - Market day alerts

4. **Advanced Features**
   - Historical data views
   - Produce market price comparisons
   - Booking time slots

## Support

For technical support:
- Email: tech@stayfresh.com
- Phone: +254700000000
- Documentation: https://docs.stayfresh.com/ussd

## License

Copyright © 2025 Stay Fresh. All rights reserved.
