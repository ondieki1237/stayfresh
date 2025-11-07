# Global Price Widget - User Guide

## 🌍 Overview

The Global Price Widget allows farmers to search for and view real-time commodity prices from international markets. This helps farmers make informed decisions about when to sell their produce by understanding global market trends.

## 📍 Location

Navigate to: **Dashboard → Global Prices** (🌍 icon in sidebar)

## ✨ Features

### 1. **Search Any Commodity**
- Type any commodity name in the search box
- Press "Search" or Enter to fetch prices
- Examples: corn, wheat, rice, soybean, sugar, coffee, cotton

### 2. **Quick Select Buttons**
Click any of the pre-configured commodity buttons for instant results:
- 🌽 Corn
- 🌾 Wheat
- 🍚 Rice
- 🫘 Soybean
- 🍬 Sugar
- ☕ Coffee
- 🧶 Cotton

### 3. **Real-Time Price Display**
When you search for a commodity, you'll see:

#### Main Price Card
- **Current Price** - Large display of current USD price
- **% Change** - Green (▲) for gains, Red (▼) for losses
- **Daily Change** - Dollar amount of change today

#### Price Details
- **Open** - Opening price for the day
- **High** - Highest price today (in green)
- **Low** - Lowest price today (in red)
- **Volume** - Number of contracts traded

#### Additional Information
- **Last Updated** - Timestamp of latest data
- **Auto-Refresh** - Toggle to refresh every 5 minutes
- **Market Insight** - Automated analysis of price movement

### 4. **Auto-Refresh**
- Enable the checkbox to automatically refresh prices every 5 minutes
- Helpful for monitoring price changes throughout the day
- Disable when not actively monitoring to save API calls

### 5. **Smart Market Insights**
The widget automatically provides insights based on price movement:

| Price Change | Insight |
|-------------|---------|
| +5% or more | "Strong upward momentum! Consider holding for better prices." |
| -5% or less | "Significant drop. Market may be volatile." |
| +0% to +5% | "Modest gains. Market showing positive sentiment." |
| -5% to 0% | "Slight decline. Monitor closely." |
| No change | "Price stable. Good time to evaluate your position." |

## 💡 How to Use This Data

### Compare with Local Prices
1. Check global price for your commodity (e.g., corn)
2. Compare with your local market price in KSH
3. Convert USD to KSH (approximately 1 USD = 150 KSH)
4. Determine if local prices are fair

**Example:**
- Global corn price: $456 USD per ton
- In KSH: ≈ 68,400 KSH per ton
- Local price: 70 KSH/kg
- Assessment: Local prices are competitive

### Timing Your Sales

#### When Global Prices Are Rising (+5% or more):
✅ **HOLD** - Wait a few days for local prices to catch up  
✅ Consider storage costs vs. potential price gains  
✅ Monitor daily for peak prices

#### When Global Prices Are Falling (-5% or more):
❌ **SELL QUICKLY** - Local prices likely to follow  
❌ Accept current prices to avoid bigger losses  
❌ Don't wait for recovery if trend is strong

#### When Global Prices Are Stable (±2%):
⚠️ **EVALUATE** - Normal market conditions  
⚠️ Sell based on your personal needs  
⚠️ Storage costs may outweigh waiting for gains

### Understanding Volume
- **High Volume (>100,000)**: Strong market activity, prices more reliable
- **Low Volume (<50,000)**: Weak trading, prices may be less stable
- **Increasing Volume**: Growing interest, possible trend continuation
- **Decreasing Volume**: Fading interest, trend may reverse

## 🕐 Market Information

### Data Source
- **TwelveData API** - Professional commodity data provider
- **Exchanges**: CBOT (Chicago Board of Trade), NYBOT (New York Board of Trade)
- **Currency**: All prices in USD (convert to KSH)
- **Delay**: 15 minutes (free tier)

### Market Hours
- Commodity markets open Monday-Friday
- Trading hours: US market hours (various depending on commodity)
- Weekend data shows Friday's closing prices
- Some commodities trade 24/5 on electronic platforms

### Supported Commodities

| Commodity | Symbol | Exchange | Description |
|-----------|--------|----------|-------------|
| Corn | ZC | CBOT | Corn futures (maize) |
| Wheat | ZW | CBOT | Wheat futures |
| Rice | ZR | CBOT | Rice futures |
| Soybean | ZS | CBOT | Soybean futures |
| Sugar | SB | NYBOT | Sugar #11 (raw) |
| Coffee | KC | NYBOT | Coffee Arabica |
| Cotton | CT | NYBOT | Cotton #2 |

**Note:** For local produce like tomatoes, onions, or carrots, the system uses local market data from the Market Insights page instead.

