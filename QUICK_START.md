# Quick Start Guide - Getting Staff Locations to Display

## Problem: No staff locations showing on the map?

Follow these steps to get everything working:

---

## Step 1: Start Traccar Server

### Option A: Using Docker (if Docker Desktop is installed)

```bash
# Start Traccar
docker compose -f docker-compose.taccar.yml up -d

# Verify it's running
docker ps
```

### Option B: Using Docker Desktop GUI
1. Open Docker Desktop
2. Go to Containers
3. Look for `traccar` container
4. If not running, click the play button

### Verify Traccar is Running
Open your browser and go to: **http://localhost:8082**

- If you see the Traccar login page → ✅ Working!
- If you get an error → Traccar is not running

**Default login:**
- Username: `admin`
- Password: `admin`

---

## Step 2: Create Devices in Traccar

1. **Login to Traccar** at http://localhost:8082
2. **Change the default password** (Settings → Account → Password)
3. **Add Devices:**
   - Click Settings → Devices
   - Click the **+** button to add a device
   - Fill in:
     - **Name**: Staff member name (e.g., "John Smith")
     - **Unique ID**: Any unique identifier (e.g., "device001")
     - **Attributes** (optional): Click "Attributes" and add:
       - Key: `role`
       - Value: `patrol` or `instructor` or `operations`

4. **Repeat** for each staff member

---

## Step 3: Add Test Positions (IMPORTANT!)

Devices won't show on the map until they have at least one position reported.

### Option A: Use Traccar Simulator (Easiest)

1. In Traccar, select a device from the list
2. Click the **three dots menu** (⋮) next to the device
3. Click **"Simulate"**
4. A path will appear on the Traccar map
5. The device is now sending simulated GPS positions
6. Repeat for each device you want to test

### Option B: Send Manual Position via API

```bash
# Replace DEVICE_ID with your device unique ID
curl -X POST "http://localhost:8082/api/positions" \
  -u admin:admin \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": "device001",
    "latitude": 43.0886,
    "longitude": -73.4540,
    "altitude": 300,
    "speed": 0,
    "course": 0,
    "accuracy": 10,
    "deviceTime": "2025-11-24T12:00:00.000Z",
    "fixTime": "2025-11-24T12:00:00.000Z"
  }'
```

### Option C: Connect Real GPS Devices

If you have real GPS trackers:
1. Configure them to send data to: `localhost:5055`
2. Use the appropriate protocol for your device
3. Traccar supports 200+ GPS protocols

---

## Step 4: Start the Web App

```bash
# Make sure you're in the project directory
cd mountain-watch-crew

# Install dependencies (if not done already)
npm install

# Start the development server
npm run dev
```

Open: **http://localhost:8080**

---

## Step 5: Debug and Verify

1. Open the app at http://localhost:8080
2. Click the **"Debug"** button in the bottom-right corner
3. Check the status badges at the top:
   - **Devices: success** → Traccar has devices ✅
   - **Positions: success** → Devices have positions ✅
   - **Staff: X** → Number of staff members found ✅

### What the Debug Panel Tells You:

#### ✅ Everything Working:
```
Devices: success
Positions: success
Staff: 3
```
→ You should see staff on the map and in the list!

#### ⚠️ Devices but no positions:
```
Devices: success
Positions: empty
Staff: 3
```
→ Devices exist but haven't reported positions yet. Use the simulator!

#### ❌ Connection Error:
```
Devices: error
Positions: error
Staff: 0
```
→ Can't connect to Traccar. Make sure it's running at http://localhost:8082

---

## Common Issues

### Issue 1: "Unable to reach the Traccar server"

**Cause:** Traccar is not running or not accessible

**Fix:**
1. Check if Traccar is running: http://localhost:8082
2. Start Traccar if needed (see Step 1)
3. Check Docker Desktop if using Docker

### Issue 2: Devices show but no map markers

**Cause:** Devices have no position data

**Fix:**
1. Use Traccar's simulator (see Step 3)
2. Or send a test position via API
3. Wait 15 seconds for the app to refresh

### Issue 3: CORS errors in browser console

**Cause:** Traccar not configured to allow web requests

**Fix:**
1. Check `taccar/conf/traccar.xml` has:
   ```xml
   <entry key='web.origin'>*</entry>
   ```
2. Restart Traccar after changes

### Issue 4: Wrong credentials

**Cause:** Changed Traccar password but app still using default

**Fix:**
1. Update hardcoded credentials in `src/context/TaccarContext.tsx`
2. Or use the "Connect server" button to enter new credentials

---

## Expected Result

When everything is working:

✅ **Map View:**
- Colored dots for each staff member at their GPS location
- Different colors for different roles (patrol=red, instructor=blue, operations=orange)
- Clicking a dot shows staff name, role, location, and last update time

✅ **Staff List:**
- All staff members listed with their current status
- Active count displayed
- Filter by role (All, Patrol, Instructor, Operations)
- Auto-refreshes every 15 seconds

✅ **Debug Panel:**
- All badges show "success" or positive numbers
- No error messages in red

---

## Quick Test Checklist

- [ ] Traccar running at http://localhost:8082
- [ ] Logged into Traccar (admin/admin)
- [ ] Changed default password
- [ ] Created at least 1 device
- [ ] Device has a position (via simulator or real GPS)
- [ ] Web app running at http://localhost:8080
- [ ] Debug panel shows "Devices: success"
- [ ] Debug panel shows "Positions: success"
- [ ] Debug panel shows "Staff: 1" or more
- [ ] Staff appears on map
- [ ] Staff appears in list

---

## Still Having Issues?

1. **Open Debug Panel** - Click "Debug" button in bottom-right
2. **Check browser console** - Press F12, look for errors
3. **Check Traccar logs** - In Docker Desktop, view container logs
4. **Verify API manually**:
   ```bash
   # Test devices endpoint
   curl -u admin:admin http://localhost:8082/api/devices

   # Test positions endpoint
   curl -u admin:admin http://localhost:8082/api/positions
   ```

The output should show JSON data with your devices and positions.

---

## Next Steps

Once you see staff on the map:

1. Configure real GPS devices to report to port 5055
2. Add more staff devices in Traccar
3. Deploy to Raspberry Pi (see KIOSK_SETUP.md)
4. Set up geofencing, notifications, etc. in Traccar

Happy tracking! 🏔️
