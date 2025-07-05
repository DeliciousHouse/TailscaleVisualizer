import {
  devices,
  connections,
  networkStats,
  type Device,
  type InsertDevice,
  type Connection,
  type InsertConnection,
  type NetworkStats,
  type NetworkTopology,
} from "@shared/schema";
import { getTailscaleClient, isTailscaleConfigured } from "./tailscale";

export interface IStorage {
  // Device operations
  getDevices(): Promise<Device[]>;
  getDevice(id: number): Promise<Device | undefined>;
  getDeviceByTailscaleId(tailscaleId: string): Promise<Device | undefined>;
  createDevice(device: InsertDevice): Promise<Device>;
  updateDevice(id: number, updates: Partial<Device>): Promise<Device>;
  deleteDevice(id: number): Promise<void>;

  // Connection operations
  getConnections(): Promise<Connection[]>;
  createConnection(connection: InsertConnection): Promise<Connection>;
  updateConnection(
    id: number,
    updates: Partial<Connection>,
  ): Promise<Connection>;
  deleteConnection(id: number): Promise<void>;

  // Network stats
  getNetworkStats(): Promise<NetworkStats>;
  updateNetworkStats(stats: Partial<NetworkStats>): Promise<NetworkStats>;

  // Combined operations
  getNetworkTopology(): Promise<NetworkTopology>;
}

export class MemStorage implements IStorage {
  private devices: Map<number, Device> = new Map();
  private connections: Map<number, Connection> = new Map();
  private networkStats: NetworkStats;
  private currentDeviceId = 1;
  private currentConnectionId = 1;

  constructor() {
    this.networkStats = {
      id: 1,
      totalDevices: 0,
      onlineDevices: 0,
      offlineDevices: 0,
      unstableDevices: 0,
      lastUpdated: new Date(),
    };

    // Initialize with sample network topology
    this.initializeSampleData();
  }

  private async initializeSampleData() {
    // Try to load from Tailscale API first
    if (isTailscaleConfigured()) {
      try {
        await this.syncWithTailscale();
        console.log("Successfully synchronized with Tailscale API");
        return;
      } catch (error) {
        console.error("Failed to sync with Tailscale API:", error);
        console.log("Falling back to sample data");
      }
    } else {
      console.log(
        "Tailscale API not configured. Using sample data for development.",
      );
    }

    // Fallback to sample data if Tailscale API is not available
    await this.loadSampleData();
  }

  private async syncWithTailscale(): Promise<void> {
    const client = getTailscaleClient();
    if (!client) {
      throw new Error("Tailscale client not available");
    }

    const tailscaleDevices = await client.getDevices();
    const stats = client.generateNetworkStats(tailscaleDevices);

    // Clear existing data
    this.devices.clear();
    this.connections.clear();
    this.currentDeviceId = 1;
    this.currentConnectionId = 1;

    // Convert and store devices
    const coordinatorDevice = tailscaleDevices.find((d) =>
      d.tags?.includes("coordinator"),
    );
    let coordinator: Device | null = null;

    for (const tailscaleDevice of tailscaleDevices) {
      const deviceData = client.convertToInternalDevice(tailscaleDevice);
      const device = await this.createDevice(deviceData);

      if (device.isCoordinator) {
        coordinator = device;
      }
    }

    // Create connections (simplified hub topology if coordinator exists)
    if (coordinator) {
      const otherDevices = Array.from(this.devices.values()).filter(
        (d) => !d.isCoordinator,
      );
      for (const device of otherDevices) {
        await this.createConnection({
          fromDeviceId: coordinator.id,
          toDeviceId: device.id,
          status: device.status === "connected" ? "active" : "inactive",
        });
      }
    }

    // Update network stats
    this.networkStats = stats;
  }

  private async loadSampleData(): Promise<void> {
    // Create coordinator device
    const coordinator = await this.createDevice({
      name: "coordinator",
      hostname: "coordinator.ts.net",
      tailscaleId: "coord-01",
      ipAddress: "100.64.0.1",
      deviceType: "server",
      os: "Linux",
      status: "connected",
      tags: ["coordinator", "critical"],
      isCoordinator: true,
    });

    // Create sample devices
    const devices = [
      {
        name: "john-macbook",
        hostname: "john-macbook.ts.net",
        tailscaleId: "desktop-01",
        ipAddress: "100.64.0.10",
        deviceType: "desktop",
        os: "macOS",
        status: "connected",
        tags: ["production", "developer"],
        isCoordinator: false,
      },
      {
        name: "jane-laptop",
        hostname: "jane-laptop.ts.net",
        tailscaleId: "desktop-02",
        ipAddress: "100.64.0.11",
        deviceType: "desktop",
        os: "Windows",
        status: "connected",
        tags: ["production"],
        isCoordinator: false,
      },
      {
        name: "john-iphone",
        hostname: "john-iphone.ts.net",
        tailscaleId: "mobile-01",
        ipAddress: "100.64.0.20",
        deviceType: "mobile",
        os: "iOS",
        status: "connected",
        tags: ["mobile"],
        isCoordinator: false,
      },
      {
        name: "jane-iphone",
        hostname: "jane-iphone.ts.net",
        tailscaleId: "mobile-02",
        ipAddress: "100.64.0.21",
        deviceType: "mobile",
        os: "iOS",
        status: "unstable",
        tags: ["mobile"],
        isCoordinator: false,
      },
      {
        name: "prod-server",
        hostname: "prod-server.ts.net",
        tailscaleId: "server-01",
        ipAddress: "100.64.0.100",
        deviceType: "server",
        os: "Linux",
        status: "connected",
        tags: ["production", "server"],
        isCoordinator: false,
      },
      {
        name: "backup-server",
        hostname: "backup-server.ts.net",
        tailscaleId: "server-02",
        ipAddress: "100.64.0.101",
        deviceType: "server",
        os: "Linux",
        status: "disconnected",
        tags: ["backup", "server"],
        isCoordinator: false,
      },
    ];

    const createdDevices = [];
    for (const device of devices) {
      createdDevices.push(await this.createDevice(device));
    }

    // Create connections (all devices connect to coordinator)
    for (const device of createdDevices) {
      await this.createConnection({
        fromDeviceId: coordinator.id,
        toDeviceId: device.id,
        status: device.status === "connected" ? "active" : "inactive",
      });
    }

    // Create some peer-to-peer connections
    if (createdDevices.length >= 2) {
      await this.createConnection({
        fromDeviceId: createdDevices[0].id,
        toDeviceId: createdDevices[1].id,
        status: "active",
      });

      await this.createConnection({
        fromDeviceId: createdDevices[2].id,
        toDeviceId: createdDevices[4].id,
        status: "active",
      });
    }

    await this.updateNetworkStats({});
  }

