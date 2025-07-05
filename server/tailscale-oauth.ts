// Alternative approach using OAuth2 authentication
import type { Device, InsertDevice, NetworkStats } from "@shared/schema";

export class TailscaleOAuthClient {
  private clientId: string;
  private clientSecret: string;
  private accessToken?: string;
  private tokenExpiry?: Date;

  constructor(clientId: string, clientSecret: string) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
  }

  async getAccessToken(): Promise<string> {
    if (this.accessToken && this.tokenExpiry && this.tokenExpiry > new Date()) {
      return this.accessToken;
    }

    // Get new token
    const response = await fetch('https://api.tailscale.com/api/v2/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: this.clientId,
        client_secret: this.clientSecret,
        scope: 'devices:read'
      })
    });

    if (!response.ok) {
      throw new Error(`OAuth token request failed: ${response.status}`);
    }

    const data = await response.json();
    this.accessToken = data.access_token;
    this.tokenExpiry = new Date(Date.now() + (data.expires_in * 1000));
    
    return this.accessToken;
  }
}

// Alternative: Use machine authentication
export async function getMachineAuthToken(): Promise<string | null> {
  try {
    // Try to read the Tailscale auth key from the local machine
    const fs = await import('fs');
    const os = await import('os');
    
    // Common locations for Tailscale auth
    const paths = [
      `${os.homedir()}/.config/tailscale/tailscaled.state`,
      '/var/lib/tailscale/tailscaled.state',
      `${process.env.HOME}/.tailscale/tailscaled.state`
    ];

    for (const path of paths) {
      try {
        const data = await fs.promises.readFile(path, 'utf-8');
        // Extract auth token from state file
        const match = data.match(/"AuthKey":"([^"]+)"/);
        if (match) {
          return match[1];
        }
      } catch (e) {
        // Continue to next path
      }
    }
  } catch (e) {
    console.log('Machine auth not available');
  }
  
  return null;
}

// Alternative: Use Tailscale CLI if available
export async function getTailscaleDevicesFromCLI(): Promise<any[]> {
  try {
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);

    const { stdout } = await execAsync('tailscale status --json');
    const data = JSON.parse(stdout);
    
    return Object.values(data.Peer || {});
  } catch (e) {
    console.log('Tailscale CLI not available');
    return [];
  }
}