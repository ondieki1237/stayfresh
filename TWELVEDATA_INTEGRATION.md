# TwelveData Market Insights Integration

## Overview

The Stay Fresh platform now integrates with **TwelveData API** to provide real-time commodity market insights, price forecasts, and market intelligence. This enhances our price prediction system with live global commodity data.

## API Key

```
API Key: 66dd04af759746b2853207bc5deaddb1
Provider: TwelveData.com
Plan: Free tier (800 API calls/day)
```

## Features

### 1. Real-Time Price Quotes
Get current prices for agricultural commodities including:
- Corn, Wheat, Soybean, Rice
- Sugar, Coffee, Cotton
- Local produce (when available)

### 2. Historical Price Data
Access time series data with configurable intervals:
- Daily, Weekly, Monthly intervals
- Up to 365 days of history
- Used for trend analysis and predictions

### 3. Market Movers
Track top gainers and losers in commodity markets:
- % change rankings
- Volume analysis
- Daily performance metrics

### 4. Technical Indicators
Calculate trading indicators:
- RSI (Relative Strength Index)
- Moving Averages (SMA, EMA)
- MACD, Bollinger Bands
- Custom indicators

### 5. Enhanced Predictions
Combine local market data with global commodity trends for more accurate forecasts.

## API Endpoints

### Get Real-Time Quote
```http
GET /api/market-insights/quote/:produceType
Authorization: Bearer <token>
```

**Example Request:**
```bash
curl -X GET "https://www.kisumu.codewithseth.co.ke/api/market-insights/quote/corn" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Example Response:**
```json
{
  "success": true,
  "symbol": "ZC",
  "price": 456.75,
  "open": 455.00,
  "high": 458.20,
  "low": 454.50,
  "volume": 123456,
  "change": 1.75,
  "percentChange": 0.38,
  "timestamp": "2025-11-07T10:30:00Z"
}
```

### Get Historical Time Series
```http
GET /api/market-insights/timeseries/:produceType?interval=1day&days=30
Authorization: Bearer <token>
```

**Query Parameters:**
- `interval` - Data interval: `1min`, `5min`, `1hour`, `1day`, `1week`, `1month`
- `days` - Number of data points (default: 30)

**Example Response:**
```json
{
  "success": true,
  "symbol": "ZC",
  "data": [
    {
      "datetime": "2025-11-07",
      "open": "455.00",
      "high": "458.20",
      "low": "454.50",
      "close": "456.75",
      "volume": "123456"
    }
  ],
  "meta": {
    "symbol": "ZC",
    "interval": "1day",
    "currency": "USD",
    "exchange": "CBOT"
  }
}
```

### Get Enhanced Market Analysis
```http
GET /api/market-insights/analysis/:produceType
Authorization: Bearer <token>
```

**Example Response:**
```json
{
  "success": true,
  "produceType": "corn",
  "timestamp": "2025-11-07T10:30:00Z",
  "dataSource": "TwelveData API",
  "currentPrice": 456.75,
  "priceChange": 1.75,
  "percentChange": 0.38,
  "dayHigh": 458.20,
  "dayLow": 454.50,
  "volume": 123456,
  "historicalData": [
    {
      "date": "2025-11-07",
      "price": 456.75
    }
  ],
  "statistics": {
    "52_week_high": 520.00,
    "52_week_low": 385.00,
    "50_day_ma": 445.30,
    "200_day_ma": 432.15
  }
}
```

### Get Market Movers
```http
GET /api/market-insights/movers
Authorization: Bearer <token>
```

**Example Response:**
```json
{
  "success": true,
  "topGainers": [
    {
      "symbol": "KC",
      "name": "Coffee",
      "price": 185.50,
      "change": 5.2
    }
  ],
  "topLosers": [
    {
      "symbol": "SB",
      "name": "Sugar",
      "price": 22.30,
      "change": -3.1
    }
  ]
}
```

### Get Bulk Quotes
```http
GET /api/market-insights/bulk?produces=corn,wheat,rice
Authorization: Bearer <token>
```

### Get Technical Indicators
```http
GET /api/market-insights/technical/:produceType?indicator=rsi&interval=1day
Authorization: Bearer <token>
```

**Supported Indicators:**
- `rsi` - Relative Strength Index
- `sma` - Simple Moving Average
- `ema` - Exponential Moving Average
- `macd` - Moving Average Convergence Divergence
- `bbands` - Bollinger Bands
- `stoch` - Stochastic Oscillator

### Check API Status
```http
GET /api/market-insights/api-status
Authorization: Bearer <token>
```

## Commodity Symbol Mapping

The system automatically maps produce types to standard commodity symbols:

| Produce Type | TwelveData Symbol | Exchange |
|-------------|-------------------|----------|
| Corn | ZC | CBOT |
| Wheat | ZW | CBOT |
| Soybean | ZS | CBOT |
| Rice | ZR | CBOT |
| Sugar | SB | NYBOT |
| Coffee | KC | NYBOT |
| Cotton | CT | NYBOT |

## Integration with Price Predictions

The TwelveData service is now integrated into the `pricePredictor.js` service:

```javascript
// Fetch external data including TwelveData
const externalData = await pricePredictor.fetchExternalData('corn');

