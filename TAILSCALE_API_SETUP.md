# Tailscale API Key Setup Guide

## Current Issue
Your API key is being recognized but lacks the required permissions to access device information.

## Step-by-Step Solution

### 1. Delete Your Current API Key
1. Go to https://login.tailscale.com/admin/settings/keys
2. Find your current API key (starts with `tskey-clie...`)
3. Click the trash icon to delete it

### 2. Create a New API Key with Correct Permissions

1. Click **"Generate API Key"**
2. **IMPORTANT**: Check these specific scopes:
   - ✅ `devices` - Full access (includes read and write)
   - ✅ `dns` - Read access (optional but recommended)
   - ✅ `routes` - Read access (optional but recommended)

   OR if you see more granular options:
   - ✅ `devices:read` - Read device information
   - ✅ `devices:write` - Update device settings
   - ✅ `network:read` - Read network topology

3. Set expiration (90 days is recommended for testing)
4. Click **"Generate"**
5. Copy the new API key immediately (it won't be shown again!)

### 3. Update Your Replit Secret

1. In Replit, go to the Secrets tab (🔒 icon)
2. Find `TAILSCALE_API_KEY`
3. Click the edit button
4. Replace with your new API key
5. Save the changes

### 4. Verify Your Tailnet Name

Your tailnet name appears to be `swallow-dace.ts.net` based on the logs. Make sure:
- The `TAILSCALE_TAILNET` secret is set to exactly: `swallow-dace.ts.net`
- Don't include `https://` or any URLs, just the tailnet name

### 5. Restart the Application

The application will automatically restart when you update the secrets.

## Common Issues

- **Wrong tailnet format**: Use `your-tailnet-name.ts.net`, not just `your-tailnet-name`
- **Expired key**: API keys expire after the set duration
- **Organization restrictions**: Some organizations limit API access - check with your admin

## Testing the Fix

Once you've updated the API key with the correct permissions, the application should:
1. Successfully connect to the Tailscale API
2. Load your real network devices
3. Show live device statuses
4. Enable the refresh button to sync data

Let me know once you've created a new API key with the correct permissions!