# USSD Self-Registration Feature

## 📱 Overview

The USSD system now allows non-members to register new chamas and join existing ones directly from their feature phones without admin intervention. This dramatically improves accessibility for rural farmers.

## 🎯 Key Features

### 1. **Self-Service Chama Registration**
- Create new chama via USSD
- No smartphone required
- No admin bottleneck
- Immediate registration confirmation

### 2. **Join Existing Chamas**
- Browse active chamas
- Submit join requests
- Admin notification for approval

### 3. **Enhanced Accessibility**
- Works on any feature phone
- No internet required
- Simple step-by-step flow
- Clear confirmations

## 📋 User Flows

### Flow 1: New User Registration

```
User dials: *384*31306#
↓
System: "Welcome to Stay Fresh Cold Storage
         You are not registered yet.
         
         1. Register New Chama
         2. Join Existing Chama
         3. Contact Support
         0. Exit"
↓
User: 1
↓
System: "Enter your Chama name:"
↓
User: Kisumu Farmers Chama
↓
System: "Enter Chama location/area:"
↓
User: Kisumu Central
↓
System: "Enter leader/chairperson name:"
↓
User: John Omondi
↓
System: "How many members? (2-100):"
↓
User: 15
↓
System: "Confirm Chama Registration:
         
         Name: Kisumu Farmers Chama
         Location: Kisumu Central
         Leader: John Omondi
         Members: 15
         
         1. Confirm & Register
         2. Cancel"
↓
User: 1
↓
System: "✅ Chama Registered Successfully!
         
         Name: Kisumu Farmers Chama
         ID: 64f8a2b3c1d4e5f6a7b8c9d0
         
         📧 You'll receive confirmation via SMS.
         Our team will contact you within 24 hours
         to complete setup.
         
         Thank you for choosing Stay Fresh!"
```

### Flow 2: Join Existing Chama

```
User dials: *384*31306#
↓
System: "Welcome to Stay Fresh Cold Storage
         You are not registered yet.
         
         1. Register New Chama
         2. Join Existing Chama
         3. Contact Support
         0. Exit"
↓
User: 2
↓
System: "Select Chama to Join:
         
         1. Kisumu Farmers Chama
            📍 Kisumu Central
            👥 15 members
         
         2. Lake Basin Produce
            📍 Kisumu West
            👥 22 members
         
         0. Back"
↓
User: 1
↓
System: "Join Request Submitted
         
         Chama: Kisumu Farmers Chama
         
         The Chama admin will be notified.
         You'll receive SMS confirmation
         within 24 hours.
         
         For urgent requests, contact:
         📞 +254 700 123 456"
```

### Flow 3: Existing Member Access

```
User dials: *384*31306#
↓
System: "Welcome to Stay Fresh - Kisumu Farmers Chama
         
         1. Room Status
         2. Market Schedule
         3. Produce Info
         4. Billing
         5. Request Release
         6. Members
         7. Power Savings"
↓
[Normal member menu continues...]
```

## 🔧 Technical Implementation

### Session Management

Registration sessions are stored in memory (Map):
```javascript
registrationSessions.set(phoneNumber, {
  step: 'name',
  data: { phone: phoneNumber }
})
```

**Steps:**
1. `name` - Collect chama name
2. `location` - Collect location
3. `leader` - Collect leader name
4. `members` - Collect member count
5. `confirm` - Confirm and register

**Session Timeout:** Automatic cleanup needed (TODO: implement timeout)

### Database Schema Updates

**Chama Model Enhancements:**
```javascript
{
  members: [{
    name: String,
    phone: String,
    role: { 
      type: String, 
      enum: ["Chairperson", "Secretary", "Treasurer", "Member"],
      default: "Member"
    },
    // ... existing fields
  }],
  memberCount: Number,
  status: { 
    type: String, 
    enum: ["pending", "active", "inactive", "suspended"],
    default: "active"
  },
  registrationMethod: {
    type: String,
    enum: ["Admin", "Web", "USSD", "Mobile"],
    default: "Admin"
  }
}
```

### Registration Logic

```javascript
async registerChama(data) {
  const chama = new Chama({
    name: data.name,
    location: data.location,
    phone: data.phone,
    members: [
      {
        name: data.leaderName,
        phone: data.phone,
        role: 'Chairperson',
        isActive: true,
        joinedDate: new Date()
      }
    ],
    memberCount: data.memberCount,
    registrationDate: new Date(),
    isActive: true,
    status: 'pending', // Requires admin approval
    registrationMethod: 'USSD'
  });
  
  await chama.save();
  return chama;
}
```

## 🧪 Testing

### Using Test Endpoint

```bash
# Test registration menu
curl -X POST http://localhost:5000/api/ussd/test \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+254712999888",
    "text": ""
  }'

# Test registration selection
curl -X POST http://localhost:5000/api/ussd/test \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+254712999888",
    "text": "1"
  }'

# Test entering chama name
curl -X POST http://localhost:5000/api/ussd/test \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+254712999888",
    "text": "1*Kisumu Farmers"
  }'

# Test entering location
curl -X POST http://localhost:5000/api/ussd/test \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+254712999888",
    "text": "1*Kisumu Farmers*Kisumu Central"
  }'

# Test entering leader name
curl -X POST http://localhost:5000/api/ussd/test \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+254712999888",
    "text": "1*Kisumu Farmers*Kisumu Central*John Omondi"
  }'

# Test entering member count
curl -X POST http://localhost:5000/api/ussd/test \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+254712999888",
    "text": "1*Kisumu Farmers*Kisumu Central*John Omondi*15"
  }'

# Test confirmation
curl -X POST http://localhost:5000/api/ussd/test \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+254712999888",
    "text": "1*Kisumu Farmers*Kisumu Central*John Omondi*15*1"
  }'
```