  async getDevices(): Promise<Device[]> {
    return Array.from(this.devices.values());
  }

  async getDevice(id: number): Promise<Device | undefined> {
    return this.devices.get(id);
  }

  async getDeviceByTailscaleId(
    tailscaleId: string,
  ): Promise<Device | undefined> {
    return Array.from(this.devices.values()).find(
      (d) => d.tailscaleId === tailscaleId,
    );
  }

  async createDevice(insertDevice: InsertDevice): Promise<Device> {
    const id = this.currentDeviceId++;
    const device: Device = {
      id,
      name: insertDevice.name,
      hostname: insertDevice.hostname,
      tailscaleId: insertDevice.tailscaleId,
      ipAddress: insertDevice.ipAddress,
      deviceType: insertDevice.deviceType,
      os: insertDevice.os,
      status: insertDevice.status,
      lastSeen: new Date(),
      tags: insertDevice.tags || [],
      isCoordinator: insertDevice.isCoordinator || false,
      x: Math.random() * 800 + 100,
      y: Math.random() * 600 + 100,
    };
    this.devices.set(id, device);
    return device;
  }

  async updateDevice(id: number, updates: Partial<Device>): Promise<Device> {
    const device = this.devices.get(id);
    if (!device) throw new Error(`Device with id ${id} not found`);

    const updatedDevice = { ...device, ...updates, lastSeen: new Date() };
    this.devices.set(id, updatedDevice);
    return updatedDevice;
  }

  async deleteDevice(id: number): Promise<void> {
    this.devices.delete(id);
    // Also delete related connections
    const connectionsToDelete = [];
    for (const [connId, conn] of Array.from(this.connections.entries())) {
      if (conn.fromDeviceId === id || conn.toDeviceId === id) {
        connectionsToDelete.push(connId);
      }
    }
    for (const connId of connectionsToDelete) {
      this.connections.delete(connId);
    }
  }

  async getConnections(): Promise<Connection[]> {
    return Array.from(this.connections.values());
  }

  async createConnection(
    insertConnection: InsertConnection,
  ): Promise<Connection> {
    const id = this.currentConnectionId++;
    const connection: Connection = {
      ...insertConnection,
      id,
      lastUpdated: new Date(),
    };
    this.connections.set(id, connection);
    return connection;
  }

  async updateConnection(
    id: number,
    updates: Partial<Connection>,
  ): Promise<Connection> {
    const connection = this.connections.get(id);
    if (!connection) throw new Error(`Connection with id ${id} not found`);

    const updatedConnection = {
      ...connection,
      ...updates,
      lastUpdated: new Date(),
    };
    this.connections.set(id, updatedConnection);
    return updatedConnection;
  }

  async deleteConnection(id: number): Promise<void> {
    this.connections.delete(id);
  }

  async getNetworkStats(): Promise<NetworkStats> {
    return this.networkStats;
  }

  async updateNetworkStats(
    updates: Partial<NetworkStats>,
  ): Promise<NetworkStats> {
    const devices = await this.getDevices();
    const totalDevices = devices.length;
    const onlineDevices = devices.filter(
      (d) => d.status === "connected",
    ).length;
    const offlineDevices = devices.filter(
      (d) => d.status === "disconnected",
    ).length;
    const unstableDevices = devices.filter(
      (d) => d.status === "unstable",
    ).length;

    this.networkStats = {
      ...this.networkStats,
      ...updates,
      totalDevices,
      onlineDevices,
      offlineDevices,
      unstableDevices,
      lastUpdated: new Date(),
    };

    return this.networkStats;
  }

  async getNetworkTopology(): Promise<NetworkTopology> {
    const devices = await this.getDevices();
    const connections = await this.getConnections();
    const stats = await this.getNetworkStats();

    return { devices, connections, stats };
  }

  // Add method to refresh data from Tailscale API
  async refreshFromTailscale(): Promise<void> {
    if (!isTailscaleConfigured()) {
      throw new Error("Tailscale API not configured");
    }

    await this.syncWithTailscale();
  }
}

export const storage = new MemStorage();
