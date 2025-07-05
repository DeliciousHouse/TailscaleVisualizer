# Server

The backend is an Express application that exposes REST APIs and a WebSocket endpoint. In development it stores data in memory and periodically simulates network changes.

## Running
Start both frontend and backend together from the project root:
```bash
npm run dev
```
The server listens on port **5000** for HTTP and WebSocket traffic.

## Next tasks
- [ ] Persist devices and connections in PostgreSQL
- [ ] Secure APIs with authentication middleware
- [ ] Expose REST endpoints for managing devices
- [ ] Refine network simulation and metrics
