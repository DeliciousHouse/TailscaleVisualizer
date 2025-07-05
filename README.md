# Tailscale Network Topology Dashboard

This repository contains a prototype dashboard that shows the topology of a Tailscale network. The app is written in **TypeScript** and consists of a React front end and an Express back end. In development the server uses an in-memory data store but the schema is ready for PostgreSQL using Drizzle ORM.

## Features
- Interactive visualization of devices and their connections
- Live network updates over WebSockets
- REST API for device and network data
- Typed shared schema between client and server

## Getting started
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server with hot reload:
   ```bash
   npm run dev
   ```
3. The app will be available at [http://localhost:5000](http://localhost:5000).

### Useful scripts
- `npm run build` – build client and server for production
- `npm start` – run the compiled app from `dist`
- `npm run check` – type check the project
- `npm run db:push` – push database schema changes when PostgreSQL is configured

## Repository structure
- `client/` – React code and UI components
- `server/` – Express server, API routes and WebSocket logic
- `shared/` – Types and schema shared between client and server

## Project timeline
- **Jul 5, 2025** – Repository initialized
- **Jul 5, 2025** – Set up initial project structure and UI components
- **Jul 5, 2025** – Added README documentation

## Roadmap
The next areas of work are tracked here at a high level:
- [ ] Persist data to a PostgreSQL instance instead of memory
- [ ] Display device details in a modal with management actions
- [ ] Add authentication and user accounts
- [ ] Improve real-time updates and network statistics
- [ ] Add automated tests and continuous integration
