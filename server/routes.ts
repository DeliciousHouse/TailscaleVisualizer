import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertDeviceSchema, type DeviceUpdate } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // WebSocket server for real-time updates
  const wss = new WebSocketServer({
    server: httpServer,
    path: "/ws",
  });

  // Store connected WebSocket clients
  const clients = new Set<WebSocket>();

  wss.on("connection", (ws) => {
    clients.add(ws);
    console.log("Client connected, total clients:", clients.size);

    // Send initial network topology
    storage.getNetworkTopology().then((topology) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "initial_topology", data: topology }));
      }
    });

    ws.on("close", () => {
      clients.delete(ws);
      console.log("Client disconnected, total clients:", clients.size);
    });

    ws.on("error", (error) => {
      console.error("WebSocket error:", error);
      clients.delete(ws);
    });
  });

  // Broadcast updates to all connected clients
  function broadcastUpdate(update: DeviceUpdate) {
    const message = JSON.stringify(update);
    clients.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(message);
      }
    });
  }

  // API Routes

  // Get network topology
  app.get("/api/network/topology", async (req, res) => {
    try {
      const topology = await storage.getNetworkTopology();
      res.json(topology);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch network topology" });
    }
  });

  // Get all devices
  app.get("/api/devices", async (req, res) => {
    try {
      const devices = await storage.getDevices();
      res.json(devices);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch devices" });
    }
  });

  // Get specific device
  app.get("/api/devices/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const device = await storage.getDevice(id);
      if (!device) {
        return res.status(404).json({ error: "Device not found" });
      }
      res.json(device);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch device" });
    }
  });

  // Update device status
  app.patch("/api/devices/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;

      const device = await storage.updateDevice(id, updates);

      // Update network stats
      await storage.updateNetworkStats({});
      const stats = await storage.getNetworkStats();

      // Broadcast updates
      broadcastUpdate({ type: "device_status", data: device });
      broadcastUpdate({ type: "stats_updated", data: stats });

      res.json(device);
    } catch (error) {
      res.status(500).json({ error: "Failed to update device" });
    }
  });

  // Create new device
  app.post("/api/devices", async (req, res) => {
    try {
      const deviceData = insertDeviceSchema.parse(req.body);
      const device = await storage.createDevice(deviceData);

      // Update network stats
      await storage.updateNetworkStats({});
      const stats = await storage.getNetworkStats();

      // Broadcast updates
      broadcastUpdate({ type: "device_connected", data: device });
      broadcastUpdate({ type: "stats_updated", data: stats });

      res.status(201).json(device);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res
          .status(400)
          .json({ error: "Invalid device data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create device" });
      }
    }
  });

  // Delete device
  app.delete("/api/devices/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const device = await storage.getDevice(id);

      if (!device) {
        return res.status(404).json({ error: "Device not found" });
      }

      await storage.deleteDevice(id);

      // Update network stats
      await storage.updateNetworkStats({});
      const stats = await storage.getNetworkStats();

      // Broadcast updates
      broadcastUpdate({ type: "device_disconnected", data: device });
      broadcastUpdate({ type: "stats_updated", data: stats });

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete device" });
    }
  });

  // Get network stats
  app.get("/api/network/stats", async (req, res) => {
    try {
      const stats = await storage.getNetworkStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch network stats" });
    }
  });

  // Simulate device status changes (for demo purposes)
  app.post("/api/network/simulate", async (req, res) => {
    try {
      const devices = await storage.getDevices();
      const randomDevice = devices[Math.floor(Math.random() * devices.length)];

      const statuses = ["connected", "disconnected", "unstable"];
      const currentStatus = randomDevice.status;
      const newStatus = statuses.filter((s) => s !== currentStatus)[
        Math.floor(Math.random() * 2)
      ];

      const updatedDevice = await storage.updateDevice(randomDevice.id, {
        status: newStatus,
      });

      // Update network stats
      await storage.updateNetworkStats({});
      const stats = await storage.getNetworkStats();

      // Broadcast updates
      broadcastUpdate({ type: "device_status", data: updatedDevice });
      broadcastUpdate({ type: "stats_updated", data: stats });

      res.json({
        message: `Device ${randomDevice.name} status changed to ${newStatus}`,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to simulate device change" });
    }
  });

  // Refresh data from Tailscale API
  app.post("/api/network/refresh", async (req, res) => {
    try {
      await storage.refreshFromTailscale();

      // Get updated topology
      const topology = await storage.getNetworkTopology();

      // Broadcast updates to all clients
      broadcastUpdate({ type: "initial_topology", data: topology });

      res.json({ message: "Network data refreshed successfully", topology });
    } catch (error) {
      console.error("Failed to refresh from Tailscale:", error);
      res.status(500).json({
        error: "Failed to refresh network data",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  // Debug endpoint to test API key permissions
  app.get("/api/debug/tailscale", async (req, res) => {
    try {
      const { getTailscaleClient } = await import("./tailscale");
      const client = getTailscaleClient();
      
      if (!client) {
        return res.json({
          status: "not_configured",
          message: "Tailscale API not configured",
          hasApiKey: !!process.env.TAILSCALE_API_KEY,
          hasTailnet: !!process.env.TAILSCALE_TAILNET,
          tailnet: process.env.TAILSCALE_TAILNET || "not set"
        });
      }

      // Test API call
      const devices = await client.getDevices();
      res.json({
        status: "success",
        message: "API key working correctly",
        deviceCount: devices.length,
        devices: devices.map(d => ({
          name: d.name,
          os: d.os,
          online: d.online
        }))
      });
    } catch (error: any) {
      res.json({
        status: "error",
        message: error.message,
        type: error.message.includes('403') ? 'permission_denied' : 
              error.message.includes('401') ? 'unauthorized' : 'unknown'
      });
    }
  });

  // Manual device import endpoint
  app.post("/api/devices/import", async (req, res) => {
    try {
      const { importFromTailscaleExport } = await import("./tailscale-manual");
      const devices = await importFromTailscaleExport(JSON.stringify(req.body));
      
      // Clear existing devices
      await storage.getDevices().then(existing => {
        existing.forEach(d => storage.deleteDevice(d.id));
      });
      
      // Import new devices
      for (const device of devices) {
        await storage.createDevice(device);
      }
      
      const topology = await storage.getNetworkTopology();
      broadcastUpdate({ type: "initial_topology", data: topology });
      
      res.json({ 
        message: "Successfully imported devices", 
        deviceCount: devices.length 
      });
    } catch (error: any) {
      res.status(400).json({ 
        error: "Failed to import devices", 
        details: error.message 
      });
    }
  });

  // Metrics endpoint for Prometheus/Grafana
  app.get("/metrics", async (req, res) => {
    try {
      const stats = await storage.getNetworkStats();
      const devices = await storage.getDevices();

      // Generate Prometheus metrics format
      const metrics = [
        `# HELP tailscale_total_devices Total number of devices in the network`,
        `# TYPE tailscale_total_devices gauge`,
        `tailscale_total_devices ${stats.totalDevices}`,
        ``,
        `# HELP tailscale_online_devices Number of online devices`,
        `# TYPE tailscale_online_devices gauge`,
        `tailscale_online_devices ${stats.onlineDevices}`,
        ``,
        `# HELP tailscale_offline_devices Number of offline devices`,
        `# TYPE tailscale_offline_devices gauge`,
        `tailscale_offline_devices ${stats.offlineDevices}`,
        ``,
        `# HELP tailscale_unstable_devices Number of unstable devices`,
        `# TYPE tailscale_unstable_devices gauge`,
        `tailscale_unstable_devices ${stats.unstableDevices}`,
        ``,
        `# HELP tailscale_devices_by_status Number of devices by status`,
        `# TYPE tailscale_devices_by_status gauge`,
        `tailscale_devices_by_status{status="connected"} ${stats.onlineDevices}`,
        `tailscale_devices_by_status{status="disconnected"} ${stats.offlineDevices}`,
        `tailscale_devices_by_status{status="unstable"} ${stats.unstableDevices}`,
        ``,
        `# HELP tailscale_device_info Device information`,
        `# TYPE tailscale_device_info gauge`,
        ...devices.map(
          (device) =>
            `tailscale_device_info{name="${device.name}",hostname="${device.hostname}",type="${device.deviceType}",os="${device.os}",status="${device.status}"} 1`,
        ),
      ];

      res.set("Content-Type", "text/plain");
      res.send(metrics.join("\n"));
    } catch (error) {
      console.error("Error generating metrics:", error);
      res.status(500).json({ error: "Failed to generate metrics" });
    }
  });

  // Start periodic simulation of network changes (only if not using real Tailscale data)
  setInterval(async () => {
    try {
      const devices = await storage.getDevices();
      if (devices.length === 0) return;

      // Only simulate if we're not using real Tailscale data
      if (process.env.TAILSCALE_API_KEY && process.env.TAILSCALE_TAILNET) {
        return; // Skip simulation when using real data
      }

      // Randomly change device status
      if (Math.random() < 0.3) {
        // 30% chance
        const randomDevice =
          devices[Math.floor(Math.random() * devices.length)];

        const statuses = ["connected", "disconnected", "unstable"];
        const currentStatus = randomDevice.status;
        const newStatus = statuses.filter((s) => s !== currentStatus)[
          Math.floor(Math.random() * 2)
        ];

        const updatedDevice = await storage.updateDevice(randomDevice.id, {
          status: newStatus,
        });

        // Update network stats
        await storage.updateNetworkStats({});
        const stats = await storage.getNetworkStats();

        // Broadcast updates
        broadcastUpdate({ type: "device_status", data: updatedDevice });
        broadcastUpdate({ type: "stats_updated", data: stats });
      }
    } catch (error) {
      console.error("Error in periodic simulation:", error);
    }
  }, 10000); // Every 10 seconds

  return httpServer;
}
