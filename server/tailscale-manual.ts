// Manual Tailscale data import - alternative to API
import type { InsertDevice } from "@shared/schema";
import { promises as fs } from "fs";
import path from "path";

export interface ManualTailscaleConfig {
  devices: {
    name: string;
    hostname: string;
    ipAddress: string;
    os?: string;
    deviceType?: string;
    online?: boolean;
    tags?: string[];
  }[];
}

export class TailscaleManualImporter {
  private configPath = path.join(process.cwd(), 'tailscale-devices.json');

  async loadDevicesFromFile(): Promise<InsertDevice[]> {
    try {
      const fileContent = await fs.readFile(this.configPath, 'utf-8');
      const config: ManualTailscaleConfig = JSON.parse(fileContent);
      
      return config.devices.map((device, index) => ({
        name: device.name,
        hostname: device.hostname,
        tailscaleId: `manual-${index + 1}`,
        ipAddress: device.ipAddress,
        deviceType: device.deviceType || this.guessDeviceType(device.name),
        os: device.os || 'Unknown',
        status: device.online ? 'connected' : 'disconnected',
        tags: device.tags || [],
        isCoordinator: index === 0 // First device is coordinator
      }));
    } catch (error) {
      console.log('No manual device configuration found');
      return [];
    }
  }

  private guessDeviceType(name: string): string {
    const lower = name.toLowerCase();
    if (lower.includes('server')) return 'server';
    if (lower.includes('phone') || lower.includes('mobile')) return 'mobile';
    if (lower.includes('laptop') || lower.includes('macbook')) return 'desktop';
    return 'other';
  }

  async saveDevicesToFile(devices: any[]): Promise<void> {
    const config: ManualTailscaleConfig = {
      devices: devices.map(d => ({
        name: d.name,
        hostname: d.hostname,
        ipAddress: d.ipAddress || d.addresses?.[0] || 'Unknown',
        os: d.os,
        deviceType: d.deviceType,
        online: d.online || d.status === 'connected',
        tags: d.tags || []
      }))
    };
    
    await fs.writeFile(this.configPath, JSON.stringify(config, null, 2));
  }
}

// Alternative: Import from Tailscale export
export async function importFromTailscaleExport(exportData: string): Promise<InsertDevice[]> {
  try {
    const data = JSON.parse(exportData);
    const devices: InsertDevice[] = [];
    
    // Handle different export formats
    if (data.devices) {
      // Direct device list
      data.devices.forEach((device: any, index: number) => {
        devices.push({
          name: device.name || device.hostname,
          hostname: device.hostname || device.name,
          tailscaleId: device.id || `import-${index + 1}`,
          ipAddress: device.addresses?.[0] || device.ipAddress || '100.64.0.' + (index + 1),
          deviceType: device.os?.toLowerCase().includes('linux') ? 'server' : 'desktop',
          os: device.os || 'Unknown',
          status: device.online ? 'connected' : 'disconnected',
          tags: device.tags || [],
          isCoordinator: device.isExitNode || false
        });
      });
    } else if (data.Peers) {
      // Tailscale status format
      Object.entries(data.Peers).forEach(([id, peer]: [string, any], index) => {
        devices.push({
          name: peer.HostName || peer.DNSName?.split('.')[0] || `Device ${index + 1}`,
          hostname: peer.DNSName || peer.HostName,
          tailscaleId: id,
          ipAddress: peer.TailscaleIPs?.[0] || '100.64.0.' + (index + 1),
          deviceType: peer.OS?.toLowerCase().includes('linux') ? 'server' : 'desktop',
          os: peer.OS || 'Unknown',
          status: peer.Online ? 'connected' : 'disconnected',
          tags: peer.Tags || [],
          isCoordinator: peer.ExitNode || false
        });
      });
    }
    
    return devices;
  } catch (error) {
    console.error('Failed to parse Tailscale export:', error);
    throw new Error('Invalid Tailscale export format');
  }
}