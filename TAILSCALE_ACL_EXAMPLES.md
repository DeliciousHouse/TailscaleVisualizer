# Tailscale ACL Configuration Examples

This document provides various ACL (Access Control List) configurations for Tailscale to enable proper API access for the network dashboard.

## What is an ACL?

Tailscale's ACL (Access Control List) defines who can access what in your Tailscale network. It controls:
- Which devices can communicate with each other
- What ports and protocols are allowed
- API access permissions
- SSH access rules

## Basic ACL for API Access

This is the minimum ACL configuration needed for the dashboard to work with API keys:

```json
{
  "acls": [
    // Allow all communication between devices
    {
      "action": "accept",
      "src": ["*"],
      "dst": ["*:*"]
    }
  ]
}
```

## Recommended ACL with API Tags

This configuration creates a specific tag for API access, providing better security:

```json
{
  "acls": [
    // Allow admin users full access
    {
      "action": "accept",
      "src": ["autogroup:admin"],
      "dst": ["*:*"]
    },
    // Allow API-tagged services to access all devices
    {
      "action": "accept",
      "src": ["tag:api"],
      "dst": ["*:*"]
    },
    // Allow members to access tagged servers
    {
      "action": "accept",
      "src": ["autogroup:member"],
      "dst": ["tag:server:*", "tag:dev:*"]
    }
  ],
  
  "tagOwners": {
    // Admins can assign the API tag
    "tag:api": ["autogroup:admin"],
    // Admins can assign server tags
    "tag:server": ["autogroup:admin"],
    "tag:dev": ["autogroup:admin", "autogroup:member"]
  }
}
```

## Full Production ACL Example

A comprehensive ACL for production environments with multiple security layers:

```json
{
  "acls": [
    // Admins have full access
    {
      "action": "accept",
      "src": ["autogroup:admin"],
      "dst": ["*:*"]
    },
    // API services can read device information
    {
      "action": "accept",
      "src": ["tag:api"],
      "dst": ["*:*"]
    },
    // Production servers can communicate with each other
    {
      "action": "accept",
      "src": ["tag:prod"],
      "dst": ["tag:prod:*"]
    },
    // Dev servers accessible by developers
    {
      "action": "accept",
      "src": ["tag:developer"],
      "dst": ["tag:dev:*"]
    },
    // Exit nodes can access internet
    {
      "action": "accept",
      "src": ["tag:exit-node"],
      "dst": ["*:*"]
    }
  ],
  
  "tagOwners": {
    "tag:api": ["autogroup:admin"],
    "tag:prod": ["autogroup:admin"],
    "tag:dev": ["autogroup:admin"],
    "tag:developer": ["autogroup:admin"],
    "tag:exit-node": ["autogroup:admin"]
  },
  
  "autoApprovers": {
    // Automatically approve exit node routes
    "routes": {
      "0.0.0.0/0": ["tag:exit-node"],
      "::/0": ["tag:exit-node"]
    }
  },
  
  "ssh": [
    // Admins can SSH to all devices
    {
      "action": "accept",
      "src": ["autogroup:admin"],
      "dst": ["*"],
      "users": ["root", "ubuntu", "ec2-user"]
    },
    // Developers can SSH to dev servers
    {
      "action": "accept",
      "src": ["tag:developer"],
      "dst": ["tag:dev"],
      "users": ["ubuntu", "dev"]
    }
  ]
}
```

## Home/Personal Network ACL

For personal use with trusted devices:

```json
{
  "acls": [
    // Everyone can access everything
    {
      "action": "accept",
      "src": ["*"],
      "dst": ["*:*"]
    }
  ],
  
  "ssh": [
    // Allow SSH between all devices
    {
      "action": "accept",
      "src": ["*"],
      "dst": ["*"],
      "users": ["*"]
    }
  ],
  
  "autoApprovers": {
    // Auto-approve exit nodes
    "routes": {
      "0.0.0.0/0": ["tag:exit"],
      "::/0": ["tag:exit"]
    }
  },
  
  "tagOwners": {
    "tag:exit": ["autogroup:admin"]
  }
}
```

## Troubleshooting ACL Issues

### API Access Denied (403 Error)
If you're getting 403 errors, ensure:
1. Your ACL includes rules allowing API access
2. The API key has the correct permissions
3. No deny rules are blocking API access

### Quick Test ACL
To test if ACL is the issue, temporarily use this permissive ACL:
```json
{
  "acls": [{"action": "accept", "src": ["*"], "dst": ["*:*"]}]
}
```

### Common Mistakes
1. **Forgetting API access rules**: Always include rules for API keys
2. **Wrong tag syntax**: Use `tag:name`, not just `name`
3. **Missing tagOwners**: Define who can assign tags
4. **Overly restrictive rules**: Start permissive, then tighten

## How to Apply ACL Changes

1. Go to [Tailscale Admin Console](https://login.tailscale.com/admin/access-controls)
2. Click "Edit file"
3. Replace with your desired ACL configuration
4. Click "Save"
5. Changes apply immediately

## Best Practices

1. **Start Simple**: Begin with a permissive ACL and gradually add restrictions
2. **Use Tags**: Group devices with tags for easier management
3. **Test Changes**: Have a test device to verify ACL changes
4. **Document Rules**: Add comments to explain each rule's purpose
5. **Regular Reviews**: Periodically review and update ACL rules

## Need Help?

If you're still having issues:
1. Check the Tailscale admin logs for specific errors
2. Verify your API key has the correct scopes
3. Test with the minimal ACL to isolate the issue
4. Ensure your tailnet name is correct in the configuration