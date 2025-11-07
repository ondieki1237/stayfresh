# Price Prediction System

## Overview
The Stay Fresh platform includes an intelligent price prediction system that analyzes historical market data to forecast future prices and provide actionable recommendations to farmers. **Now enhanced with TwelveData API integration for real-time global commodity market insights!**

## Recent Enhancement: TwelveData Integration 🆕

The system is now integrated with TwelveData API to provide:
- Real-time global commodity prices (Corn, Wheat, Rice, Sugar, Coffee, etc.)
- Historical price data from international markets
- Technical indicators (RSI, Moving Averages, MACD)
- Market movers (top gainers and losers)

**See [TWELVEDATA_INTEGRATION.md](./TWELVEDATA_INTEGRATION.md) for complete documentation.**

## Features

### 1. **Price Forecasting**
- 7-day price predictions using linear regression
- Confidence scores based on market volatility
- Trend analysis (increasing/decreasing)
- Percentage change projections
- **Enhanced with global commodity data from TwelveData API**

### 2. **Seasonal Trends**
- Monthly price averages over the past year
- Identification of best and worst months for selling
- Price range analysis across seasons

### 3. **Smart Recommendations**
- **HOLD**: When prices are expected to rise (>5%)
- **SELL**: When prices may drop (>5%)
- **MONITOR**: When prices are stable (<5% change)

### 4. **Market Intelligence**
- Comprehensive analysis combining predictions and seasonal data
- **Real-time global commodity market context**
- Data-driven insights for better decision making

### 5. **External Data Integration** 🆕
- TwelveData API for global commodity prices
- Ready for statistics.kilimo.go.ke integration
- Weather data integration capability
- Supply chain data support

## API Endpoints

### Get Price Prediction
```
GET /api/predictions/:produceType?days=7
```

**Example Response:**
```json
{
  "success": true,
  "produceType": "tomato",
  "currentPrice": 65,
  "predictions": [
    { "day": 1, "predictedPrice": 66.2, "confidence": 85 },
    { "day": 2, "predictedPrice": 67.4, "confidence": 82 },
    { "day": 7, "predictedPrice": 72.1, "confidence": 68 }
  ],
  "trend": "increasing",
  "percentChange": "10.92",
  "recommendation": {
    "action": "HOLD",
    "message": "Prices are expected to rise by 10.9% in the coming week.",
    "icon": "📈",
    "color": "green"
  }
}
```

### Get Seasonal Trends
```
GET /api/predictions/:produceType/seasonal
```

**Example Response:**
```json
{
  "success": true,
  "produceType": "tomato",
  "seasonalPattern": [
    { "month": "Jan", "avgPrice": 58, "sampleSize": 31 },
    { "month": "Feb", "avgPrice": 62, "sampleSize": 28 }
  ],
  "insights": {
    "bestMonth": "December",
    "bestPrice": 75,
    "worstMonth": "April",
    "worstPrice": 45,
    "priceRange": 30
  }
}
```

### Get Market Intelligence
```
GET /api/predictions/:produceType/intelligence
```

Returns combined prediction and seasonal analysis.

## Integration with Kenya Agricultural Statistics

### Data Source: https://statistics.kilimo.go.ke

The Ministry of Agriculture and Livestock Development provides valuable data including:

1. **Crop Production Statistics**
   - Planting and harvest seasons
   - Production volumes
   - Yield data

2. **Market Price Information**
   - Regional price variations
   - Historical price trends
   - Commodity prices

3. **Weather and Climate Data**
   - Rainfall patterns
   - Temperature variations
   - Drought/flood predictions

### Implementation Options

#### Option 1: Web Scraping
```javascript
// Example scraper structure
import axios from 'axios';
import cheerio from 'cheerio';

async function scrapeKilimoData(produceType) {
  try {
    const response = await axios.get('https://statistics.kilimo.go.ke/market-prices');
    const $ = cheerio.load(response.data);
    
    // Parse HTML structure to extract price data
    const priceData = [];
    $('.price-table tr').each((i, elem) => {
      // Extract data...
    });
    
    return priceData;
  } catch (error) {
    console.error('Scraping error:', error);
    return null;
  }
}
```

