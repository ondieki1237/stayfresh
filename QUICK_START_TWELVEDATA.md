# 🚀 Quick Start: TwelveData Market Insights

## What You Got

Your free TwelveData API key is now integrated into Stay Fresh! Here's what you can do:

### 🎁 Your Free API Access
```
API Key: 66dd04af759746b2853207bc5deaddb1
Daily Limit: 800 calls/day
Rate Limit: 8 calls/minute
```

## ⚡ Quick Test (3 Steps)

### Step 1: Start the Server
```bash
cd /home/seth/Documents/coldroom/server
npm run dev
```

### Step 2: Get Your JWT Token
```bash
# Login to get a token (replace with your credentials)
curl -X POST "https://www.kisumu.codewithseth.co.ke/api/farmers/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"your-email@example.com","password":"your-password"}'

# Copy the "token" from the response
```

### Step 3: Test the API
```bash
# Replace YOUR_TOKEN with the token from Step 2
TOKEN="YOUR_TOKEN"

# Get real-time corn price
curl -X GET "https://www.kisumu.codewithseth.co.ke/api/market-insights/quote/corn" \
  -H "Authorization: Bearer $TOKEN"

# Get market movers
curl -X GET "https://www.kisumu.codewithseth.co.ke/api/market-insights/movers" \
  -H "Authorization: Bearer $TOKEN"
```

## 🎯 What Each Endpoint Does

| Endpoint | What It Does | Example |
|----------|-------------|---------|
| `/quote/corn` | Get current price of corn | `$456.75 (+0.38%)` |
| `/timeseries/wheat` | Get 30-day price history | Chart data for wheat prices |
| `/movers` | See biggest price changes | Coffee +5.2%, Sugar -3.1% |
| `/analysis/rice` | Full market analysis | Price + trends + stats |
| `/technical/coffee?indicator=rsi` | Trading indicators | RSI, Moving Averages, etc. |

## 📊 Supported Commodities

✅ **Corn** (ZC) - Maize futures  
✅ **Wheat** (ZW) - Wheat futures  
✅ **Rice** (ZR) - Rice futures  
✅ **Soybean** (ZS) - Soybean futures  
✅ **Sugar** (SB) - Sugar futures  
✅ **Coffee** (KC) - Coffee futures  
✅ **Cotton** (CT) - Cotton futures  

*For local produce like tomatoes/onions, the system uses your existing local market data.*

## 💡 Why This Matters

### Before TwelveData:
- ❌ Only local market prices
- ❌ No global market context
- ❌ Limited trend data

### After TwelveData:
- ✅ Global commodity prices in real-time
- ✅ Compare local vs international markets
- ✅ See what professional traders see
- ✅ Better timing for selling produce
- ✅ Understand price movements globally

## 🎨 Example Use Cases

### 1. Check if Local Prices Are Fair
```
Local tomato price: KSH 80/kg
Global tomato indicator: Coffee prices up 5.2%
→ Agriculture commodities rising globally
→ Local price is reasonable, could go higher
```

### 2. Timing Your Sales
```
Corn price trend: +2.5% this week
7-day prediction: +8% expected
Recommendation: HOLD (wait for higher prices)
```

### 3. Market Overview
```
Top Gainers: Coffee +5.2%, Cotton +3.8%
Top Losers: Sugar -3.1%, Wheat -1.5%
→ General market sentiment: Bullish
→ Good time to consider selling stored produce
```

## 📱 Next: Build the UI

Now you can create frontend components to show this data:

```typescript
// Show global price widget
<GlobalPriceWidget produceType="corn" />

// Show market movers
<MarketMovers />

// Show comparison
<PriceComparison local={80} global={75} />
```

## 📚 Full Documentation

- **[TWELVEDATA_INTEGRATION.md](./TWELVEDATA_INTEGRATION.md)** - Complete API reference
- **[TWELVEDATA_IMPLEMENTATION_SUMMARY.md](./TWELVEDATA_IMPLEMENTATION_SUMMARY.md)** - What was done
- **[PRICE_PREDICTION.md](./PRICE_PREDICTION.md)** - Price prediction system

## 🛠️ Where Is Everything?

```
server/
├── services/
│   ├── twelveDataService.js      ← TwelveData API client
│   └── pricePredictor.js         ← Enhanced with TwelveData
├── routes/
│   ├── market-insights.js        ← New API endpoints
│   └── predictions.js            ← Existing predictions
└── index.js                      ← Routes mounted here

root/
├── TWELVEDATA_INTEGRATION.md           ← Full API docs
├── TWELVEDATA_IMPLEMENTATION_SUMMARY.md ← Implementation details
├── PRICE_PREDICTION.md                 ← Price prediction docs
└── test-twelvedata.sh                  ← Test script
```

## ⚡ Quick Commands

```bash
# Test everything (after updating TOKEN in script)
./test-twelvedata.sh

# Or test individual endpoints
curl https://www.kisumu.codewithseth.co.ke/api/market-insights/quote/corn \
  -H "Authorization: Bearer YOUR_TOKEN"

curl https://www.kisumu.codewithseth.co.ke/api/market-insights/movers \
  -H "Authorization: Bearer YOUR_TOKEN"

curl https://www.kisumu.codewithseth.co.ke/api/market-insights/api-status \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🎉 You're All Set!

Your Stay Fresh platform now has professional-grade market intelligence! Farmers can:

1. ✅ See real-time global commodity prices
2. ✅ Track market trends and movers
3. ✅ Get technical analysis
4. ✅ Make informed selling decisions
5. ✅ Compare local vs global markets

**Go ahead and test it! 🚀**

---

Need help? Check the full docs or test with the provided script!
