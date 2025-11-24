# Raspberry Pi Self-Hosted Deployment Guide

Complete guide for deploying Mountain Watch Crew on a Raspberry Pi with your own domain.

## Prerequisites

- Raspberry Pi (3B+ or later recommended)
- Raspberry Pi OS (64-bit recommended)
- Domain name (e.g., `mountainwatch.yourdomain.com`)
- Router access for port forwarding (if accessing externally)
- Basic command line knowledge

---

## Part 1: Prepare Your Raspberry Pi

### 1. Update System

```bash
sudo apt update && sudo apt upgrade -y
```

### 2. Install Required Software

```bash
# Install nginx (web server)
sudo apt install nginx -y

# Install certbot (for SSL certificates)
sudo apt install certbot python3-certbot-nginx -y

# Install Node.js (for building the app)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install nodejs -y
```

### 3. Install and Configure Traccar

```bash
# Download Traccar for ARM
cd ~
wget https://www.traccar.org/download/traccar-linux-arm64.zip
unzip traccar-linux-arm64.zip

# Install
sudo ./traccar.run

# Start and enable service
sudo systemctl start traccar
sudo systemctl enable traccar

# Verify it's running
sudo systemctl status traccar
```

---

## Part 2: Build and Deploy the Web App

### 1. Clone Your Repository

```bash
cd /var/www
sudo mkdir -p mountain-watch
sudo chown $USER:$USER mountain-watch
cd mountain-watch

# Clone your repo
git clone https://github.com/YOUR_USERNAME/mountain-watch-crew.git .
```

### 2. Configure Production Environment

```bash
# Create production config
cat > .env.production << EOF
VITE_TACCAR_BASE_URL=http://localhost:8082
VITE_TACCAR_USERNAME=admin
VITE_TACCAR_PASSWORD=YOUR_SECURE_PASSWORD
EOF
```

### 3. Build the Application

```bash
# Install dependencies
npm install

# Build for production
npm run build

# The build output will be in the 'dist' folder
```

---

## Part 3: Configure Nginx Web Server

### 1. Create Nginx Configuration

```bash
sudo nano /etc/nginx/sites-available/mountain-watch
```

Paste this configuration:

```nginx
# Mountain Watch - HTTP (will redirect to HTTPS)
server {
    listen 80;
    listen [::]:80;
    server_name mountainwatch.yourdomain.com;

    # Let's Encrypt challenge
    location /.well-known/acme-challenge/ {
        root /var/www/mountain-watch/dist;
    }

    # Redirect to HTTPS
    location / {
        return 301 https://$server_name$request_uri;
    }
}

# Mountain Watch - HTTPS
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name mountainwatch.yourdomain.com;

    # SSL certificates (will be configured by certbot)
    ssl_certificate /etc/letsencrypt/live/mountainwatch.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/mountainwatch.yourdomain.com/privkey.pem;

    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256';

    # Root directory
    root /var/www/mountain-watch/dist;
    index index.html;

    # Security headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer" always;

    # Serve the app
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Proxy Traccar API requests
    location /api/ {
        proxy_pass http://localhost:8082;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 2. Enable the Site

```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/mountain-watch /etc/nginx/sites-enabled/

# Remove default site (optional)
sudo rm /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Restart nginx
sudo systemctl restart nginx
```

---

## Part 4: Domain and DNS Setup

### 1. Configure DNS Records

Log into your domain registrar and add an A record:

```
Type: A
Name: mountainwatch (or @ for root domain)
Value: YOUR_RASPBERRY_PI_PUBLIC_IP
TTL: 3600
```

**Finding your public IP:**
```bash
curl ifconfig.me
```

### 2. Port Forwarding (if behind router)

Configure your router to forward ports to your Raspberry Pi:

- **Port 80** → Raspberry Pi IP (for HTTP/Let's Encrypt)
- **Port 443** → Raspberry Pi IP (for HTTPS)
- **Port 8082** (optional) → Raspberry Pi IP (for direct Traccar access)

---

## Part 5: SSL Certificate (HTTPS)

### 1. Obtain Let's Encrypt Certificate

**Before running this, ensure:**
- Your domain DNS is pointing to your Pi
- Port 80 is open and forwarded
- Nginx is running

```bash
# Get certificate (replace with your domain)
sudo certbot --nginx -d mountainwatch.yourdomain.com

# Follow the prompts:
# - Enter your email
# - Agree to terms
# - Choose to redirect HTTP to HTTPS (option 2)
```

### 2. Auto-Renewal

Certbot automatically sets up renewal. Test it:

```bash
sudo certbot renew --dry-run
```

---

## Part 6: Configure Traccar for Your Domain

### 1. Update Traccar Configuration

```bash
sudo nano /opt/traccar/conf/traccar.xml
```

Update these entries:

```xml
<!-- Allow requests from your domain -->
<entry key='web.origin'>https://mountainwatch.yourdomain.com</entry>

