#!/bin/bash
set -euo pipefail
IFS=$'\n\t'

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Banner
echo -e "${GREEN}"
echo "╔═══════════════════════════════════════╗"
echo "║   🌱 Stay Fresh Mobile Build Tool    ║"
echo "║      Capacitor Android Builder        ║"
echo "╚═══════════════════════════════════════╝"
echo -e "${NC}"

# Parse command line arguments
RECREATE=0
CLEAN=0
RELEASE=0

while [[ $# -gt 0 ]]; do
  case $1 in
    --recreate)
      RECREATE=1
      echo -e "${YELLOW}⚠️  --recreate flag: Will remove and recreate android folder${NC}"
      shift
      ;;
    --clean)
      CLEAN=1
      echo -e "${YELLOW}🧹 --clean flag: Will clean build cache${NC}"
      shift
      ;;
    --release)
      RELEASE=1
      echo -e "${BLUE}📦 --release flag: Building release APK${NC}"
      shift
      ;;
    *)
      echo -e "${RED}❌ Unknown option: $1${NC}"
      echo "Usage: $0 [--recreate] [--clean] [--release]"
      exit 1
      ;;
  esac
done

# Check required tools
echo -e "${BLUE}🔍 Checking required tools...${NC}"

if ! command -v node &> /dev/null; then
  echo -e "${RED}❌ Node.js is not installed${NC}"
  exit 1
fi
echo -e "${GREEN}✓ Node.js: $(node --version)${NC}"

if ! command -v npm &> /dev/null; then
  echo -e "${RED}❌ npm is not installed${NC}"
  exit 1
fi
echo -e "${GREEN}✓ npm: $(npm --version)${NC}"

if ! command -v npx &> /dev/null; then
  echo -e "${RED}❌ npx is not installed${NC}"
  exit 1
fi
echo -e "${GREEN}✓ npx available${NC}"

# Check for Java (required for Android builds)
if ! command -v java &> /dev/null; then
  echo -e "${RED}❌ Java is not installed${NC}"
  echo "Please install Java JDK 11 or higher"
  exit 1
fi
echo -e "${GREEN}✓ Java: $(java -version 2>&1 | head -n 1)${NC}"

# Check for Android SDK
if [ -z "${ANDROID_HOME:-}" ] && [ -z "${ANDROID_SDK_ROOT:-}" ]; then
  echo -e "${YELLOW}⚠️  ANDROID_HOME or ANDROID_SDK_ROOT not set${NC}"
  echo "Android SDK may not be properly configured"
fi

# Optional: Check for uncommitted changes
if command -v git &> /dev/null && [ -d .git ]; then
  if [ -n "$(git status --porcelain 2>/dev/null)" ]; then
    echo -e "${YELLOW}⚠️  You have uncommitted changes.${NC}"
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
      echo -e "${RED}❌ Build cancelled. Please commit your changes first.${NC}"
      exit 1
    fi
  fi
fi

# Clean build cache if requested
if [ "$CLEAN" -eq 1 ]; then
  echo -e "${BLUE}🧹 Cleaning build cache...${NC}"
  rm -rf .next
  rm -rf node_modules/.cache
  rm -rf android/app/build
  echo -e "${GREEN}✓ Cache cleaned${NC}"
fi

# Handle android folder
if [ "$RECREATE" -eq 1 ]; then
  echo -e "${BLUE}🗑 Removing existing Android folder...${NC}"
  rm -rf android
  echo -e "${BLUE}➕ Adding Android platform...${NC}"
  npx cap add android
  echo -e "${GREEN}✓ Android platform added${NC}"
elif [ -d "android" ]; then
  echo -e "${GREEN}📁 android folder exists — preserving native changes${NC}"
else
  echo -e "${BLUE}➕ Adding Android platform (first time)...${NC}"
  npx cap add android
  echo -e "${GREEN}✓ Android platform added${NC}"
fi

# Check if Capacitor is installed
if [ ! -f "node_modules/@capacitor/core/package.json" ]; then
  echo -e "${YELLOW}⚠️  Capacitor not found in node_modules${NC}"
  echo -e "${BLUE}📦 Installing Capacitor...${NC}"
  npm install @capacitor/core @capacitor/cli @capacitor/android
fi

# Install dependencies
echo -e "${BLUE}📦 Installing dependencies...${NC}"
npm install

# Build Next.js app
echo -e "${BLUE}🛠 Building Next.js application...${NC}"
npm run build

if [ ! -d "out" ]; then
  echo -e "${RED}❌ Build failed - 'out' directory not found${NC}"
  echo "Make sure your package.json has: \"build\": \"next build\""
  echo "And next.config.js has: output: 'export'"
  exit 1
