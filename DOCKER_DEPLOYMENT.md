# Docker-First Tailscale Network Dashboard

## Quick Start

```bash
# 1. Start the dashboard
./docker-start.sh

# 2. Access at http://localhost:6000
```

## Docker-First Architecture

This application is designed to run in Docker containers with minimal setup:

- **Port 6000**: Main dashboard and API
- **Automatic fallback**: Demo mode when no API credentials provided
- **Production ready**: Optimized Docker builds with proper health checks

## Basic Setup

### Option 1: Simple Dashboard
```bash
# Copy environment template
cp .env.example .env

# Edit with your Tailscale credentials (optional)
nano .env

# Start with Docker
./docker-start.sh
```

### Option 2: Full Monitoring Stack
```bash
# Copy Grafana environment template
cp .env.grafana.example .env.grafana

# Edit with all credentials
nano .env.grafana

# Start full stack
docker-compose -f docker-compose.grafana.yml up -d
```

## Environment Variables

### Required for Real Data
```env
TAILSCALE_API_KEY=your_api_key_here
TAILSCALE_TAILNET=your_tailnet_name
```

### Optional for Full Stack
```env
# Database settings
INFLUXDB_TOKEN=your_secure_token
GRAFANA_PASSWORD=your_secure_password
```

## Access Points

- **Dashboard**: http://localhost:6000
- **API**: http://localhost:6000/api/network/topology
- **Metrics**: http://localhost:6000/metrics
- **Grafana**: http://localhost:3000 (if using full stack)

## Docker Commands

### Basic Operations
```bash
# Start dashboard
docker-compose up -d

# Stop dashboard
docker-compose down

# View logs
docker-compose logs -f

# Restart
docker-compose restart

# Rebuild
docker-compose build --no-cache
```

### Full Stack Operations
```bash
# Start full monitoring stack
docker-compose -f docker-compose.grafana.yml up -d

# Stop full stack
docker-compose -f docker-compose.grafana.yml down

# Stop and remove volumes
docker-compose -f docker-compose.grafana.yml down -v
```

## Production Deployment

### Single Container
```bash
# Build production image
docker build -t tailscale-dashboard .

# Run with environment variables
docker run -d \
  -p 6000:6000 \
  -e TAILSCALE_API_KEY=your_key \
  -e TAILSCALE_TAILNET=your_tailnet \
  tailscale-dashboard
```

### Full Stack
```bash
# Production deployment
docker-compose -f docker-compose.grafana.yml up -d
```

## Data Persistence

### Application Data
- Uses in-memory storage by default
- No external database required
- Syncs with Tailscale API in real-time

### Monitoring Data
- **InfluxDB**: Time-series metrics stored in Docker volumes
- **Grafana**: Dashboard configurations in Docker volumes
- **Prometheus**: Metrics data in Docker volumes

## Networking

### Port Configuration
- **6000**: Main application (dashboard + API)
- **3000**: Grafana (optional)
- **8086**: InfluxDB (optional)
- **9090**: Prometheus (optional)

### Container Communication
- Internal Docker network for service communication
- Prometheus scrapes metrics from dashboard on port 6000
- InfluxDB receives data from dashboard
- Grafana connects to both InfluxDB and Prometheus

## Health Checks

The application includes built-in health monitoring:
- **API Health**: `/api/network/topology` returns 200 OK
- **Metrics Health**: `/metrics` returns Prometheus format
- **WebSocket Health**: Real-time updates via WebSocket

## Troubleshooting

### Common Issues

1. **Port 6000 already in use**
   ```bash
   # Check what's using the port
   lsof -i :6000
   
   # Use different port
   docker-compose up -d -p 6001:6000
   ```

2. **API credentials not working**
   ```bash
   # Check logs
   docker-compose logs -f
   
   # Verify environment variables
   docker-compose exec app env | grep TAILSCALE
   ```

3. **Containers not starting**
   ```bash
   # Check Docker status
   docker-compose ps
   
   # View detailed logs
   docker-compose logs --details
   ```

### Log Monitoring
```bash
# Follow all logs
docker-compose logs -f

# Follow specific service
docker-compose logs -f tailscale-dashboard

# View last 50 lines
docker-compose logs --tail=50
```

## Resource Requirements

### Minimum (Basic Dashboard)
- **CPU**: 0.5 cores
- **Memory**: 512MB
- **Disk**: 1GB

### Recommended (Full Stack)
- **CPU**: 2 cores
- **Memory**: 2GB
- **Disk**: 5GB

## Security

### Best Practices
- Store API keys as Docker secrets in production
- Use environment files that aren't committed to git
- Regular container updates
- Network isolation for production deployments

### Docker Secrets (Production)
```bash
# Create secrets
echo "your_api_key" | docker secret create tailscale_api_key -

# Use in compose file
version: '3.8'
services:
  app:
    secrets:
      - tailscale_api_key
```

## Backup Strategy

### Application Backup
```bash
# Backup environment files
cp .env .env.backup
cp .env.grafana .env.grafana.backup
```

### Data Backup
```bash
# Backup Docker volumes
docker run --rm -v grafana_data:/data -v $(pwd):/backup alpine tar czf /backup/grafana-backup.tar.gz /data
```

## Scaling

### Horizontal Scaling
- Dashboard can run multiple instances behind load balancer
- Shared InfluxDB/Grafana for centralized monitoring
- WebSocket sticky sessions required

### Vertical Scaling
- Increase container resources in compose file
- Monitor CPU/memory usage with built-in metrics