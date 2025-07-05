#!/bin/bash

# Docker-first startup script for Tailscale Network Dashboard

echo "🐳 Starting Tailscale Network Dashboard on port 6000"
echo "================================================="

# Check if Docker is available
if ! command -v docker &> /dev/null; then
    echo "❌ Docker not found. Please install Docker first."
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📄 Creating .env file from template..."
    cp .env.example .env
    echo "✅ Created .env file"
    echo ""
    echo "⚠️  Configure your .env file with Tailscale credentials:"
    echo "   - TAILSCALE_API_KEY: Get from https://login.tailscale.com/admin/settings/keys"
    echo "   - TAILSCALE_TAILNET: Your tailnet name"
    echo ""
    echo "📝 Without credentials, the app will run in demo mode with sample data"
    echo ""
fi

# Build and start the container
echo "🏗️  Building Docker image..."
docker-compose build

echo "🚀 Starting container..."
docker-compose up -d

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Dashboard is running!"
    echo "🌐 Access at: http://localhost:6000"
    echo "📊 Metrics at: http://localhost:6000/metrics"
    echo ""
    echo "📋 Commands:"
    echo "   Stop:     docker-compose down"
    echo "   Logs:     docker-compose logs -f"
    echo "   Restart:  docker-compose restart"
    echo "   Rebuild:  docker-compose build --no-cache"
else
    echo "❌ Failed to start container"
    exit 1
fi