import type { Device, InsertDevice, NetworkStats } from "@shared/schema";

export interface TailscaleDevice {
  id: string;
  name: string;
  hostname: string;
  clientVersion: string;
  os: string;
  addresses: string[];
  machineKey: string;
  nodeKey: string;
  created: string;
  lastSeen: string;
  online: boolean;
  isExternal: boolean;
  updateAvailable: boolean;
  tags: string[];
  expires: string;
  keyExpiryDisabled: boolean;
  authorized: boolean;
  user: string;
  tailnetLockKey: string;
  tailnetLockError: string;
  enabledServices: string[];
  advertiseExitNode: boolean;
  advertiseRoutes: string[];
  blocksIncomingConnections: boolean;
}

export interface TailscaleApiResponse {
  devices: TailscaleDevice[];
}

export class TailscaleClient {
  private apiKey: string;
  private tailnet: string;
  private baseUrl = "https://api.tailscale.com/api/v2";

  constructor(apiKey: string, tailnet: string) {
    this.apiKey = apiKey;
    this.tailnet = tailnet;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    // Debug logging
    console.log(`\n🔍 Tailscale API Request Debug:`);
    console.log(`URL: ${url}`);
    console.log(`Method: ${options.method || 'GET'}`);
    console.log(`Tailnet: ${this.tailnet}`);
    console.log(`API Key: ${this.apiKey.substring(0, 10)}...`);
    
    const response = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      // Get detailed error information
      let errorDetails = '';
      try {
        const errorBody = await response.text();
        errorDetails = errorBody;
        console.error(`Error Response Body: ${errorBody}`);
      } catch (e) {
        console.error('Could not read error response body');
      }
      
      throw new Error(
        `Tailscale API error: ${response.status} ${response.statusText}${errorDetails ? ` - ${errorDetails}` : ''}`,
      );
    }

    return response.json();
  }

  async getDevices(): Promise<TailscaleDevice[]> {
    try {
      const response = await this.makeRequest<TailscaleApiResponse>(
        `/tailnet/${this.tailnet}/devices`,
      );
      return response.devices;
    } catch (error: any) {
      // Try alternative endpoint formats
      if (error.message?.includes('403')) {
        console.log('\n🔄 Trying alternative API endpoint formats...');
        
        // Try without .ts.net suffix
        const simpleTailnet = this.tailnet.replace('.ts.net', '');
        console.log(`Attempting with tailnet: ${simpleTailnet}`);
        
        try {
          const response = await this.makeRequest<TailscaleApiResponse>(
            `/tailnet/${simpleTailnet}/devices`,
          );
          console.log('✅ Success with simplified tailnet name!');
          return response.devices;
        } catch (altError) {
          console.log('❌ Alternative endpoint also failed');
        }
      }
      
      throw error;
    }
  }

  async getDevice(deviceId: string): Promise<TailscaleDevice> {
    return this.makeRequest<TailscaleDevice>(`/device/${deviceId}`);
  }

  async updateDevice(
    deviceId: string,
    updates: Partial<TailscaleDevice>,
  ): Promise<TailscaleDevice> {
    return this.makeRequest<TailscaleDevice>(`/device/${deviceId}`, {
      method: "PATCH",
      body: JSON.stringify(updates),
    });
  }

  async authorizeDevice(deviceId: string): Promise<void> {
    await this.makeRequest(`/device/${deviceId}/authorized`, {
      method: "POST",
      body: JSON.stringify({ authorized: true }),
    });
  }

  async deauthorizeDevice(deviceId: string): Promise<void> {
    await this.makeRequest(`/device/${deviceId}/authorized`, {
      method: "POST",
      body: JSON.stringify({ authorized: false }),
    });
  }

  async deleteDevice(deviceId: string): Promise<void> {
    await this.makeRequest(`/device/${deviceId}`, {
      method: "DELETE",
    });
  }

  // Convert Tailscale device to our internal format
  convertToInternalDevice(tailscaleDevice: TailscaleDevice): InsertDevice {
    const deviceType = this.getDeviceType(tailscaleDevice.os);
    const status = this.getDeviceStatus(tailscaleDevice);

    return {
      name: tailscaleDevice.name,
      hostname: tailscaleDevice.hostname,
      tailscaleId: tailscaleDevice.id,
      ipAddress: tailscaleDevice.addresses[0] || "Unknown",
      deviceType,
      os: tailscaleDevice.os,
      status,
      tags: tailscaleDevice.tags || [],
      isCoordinator: false, // No coordinator designation needed with full access
    };
  }

  private getDeviceType(os: string): string {
    const osLower = os.toLowerCase();
    if (osLower.includes("ios") || osLower.includes("android")) {
      return "mobile";
    }
    if (
      osLower.includes("linux") ||
      osLower.includes("ubuntu") ||
      osLower.includes("debian")
    ) {
      return "server";
    }
    return "desktop";
  }

  private getDeviceStatus(device: TailscaleDevice): string {
    if (!device.online) return "disconnected";

    const lastSeen = new Date(device.lastSeen);
    const now = new Date();
    const minutesSinceLastSeen =
      (now.getTime() - lastSeen.getTime()) / (1000 * 60);

    if (minutesSinceLastSeen > 5) return "unstable";
    return "connected";
  }

  // Generate network statistics from devices
  generateNetworkStats(devices: TailscaleDevice[]): NetworkStats {
    const onlineDevices = devices.filter((d) => d.online).length;
    const totalDevices = devices.length;
    const offlineDevices = totalDevices - onlineDevices;

    // Calculate unstable devices (online but not seen recently)
    const unstableDevices = devices.filter((d) => {
      if (!d.online) return false;
      const lastSeen = new Date(d.lastSeen);
      const now = new Date();
      const minutesSinceLastSeen =
        (now.getTime() - lastSeen.getTime()) / (1000 * 60);
      return minutesSinceLastSeen > 5;
    }).length;

    return {
      id: 1,
      totalDevices,
      onlineDevices: onlineDevices - unstableDevices,
      offlineDevices,
      unstableDevices,
      lastUpdated: new Date(),
    };
  }
}

// Create singleton instance
let tailscaleClient: TailscaleClient | null = null;

export function getTailscaleClient(): TailscaleClient | null {
  if (!tailscaleClient) {
    const apiKey = process.env.TAILSCALE_API_KEY;
    const tailnet = process.env.TAILSCALE_TAILNET;

    if (!apiKey || !tailnet) {
      console.warn(
        "Tailscale API key or tailnet not configured. Using mock data.",
      );
      return null;
    }

    tailscaleClient = new TailscaleClient(apiKey, tailnet);
  }

  return tailscaleClient;
}

export function isTailscaleConfigured(): boolean {
  return !!(process.env.TAILSCALE_API_KEY && process.env.TAILSCALE_TAILNET);
}