#### Option 2: API Integration (if available)
```javascript
async function fetchKilimoAPI(produceType, region) {
  try {
    const response = await axios.get(
      `https://statistics.kilimo.go.ke/api/v1/prices`,
      {
        params: {
          commodity: produceType,
          region: region,
          period: 'monthly'
        },
        headers: {
          'Authorization': `Bearer ${process.env.KILIMO_API_KEY}`
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('API error:', error);
    return null;
  }
}
```

#### Option 3: Manual Data Import
```javascript
// Import CSV/Excel files from Kilimo portal
import fs from 'fs';
import csv from 'csv-parser';

async function importKilimoCSV(filePath) {
  const results = [];
  
  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', reject);
  });
}
```

### Enhanced Price Predictor with External Data

```javascript
// In server/services/pricePredictor.js

async fetchExternalData(produceType, region) {
  try {
    // 1. Fetch from Kilimo statistics
    const governmentData = await this.fetchKilimoStatistics(produceType, region);
    
    // 2. Fetch weather data (affects crop yields)
    const weatherData = await this.fetchWeatherForecast(region);
    
    // 3. Analyze supply chain factors
    const supplyData = await this.analyzeSupplyFactors(produceType);
    
    return {
      government: governmentData,
      weather: weatherData,
      supply: supplyData
    };
  } catch (error) {
    console.error('External data fetch error:', error);
    return null;
  }
}

async predictPriceWithExternalData(produceType, region, daysAhead = 7) {
  // Combine historical data with external sources
  const [historical, external] = await Promise.all([
    this.getHistoricalData(produceType, 30),
    this.fetchExternalData(produceType, region)
  ]);
  
  // Apply weighted algorithm
  const prediction = this.calculateEnhancedPrediction(
    historical,
    external,
    daysAhead
  );
  
  return prediction;
}
```

## Additional Data Sources

### 1. Weather APIs
- **OpenWeatherMap**: Current and forecast weather
- **Kenya Meteorological Department**: Local climate data

### 2. International Commodity Prices
- **FAO GIEWS**: Global food price index
- **World Bank Commodity Markets**: Price forecasts

### 3. Transport and Logistics
- **Fuel price indices**: Affects transport costs
- **Road condition data**: Affects market access

### 4. Regional Market Data
- Local market association reports
- Trading platform data
- Agricultural cooperatives

## Machine Learning Enhancement

For more advanced predictions, consider implementing:

### Time Series Forecasting
```javascript
// Using libraries like TensorFlow.js
import * as tf from '@tensorflow/tfjs-node';

async function trainPriceModel(historicalData) {
  const model = tf.sequential({
    layers: [
      tf.layers.lstm({ units: 50, returnSequences: true, inputShape: [30, 1] }),
      tf.layers.dropout({ rate: 0.2 }),
      tf.layers.lstm({ units: 50, returnSequences: false }),
      tf.layers.dropout({ rate: 0.2 }),
      tf.layers.dense({ units: 1 })
    ]
  });
  
  model.compile({
    optimizer: 'adam',
    loss: 'meanSquaredError'
  });
  
  // Train model with historical data
  await model.fit(trainingData, labels, {
    epochs: 100,
    batchSize: 32
  });
  
  return model;
}
```

## Installation

1. **Install dependencies** (if using scraping):
```bash
cd server
npm install axios cheerio csv-parser
```

2. **Configure environment variables**:
```bash
# .env
KILIMO_API_KEY=your_api_key_if_available
WEATHER_API_KEY=your_weather_api_key
```

3. **Start the server**:
```bash
npm start
```

## Usage in Frontend

```typescript
// In your React component
const fetchPricePrediction = async (produceType: string) => {
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';
  const response = await fetch(
    `${API_BASE}/predictions/${produceType}?days=7`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );
  const data = await response.json();
  return data;
};
```

## Roadmap

- [ ] Implement Kilimo data scraper/API client
- [ ] Add weather data integration
- [ ] Implement LSTM model for better accuracy
- [ ] Add regional price comparison
- [ ] Create price alerts system
- [ ] Export prediction reports
- [ ] Historical accuracy tracking
- [ ] Multi-factor analysis dashboard

## Notes

- Current implementation uses linear regression on historical data
- Predictions improve with more historical data points (minimum 7 days)
- Confidence scores decrease for longer-term predictions
- Integration with external sources requires proper authentication and rate limiting

## Support

For questions or suggestions about the price prediction system:
- Email: support@stayfresh.co.ke
- Documentation: Check API_DOCS.md

---

**Last Updated**: November 7, 2025
