# 📱 USSD Quick Reference Card

## Dial Code
```
*384*31306#
```

## 🆕 NEW: Self-Registration Flow

### For Non-Members

```
*384*31306#
↓
CON Welcome to Stay Fresh Cold Storage

You are not registered yet.

1. Register New Chama
2. Join Existing Chama
3. Contact Support
0. Exit
```

#### Option 1: Register New Chama
```
Steps:
1. Enter Chama Name (min 3 chars)
2. Enter Location
3. Enter Leader Name
4. Enter Member Count (2-100)
5. Confirm Registration

Result: Pending approval, SMS confirmation sent
```

#### Option 2: Join Existing Chama
```
Browse list of active chamas
Select chama to join
Submit join request
Admin receives notification
```

#### Option 3: Contact Support
```
Shows:
- Support email
- Support phone
- Website
```

---

## 👥 Existing Members Menu

```
*384*31306#
↓
CON Welcome to Stay Fresh - [Your Chama Name]

1. Room Status
2. Market Schedule
3. Produce Info
4. Billing
5. Request Release
6. Members
7. Power Savings
```

### 1️⃣ Room Status
Shows:
- Current temperature
- Humidity levels
- Power status
- Door status

### 2️⃣ Market Schedule
Shows:
- Next market day
- Market hours
- Power schedule
- Days remaining

### 3️⃣ Produce Info
Shows:
- Total quantity stored
- Produce types
- Storage duration
- Condition status

### 4️⃣ Billing
Shows:
- Current charges
- Shared costs
- Payment status
- Total members sharing

### 5️⃣ Request Release
Options:
- Enter quantity to release
- System notifies admin
- Receive confirmation

### 6️⃣ Members
Shows:
- List of all members
- Total member count
- Contact information

### 7️⃣ Power Savings
Shows:
- Electricity saved
- Cost savings
- Environmental impact
- Peak vs off-peak usage

---

## 📋 Validation Rules

| Field | Min | Max | Format |
|-------|-----|-----|--------|
| Chama Name | 3 | 100 | Text |
| Location | 3 | 100 | Text |
| Leader Name | 3 | 100 | Text |
| Member Count | 2 | 100 | Number |

---

## 🔧 For Developers

### Test Endpoints

```bash
# Test any flow
curl -X POST http://localhost:5000/api/ussd/test \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "+254712345678", "text": "1*Chama Name*Location*Leader*10*1"}'

# Simulate in browser
http://localhost:5000/api/ussd/simulate/+254712345678?text=1
```

### Text Format

USSD input uses `*` as delimiter:
- `""` = Initial menu
- `"1"` = Option 1 selected
- `"1*MyChama"` = Option 1, then entered "MyChama"
- `"1*MyChama*Kisumu"` = Multi-step progression

### Response Format

```
CON ... = Continue session (show next step)
END ... = End session (final message)
```

---

## 🚨 Common Issues

### "Session expired"
**Solution:** Dial *384*31306# again to restart

### "Name too short"
**Solution:** Enter at least 3 characters

### "Invalid number"
**Solution:** Enter member count between 2-100

### Issue: "You are not registered"
**Solution:** 
- Non-member: Dial *384*31306# and select option 1 to register
- Existing member: Contact admin to add your phone

---

## 📞 Support Contacts

- **Email:** support@stayfresh.co.ke
- **Phone:** +254 700 123 456
- **Web:** www.stayfresh.co.ke

---

## 🎯 Registration Status

After registration via USSD:

1. ✅ **Registered** - Chama created with status='pending'
2. ⏳ **Pending** - Waiting admin approval (24 hours)
3. 📧 **Confirmation** - SMS sent to registered phone
4. 🏢 **Cold Room** - Assigned after approval
5. ✨ **Active** - Full access to all features

---

## 📊 Benefits

### For Farmers
- ✅ No smartphone needed
- ✅ Works on any phone
- ✅ No internet required
- ✅ 24/7 availability
- ✅ Instant registration

### For Chamas
- ✅ Easy onboarding
- ✅ Member self-service
- ✅ Real-time information
- ✅ Reduced admin calls
- ✅ Better transparency

---

**Version:** 2.0  
**Last Updated:** 2024-01-15  
**Feature:** Self-Registration Enabled ✨
