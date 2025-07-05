# Tailscale Network Topology Dashboard

This project visualizes a Tailscale network in real time. It uses a React front end with a Node.js and Express back end. The project was created on Replit and includes a PostgreSQL database schema using Drizzle ORM.

## Project timeline
- **Jul 5, 2025** - Repository initialized with base Replit configuration
- **Jul 5, 2025** - Initial project structure and UI components added

## Tasks
### Completed
- Set up React, Tailwind and shadcn/ui components
- Set up Express server with WebSocket support
- In-memory data storage with a PostgreSQL schema definition
- Basic network topology visualization

### In progress / planned
- Persist data to a real PostgreSQL instance
- Add authentication and user management
- Improve device management actions and real-time updates
- Add automated tests and CI workflow

## Repository structure
- `client/` – React front end code
- `server/` – Express server and WebSocket logic
- `shared/` – Types shared between client and server

To start the project locally:
```bash
npm install
npm run dev
```