## 📊 Practical Examples

### Example 1: Good Time to Sell
```
Search: Wheat
Current Price: $650 USD (+6.5%)
Insight: "Strong upward momentum! Price up 6.50% today."

Your Action:
→ Local wheat prices likely rising too
→ Good time to sell if you have stored wheat
→ Demand is high, capitalize on trend
```

### Example 2: Wait Before Selling
```
Search: Corn
Current Price: $445 USD (+2.1%)
High: $458 (hit earlier today)
Insight: "Modest gains. Market showing positive sentiment."

Your Action:
→ Price peaked earlier at $458
→ May rise again tomorrow
→ If storage cost is low, wait 1-2 days
→ Monitor for return to $458 level
```

### Example 3: Sell Immediately
```
Search: Sugar
Current Price: $20.50 USD (-7.2%)
Insight: "Significant drop of 7.20% today. Market may be volatile."

Your Action:
→ Major price decline
→ Local prices will likely drop too
→ Sell today at current local price
→ Don't wait for recovery
```

## 🎯 Pro Tips

### Daily Routine
1. **Morning Check** (8-9 AM): See overnight changes
2. **Midday Update** (12-1 PM): Check if trends continue
3. **Evening Review** (5-6 PM): Plan for next day

### Strategy Tips
- **Track for 1 week** before making decisions
- **Note patterns** - Some commodities rise on certain days
- **Seasonal awareness** - Harvest time usually means lower prices
- **Global events** - Weather, politics affect prices
- **Currency conversion** - Monitor USD/KSH exchange rate too

### Best Practices
✅ Enable auto-refresh when actively monitoring  
✅ Check multiple commodities for market sentiment  
✅ Compare today's price with Open price  
✅ Look at High/Low range for volatility  
✅ Use Volume to confirm trend strength  
✅ Combine with local Market Insights data  
✅ Keep a price journal to spot patterns

### Common Mistakes to Avoid
❌ Checking only once before selling  
❌ Ignoring volume indicators  
❌ Not converting USD to KSH properly  
❌ Selling in panic on small drops  
❌ Waiting too long during downtrends  
❌ Forgetting about storage costs  
❌ Not comparing with local prices

## 🔧 Troubleshooting

### "Please login to view global prices"
**Solution:** You need to be logged in. Click Logout and login again.

### "No data available for [commodity]"
**Solution:** 
- Try standard commodities: corn, wheat, rice, soybean, sugar, coffee, cotton
- Check spelling of commodity name
- Some local produce not tracked globally - use Market Insights instead

### Prices not updating
**Solution:**
- Check auto-refresh is enabled
- Click Search again to manually refresh
- Ensure internet connection is active
- Weekend/holiday - markets may be closed

### Wrong commodity showing
**Solution:**
- Clear search box and type again
- Use Quick Select buttons for accuracy
- Try exact spelling (lowercase usually works)

## 📱 Mobile Usage

The Global Price Widget is fully responsive:
- ✅ Works on phones and tablets
- ✅ Quick select buttons adapt to screen size
- ✅ Touch-friendly interface
- ✅ Auto-refresh works on mobile data

## 🔐 Privacy & Data

- Your searches are private
- No data is stored or shared
- Requires login for security
- API calls logged for rate limiting only

## 💰 Cost & Limits

- **Free to use** - No charges to farmers
- **800 searches per day** (platform-wide)
- **Updates every 15 minutes** (real-time with delay)
- Fair usage - don't refresh excessively

## 📚 Related Features

- **Market Insights** - Local price trends and comparisons
- **Price Predictions** - 7-day forecasts for local produce
- **Marketplace** - Buy/sell directly with other farmers

## 🎓 Learning Resources

### Understanding Commodity Markets
- Futures markets represent future delivery prices
- Spot prices are for immediate delivery
- Global prices influence but don't dictate local prices
- Supply/demand, weather, policy all affect prices

### Currency Conversion
- 1 USD ≈ 150 KSH (check current rate)
- Price per ton → divide by 1000 for price per kg
- Example: $600/ton = $0.60/kg = 90 KSH/kg

### When to Trust Global Data
✅ For traded commodities (corn, wheat, rice)  
✅ For long-term trends  
✅ For general market sentiment  
⚠️ Less useful for highly local produce  
⚠️ Adjust for local supply/demand factors

## 🆘 Need Help?

If you have questions or issues:
1. Check this guide first
2. Try searching common commodities (corn, wheat)
3. Compare results with Market Insights page
4. Contact support if problems persist

---

**Happy Trading! Use global data wisely to maximize your profits! 🌍📈🌾**