// externalData.twelveData contains real-time commodity info
```

This enhances predictions by:
1. Validating local prices against global commodity trends
2. Detecting unusual price movements
3. Providing context for price forecasts
4. Identifying arbitrage opportunities

## Frontend Integration

### Example: Display Real-Time Price
```typescript
// In your React component
const [commodityPrice, setCommodityPrice] = useState(null);

useEffect(() => {
  const fetchPrice = async () => {
    const response = await fetch(
      `${API_BASE}/market-insights/quote/corn`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    const data = await response.json();
    setCommodityPrice(data);
  };
  
  fetchPrice();
  // Refresh every 5 minutes
  const interval = setInterval(fetchPrice, 5 * 60 * 1000);
  return () => clearInterval(interval);
}, []);
```

### Example: Market Movers Widget
```typescript
const MarketMovers = () => {
  const [movers, setMovers] = useState(null);
  
  useEffect(() => {
    fetch(`${API_BASE}/market-insights/movers`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setMovers(data));
  }, []);
  
  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <h3 className="text-green-600 font-bold">Top Gainers 📈</h3>
        {movers?.topGainers.map(item => (
          <div key={item.symbol}>
            {item.name}: +{item.change}%
          </div>
        ))}
      </div>
      <div>
        <h3 className="text-red-600 font-bold">Top Losers 📉</h3>
        {movers?.topLosers.map(item => (
          <div key={item.symbol}>
            {item.name}: {item.change}%
          </div>
        ))}
      </div>
    </div>
  );
};
```

## Usage Limits

**Free Plan (Current):**
- 800 API calls per day
- 8 API calls per minute
- Real-time data with 15-minute delay
- No credit card required

**Rate Limiting Strategy:**
1. Cache responses for 5-15 minutes
2. Use bulk endpoints when possible
3. Fetch only on user request, not automatic polling
4. Monitor usage via `/api/market-insights/api-status`

## Error Handling

The API gracefully handles errors:

```json
{
  "success": false,
  "message": "No quote data available for tomato. This commodity may not be tracked by the API."
}
```

**Common Scenarios:**
1. **Commodity not found** - Returns 404 with helpful message
2. **Rate limit exceeded** - Returns 429, retry after delay
3. **API key invalid** - Returns 401, check configuration
4. **Network error** - Returns 500, service continues with local data

## Benefits for Farmers

1. **Global Price Context**: Compare local prices with international commodity markets
2. **Timing Decisions**: Know when global prices are rising to hold produce
3. **Market Trends**: See if prices are trending up or down globally
4. **Risk Management**: Understand volatility and price movements
5. **Arbitrage Opportunities**: Identify when local prices diverge from global

## Testing

### Test the API Integration
```bash
# From server directory
cd server

# Install dependencies (if not already done)
npm install axios

# Test quote endpoint
curl -X GET "https://www.kisumu.codewithseth.co.ke/api/market-insights/quote/corn" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Test movers endpoint
curl -X GET "https://www.kisumu.codewithseth.co.ke/api/market-insights/movers" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Check API status
curl -X GET "https://www.kisumu.codewithseth.co.ke/api/market-insights/api-status" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Future Enhancements

1. **Cache Layer**: Implement Redis caching to reduce API calls
2. **Webhook Integration**: Subscribe to price alerts
3. **Custom Alerts**: Notify farmers when prices hit thresholds
4. **Historical Analysis**: Compare current prices to historical averages
5. **Correlation Analysis**: Show how global commodity prices affect local markets
6. **Upgrade Plan**: If usage exceeds free tier, upgrade to paid plan ($29/month for 1,000 calls/day)

## Troubleshooting

### Issue: "Commodity not found"
**Solution**: TwelveData mainly tracks major commodities. For local produce like tomatoes, the system falls back to local market data.

### Issue: "Rate limit exceeded"
**Solution**: 
- Implement caching with 15-minute TTL
- Use bulk endpoints
- Reduce polling frequency
- Consider upgrading API plan

### Issue: "API key invalid"
**Solution**: Verify the API key in `server/services/twelveDataService.js`

### Issue: "No data returned"
**Solution**: 
- Check if commodity symbol is correct
- Try standard commodities (corn, wheat, rice)
- Verify API status at twelvedata.com

## Related Documentation

- [PRICE_PREDICTION.md](./PRICE_PREDICTION.md) - Price prediction system
- [API_DOCS.md](./API_DOCS.md) - General API documentation
- [TwelveData API Docs](https://twelvedata.com/docs) - Official API documentation

## Support

For issues or questions:
1. Check API status: `/api/market-insights/api-status`
2. Review logs in server console
3. Test with standard commodities first
4. Verify JWT token is valid

## Summary

The TwelveData integration provides Stay Fresh with:
- ✅ Real-time global commodity prices
- ✅ Historical price data for trend analysis
- ✅ Market movers and technical indicators
- ✅ Enhanced price predictions
- ✅ 800 free API calls per day
- ✅ Professional market intelligence tools

This gives farmers powerful insights to make informed decisions about when to sell their produce for maximum profit! 🚀📈
