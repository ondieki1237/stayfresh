# 🚀 Quick Build Guide - Stay Fresh Mobile

## 📋 Prerequisites Checklist

- [ ] Node.js 18+ installed
- [ ] Java JDK 11+ installed
- [ ] Android Studio with SDK installed
- [ ] `ANDROID_HOME` environment variable set
- [ ] USB debugging enabled on Android device (optional)

## 🏁 First Time Setup

```bash
# 1. Install Capacitor
npm run cap:setup

# OR manually:
npm install @capacitor/core @capacitor/cli @capacitor/android
```

## 🔨 Build Commands

```bash
# Debug build (quick testing)
./build-android.sh
# OR
npm run cap:build

# Clean build (if errors occur)
./build-android.sh --clean
# OR
npm run cap:build:clean

# Release build (production)
./build-android.sh --release
# OR
npm run cap:build:release

# Recreate Android folder
./build-android.sh --recreate
```

## 📱 Installation Commands

```bash
# Install via USB
npm run android:install

# View logs
npm run android:logs

# Open in Android Studio
npm run cap:open
```

## ⚡ Quick Workflow

```bash
# 1. Make code changes

# 2. Build & install in one go
./build-android.sh && npm run android:install

# 3. View logs
npm run android:logs
```

## 🎯 Output Location

Your APK will be at:
```
android/app/build/outputs/apk/debug/app-debug.apk
```

## 🆘 Common Issues

### Permission Denied
```bash
chmod +x build-android.sh
chmod +x setup-capacitor.sh
```

### ANDROID_HOME not found
```bash
# Linux/Mac
export ANDROID_HOME=$HOME/Android/Sdk

# Add to ~/.bashrc or ~/.zshrc to make permanent
```

### Gradle build fails
```bash
./build-android.sh --clean --recreate
```

### Device not detected
```bash
# Check devices
adb devices

# Restart adb
adb kill-server
adb start-server
```

## 📚 Full Documentation

See `BUILD_ANDROID.md` for complete instructions.

---

**Happy Building!** 🌱
