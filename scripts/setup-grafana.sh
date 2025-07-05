#!/bin/bash

# Tailscale Network Dashboard + Grafana Setup Script

echo "📊 Tailscale Network Dashboard with Grafana Setup"
echo "=================================================="

# Check if Docker is available
if ! command -v docker &> /dev/null; then
    echo "❌ Docker not found. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose not found. Please install Docker Compose first."
    exit 1
fi

# Create .env file for Grafana setup
if [ ! -f .env.grafana ]; then
    echo "📄 Creating .env.grafana file from template..."
    cp .env.grafana.example .env.grafana
    echo "✅ Created .env.grafana file"
    echo ""
    echo "⚠️  IMPORTANT: Edit .env.grafana file with your credentials:"
    echo "   - TAILSCALE_API_KEY: Get from https://login.tailscale.com/admin/settings/keys"
    echo "   - TAILSCALE_TAILNET: Your tailnet name"
    echo "   - INFLUXDB_TOKEN: Generate a secure token"
    echo "   - GRAFANA_PASSWORD: Set a secure password"
    echo ""
    echo "Press Enter to continue after editing .env.grafana..."
    read -r
else
    echo "✅ .env.grafana file already exists"
fi

# Create required directories
echo "📁 Creating directories..."
mkdir -p grafana/{provisioning/{datasources,dashboards},dashboards}
mkdir -p prometheus
mkdir -p data

# Set proper permissions
echo "🔐 Setting permissions..."
sudo chown -R 472:472 grafana/
sudo chown -R 65534:65534 prometheus/

# Build and start services
echo "🚀 Building and starting services..."
docker-compose -f docker-compose.grafana.yml up -d

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Services started successfully!"
    echo ""
    echo "🌐 Access your services:"
    echo "   • Tailscale Dashboard: http://localhost:5000"
    echo "   • Grafana: http://localhost:3000 (admin/your_password)"
    echo "   • InfluxDB: http://localhost:8086"
    echo "   • Prometheus: http://localhost:9090"
    echo ""
    echo "📊 Grafana Setup:"
    echo "   1. Login to Grafana at http://localhost:3000"
    echo "   2. Datasources are pre-configured (InfluxDB & Prometheus)"
    echo "   3. Dashboard is automatically imported"
    echo "   4. Metrics are available at http://localhost:5000/metrics"
    echo ""
    echo "🔄 To stop services: docker-compose -f docker-compose.grafana.yml down"
    echo "🗑️  To remove everything: docker-compose -f docker-compose.grafana.yml down -v"
else
    echo "❌ Failed to start services. Check Docker logs:"
    echo "   docker-compose -f docker-compose.grafana.yml logs"
    exit 1
fi