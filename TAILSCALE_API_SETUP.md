# Tailscale API Key Setup Guide

## Current Issue
Your API key is being recognized but lacks the required permissions to access device information.

**Error**: `"calling actor does not have enough permissions to perform this function"`

## Step-by-Step Solution

### 1. Configure ACL (Access Control List) Settings

Before creating an API key, ensure your Tailscale ACL allows proper API access:

#### 1.1 Access Your ACL Configuration
1. Go to https://login.tailscale.com/admin/access-controls
2. Click **"Edit file"** to modify your ACL

#### 1.2 Add API Access Rules
Add these sections to your ACL configuration:

```json
{
  "acls": [
    // Keep your existing ACL rules...
    
    // Add this rule to allow API access to all devices
    {
      "action": "accept",
      "src": ["autogroup:admin", "tag:api"],
      "dst": ["*:*"]
    }
  ],
  
  "tagOwners": {
    // Keep your existing tag owners...
    
    // Add API tag for service accounts
    "tag:api": ["autogroup:admin"]
  }
}
```

#### 1.3 For New Tailnets (Minimal ACL)
If you're starting fresh, use this minimal ACL that allows full access:

```json
{
  "acls": [
    {
      "action": "accept",
      "src": ["*"],
      "dst": ["*:*"]
    }
  ]
}
```

#### 1.4 Save and Apply
1. Click **"Save"** to apply ACL changes
2. Changes take effect immediately

### 2. Delete Your Current API Key
1. Go to https://login.tailscale.com/admin/settings/keys
2. Find your current API key (starts with `tskey-clie...`)
3. Click the trash icon to delete it

### 3. Create a New API Key with Correct Permissions

**CRITICAL**: The Tailscale API interface may show different options depending on your account type. Look for these **exact** permission names:

**Option A - If you see broad scopes:**
1. Click **"Generate API Key"**
2. Check **ALL** of these scopes:
   - ✅ `devices` - Full access (this is the critical one!)
   - ✅ `dns` - Read access
   - ✅ `routes` - Read access
   - ✅ `acls` - Read access (if available)

**Option B - If you see granular scopes:**
1. Click **"Generate API Key"**
2. Check these specific scopes:
   - ✅ `devices:read` - Read device information
   - ✅ `devices:write` - Update device settings
   - ✅ `network:read` - Read network topology

**Option C - If you see "All" option:**
1. Simply select **"All"** permissions for testing
2. This ensures no permission issues

3. Set expiration (90 days is recommended for testing)
4. Click **"Generate"**
5. Copy the new API key immediately (it won't be shown again!)

### 4. Update Your Replit Secret

1. In Replit, go to the Secrets tab (🔒 icon)
2. Find `TAILSCALE_API_KEY`
3. Click the edit button
4. Replace with your new API key
5. Save the changes

### 5. Verify Your Tailnet Name

Your tailnet name appears to be `swallow-dace.ts.net` based on the logs. Make sure:
- The `TAILSCALE_TAILNET` secret is set to exactly: `swallow-dace.ts.net`
- Don't include `https://` or any URLs, just the tailnet name

### 6. Restart the Application

The application will automatically restart when you update the secrets.

## Advanced ACL Examples

### Example 1: Production ACL with API Access
```json
{
  "acls": [
    // Allow admins full access
    {
      "action": "accept",
      "src": ["autogroup:admin"],
      "dst": ["*:*"]
    },
    // Allow API keys to access all devices
    {
      "action": "accept", 
      "src": ["tag:api"],
      "dst": ["*:*"]
    },
    // Regular user access
    {
      "action": "accept",
      "src": ["autogroup:member"],
      "dst": ["tag:server:*"]
    }
  ],
  
  "tagOwners": {
    "tag:api": ["autogroup:admin"],
    "tag:server": ["autogroup:admin"]
  },
  
  "autoApprovers": {
    "routes": {
      "0.0.0.0/0": ["tag:exit-node"]
    }
  }
}
```

### Example 2: Development/Testing ACL (Most Permissive)
```json
{
  "acls": [
    {
      "action": "accept",
      "src": ["*"],
      "dst": ["*:*"]
    }
  ],
  
  "ssh": [
    {
      "action": "accept",
      "src": ["*"],
      "dst": ["*"],
      "users": ["*"]
    }
  ]
}
```

## Common Issues

- **Wrong tailnet format**: Use `your-tailnet-name.ts.net`, not just `your-tailnet-name`
- **Expired key**: API keys expire after the set duration
- **Organization restrictions**: Some organizations limit API access - check with your admin
- **ACL blocking API**: Ensure your ACL includes rules allowing API access (see examples above)

## Testing the Fix

Once you've updated the API key with the correct permissions, the application should:
1. Successfully connect to the Tailscale API
2. Load your real network devices
3. Show live device statuses
4. Enable the refresh button to sync data

Let me know once you've created a new API key with the correct permissions!