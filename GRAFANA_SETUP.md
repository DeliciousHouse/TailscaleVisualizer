# Tailscale Network Dashboard with Grafana Integration

## Overview

This setup provides a complete monitoring stack for your Tailscale network with real-time visualization and historical data analysis.

## Architecture Components

### Core Services

- **Tailscale Dashboard** (Port 5000): Real-time network topology visualization
- **Grafana** (Port 3000): Advanced dashboards and alerting
- **InfluxDB** (Port 8086): Time-series database for metrics storage
- **Prometheus** (Port 9090): Alternative metrics collection system

### Data Flow

1. Dashboard collects live data from Tailscale API
2. Metrics endpoint (`/metrics`) exports data in Prometheus format
3. InfluxDB/Prometheus scrapes metrics every 30 seconds
4. Grafana visualizes historical trends and current status

## Setup Options

### Option 1: Simple Dashboard Only

```bash
# Basic setup - no database required
npm install
npm run dev
```

**Use case**: Real-time monitoring, development, small networks

### Option 2: Full Grafana Stack

```bash
# Complete monitoring setup
./scripts/setup-grafana.sh
```

**Use case**: Production monitoring, historical analysis, alerting

## Dependencies Required

### Minimal Setup (Option 1)

- Node.js 20+
- npm/yarn
- Environment variables: `TAILSCALE_API_KEY`, `TAILSCALE_TAILNET`

### Full Stack (Option 2)

- Docker & Docker Compose
- 2GB+ RAM (for InfluxDB/Grafana)
- 5GB+ disk space (for time-series data)

## Environment Configuration

### Basic Setup (.env)

```env
TAILSCALE_API_KEY=your_api_key_here
TAILSCALE_TAILNET=your_tailnet_name
```

### Full Stack (.env.grafana)

```env
# Tailscale Configuration
TAILSCALE_API_KEY=your_api_key_here
TAILSCALE_TAILNET=your_tailnet_name

# InfluxDB Configuration
INFLUXDB_USERNAME=admin
INFLUXDB_PASSWORD=secure_password_here
INFLUXDB_ORG=tailscale-monitoring
INFLUXDB_BUCKET=tailscale-metrics
INFLUXDB_TOKEN=your_secure_token_here

# Grafana Configuration
GRAFANA_PASSWORD=your_grafana_password
```

## Docker Bind Mounts vs Database

### Bind Mounts (Sufficient for most use cases)

```yaml
volumes:
  - ./data:/app/data # Application data
  - influxdb_data:/var/lib/influxdb2 # Time-series data
  - grafana_data:/var/lib/grafana # Grafana config
```

**Benefits:**

- No external database needed
- Easy backup (just copy directories)
- Simple deployment
- Fast setup

### When you need a separate database

- **High availability**: Multiple dashboard instances
- **Complex queries**: Advanced analytics across multiple sources
- **Compliance**: Separate data storage requirements
- **Scale**: 100+ devices with high-frequency updates

## Available Metrics

The dashboard exports these metrics for Grafana:

### Network Overview

- `tailscale_total_devices`: Total devices in network
- `tailscale_online_devices`: Currently online devices
- `tailscale_offline_devices`: Currently offline devices
- `tailscale_unstable_devices`: Devices with connection issues

### Device Details

- `tailscale_device_info`: Device metadata with labels (name, hostname, type, OS, status)

### Connection Statistics

- Device type distribution
- OS distribution
- Status changes over time

## Grafana Dashboard Features

### Pre-configured Panels

1. **Network Overview**: Real-time device counts
2. **Status Distribution**: Pie chart of device states
3. **Timeline**: Historical status changes
4. **Device Table**: Detailed device information

### Alerting Rules

- Device goes offline
- Network partition detected
- New device connects
- High device churn rate

## Deployment Strategies

### Development

```bash
# Run locally with sample data
npm run dev
```

### Production (Docker)

```bash
# Full stack with persistence
docker-compose -f docker-compose.grafana.yml up -d
```

### Cloud (Replit)

```bash
# Set secrets in Replit environment
# Use the basic setup (Option 1)
```

## Data Persistence

### What gets stored:

- **InfluxDB**: Time-series metrics (device status over time)
- **Grafana**: Dashboard configurations, user settings
- **Application**: Current network state (in-memory)

### Backup strategy:

```bash
# Backup InfluxDB data
docker exec influxdb influx backup /backup
docker cp influxdb:/backup ./backup-$(date +%Y%m%d)

# Backup Grafana
docker exec grafana tar czf /tmp/grafana-backup.tar.gz /var/lib/grafana
docker cp grafana:/tmp/grafana-backup.tar.gz ./grafana-backup-$(date +%Y%m%d).tar.gz
```

## Monitoring Recommendations

### For Small Networks (1-20 devices)

- Use basic dashboard (Option 1)
- Bind mounts are sufficient
- Check logs occasionally

### For Medium Networks (20-100 devices)

- Use full Grafana stack (Option 2)
- Set up basic alerting
- Monitor metrics every 30 seconds

### For Large Networks (100+ devices)

- Consider separate database
- Implement advanced alerting
- Use Prometheus for better scalability
- Monitor metrics every 15 seconds

## Troubleshooting

### Common Issues

1. **Metrics not appearing**: Check `/metrics` endpoint
2. **Grafana connection failed**: Verify InfluxDB is running
3. **No data in dashboards**: Check Tailscale API credentials
4. **High memory usage**: Reduce metrics retention period

### Debug Commands

```bash
# Check metrics endpoint
curl http://localhost:5000/metrics

# Check container logs
docker-compose -f docker-compose.grafana.yml logs

# Verify services
docker-compose -f docker-compose.grafana.yml ps
```

## Security Notes

- Store API keys securely (use Docker secrets in production)
- Use strong passwords for Grafana and InfluxDB
- Consider reverse proxy with SSL for external access
- Regularly update container images
