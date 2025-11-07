#!/bin/bash

# Stay Fresh - Android Environment Setup
echo "🔧 Setting up Android environment variables..."

# Detect shell
SHELL_RC=""
if [ -n "$ZSH_VERSION" ]; then
    SHELL_RC="$HOME/.zshrc"
elif [ -n "$BASH_VERSION" ]; then
    SHELL_RC="$HOME/.bashrc"
else
    echo "⚠️  Could not detect shell type"
    SHELL_RC="$HOME/.profile"
fi

# Android SDK path
ANDROID_SDK_PATH="$HOME/Android/Sdk"

# Check if SDK exists
if [ ! -d "$ANDROID_SDK_PATH" ]; then
    echo "❌ Android SDK not found at: $ANDROID_SDK_PATH"
    echo "Please install Android Studio and SDK first"
    exit 1
fi

echo "✓ Found Android SDK at: $ANDROID_SDK_PATH"

# Check if already configured
if grep -q "ANDROID_HOME" "$SHELL_RC" 2>/dev/null; then
    echo "⚠️  ANDROID_HOME already configured in $SHELL_RC"
    echo "Current configuration:"
    grep "ANDROID" "$SHELL_RC"
    echo ""
    read -p "Do you want to update it? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Skipping update"
        exit 0
    fi
    # Remove old configuration
    sed -i '/ANDROID_HOME/d' "$SHELL_RC"
    sed -i '/ANDROID_SDK_ROOT/d' "$SHELL_RC"
fi

# Add Android environment variables
echo "" >> "$SHELL_RC"
echo "# Android SDK Configuration (Added by Stay Fresh)" >> "$SHELL_RC"
echo "export ANDROID_HOME=\$HOME/Android/Sdk" >> "$SHELL_RC"
echo "export ANDROID_SDK_ROOT=\$HOME/Android/Sdk" >> "$SHELL_RC"
echo "export PATH=\$PATH:\$ANDROID_HOME/emulator" >> "$SHELL_RC"
echo "export PATH=\$PATH:\$ANDROID_HOME/platform-tools" >> "$SHELL_RC"
echo "export PATH=\$PATH:\$ANDROID_HOME/tools" >> "$SHELL_RC"
echo "export PATH=\$PATH:\$ANDROID_HOME/tools/bin" >> "$SHELL_RC"

echo ""
echo "✅ Android environment configured in: $SHELL_RC"
echo ""
echo "🔄 To apply changes, run:"
echo "   source $SHELL_RC"
echo ""
echo "Or simply close and reopen your terminal"
echo ""

# Apply to current session
export ANDROID_HOME=$HOME/Android/Sdk
export ANDROID_SDK_ROOT=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin

echo "✓ Environment variables set for current session"
echo ""
echo "Verification:"
echo "ANDROID_HOME: $ANDROID_HOME"
echo "ANDROID_SDK_ROOT: $ANDROID_SDK_ROOT"
echo ""

# Check adb
if command -v adb &> /dev/null; then
    echo "✓ adb is accessible: $(which adb)"
else
    echo "⚠️  adb not found in PATH yet. Restart terminal or run 'source $SHELL_RC'"
fi

echo ""
echo "🎉 Setup complete! You can now run: ./build-android.sh"
