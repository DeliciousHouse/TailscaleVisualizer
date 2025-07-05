# Git Override Instructions

## Quick Override (Recommended)

To override your upstream repository with the current code:

### Option 1: Using the provided script
```bash
./scripts/git-override.sh
```

### Option 2: Manual commands
```bash
# Initialize git repository
git init

# Add all files
git add .

# Create commit
git commit -m "Override: Tailscale Network Dashboard with full Grafana integration"

# Add your remote repository
git remote add origin https://github.com/username/your-repo.git

# Force push to override upstream
git push -f origin main
```

## What gets pushed

Your upstream repository will contain:

### Core Application
- Complete Tailscale network topology dashboard
- Real-time WebSocket updates
- Dark mode as default
- Responsive design with interactive SVG nodes

### Tailscale Integration
- Full API integration with authentication
- Live device status monitoring
- Network topology synchronization
- Demo mode fallback

### Grafana Monitoring Stack
- Complete Docker Compose setup
- InfluxDB time-series database
- Prometheus metrics collection
- Pre-configured Grafana dashboards
- Metrics endpoint at `/metrics`

### Deployment Options
- Development setup (`npm run dev`)
- Docker containerization
- Grafana integration stack
- Production-ready configurations

### Documentation
- Complete setup instructions
- API configuration guide
- Docker deployment guide
- Grafana integration documentation
- Troubleshooting guide

## Repository Structure

```
tailscale-dashboard/
├── client/                 # React frontend
├── server/                 # Node.js backend
├── shared/                 # TypeScript schemas
├── scripts/                # Setup scripts
├── grafana/                # Grafana configurations
├── prometheus/             # Prometheus config
├── docker-compose.yml      # Basic Docker setup
├── docker-compose.grafana.yml  # Full monitoring stack
├── Dockerfile              # Container build
└── docs/                   # Documentation
```

## After Override

Once you've pushed to your repository:

1. **Clone anywhere**: `git clone https://github.com/username/your-repo.git`
2. **Quick start**: `npm install && npm run dev`
3. **Full monitoring**: `./scripts/setup-grafana.sh`
4. **Deploy**: Use Docker Compose or Replit deploy

## Force Push Safety

The force push (`git push -f`) will:
- Replace all content in your upstream repository
- Make this code the authoritative source
- Remove any existing history
- Set main branch as the default

This is exactly what you want for overriding upstream content.

## Authentication

You may need to set up authentication:
- **GitHub**: Personal access token or SSH keys
- **GitLab**: Deploy tokens or SSH keys
- **Bitbucket**: App passwords or SSH keys

## Verification

After pushing, verify the override worked:
1. Visit your repository URL
2. Check that all files are present
3. Verify the commit message appears
4. Confirm the timestamp is recent