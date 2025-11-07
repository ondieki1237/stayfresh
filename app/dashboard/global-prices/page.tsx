'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import GlobalPriceWidget from '@/components/market/global-price-widget';

export default function GlobalPricesPage() {
  const [farmer, setFarmer] = useState(null);

  useEffect(() => {
    const fetchFarmer = async () => {
      try {
        const token = localStorage.getItem('token');
        const farmerId = localStorage.getItem('farmerId');
        
        if (token && farmerId) {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || '/api'}/farmers/${farmerId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (response.ok) {
            const data = await response.json();
            setFarmer(data);
          }
        }
      } catch (error) {
        console.error('Failed to fetch farmer:', error);
      }
    };
    fetchFarmer();
  }, []);

  return (
    <DashboardLayout farmer={farmer}>
      <div className="min-h-screen bg-gray-50 p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="bg-gradient-to-r from-yellow-400 to-green-500 text-white p-8 rounded-lg shadow-lg">
            <h1 className="text-4xl font-bold mb-2">🌍 Global Market Prices</h1>
            <p className="text-white/90 text-lg">
              Track real-time commodity prices from international markets
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Global Price Widget */}
          <GlobalPriceWidget />

          {/* Additional Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Why This Matters */}
            <div className="bg-white p-6 rounded-lg border-2 border-yellow-400 shadow-md">
              <div className="text-3xl mb-3">💰</div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                Why Global Prices Matter
              </h3>
              <p className="text-sm text-gray-600">
                International commodity prices influence local markets. 
                When global prices rise, local prices often follow. 
                Use this to time your sales strategically.
              </p>
            </div>

            {/* How to Use */}
            <div className="bg-white p-6 rounded-lg border-2 border-green-500 shadow-md">
              <div className="text-3xl mb-3">📊</div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                How to Use This Data
              </h3>
              <p className="text-sm text-gray-600">
                1. Check global trends daily
                <br />
                2. Compare with local prices
                <br />
                3. Hold when prices are rising
                <br />
                4. Sell when you see peaks
              </p>
            </div>

            {/* Market Hours */}
            <div className="bg-white p-6 rounded-lg border-2 border-blue-400 shadow-md">
              <div className="text-3xl mb-3">🕐</div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                Market Information
              </h3>
              <p className="text-sm text-gray-600">
                Data from CBOT and NYBOT exchanges.
                Prices in USD with 15-minute delay.
                Markets open Mon-Fri during US trading hours.
              </p>
            </div>
          </div>

          {/* Tips Section */}
          <div className="bg-gradient-to-br from-green-50 to-yellow-50 p-6 rounded-lg border-2 border-green-400">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              💡 Pro Tips for Farmers
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
              <div className="flex gap-3">
                <span className="text-2xl">📈</span>
                <div>
                  <strong>Rising Prices:</strong> When you see global prices trending up 
                  by 5% or more, consider holding your produce for a few days to get 
                  better local prices.
                </div>
              </div>
              <div className="flex gap-3">
                <span className="text-2xl">📉</span>
                <div>
                  <strong>Falling Prices:</strong> If global prices drop significantly, 
                  local prices may follow. Sell quickly if you need to avoid losses.
                </div>
              </div>
              <div className="flex gap-3">
                <span className="text-2xl">🔄</span>
                <div>
                  <strong>Check Regularly:</strong> Enable auto-refresh or check prices 
                  daily. Market conditions change rapidly, especially during harvest seasons.
                </div>
              </div>
              <div className="flex gap-3">
                <span className="text-2xl">💹</span>
                <div>
                  <strong>Volume Matters:</strong> High trading volume indicates strong 
                  market activity. Low volume may mean prices are less reliable.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
