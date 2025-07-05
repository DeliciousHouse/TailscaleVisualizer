import { useEffect, useRef } from "react";
import { ZoomIn, ZoomOut, Maximize2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Device, Connection } from "@shared/schema";

interface NetworkTopologyProps {
  devices: Device[];
  connections: Connection[];
  onDeviceClick: (device: Device) => void;
}

export function NetworkTopology({ devices, connections, onDeviceClick }: NetworkTopologyProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Device type emojis
  const getDeviceEmoji = (deviceType: string, isCoordinator: boolean) => {
    if (isCoordinator) return "🔗";
    switch (deviceType) {
      case "desktop": return "💻";
      case "mobile": return "📱";
      case "server": return "🖥️";
      default: return "📟";
    }
  };

  // Status colors
  const getStatusColor = (status: string) => {
    switch (status) {
      case "connected": return "var(--connected-green)";
      case "unstable": return "var(--warning-yellow)";
      case "disconnected": return "hsl(240, 5%, 65%)";
      default: return "hsl(240, 5%, 65%)";
    }
  };

  // Position devices in a force-directed layout
  const positionDevices = () => {
    const width = containerRef.current?.clientWidth || 800;
    const height = containerRef.current?.clientHeight || 600;
    
    // Find coordinator
    const coordinator = devices.find(d => d.isCoordinator);
    
    if (coordinator) {
      // Position coordinator at center
      coordinator.x = width / 2;
      coordinator.y = height / 2;
    }
    
    // Position other devices in a circle around coordinator
    const otherDevices = devices.filter(d => !d.isCoordinator);
    const radius = Math.min(width, height) * 0.3;
    
    otherDevices.forEach((device, index) => {
      const angle = (index / otherDevices.length) * 2 * Math.PI;
      device.x = (width / 2) + Math.cos(angle) * radius;
      device.y = (height / 2) + Math.sin(angle) * radius;
    });
  };

  useEffect(() => {
    positionDevices();
  }, [devices]);

  const handleDeviceClick = (device: Device) => {
    onDeviceClick(device);
  };

  const handleZoomIn = () => {
    // Implement zoom functionality
    console.log("Zoom in");
  };

  const handleZoomOut = () => {
    // Implement zoom functionality
    console.log("Zoom out");
  };

  const handleReset = () => {
    positionDevices();
  };

  return (
    <div ref={containerRef} className="relative w-full h-full bg-muted/20 rounded-lg overflow-hidden">
      {/* Network Topology SVG */}
      <svg
        ref={svgRef}
        className="w-full h-full"
        viewBox="0 0 100% 100%"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
            fill="hsl(240, 5%, 65%)"
          >
            <polygon points="0 0, 10 3.5, 0 7" />
          </marker>
        </defs>
        
        {/* Connection lines */}
        <g>
          {connections.map((connection) => {
            const fromDevice = devices.find(d => d.id === connection.fromDeviceId);
            const toDevice = devices.find(d => d.id === connection.toDeviceId);
            
            if (!fromDevice || !toDevice) return null;
            
            return (
              <line
                key={connection.id}
                x1={fromDevice.x}
                y1={fromDevice.y}
                x2={toDevice.x}
                y2={toDevice.y}
                stroke={connection.status === 'active' ? "hsl(240, 5%, 65%)" : "hsl(240, 5%, 35%)"}
                strokeWidth="2"
                strokeDasharray={connection.status === 'active' ? "none" : "5,5"}
                markerEnd="url(#arrowhead)"
                opacity="0.7"
                className="network-connection"
              />
            );
          })}
        </g>
        
        {/* Device nodes */}
        <g>
          {devices.map((device) => {
            const radius = device.isCoordinator ? 30 : device.deviceType === 'server' ? 25 : device.deviceType === 'mobile' ? 20 : 22;
            
            return (
              <g key={device.id} className="network-node">
                <circle
                  cx={device.x}
                  cy={device.y}
                  r={radius}
                  fill={device.isCoordinator ? "var(--tailscale-purple)" : getStatusColor(device.status)}
                  stroke="white"
                  strokeWidth="3"
                  className="cursor-pointer"
                  onClick={() => handleDeviceClick(device)}
                  style={{
                    animation: device.status === 'unstable' ? 'pulse 2s infinite' : 'none',
                    opacity: device.status === 'disconnected' ? 0.5 : 1
                  }}
                />
                
                {/* Device emoji */}
                <text
                  x={device.x}
                  y={device.y + 3}
                  textAnchor="middle"
                  fill="white"
                  fontSize="14"
                  className="pointer-events-none"
                >
                  {getDeviceEmoji(device.deviceType, device.isCoordinator)}
                </text>
                
                {/* Device label */}
                <text
                  x={device.x}
                  y={device.y + radius + 20}
                  textAnchor="middle"
                  fill="currentColor"
                  fontSize="12"
                  className="pointer-events-none"
                >
                  {device.name}
                </text>
              </g>
            );
          })}
        </g>
      </svg>
      
      {/* Controls */}
      <div className="absolute top-4 right-4 flex flex-col space-y-2">
        <Button variant="outline" size="icon" onClick={handleZoomIn}>
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={handleZoomOut}>
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon">
          <Maximize2 className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={handleReset}>
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Legend */}
      <div className="absolute bottom-4 left-4">
        <Card className="p-4">
          <h4 className="text-sm font-medium mb-3">Legend</h4>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-connected-green rounded-full" />
              <span className="text-xs">Connected</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-warning-yellow rounded-full" />
              <span className="text-xs">Unstable</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-muted rounded-full" />
              <span className="text-xs">Offline</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-tailscale-purple rounded-full" />
              <span className="text-xs">Coordinator</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
