# Tailscale Network Topology Dashboard

A real-time web application that visualizes your Tailscale network topology with interactive device monitoring, live status updates, and comprehensive network analytics.

## Features

- **Real-time Network Visualization**: Interactive SVG-based topology map showing all connected devices
- **Live Status Monitoring**: WebSocket-powered updates for device status changes
- **Device Management**: Detailed device information with SSH and ping capabilities
- **Dark Mode Interface**: Beautiful dark theme with light mode toggle
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Multiple View Modes**: Topology map, device grid, and analytics dashboard

## Prerequisites

- Node.js 20 or higher
- npm or yarn package manager
- Tailscale account with API access

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Tailscale API Configuration
TAILSCALE_API_KEY=your_tailscale_api_key_here
TAILSCALE_TAILNET=your_tailnet_name

# Optional: Database Configuration (uses in-memory storage by default)
DATABASE_URL=your_postgresql_connection_string

# Optional: Server Configuration
PORT=5000
NODE_ENV=development
```

### Getting Your Tailscale API Key

1. Go to the [Tailscale Admin Console](https://login.tailscale.com/admin)
2. Navigate to **Settings** → **Keys**
3. Click **Generate API Key**
4. Select the following scopes:
   - `devices:read` - Read device information
   - `devices:write` - Update device settings (optional)
   - `network:read` - Read network topology
5. Copy the generated key and add it to your `.env` file

### Finding Your Tailnet Name

Your tailnet name is typically your organization name or email domain. You can find it in:

- The Tailscale Admin Console URL: `https://login.tailscale.com/admin/machines/{tailnet-name}`
- Your device hostnames: `device-name.{tailnet-name}.ts.net`

## Installation

1. **Clone the repository**:

   ```bash
   git clone <repository-url>
   cd tailscale-network-dashboard
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Set up environment variables**:

   ```bash
   cp .env.example .env
   # Edit .env with your Tailscale API key and tailnet name
   ```

4. **Start the development server**:

   ```bash
   npm run dev
   ```

5. **Access the application**:
   Open your browser and navigate to `http://localhost:5000`

## API Endpoints

The application provides the following REST API endpoints:

- `GET /api/network/topology` - Get complete network topology
- `GET /api/devices` - List all devices
- `GET /api/devices/:id` - Get specific device details
- `PATCH /api/devices/:id` - Update device settings
- `GET /api/network/stats` - Get network statistics
- `POST /api/network/simulate` - Simulate network changes (development)

## WebSocket Events

Real-time updates are delivered via WebSocket at `/ws`:

- `initial_topology` - Initial network data on connection
- `device_status` - Device status changes
- `device_connected` - New device connected
- `device_disconnected` - Device disconnected
- `stats_updated` - Network statistics updated

## Development

### Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utility functions
│   │   └── pages/          # Page components
├── server/                 # Express backend
│   ├── index.ts            # Server entry point
│   ├── routes.ts           # API routes
│   ├── storage.ts          # Data storage layer
│   └── tailscale.ts        # Tailscale API client
├── shared/                 # Shared types and schemas
└── README.md
```

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run db:push` - Push database schema changes
- `npm run db:studio` - Open database studio

### Adding New Features

1. **Backend Changes**: Update `server/routes.ts` and `server/storage.ts`
2. **Frontend Changes**: Add components in `client/src/components/`
3. **Shared Types**: Update `shared/schema.ts` for new data structures
4. **Database**: Use Drizzle ORM for database operations

## Production Deployment

### Using Replit

1. Import this repository to Replit
2. Set environment variables in Replit Secrets
3. Click "Run" to start the application
4. Use Replit's deployment feature for production hosting

### Using Docker

```bash
# Build the image
docker build -t tailscale-dashboard .

# Run the container
docker run -p 5000:5000 \
  -e TAILSCALE_API_KEY=your_key \
  -e TAILSCALE_TAILNET=your_tailnet \
  tailscale-dashboard
```

### Using Traditional Hosting

1. Build the application: `npm run build`
2. Set environment variables on your server
3. Start the server: `npm start`
4. Configure reverse proxy (nginx/Apache) if needed

## Security Considerations

- **API Key Security**: Never commit your Tailscale API key to version control
- **Network Access**: Ensure the application runs on a trusted network
- **HTTPS**: Use HTTPS in production for secure WebSocket connections
- **Rate Limiting**: Consider implementing rate limiting for API endpoints

## Troubleshooting

### Common Issues

1. **WebSocket Connection Failed**:

   - Check if the server is running
   - Verify WebSocket URL matches your domain
   - Ensure no firewall blocking WebSocket connections

2. **No Devices Showing**:

   - Verify your Tailscale API key has correct permissions
   - Check that your tailnet name is correct
   - Ensure devices are connected to your Tailscale network

3. **API Rate Limiting**:
   - Tailscale API has rate limits; avoid excessive requests
   - Implement caching for frequently accessed data

### Debug Mode

Set `NODE_ENV=development` and check the console for detailed logs:

```bash
NODE_ENV=development npm run dev
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -am 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues and questions:

- Check the troubleshooting section above
- Open an issue on GitHub
- Contact the development team

## Changelog

- **July 2025**: Initial release with real-time visualization and Tailscale integration
