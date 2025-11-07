# Stay Fresh Mobile App - Build Instructions

## 🚀 Quick Start

### Prerequisites

1. **Node.js & npm** (v18 or higher)
   ```bash
   node --version
   npm --version
   ```

2. **Java JDK** (11 or higher)
   ```bash
   java -version
   ```

3. **Android Studio** with Android SDK
   - Download from: https://developer.android.com/studio
   - Install Android SDK Platform 33 or higher
   - Set `ANDROID_HOME` environment variable

4. **Capacitor Dependencies**
   ```bash
   npm install @capacitor/core @capacitor/cli @capacitor/android
   ```

## 📱 Building the APK

### Option 1: Using the Build Script (Recommended)

```bash
# Basic build (debug APK)
./build-android.sh

# Clean build (removes cache)
./build-android.sh --clean

# Recreate Android folder
./build-android.sh --recreate

# Build release APK
./build-android.sh --release

# Combine options
./build-android.sh --clean --recreate
```

### Option 2: Manual Build

```bash
# 1. Install dependencies
npm install

# 2. Build Next.js app
npm run build

# 3. Add Android platform (first time only)
npx cap add android

# 4. Sync web assets to Android
npx cap copy android
npx cap sync android

# 5. Build APK
cd android
./gradlew assembleDebug
```

## 📦 Output Locations

- **Debug APK:** `android/app/build/outputs/apk/debug/app-debug.apk`
- **Release APK:** `android/app/build/outputs/apk/release/app-release-unsigned.apk`

## 📲 Installing the APK

### Via USB

```bash
# Enable USB debugging on your device
# Connect device via USB

# Check if device is detected
adb devices

# Install APK
adb install android/app/build/outputs/apk/debug/app-debug.apk

# Or use -r flag to reinstall
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

### Via Wireless Debugging (Android 11+)

```bash
# 1. Enable wireless debugging on device
# 2. Connect to same WiFi network
# 3. Pair device (first time only)
adb pair <ip>:<port>

# 4. Connect
adb connect <ip>:5555

# 5. Install
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

### Via File Transfer

```bash
# Copy APK to device
adb push android/app/build/outputs/apk/debug/app-debug.apk /sdcard/Download/

# Then install from device's file manager
```

## 🔧 Environment Setup

### Linux/Mac

Add to `~/.bashrc` or `~/.zshrc`:

```bash
# Android SDK
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin

# Java (adjust path as needed)
export JAVA_HOME=/usr/lib/jvm/java-11-openjdk-amd64
export PATH=$PATH:$JAVA_HOME/bin
```

### Windows

```powershell
# Set environment variables via System Properties > Environment Variables
ANDROID_HOME=C:\Users\<username>\AppData\Local\Android\Sdk
JAVA_HOME=C:\Program Files\Java\jdk-11

# Add to PATH:
%ANDROID_HOME%\platform-tools
%ANDROID_HOME%\tools
%JAVA_HOME%\bin
```

## 🎨 Customization

### App Icon

1. Create icon at `android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png`
2. Or use: https://icon.kitchen/

### Splash Screen

1. Create splash at `android/app/src/main/res/drawable/splash.png`
2. Configure in `capacitor.config.ts`

### App Name

Edit `android/app/src/main/res/values/strings.xml`:
```xml
<string name="app_name">Stay Fresh</string>
```

### Package Name

Edit `capacitor.config.ts`:
```typescript
appId: 'com.stayfresh.app'
```

## 🐛 Troubleshooting

### "gradlew: Permission denied"

```bash
chmod +x android/gradlew
```

### "ANDROID_HOME not set"

```bash
export ANDROID_HOME=$HOME/Android/Sdk
```

### "Java version not supported"

Install Java JDK 11:
```bash
# Ubuntu/Debian
sudo apt install openjdk-11-jdk

# macOS
brew install openjdk@11
```

### "SDK location not found"

Create `android/local.properties`:
```properties
sdk.dir=/home/username/Android/Sdk
```

### Build fails with "out of memory"

Edit `android/gradle.properties`:
```properties
org.gradle.jvmargs=-Xmx4096m -XX:MaxPermSize=1024m
```

### Port 5000 conflicts

The app expects backend at `http://localhost:5000`. Update API URLs in:
- `components/` files
- Environment variables

## 🔐 Release Build

### Generate Keystore

```bash
keytool -genkey -v -keystore stay-fresh.keystore \
  -alias stay-fresh -keyalg RSA -keysize 2048 -validity 10000
```

### Configure Signing

Edit `android/app/build.gradle`:

```gradle
android {
    signingConfigs {
        release {
            storeFile file("../../stay-fresh.keystore")
            storePassword "your-password"
            keyAlias "stay-fresh"
            keyPassword "your-password"
        }
    }
    
    buildTypes {
        release {
            signingConfig signingConfigs.release
        }
    }
}
```

### Build Release APK

```bash
./build-android.sh --release
```

## 📊 Build Script Options

| Option | Description |
|--------|-------------|
| `--recreate` | Remove and recreate android folder |
| `--clean` | Clean build cache and node_modules/.cache |
| `--release` | Build release APK instead of debug |

## 🚀 Development Workflow

```bash
# 1. Make changes to code

# 2. Test in browser
npm run dev

# 3. Build and sync to Android
npm run build
npx cap sync android

# 4. Open in Android Studio (optional)
npx cap open android

# 5. Or build APK directly
./build-android.sh
```

## 📱 Testing on Emulator

```bash
# List available emulators
emulator -list-avds

# Start emulator
emulator -avd <emulator-name>

# Install APK
adb install android/app/build/outputs/apk/debug/app-debug.apk

# View logs
adb logcat | grep "Stay Fresh"
```

## 🌐 API Configuration

The app connects to backend at `http://localhost:5000`. For production:

1. Update API URLs in components
2. Or use environment variables:

```typescript
// lib/api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
```

Build with:
```bash
NEXT_PUBLIC_API_URL=https://api.stayfresh.com npm run build
```

## 📚 Additional Resources

- [Capacitor Docs](https://capacitorjs.com/docs)
- [Android Studio Guide](https://developer.android.com/studio/intro)
- [Next.js Static Export](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)

## 🆘 Support

For issues or questions:
- Email: tech@stayfresh.com
- GitHub: https://github.com/ondieki1237/stayfresh
- Documentation: https://docs.stayfresh.com

---

**Built with ❤️ by Stay Fresh Team** 🌱