### Using Simulate Endpoint

```bash
# Open in browser
http://localhost:5000/api/ussd/simulate/+254712999888?text=1

# Full flow
http://localhost:5000/api/ussd/simulate/+254712999888?text=1*Kisumu%20Farmers*Kisumu%20Central*John%20Omondi*15*1
```

## 📊 Validation Rules

| Field | Minimum | Maximum | Validation |
|-------|---------|---------|------------|
| Chama Name | 3 chars | 100 chars | Required, alphanumeric + spaces |
| Location | 3 chars | 100 chars | Required, any text |
| Leader Name | 3 chars | 100 chars | Required, any text |
| Member Count | 2 | 100 | Required, integer only |

## 🔔 Notifications (TODO)

### SMS Confirmation
After successful registration, user receives:
```
✅ Stay Fresh: Your Chama "Kisumu Farmers Chama" 
has been registered successfully! 

ID: 64f8a2b3c1d4e5f6a7b8c9d0

Our team will contact you within 24 hours to 
complete setup and assign your cold room.

Questions? Call +254 700 123 456
```

### Admin Notification
Admin dashboard shows new pending chamas:
```
🆕 New USSD Registration
Chama: Kisumu Farmers Chama
Leader: John Omondi (+254712999888)
Location: Kisumu Central
Members: 15
Date: 2024-01-15 10:30 AM

[Approve] [Contact] [Reject]
```

## 🛠️ Admin Dashboard Integration

### View Pending Registrations

Add to admin dashboard:
```typescript
// components/admin/pending-registrations.tsx
const PendingRegistrations = () => {
  const [chamas, setChamas] = useState([])
  
  useEffect(() => {
    fetch(`${API_BASE}/chamas?status=pending`)
      .then(res => res.json())
      .then(data => setChamas(data))
  }, [])
  
  return (
    <div>
      <h2>Pending USSD Registrations</h2>
      {chamas.map(chama => (
        <div key={chama._id}>
          <h3>{chama.name}</h3>
          <p>Location: {chama.location}</p>
          <p>Leader: {chama.members[0].name}</p>
          <p>Phone: {chama.phone}</p>
          <button onClick={() => approve(chama._id)}>
            Approve
          </button>
          <button onClick={() => contact(chama.phone)}>
            Contact
          </button>
        </div>
      ))}
    </div>
  )
}
```

### Approval Workflow

```javascript
// server/routes/chamas.js
router.patch('/chamas/:id/approve', authMiddleware, async (req, res) => {
  const chama = await Chama.findById(req.params.id)
  
  if (chama.status !== 'pending') {
    return res.status(400).json({ 
      message: 'Chama already processed' 
    })
  }
  
  chama.status = 'active'
  await chama.save()
  
  // TODO: Send SMS confirmation
  // TODO: Assign cold room if available
  
  res.json({ message: 'Chama approved', chama })
})
```

## 🚀 Deployment Steps

### 1. Update Production Database

No schema changes required - new fields have defaults.

### 2. Deploy Code

```bash
ssh user@kisumu.codewithseth.co.ke
cd /path/to/stayfresh/server
git pull origin main
npm install
pm2 restart stayfresh
```

### 3. Test on Production

```bash
# Test registration menu
curl -X POST https://www.kisumu.codewithseth.co.ke/api/ussd/test \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "+254712999888", "text": ""}'
```

### 4. Configure Africa's Talking

- Callback URL: `https://www.kisumu.codewithseth.co.ke/api/ussd`
- Method: POST
- Format: URL-encoded

## 📈 Benefits

### For Farmers
- ✅ No smartphone needed
- ✅ No admin dependency
- ✅ Instant registration
- ✅ 24/7 availability
- ✅ No internet required

### For Admins
- ✅ Reduced manual work
- ✅ Automated onboarding
- ✅ Better tracking (registrationMethod field)
- ✅ Scalable to thousands of chamas
- ✅ Clear approval workflow

### For Business
- ✅ Faster user acquisition
- ✅ Lower customer acquisition cost
- ✅ Better rural penetration
- ✅ Competitive advantage
- ✅ Data-driven insights

## 🔮 Future Enhancements

### Phase 2: Full Member Management
- Add multiple members via USSD
- Collect member details (name, phone)
- Assign roles (secretary, treasurer)
- Member verification flow

### Phase 3: Payment Integration
- M-Pesa registration fee
- Automatic cold room assignment
- Instant activation after payment

### Phase 4: Smart Matching
- Auto-suggest nearby chamas to join
- Match based on produce type
- Location-based recommendations

### Phase 5: Advanced Features
- Edit chama details via USSD
- Transfer leadership
- Remove/add members
- Update contact information

## 📞 Support

For issues or questions:
- **Email:** support@stayfresh.co.ke
- **Phone:** +254 700 123 456
- **Documentation:** See USSD_DOCUMENTATION.md

## 🎉 Success Metrics

Track these metrics in analytics:
- USSD registrations per day
- Registration completion rate
- Time from registration to approval
- Active chamas by registration method
- User retention (USSD vs Web vs Admin)

---

**Last Updated:** 2024-01-15  
**Version:** 2.0  
**Status:** ✅ Ready for Testing
