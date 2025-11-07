#!/bin/bash

echo "🚀 Stay Fresh - APK Builder"
echo "============================"
echo ""

# Set Android environment
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin
export PATH=$PATH:$ANDROID_HOME/build-tools/34.0.0

echo "✓ Android SDK: $ANDROID_HOME"
echo "✓ Java Version: $(java -version 2>&1 | head -n 1)"
echo "✓ Backend API: https://www.kisumu.codewithseth.co.ke/api"
echo ""

# Check if android folder exists
if [ ! -d "android" ]; then
    echo "❌ Android folder not found. Run setup first:"
    echo "   ./setup-capacitor.sh"
    exit 1
fi

# Step 1: Build Next.js app
echo "📦 Step 1: Building Next.js app..."
npm run build || { echo "❌ Build failed"; exit 1; }
echo "✓ Next.js build complete"
echo ""

# Step 2: Sync to Android
echo "🔄 Step 2: Syncing to Android..."
npx cap sync android || { echo "❌ Sync failed"; exit 1; }
echo "✓ Sync complete"
echo ""

# Step 3: Build APK
echo "🔨 Step 3: Building APK..."
cd android
chmod +x gradlew
./gradlew assembleDebug || { echo "❌ APK build failed"; exit 1; }
cd ..
echo "✓ APK build complete"
echo ""

# Find and display APK location
APK_PATH="android/app/build/outputs/apk/debug/app-debug.apk"
if [ -f "$APK_PATH" ]; then
    APK_SIZE=$(du -h "$APK_PATH" | cut -f1)
    echo "🎉 SUCCESS! APK built successfully"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "📱 APK Location: $APK_PATH"
    echo "📦 APK Size: $APK_SIZE"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "🚀 Next Steps:"
    echo "  1. Install on device: adb install -r $APK_PATH"
    echo "  2. Or copy to device and install manually"
    echo ""
else
    echo "❌ APK file not found at expected location"
    exit 1
fi