<!-- Optional: Change Traccar web interface port if needed -->
<entry key='web.port'>8082</entry>
```

### 2. Restart Traccar

```bash
sudo systemctl restart traccar
```

---

## Part 7: Final Steps

### 1. Test Your Deployment

1. **Access your domain:** `https://mountainwatch.yourdomain.com`
2. **Check SSL:** Should show secure padlock in browser
3. **Test connection:** App should connect to Traccar automatically
4. **Verify API:** Open browser console, should see no CORS errors

### 2. Update Traccar Password

1. Access Traccar at `http://YOUR_PI_IP:8082`
2. Login with `admin/admin`
3. **Change password immediately**
4. Update `.env.production` if you hardcoded credentials

### 3. Create Devices (Staff Members)

In Traccar:
1. Settings → Devices → Add Device
2. For each staff member:
   - Name: Staff member name
   - Identifier: Unique ID (e.g., "JS001")
   - Attributes → Add: `role` = `patrol`, `instructor`, or `operations`

---

## Part 8: Kiosk Mode Setup

### 1. Auto-Start Chromium in Kiosk Mode

```bash
# Create autostart directory
mkdir -p ~/.config/lxsession/LXDE-pi

# Create autostart file
nano ~/.config/lxsession/LXDE-pi/autostart
```

Add:

```bash
@lxpanel --profile LXDE-pi
@pcmanfm --desktop --profile LXDE-pi
@xscreensaver -no-splash

# Disable screen blanking
@xset s off
@xset -dpms
@xset s noblank

# Start Chromium in kiosk mode
@chromium-browser --kiosk --disable-infobars --disable-session-crashed-bubble --disable-restore-session-state --noerrdialogs https://mountainwatch.yourdomain.com
```

### 2. Prevent Screen Sleep

```bash
# Edit lightdm config
sudo nano /etc/lightdm/lightdm.conf
```

Add under `[Seat:*]`:

```ini
xserver-command=X -s 0 -dpms
```

---

## Maintenance & Updates

### Update the Web App

```bash
cd /var/www/mountain-watch

# Pull latest changes
git pull

# Install any new dependencies
npm install

# Rebuild
npm run build

# No need to restart nginx - changes are immediate
```

### View Logs

```bash
# Nginx access logs
sudo tail -f /var/log/nginx/access.log

# Nginx error logs
sudo tail -f /var/log/nginx/error.log

# Traccar logs
sudo tail -f /opt/traccar/logs/tracker-server.log
```

### Restart Services

```bash
# Restart nginx
sudo systemctl restart nginx

# Restart Traccar
sudo systemctl restart traccar

# Check status
sudo systemctl status nginx
sudo systemctl status traccar
```

---

## Security Best Practices

1. **Change default passwords**
   - Raspberry Pi user password
   - Traccar admin password

2. **Keep system updated**
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

3. **Configure firewall (optional)**
   ```bash
   sudo apt install ufw -y
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   sudo ufw allow 22/tcp  # SSH
   sudo ufw enable
   ```

4. **Regular backups**
   - Traccar database: `/opt/traccar/data/`
   - Nginx config: `/etc/nginx/sites-available/`
   - App source: `/var/www/mountain-watch/`

---

## Troubleshooting

### Can't Access Domain

1. **Check DNS propagation:**
   ```bash
   dig mountainwatch.yourdomain.com
   nslookup mountainwatch.yourdomain.com
   ```

2. **Verify nginx is running:**
   ```bash
   sudo systemctl status nginx
   ```

3. **Check port forwarding** in your router

### SSL Certificate Issues

1. **Ensure port 80 is open** (Let's Encrypt needs it)
2. **Check nginx config:**
   ```bash
   sudo nginx -t
   ```
3. **Manual certificate renewal:**
   ```bash
   sudo certbot renew --force-renewal
   ```

### Traccar Connection Fails

1. **Check Traccar is running:**
   ```bash
   sudo systemctl status traccar
   ```

2. **Test Traccar API:**
   ```bash
   curl http://localhost:8082/api/server
   ```

3. **Check CORS settings** in Traccar config

### App Not Updating

1. **Hard refresh browser:** `Ctrl+Shift+R` (or `Cmd+Shift+R` on Mac)
2. **Clear browser cache**
3. **Verify build completed:**
   ```bash
   ls -la /var/www/mountain-watch/dist
   ```

---

## Alternative: Local Network Only

If you only want to access the app on your local network (no internet):

1. **Skip DNS and SSL steps** (Part 4 & 5)
2. **Use simplified nginx config:**

```nginx
server {
    listen 80;
    server_name _;

    root /var/www/mountain-watch/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://localhost:8082;
    }
}
```

3. **Access via local IP:** `http://YOUR_PI_LOCAL_IP`
4. **Note:** User location (GPS) requires HTTPS in production, so it won't work over HTTP except on localhost

---

## Support

For issues:
- Check logs (see Maintenance section)
- Verify all services are running
- Ensure firewall/port forwarding is configured
- Test with `curl` commands to isolate issues

**Need help?** Check the main [README.md](README.md) and [KIOSK_SETUP.md](KIOSK_SETUP.md) for additional guidance.