fi

echo -e "${GREEN}✓ Next.js build complete${NC}"

# Update Capacitor configuration
echo -e "${BLUE}🔧 Updating Capacitor configuration...${NC}"

# Check if capacitor.config.ts or capacitor.config.json exists
if [ -f "capacitor.config.ts" ] || [ -f "capacitor.config.json" ]; then
  echo -e "${GREEN}✓ Capacitor config found${NC}"
else
  echo -e "${YELLOW}⚠️  Capacitor config not found, creating one...${NC}"
  npx cap init "Stay Fresh" "com.stayfresh.app"
fi

# Sync with Capacitor
echo -e "${BLUE}🔄 Syncing with Capacitor...${NC}"
npx cap copy android
npx cap sync android
echo -e "${GREEN}✓ Capacitor sync complete${NC}"

# Build APK
echo -e "${BLUE}📱 Building Android APK...${NC}"

# Make gradlew executable
if [ -f "./android/gradlew" ]; then
  chmod +x ./android/gradlew
fi

# Determine build type
if [ "$RELEASE" -eq 1 ]; then
  BUILD_TYPE="Release"
  GRADLE_TASK="assembleRelease"
  APK_PATH="android/app/build/outputs/apk/release/app-release-unsigned.apk"
else
  BUILD_TYPE="Debug"
  GRADLE_TASK="assembleDebug"
  APK_PATH="android/app/build/outputs/apk/debug/app-debug.apk"
fi

echo -e "${BLUE}Building $BUILD_TYPE APK...${NC}"

if [ -x "./android/gradlew" ]; then
  (cd android && ./gradlew $GRADLE_TASK)
elif [ -x "./android/gradlew.bat" ]; then
  (cd android && ./gradlew.bat $GRADLE_TASK)
else
  echo -e "${RED}⚠️  gradlew not found or not executable. Attempting to fix...${NC}"
  chmod +x ./android/gradlew 2>/dev/null || true
  (cd android && ./gradlew $GRADLE_TASK)
fi

# Check if APK was created
if [ ! -f "$APK_PATH" ]; then
  echo -e "${RED}❌ APK build failed - file not found at: $APK_PATH${NC}"
  exit 1
fi

# Success message
echo ""
echo -e "${GREEN}╔═══════════════════════════════════════╗${NC}"
echo -e "${GREEN}║    ✅ Build Finished Successfully!    ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}📦 Your APK is located at:${NC}"
echo -e "${GREEN}   $APK_PATH${NC}"
echo ""

# Get APK size
APK_SIZE=$(du -h "$APK_PATH" | cut -f1)
echo -e "${BLUE}📏 APK Size: ${GREEN}$APK_SIZE${NC}"
echo ""

# Installation instructions
echo -e "${YELLOW}💡 Installation Instructions:${NC}"
echo ""
echo -e "${BLUE}1. Install via USB:${NC}"
echo "   adb install $APK_PATH"
echo ""
echo -e "${BLUE}2. Install via wireless debugging:${NC}"
echo "   adb connect <device-ip>:5555"
echo "   adb install $APK_PATH"
echo ""
echo -e "${BLUE}3. Copy APK to device:${NC}"
echo "   adb push $APK_PATH /sdcard/Download/"
echo "   (Then install from device file manager)"
echo ""

# Check if device is connected
if command -v adb &> /dev/null; then
  DEVICES=$(adb devices | grep -v "List of devices" | grep device | wc -l)
  if [ "$DEVICES" -gt 0 ]; then
    echo -e "${GREEN}✓ $DEVICES Android device(s) detected${NC}"
    echo -e "${YELLOW}Install now? (y/N):${NC} "
    read -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
      echo -e "${BLUE}📲 Installing APK...${NC}"
      adb install -r "$APK_PATH"
      echo -e "${GREEN}✓ Installation complete!${NC}"
    fi
  else
    echo -e "${YELLOW}⚠️  No Android devices detected${NC}"
    echo "Connect a device and enable USB debugging to install"
  fi
fi

# Open Android Studio option
echo ""
echo -e "${BLUE}🚀 Open in Android Studio? (y/N):${NC} "
read -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  if command -v studio &> /dev/null; then
    studio android/
  elif [ -f "/opt/android-studio/bin/studio.sh" ]; then
    /opt/android-studio/bin/studio.sh android/
  else
    echo -e "${YELLOW}⚠️  Android Studio not found in PATH${NC}"
    echo "Please open manually: android/ folder"
  fi
fi

echo ""
echo -e "${GREEN}🎉 Thank you for using Stay Fresh Build Tool!${NC}"
