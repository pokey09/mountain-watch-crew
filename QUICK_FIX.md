# Quick Fix for Nginx SSL Error

You're seeing this error because nginx is trying to load SSL certificates that don't exist yet. You need to start with HTTP-only config first.

## Fix the Current Error

On your Raspberry Pi, run these commands:

```bash
# Step 1: Copy the HTTP-only config
sudo cp nginx-http-only.conf /etc/nginx/sites-available/mountain-watch

# Step 2: Test nginx config
sudo nginx -t

# Step 3: Restart nginx
sudo systemctl restart nginx

# Step 4: Verify it's working
curl http://tracking.willardskipatrol.net
# Or visit http://tracking.willardskipatrol.net in your browser
```

## Get SSL Certificate

Once nginx is running with HTTP-only config:

```bash
# Get SSL certificate from Let's Encrypt
sudo certbot --nginx -d tracking.willardskipatrol.net

# Follow the prompts - certbot will automatically update your nginx config
```

**OR** manually update after certbot:

```bash
# Copy the HTTPS-enabled config
sudo cp nginx-https.conf /etc/nginx/sites-available/mountain-watch

# Test nginx config
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx
```

## Verify HTTPS is Working

```bash
# Test HTTPS
curl https://tracking.willardskipatrol.net

# Or visit in browser
open https://tracking.willardskipatrol.net
```

## Correct Deployment Order

1. ✅ Build the app (`npm run build`)
2. ✅ Use **HTTP-only** nginx config (`nginx-http-only.conf`)
3. ✅ Start nginx and verify it works
4. ✅ Get SSL certificate with certbot
5. ✅ Update to **HTTPS** nginx config (`nginx-https.conf`)
6. ✅ Reload nginx

## Common Mistakes

❌ **Don't** use HTTPS config before getting the SSL certificate
❌ **Don't** try to get SSL cert if nginx won't start
❌ **Don't** skip the HTTP-only step

✅ **Do** start with HTTP-only config
✅ **Do** verify HTTP works first
✅ **Do** get SSL certificate after HTTP is working
✅ **Do** then switch to HTTPS config
