# 🔐 Tailscale API Setup Guide

## The 403 Forbidden Error

You're seeing this error because your Tailscale API key doesn't have the required permissions:

```
Failed to sync with Tailscale API: Error: Tailscale API error: 403 Forbidden
```

## ✅ Quick Fix

### Step 1: Generate New API Key
1. Visit: https://login.tailscale.com/admin/settings/keys
2. Delete your current API key if it exists
3. Click "Generate API key"
4. **Important**: Select these exact scopes:
   - ✅ `devices:read` - Read device information
   - ✅ `devices:write` - Modify device settings
   - ✅ `network:read` - Read network topology

### Step 2: Update Environment Variables
Create or update your `.env` file:

```env
TAILSCALE_API_KEY=your_new_api_key_here
TAILSCALE_TAILNET=your_organization_name
```

**Finding your tailnet name:**
- It's your organization name in Tailscale
- Check the URL when logged into Tailscale: `https://login.tailscale.com/admin/machines/{tailnet}`
- Or use your email domain if you're using personal Tailscale

### Step 3: Restart Application
```bash
# Kill any existing processes
pkill -f "tsx server/index.ts"

# Start fresh
npm run dev
```

## 🐳 Docker Setup

For the most reliable setup, use Docker:

```bash
# Create environment file
cp .env.example .env

# Edit with your credentials
nano .env

# Start with Docker
./docker-start.sh
```

## Common Issues

### 401 Unauthorized
```
TAILSCALE_API_ERROR: 401 Unauthorized
```
**Fix:** API key is invalid or tailnet name is wrong

### 429 Rate Limited
```
TAILSCALE_API_ERROR: 429 Too Many Requests
```
**Fix:** Wait a few minutes, API has rate limits

### Network Connection Issues
```
Failed to sync with Tailscale API: fetch failed
```
**Fix:** Check internet connection and Tailscale service status

## Testing Your Setup

Once configured, you should see:
```
2:57:06 PM [express] serving on port 6000
Successfully synchronized with Tailscale API
Successfully synced 5 devices from Tailscale API
```

Instead of:
```
Failed to sync with Tailscale API: Error: Tailscale API error: 403 Forbidden
Falling back to sample data
```

## API Key Permissions Explained

| Scope | Purpose | Required |
|-------|---------|----------|
| `devices:read` | View device list, status, IPs | ✅ Yes |
| `devices:write` | Update device settings | ✅ Yes |
| `network:read` | Read network topology | ✅ Yes |
| `routes:read` | Read subnet routes | ❌ Optional |
| `acl:read` | Read access control lists | ❌ Optional |

## Alternative: Demo Mode

If you can't configure Tailscale API right now, the app will run in demo mode with sample data. This is perfect for:
- Testing the interface
- Development
- Presentations

You'll see realistic network topology with simulated devices that change status automatically.

## Production Deployment

For production, use Docker with environment variables:

```bash
# Docker run
docker run -d \
  -p 6000:6000 \
  -e TAILSCALE_API_KEY=your_key \
  -e TAILSCALE_TAILNET=your_tailnet \
  tailscale-dashboard

# Docker Compose
docker compose up -d
```

## Security Best Practices

1. **Rotate API keys** regularly
2. **Use minimum required scopes** only
3. **Store keys securely** (environment variables, not code)
4. **Monitor API usage** in Tailscale admin console
5. **Revoke unused keys** immediately