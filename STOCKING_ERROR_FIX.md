# Stocking Booking Error - Troubleshooting Guide

## 🐛 Issue

Getting "❌ Error booking stocking. Please try again." when trying to book stocking.

## ✅ Fix Applied

Updated `components/dashboard/book-stocking.tsx` with:

1. **Better error logging** - Shows exact error details in console
2. **Detailed error messages** - Shows what went wrong (status code, error text)
3. **Removed fallback** - Changed from `${API_BASE || "/api"}` to `${API_BASE}` 
4. **Helpful troubleshooting info** - Shows API URL being used

## 🔍 Debug Information

The updated component now logs:
```
Booking stocking with: {
  url: "https://www.kisumu.codewithseth.co.ke/api/stocking/book",
  roomId: "...",
  farmerId: "...",
  produceType: "...",
  quantity: ...
}
```

And shows detailed errors like:
```
❌ Server error: 404 Not Found
❌ Server error: 500 Internal Server Error  
❌ Failed to book stocking: [specific error message]
```

## 🔧 How to Test

### 1. Rebuild the app
```bash
cd /home/seth/Documents/coldroom
npm run build
npx cap sync android
cd android && ./gradlew assembleDebug && cd ..
```

### 2. Install on device
```bash
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

### 3. Test with Chrome DevTools
```bash
# On your computer, open Chrome:
chrome://inspect

# Then:
# 1. Connect your Android device via USB
# 2. Enable USB debugging
# 3. Open Stay Fresh app
# 4. In Chrome, click "inspect" on the app
# 5. Try booking stocking
# 6. Check Console tab for errors
```

## 🌐 Backend Checks

### 1. Verify backend is accessible
```bash
curl https://www.kisumu.codewithseth.co.ke/api/health
```

Expected response:
```json
{"status":"API is running","timestamp":"..."}
```

### 2. Check CORS settings
Make sure your backend (`server/index.js`) has:
```javascript
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false
}));
```

### 3. Test stocking endpoint
```bash
# Get a token first (login)
TOKEN="your-jwt-token-here"

# Test stocking endpoint
curl -X POST https://www.kisumu.codewithseth.co.ke/api/stocking/book \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "roomId": "673c55fd3aaa12f28e4a90ee",
    "farmerId": "673c55fd3aaa12f28e4a90ee",
    "produceType": "Tomatoes",
    "quantity": 50,
    "estimatedValue": 5000,
    "condition": "Fresh",
    "targetPrice": 120,
    "notes": "Test booking"
  }'
```

## 🚨 Common Issues & Solutions

### Issue 1: CORS Error
**Symptom:** Console shows "CORS policy" error
**Solution:** 
- Check backend CORS configuration
- Ensure `Access-Control-Allow-Origin: *` header is present
- Restart backend server

### Issue 2: 404 Not Found
**Symptom:** Response status: 404
**Solution:**
- Verify route exists in `server/routes/stocking.js`
- Check route is mounted in `server/index.js`: `app.use("/api/stocking", stockingRoutes)`
- Ensure backend server is running

### Issue 3: 401 Unauthorized
**Symptom:** Response status: 401
**Solution:**
- Check token is being sent in Authorization header
- Verify token is valid (not expired)
- Check `authMiddleware` is working correctly

### Issue 4: 500 Internal Server Error
**Symptom:** Response status: 500
**Solution:**
- Check backend logs for error details
- Verify database connection is working
- Check all required fields are being sent
- Verify MongoDB models exist (Stocking, Room, Farmer)

### Issue 5: Network Error / Failed to Fetch
**Symptom:** "Failed to fetch" or "Network request failed"
**Solution:**
- Ensure device has internet connection
- Check backend server is accessible from internet
- Verify API URL is correct: `https://www.kisumu.codewithseth.co.ke/api`
- Check firewall/security settings on backend server

## 📝 What the Fix Does

### Before:
```typescript
const response = await fetch(`${API_BASE || "/api"}/stocking/book`, ...)
```
- Silent errors
- Generic error messages
- No debugging info

### After:
```typescript
const response = await fetch(`${API_BASE}/stocking/book`, ...)
console.log("Booking stocking with:", {...})
console.log("Response status:", response.status)
// Detailed error handling
```
- Logs request details
- Shows response status
- Provides specific error messages
- Shows API URL being used
- Includes troubleshooting hints

## 🔄 Quick Rebuild Command

```bash
cd /home/seth/Documents/coldroom && \
npm run build && \
npx cap sync android && \
cd android && ./gradlew assembleDebug && cd .. && \
echo "✅ APK ready: android/app/build/outputs/apk/debug/app-debug.apk"
```

Then install:
```bash
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

## 📱 Testing Checklist

After installing the updated APK:

- [ ] Open app and login
- [ ] Navigate to a rented room
- [ ] Click "Book Stocking"
- [ ] Fill in the form
- [ ] Click "Book Stocking" button
- [ ] If error occurs:
  - [ ] Check Chrome DevTools console
  - [ ] Note the exact error message
  - [ ] Check backend is running
  - [ ] Verify API URL in console log

## 🆘 Still Not Working?

If the error persists after applying the fix:

1. **Check Chrome DevTools console** - This will show the exact error
2. **Check backend logs** - Look for error messages on server
3. **Test backend directly** - Use curl to test the endpoint
4. **Verify API URL** - Ensure it's `https://www.kisumu.codewithseth.co.ke/api`
5. **Check network** - Make sure device can reach backend

The improved error messages will tell you exactly what's wrong! 🔍
