# Tailscale Network Topology Dashboard

## Overview

This is a full-stack web application that provides a real-time network topology visualization for Tailscale networks. The application displays device connections, network statistics, and allows users to interact with their network infrastructure through an intuitive dashboard interface.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Real-time Updates**: WebSocket connection for live network status updates
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Real-time Communication**: WebSocket server for broadcasting network updates
- **Development**: Hot reload with Vite middleware integration

### Database Design
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema**: Three main tables:
  - `devices`: Store device information (name, hostname, IP, status, position)
  - `connections`: Track connections between devices
  - `network_stats`: Store aggregated network statistics
- **Migrations**: Automated schema management with Drizzle Kit

## Key Components

### Core Features
1. **Network Topology Visualization**: Interactive SVG-based network diagram showing device connections
2. **Real-time Status Updates**: WebSocket-powered live updates for device status changes
3. **Device Management**: View detailed device information and perform actions (SSH, ping)
4. **Statistics Dashboard**: Real-time network health metrics and device counts
5. **Responsive Design**: Mobile-friendly interface with adaptive layouts

### UI Components
- **Dashboard**: Main interface with topology view and statistics
- **Device Modal**: Detailed device information with action buttons
- **Sidebar**: Network statistics, device filters, and activity feed
- **Network Topology**: Custom SVG visualization with force-directed layout
- **Theme System**: Dark/light mode toggle with persistent preferences

### Backend Services
- **Storage Layer**: In-memory storage implementation with PostgreSQL schema ready
- **WebSocket Handler**: Real-time communication for network updates
- **API Routes**: RESTful endpoints for device and network data
- **Development Server**: Integrated Vite development server with hot reload

## Data Flow

1. **Initial Load**: Client fetches network topology from `/api/network/topology`
2. **WebSocket Connection**: Establishes persistent connection at `/ws` for real-time updates
3. **State Updates**: Server broadcasts device status changes to all connected clients
4. **UI Updates**: React components re-render based on incoming WebSocket messages
5. **User Actions**: Device interactions trigger API calls and broadcast updates

## External Dependencies

### Frontend Dependencies
- **UI Framework**: React 18 with TypeScript support
- **Component Library**: Radix UI primitives with shadcn/ui components
- **State Management**: TanStack Query for caching and synchronization
- **Styling**: Tailwind CSS with custom Tailscale branding
- **Date Handling**: date-fns for time formatting
- **Icons**: Lucide React for consistent iconography

### Backend Dependencies
- **Database**: Neon Database (PostgreSQL serverless)
- **ORM**: Drizzle ORM with Zod validation
- **WebSocket**: Built-in WebSocket server
- **Session Management**: Connect-pg-simple for PostgreSQL sessions
- **Development**: ESBuild for production builds

## Deployment Strategy

### Development Environment
- **Local Development**: `npm run dev` starts both frontend and backend with hot reload
- **Database**: Requires `DATABASE_URL` environment variable for PostgreSQL connection
- **WebSocket**: Automatically configured for local development

### Production Build
- **Frontend**: Vite builds optimized static assets to `dist/public`
- **Backend**: ESBuild bundles server code to `dist/index.js`
- **Database Migration**: `npm run db:push` applies schema changes
- **Start Command**: `npm start` runs the production server

### Environment Configuration
- **Required Variables**: `DATABASE_URL` for database connection
- **Optional Variables**: Node environment settings for optimization
- **Port Configuration**: Defaults to standard HTTP ports with WebSocket support

## Changelog

- July 05, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.