# Kiosk Mode Deployment Guide

This guide covers deploying the Mountain Watch Crew tracking app as a kiosk on a Raspberry Pi 4.

## Table of Contents
1. [Hardware Requirements](#hardware-requirements)
2. [OS Installation](#os-installation)
3. [Traccar Server Setup](#traccar-server-setup)
4. [Web App Deployment](#web-app-deployment)
5. [Kiosk Browser Configuration](#kiosk-browser-configuration)
6. [Auto-Start Configuration](#auto-start-configuration)
7. [Troubleshooting](#troubleshooting)

---

## Hardware Requirements

### Raspberry Pi 4 Setup
- **Raspberry Pi 4** (4GB or 8GB RAM recommended)
- **MicroSD card** (32GB minimum, Class 10)
- **Power supply** (official 5V 3A USB-C adapter)
- **Display** (HDMI monitor or touchscreen)
- **Keyboard & Mouse** (for initial setup only)
- **Ethernet cable** or WiFi connection

### Optional
- **Case with cooling** (active fan recommended for 24/7 operation)
- **UPS/Battery backup** (for power outage resilience)

---

## OS Installation

### 1. Download Raspberry Pi OS Lite (64-bit)
```bash
# Use Raspberry Pi Imager or download from:
# https://www.raspberrypi.com/software/operating-systems/

# Flash to SD card using Raspberry Pi Imager
# Enable SSH and configure WiFi during imaging (recommended)
```

### 2. Boot and Initial Setup
```bash
# Default credentials (change immediately!)
# Username: pi
# Password: raspberry

# Update system
sudo apt update && sudo apt upgrade -y

# Set timezone
sudo raspi-config
# Navigate to: Localisation Options > Timezone

# Change default password
passwd

# Set hostname (optional)
sudo raspi-config
# Navigate to: System Options > Hostname
# Example: mountain-watch-kiosk
```

### 3. Install Required Packages
```bash
# Install essential packages
sudo apt install -y \
  chromium-browser \
  unclutter \
  xdotool \
  x11-xserver-utils \
  lightdm \
  openbox \
  nodejs \
  npm \
  openjdk-11-jre-headless

# Verify installations
chromium-browser --version
node --version
java -version
```

---

## Traccar Server Setup

### Option 1: Native Installation (Recommended for Pi)

```bash
# Download Traccar for ARM
cd /tmp
wget https://www.traccar.org/download/traccar-linux-arm.zip
unzip traccar-linux-arm.zip

# Install
sudo ./traccar.run

# Start service
sudo systemctl start traccar
sudo systemctl enable traccar

# Verify it's running
sudo systemctl status traccar

# Access web interface at http://localhost:8082
# Default credentials: admin / admin
```

### Configure Traccar
```bash
# Edit configuration (optional)
sudo nano /opt/traccar/conf/traccar.xml

# Key settings:
# <entry key='web.port'>8082</entry>
# <entry key='web.origin'>*</entry>  # Allow CORS

# Restart after changes
sudo systemctl restart traccar
```

### Set Up Devices in Traccar
1. Open browser: `http://localhost:8082`
2. Login (admin/admin)
3. **Change default password immediately**
4. Add devices: Settings > Devices > Add Device
5. Assign names matching staff members
6. Note device unique IDs for GPS trackers

---

## Web App Deployment

### Option 1: Build and Serve Locally

```bash
# Clone repository
cd ~
git clone https://github.com/yourusername/mountain-watch-crew.git
cd mountain-watch-crew

# Install dependencies
npm install

# Build production bundle
npm run build

# Install serve globally
sudo npm install -g serve

# Test the build
serve -s dist -l 3000

# Verify at http://localhost:3000
```

### Option 2: Run Development Server (Quick Test)
```bash
cd ~/mountain-watch-crew
npm run dev -- --host 0.0.0.0 --port 3000
```

### Configure Environment Variables
```bash
# Create .env.local file
cd ~/mountain-watch-crew
nano .env.local
```

Add:
```env
VITE_TACCAR_BASE_URL=http://localhost:8082
VITE_TACCAR_USERNAME=admin
VITE_TACCAR_PASSWORD=your-password-here
```

**Security Note:** For production, set these in the Traccar Connect dialog instead of hardcoding.

---

## Kiosk Browser Configuration

### 1. Create Kiosk Start Script

```bash
# Create script directory
mkdir -p ~/kiosk
nano ~/kiosk/start-kiosk.sh
```

Add the following:
```bash
#!/bin/bash

# Disable screen blanking
xset s off
xset -dpms
xset s noblank

# Hide cursor after inactivity
unclutter -idle 0.1 &

# Start Chromium in kiosk mode
chromium-browser \
  --kiosk \
  --noerrdialogs \
  --disable-infobars \
  --disable-session-crashed-bubble \
  --disable-features=TranslateUI \
  --no-first-run \
  --check-for-update-interval=31536000 \
  --disable-pinch \
  --overscroll-history-navigation=0 \
  --app=http://localhost:3000
```

Make executable:
```bash
chmod +x ~/kiosk/start-kiosk.sh
```

### 2. Create Openbox Configuration

```bash
mkdir -p ~/.config/openbox
nano ~/.config/openbox/autostart
```

Add:
```bash
# Disable screen blanking
xset s off &
xset -dpms &
xset s noblank &

# Start web server
cd /home/pi/mountain-watch-crew && serve -s dist -l 3000 &

# Wait for server to start
sleep 5

# Start kiosk browser
/home/pi/kiosk/start-kiosk.sh &
```

Make executable:
```bash
chmod +x ~/.config/openbox/autostart
```

### 3. Configure LightDM Auto-Login

```bash
sudo nano /etc/lightdm/lightdm.conf
```

Find and modify:
```ini
[Seat:*]
autologin-user=pi
autologin-user-timeout=0
user-session=openbox
```

---

## Auto-Start Configuration

### 1. Create Systemd Service for Web Server

```bash
sudo nano /etc/systemd/system/mountain-watch-web.service
```

Add:
```ini
[Unit]
Description=Mountain Watch Web Server
After=network.target traccar.service

[Service]
Type=simple
User=pi
WorkingDirectory=/home/pi/mountain-watch-crew/dist
ExecStart=/usr/bin/npx serve -s . -l 3000
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl daemon-reload
sudo systemctl enable mountain-watch-web
sudo systemctl start mountain-watch-web
sudo systemctl status mountain-watch-web
```

### 2. Verify Auto-Start on Reboot

```bash
sudo reboot
```

After reboot:
- Traccar should start automatically
- Web server should start automatically
- Display should show kiosk in fullscreen
- No mouse cursor visible
- No browser UI elements

---

## Kiosk Features Enabled

The app includes built-in kiosk optimizations:

✅ **Screen Wake Lock** - Prevents display sleep
✅ **No Text Selection** - Prevents accidental highlighting
✅ **Disabled Context Menu** - Right-click disabled
✅ **Keyboard Shortcuts Blocked** - F11, Ctrl+W, etc. disabled
✅ **Touch Optimized** - No long-press menus on touchscreens
✅ **Auto-Reconnect** - Reloads on network recovery
✅ **No Scrolling** - Fixed viewport layout
✅ **Overscroll Prevention** - No pull-to-refresh

### Enable Fullscreen Mode
To enable auto-fullscreen on load, edit:
```typescript
// src/pages/Index.tsx
useKioskMode(true); // Change false to true
```

---

## Network Configuration

### Static IP (Recommended)
```bash
sudo nano /etc/dhcpcd.conf
```

Add:
```conf
interface eth0
static ip_address=192.168.1.100/24
static routers=192.168.1.1
static domain_name_servers=192.168.1.1 8.8.8.8

# Or for WiFi:
interface wlan0
static ip_address=192.168.1.100/24
static routers=192.168.1.1
static domain_name_servers=192.168.1.1 8.8.8.8
```

Restart networking:
```bash
sudo systemctl restart dhcpcd
```

---

## Remote Management

### SSH Access
```bash
# From another computer on the same network:
ssh pi@192.168.1.100

# Update app:
cd ~/mountain-watch-crew
git pull
npm install
npm run build
sudo systemctl restart mountain-watch-web
```

### VNC (Optional)
```bash
# Enable VNC
sudo raspi-config
# Navigate to: Interface Options > VNC > Enable

# Access from VNC Viewer on another computer
# Address: 192.168.1.100:5900
```

---

## Troubleshooting

### Kiosk Not Starting
```bash
# Check service status
sudo systemctl status mountain-watch-web
sudo systemctl status traccar

# Check logs
journalctl -u mountain-watch-web -n 50
journalctl -u traccar -n 50

# Restart services
sudo systemctl restart mountain-watch-web
sudo systemctl restart traccar
```

### Display Issues
```bash
# Check X server
ps aux | grep X

# Restart X session
sudo systemctl restart lightdm

# Check Openbox logs
cat ~/.xsession-errors
```

### Traccar Not Accessible
```bash
# Verify Traccar is running
sudo systemctl status traccar

# Check port
sudo netstat -tuln | grep 8082

# Test connection
curl http://localhost:8082

# Restart Traccar
sudo systemctl restart traccar
```

### Network Issues
```bash
# Check connection
ping google.com

# Check IP
ip addr show

# Restart networking
sudo systemctl restart dhcpcd
```

### Screen Sleeping Despite Wake Lock
```bash
# Add to /boot/config.txt
sudo nano /boot/config.txt

# Add:
hdmi_blanking=1

# Reboot
sudo reboot
```

### Browser Crashes/Freezes
```bash
# Clear browser cache
rm -rf ~/.cache/chromium

# Increase GPU memory (if needed)
sudo nano /boot/config.txt
# Add: gpu_mem=256

sudo reboot
```

---

## Security Hardening

### Change Default Passwords
```bash
# Pi user
passwd

# Traccar admin
# Change via web interface: http://localhost:8082
```

### Firewall Setup
```bash
sudo apt install -y ufw

# Allow SSH (for remote access)
sudo ufw allow 22/tcp

# Allow Traccar device connections
sudo ufw allow 5055/tcp

# Allow local web access only (optional)
sudo ufw allow from 192.168.1.0/24 to any port 3000
sudo ufw allow from 192.168.1.0/24 to any port 8082

# Enable firewall
sudo ufw enable
```

### Disable Unused Services
```bash
sudo systemctl disable bluetooth
sudo systemctl disable cups
```

---

## Maintenance

### Daily Auto-Reboot (Optional)
```bash
# Edit crontab
crontab -e

# Add (reboot at 3 AM daily):
0 3 * * * /sbin/shutdown -r now
```

### Update Script
```bash
nano ~/kiosk/update.sh
```

Add:
```bash
#!/bin/bash
cd ~/mountain-watch-crew
git pull
npm install
npm run build
sudo systemctl restart mountain-watch-web
```

```bash
chmod +x ~/kiosk/update.sh
```

### Monitor System Health
```bash
# CPU temperature
vcgencmd measure_temp

# Memory usage
free -h

# Disk usage
df -h

# Uptime
uptime
```

---

## Performance Optimization

### Overclock Pi 4 (Optional)
```bash
sudo nano /boot/config.txt
```

Add:
```conf
# Moderate overclock
over_voltage=2
arm_freq=1750
gpu_freq=600
```

**Warning:** Ensure adequate cooling before overclocking.

### Reduce Memory Usage
```bash
# Disable swap (if using 4GB+ RAM)
sudo dphys-swapfile swapoff
sudo systemctl disable dphys-swapfile
```

---

## Support

For issues or questions:
- Check [GitHub Issues](https://github.com/yourusername/mountain-watch-crew/issues)
- Review [Traccar Documentation](https://www.traccar.org/documentation/)
- Raspberry Pi Forums: https://forums.raspberrypi.com/

---

## Quick Reference Commands

```bash
# Restart services
sudo systemctl restart traccar
sudo systemctl restart mountain-watch-web
sudo systemctl restart lightdm

# View logs
journalctl -u traccar -f
journalctl -u mountain-watch-web -f

# Reboot system
sudo reboot

# Shutdown system
sudo shutdown -h now
```
