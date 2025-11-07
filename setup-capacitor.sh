#!/bin/bash

# Stay Fresh - First Time Setup Script
echo "🌱 Stay Fresh - First Time Setup"
echo "=================================="
echo ""

# Install Capacitor
echo "📦 Installing Capacitor dependencies..."
npm install --save @capacitor/core @capacitor/cli @capacitor/android @capacitor/splash-screen

# Initialize Capacitor
echo "🔧 Initializing Capacitor..."
npx cap init "Stay Fresh" "com.stayfresh.app" --web-dir=out

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Run: ./build-android.sh"
echo "2. Or run: npm run build && npx cap add android"
echo ""
