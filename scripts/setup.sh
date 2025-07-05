#!/bin/bash

# Tailscale Network Dashboard Setup Script

echo "🔗 Tailscale Network Dashboard Setup"
echo "======================================"

# Check if .env exists
if [ ! -f .env ]; then
    echo "📄 Creating .env file from template..."
    cp .env.example .env
    echo "✅ Created .env file"
    echo ""
    echo "⚠️  IMPORTANT: Edit .env file with your Tailscale credentials:"
    echo "   - TAILSCALE_API_KEY: Get from https://login.tailscale.com/admin/settings/keys"
    echo "   - TAILSCALE_TAILNET: Your tailnet name (usually your organization)"
    echo ""
else
    echo "✅ .env file already exists"
fi

# Check Node.js version
NODE_VERSION=$(node --version 2>/dev/null || echo "not installed")
if [[ $NODE_VERSION == "not installed" ]]; then
    echo "❌ Node.js not found. Please install Node.js 20 or higher."
    exit 1
elif [[ ! $NODE_VERSION =~ v(20|21|22) ]]; then
    echo "⚠️  Node.js version: $NODE_VERSION"
    echo "   Recommended: Node.js 20 or higher"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo ""
echo "🚀 Setup complete! Next steps:"
echo ""
echo "1. Edit .env file with your Tailscale API credentials:"
echo "   nano .env"
echo ""
echo "2. Start the development server:"
echo "   npm run dev"
echo ""
echo "3. Open your browser and visit:"
echo "   http://localhost:5000"
echo ""
echo "📖 For detailed setup instructions, see README.md"