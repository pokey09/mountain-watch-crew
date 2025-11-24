# Mountain Watch Crew - GPS Staff Tracking

Real-time GPS tracking system for ski mountain staff including ski patrol, instructors, and mountain operations personnel.

## Features

- 🗺️ **Real-time Map Tracking** - Live staff location visualization using OpenStreetMap and Leaflet
- 👥 **Staff Directory** - Filterable roster with role-based organization (Patrol, Instructor, Operations)
- 🔄 **Auto-Refresh** - Automatic position updates every 15 seconds
- 🖥️ **Kiosk Mode Ready** - Optimized for 24/7 display deployment
- 📱 **Touch Optimized** - Works on tablets and touchscreens
- 🔒 **Secure** - Basic authentication with Traccar backend

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI**: shadcn/ui + Tailwind CSS + Radix UI
- **Maps**: Leaflet + React Leaflet
- **State Management**: React Context + TanStack Query
- **Backend**: Traccar GPS tracking server

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Traccar server (see setup below)

### Installation

```bash
# Clone the repository
git clone <YOUR_GIT_URL>
cd mountain-watch-crew

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:8080`

### Building for Production

```bash
# Build the app
npm run build

# Preview production build
npm run preview
```

## Running a Traccar Server

This project requires a Traccar-compatible GPS tracking server.

### Option 1: Docker (Development)

```bash
# Start Traccar server
docker compose -f docker-compose.taccar.yml up -d
```

Access at `http://localhost:8082` (default credentials: `admin/admin`)

### Option 2: Native Installation (Production - Raspberry Pi)

See [KIOSK_SETUP.md](KIOSK_SETUP.md) for complete Raspberry Pi deployment instructions.

```bash
# Download Traccar for ARM (Raspberry Pi)
wget https://www.traccar.org/download/traccar-linux-arm.zip
unzip traccar-linux-arm.zip
sudo ./traccar.run

# Start service
sudo systemctl start traccar
sudo systemctl enable traccar
```

## Configuration

### Environment Variables

Create a `.env.local` file (optional):

```env
VITE_TACCAR_BASE_URL=http://localhost:8082
VITE_TACCAR_USERNAME=admin
VITE_TACCAR_PASSWORD=admin
```

**Note:** For better security, configure connection details through the in-app dialog instead.

### Traccar Setup

1. Access Traccar UI at `http://localhost:8082`
2. Login with default credentials: `admin/admin`
3. **Change the default password immediately**
4. Create devices for each staff member:
   - Settings → Devices → Add Device
   - Set device name to staff member name
   - Add role attribute: `patrol`, `instructor`, or `operations`
5. Configure GPS devices to report to port `5055`

### Connecting the App

1. Open the Mountain Watch app
2. Click **Connect server** in the header
3. Enter your Traccar server URL (e.g., `http://localhost:8082`)
4. Provide username and password
5. Connection details are saved in browser localStorage

## Kiosk Deployment

For 24/7 kiosk deployment on Raspberry Pi, see the comprehensive guide:

📖 **[KIOSK_SETUP.md](KIOSK_SETUP.md)**

Includes:
- Raspberry Pi OS installation
- Native Traccar setup
- Chromium kiosk browser configuration
- Auto-start on boot
- Security hardening
- Remote management
- Troubleshooting

### Kiosk Features

- ✅ Screen wake lock (prevents sleep)
- ✅ Disabled text selection
- ✅ Blocked context menus
- ✅ Keyboard shortcut blocking
- ✅ Auto-reload on network reconnection
- ✅ No scrolling (fixed viewport)
- ✅ Touch-optimized interface

## Project Structure

```
mountain-watch-crew/
├── src/
│   ├── components/       # React components
│   │   ├── Header.tsx
│   │   ├── MapView.tsx
│   │   ├── StaffList.tsx
│   │   ├── StaffCard.tsx
│   │   ├── TaccarConnectDialog.tsx
│   │   └── ui/          # shadcn UI components
│   ├── context/         # React context providers
│   │   └── TaccarContext.tsx
│   ├── hooks/           # Custom React hooks
│   │   ├── useTaccarData.ts
│   │   ├── useTaccarStaff.ts
│   │   └── useKioskMode.ts
│   ├── pages/           # Page components
│   │   ├── Index.tsx
│   │   └── NotFound.tsx
│   ├── lib/             # Utilities
│   └── assets/          # Static assets
├── taccar/
│   └── conf/
│       └── traccar.xml  # Traccar configuration
├── docker-compose.taccar.yml
├── KIOSK_SETUP.md       # Raspberry Pi deployment guide
└── README.md
```

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### API Integration

The app connects to Traccar's REST API:

- `GET /api/devices` - List all devices (staff members)
- `GET /api/positions` - Get latest GPS positions

Authentication uses HTTP Basic Auth with base64 encoding.

## CORS Configuration

If hosting Traccar on a different origin, update `traccar.xml`:

```xml
<entry key='web.origin'>http://your-app-host:port</entry>
```

Restart Traccar after changes:

```bash
sudo systemctl restart traccar
```

## Browser Compatibility

- ✅ Chrome/Chromium (recommended for kiosk)
- ✅ Firefox
- ✅ Safari
- ✅ Edge

**Note:** Wake Lock API requires HTTPS in production (except localhost).

## Troubleshooting

### Connection Issues

- Verify Traccar is running: `sudo systemctl status traccar`
- Check Traccar is accessible: `curl http://localhost:8082`
- Verify CORS is configured in `traccar.xml`
- Check browser console for errors

### No Staff Appearing

- Ensure devices are created in Traccar
- Verify devices have reported positions
- Check Traccar API: `http://localhost:8082/api/positions`
- Use Traccar's built-in simulator for testing

### Map Not Loading

- Check browser console for errors
- Verify internet connection (for OpenStreetMap tiles)
- Clear browser cache
- Check Leaflet CSS is loading

## License

This project is private and proprietary.

## Support

For issues and questions, see [KIOSK_SETUP.md](KIOSK_SETUP.md) troubleshooting section.

---

**Built for Mountain Operations** 🏔️ ⛷️
