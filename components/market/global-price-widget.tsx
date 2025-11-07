'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

interface CommodityQuote {
  success: boolean;
  symbol: string;
  price: number;
  open: number;
  high: number;
  low: number;
  volume: number;
  change: number;
  percentChange: number;
  timestamp: string;
}

const POPULAR_COMMODITIES = [
  { name: 'Corn', value: 'corn', icon: '🌽' },
  { name: 'Wheat', value: 'wheat', icon: '🌾' },
  { name: 'Rice', value: 'rice', icon: '🍚' },
  { name: 'Soybean', value: 'soybean', icon: '🫘' },
  { name: 'Sugar', value: 'sugar', icon: '🍬' },
  { name: 'Coffee', value: 'coffee', icon: '☕' },
  { name: 'Cotton', value: 'cotton', icon: '🧶' },
];

export default function GlobalPriceWidget() {
  const [commodity, setCommodity] = useState('');
  const [quote, setQuote] = useState<CommodityQuote | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const fetchPrice = async (commodityName: string) => {
    if (!commodityName.trim()) {
      setError('Please enter a commodity name');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to view global prices');
        setLoading(false);
        return;
      }

      const response = await fetch(
        `${API_BASE}/market-insights/quote/${commodityName.toLowerCase()}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(
          data.message || 
          `No data available for "${commodityName}". Try: corn, wheat, rice, soybean, sugar, coffee, or cotton.`
        );
        setQuote(null);
      } else {
        setQuote(data);
        setError(null);
      }
    } catch (err: any) {
      setError(`Failed to fetch price: ${err.message}`);
      setQuote(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPrice(commodity);
  };

  const handleQuickSelect = (commodityValue: string) => {
    setCommodity(commodityValue);
    fetchPrice(commodityValue);
  };

  // Auto-refresh every 5 minutes if enabled
  useEffect(() => {
    if (autoRefresh && commodity && quote) {
      const interval = setInterval(() => {
        fetchPrice(commodity);
      }, 5 * 60 * 1000); // 5 minutes

      return () => clearInterval(interval);
    }
  }, [autoRefresh, commodity, quote]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className="border-2 border-yellow-400 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-yellow-400 to-green-500 text-white">
        <CardTitle className="flex items-center gap-2 text-2xl">
          🌍 Global Commodity Price Tracker
        </CardTitle>
        <p className="text-white/90 text-sm">
          Get real-time prices from international markets
        </p>
      </CardHeader>
      
      <CardContent className="p-6 space-y-6">
        {/* Search Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Enter commodity (e.g., corn, wheat, rice)"
              value={commodity}
              onChange={(e) => setCommodity(e.target.value)}
              className="flex-1 border-yellow-400 focus:border-green-500 focus:ring-green-500"
            />
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-gradient-to-r from-yellow-400 to-green-500 hover:from-yellow-500 hover:to-green-600 text-white font-bold px-6"
            >
              {loading ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Loading...
                </>
              ) : (
                <>
                  🔍 Search
                </>
              )}
            </Button>
          </div>

          {/* Quick Select Buttons */}
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-gray-600 mr-2">Quick select:</span>
            {POPULAR_COMMODITIES.map((item) => (
              <Badge
                key={item.value}
                variant="outline"
                className="cursor-pointer hover:bg-yellow-100 border-yellow-400 transition-colors"
                onClick={() => handleQuickSelect(item.value)}
              >
                {item.icon} {item.name}
              </Badge>
            ))}
          </div>
        </form>

        {/* Error Message */}
        {error && (
          <Alert variant="destructive" className="border-red-400">
            <AlertDescription className="flex items-center gap-2">
              ⚠️ {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Price Display */}
        {quote && !error && (
          <div className="space-y-4 animate-in fade-in duration-500">
            {/* Main Price Card */}
            <div className="bg-gradient-to-br from-yellow-50 to-green-50 p-6 rounded-lg border-2 border-yellow-400">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 capitalize">
                    {commodity}
                  </h3>
                  <p className="text-sm text-gray-600">Symbol: {quote.symbol}</p>
                </div>
                <Badge 
                  className={`text-lg px-3 py-1 ${
                    quote.change >= 0 
                      ? 'bg-green-500 hover:bg-green-600' 
                      : 'bg-red-500 hover:bg-red-600'
                  }`}
                >
                  {quote.change >= 0 ? '▲' : '▼'} {Math.abs(quote.percentChange).toFixed(2)}%
                </Badge>
              </div>

              <div className="text-5xl font-bold text-gray-900 mb-2">
                {formatPrice(quote.price)}
              </div>

              <div className={`text-lg font-semibold ${
                quote.change >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {quote.change >= 0 ? '+' : ''}{formatPrice(quote.change)} today
              </div>
            </div>

            {/* Price Details Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <p className="text-xs text-gray-500 mb-1">Open</p>
                <p className="text-lg font-bold text-gray-800">
                  {formatPrice(quote.open)}
                </p>
              </div>

              <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <p className="text-xs text-gray-500 mb-1">High</p>
                <p className="text-lg font-bold text-green-600">
                  {formatPrice(quote.high)}
                </p>
              </div>

              <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <p className="text-xs text-gray-500 mb-1">Low</p>
                <p className="text-lg font-bold text-red-600">
                  {formatPrice(quote.low)}
                </p>
              </div>

              <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <p className="text-xs text-gray-500 mb-1">Volume</p>
                <p className="text-lg font-bold text-gray-800">
                  {quote.volume.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Footer Info */}
            <div className="flex items-center justify-between text-sm text-gray-600 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2">
                <span>🕐 Last updated: {formatTimestamp(quote.timestamp)}</span>
              </div>
              
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="rounded border-yellow-400 text-green-500 focus:ring-green-500"
                />
                <span>Auto-refresh (5 min)</span>
              </label>
            </div>

            {/* Market Insight */}
            <Alert className="border-green-400 bg-green-50">
              <AlertDescription className="text-sm">
                <strong>💡 Market Insight:</strong>{' '}
                {quote.percentChange > 5 ? (
                  <>Strong upward momentum! Price up {quote.percentChange.toFixed(2)}% today. Consider holding for better prices.</>
                ) : quote.percentChange < -5 ? (
                  <>Significant drop of {Math.abs(quote.percentChange).toFixed(2)}% today. Market may be volatile.</>
                ) : quote.percentChange > 0 ? (
                  <>Modest gains of {quote.percentChange.toFixed(2)}% today. Market showing positive sentiment.</>
                ) : quote.percentChange < 0 ? (
                  <>Slight decline of {Math.abs(quote.percentChange).toFixed(2)}% today. Monitor closely.</>
                ) : (
                  <>Price stable with minimal change. Good time to evaluate your position.</>
                )}
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Empty State */}
        {!quote && !error && !loading && (
          <div className="text-center py-12 text-gray-500">
            <div className="text-6xl mb-4">🌾</div>
            <p className="text-lg font-semibold mb-2">Search for a commodity</p>
            <p className="text-sm">
              Enter a commodity name above or click a quick select button to see global prices
            </p>
          </div>
        )}

        {/* Info Box */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 text-sm">
          <p className="font-semibold text-blue-900 mb-2">ℹ️ About Global Prices</p>
          <ul className="text-blue-800 space-y-1">
            <li>• Prices from international commodity exchanges (CBOT, NYBOT)</li>
            <li>• Data updated with 15-minute delay (free tier)</li>
            <li>• USD prices - compare with local KSH rates</li>
            <li>• Use this to time your sales for maximum profit</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
