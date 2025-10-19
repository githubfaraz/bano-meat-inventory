# VPS Deployment Guide - Bano Fresh Inventory System

This guide will help you deploy the Bano Fresh inventory application on a self-managed Linux VPS with root access.

## 📋 Prerequisites

- Self-managed VPS with root access
- Ubuntu 20.04/22.04 or Debian 11/12 (recommended)
- Minimum: 1GB RAM, 20GB disk space
- Domain or subdomain for backend API (optional but recommended)
- MongoDB Atlas connection string
- SSH access to VPS

## 🎯 Deployment Overview

We'll set up:
1. Python 3.11 environment
2. FastAPI backend with systemd service
3. Nginx as reverse proxy
4. SSL certificate with Let's Encrypt (optional)
5. Multiple websites support

## 📝 Step-by-Step Deployment

### Step 1: Initial VPS Setup

```bash
# Update system packages
apt update && apt upgrade -y

# Install essential tools
apt install -y curl wget git nano ufw build-essential software-properties-common

# Configure firewall
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw enable
```

### Step 2: Install Python 3.11

```bash
# Add deadsnakes PPA (for Ubuntu)
add-apt-repository ppa:deadsnakes/ppa -y
apt update

# Install Python 3.11 and pip
apt install -y python3.11 python3.11-venv python3.11-dev python3-pip

# Verify installation
python3.11 --version
```

### Step 3: Install and Configure Nginx

```bash
# Install Nginx
apt install -y nginx

# Start and enable Nginx
systemctl start nginx
systemctl enable nginx

# Check status
systemctl status nginx
```

### Step 4: Clone Repository and Setup Backend

```bash
# Create application directory
mkdir -p /var/www/bano-fresh
cd /var/www/bano-fresh

# Clone repository
git clone https://github.com/githubfaraz/bano-meat-inventory.git .

# Navigate to backend
cd /var/www/bano-fresh/backend

# Create virtual environment
python3.11 -m venv venv

# Activate virtual environment
source venv/bin/activate

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt
```

### Step 5: Configure Environment Variables

```bash
# Edit .env file
nano /var/www/bano-fresh/backend/.env
```

Add your environment variables:

```env
MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority
DB_NAME=bano_fresh_inventory
JWT_SECRET_KEY=your_super_secret_jwt_key_change_this
CORS_ORIGINS=http://your-frontend-domain.com
```

**Important**: Replace with your actual values!

Save and exit (Ctrl+X, then Y, then Enter)

### Step 6: Test Backend Locally

```bash
# Test if the backend runs
cd /var/www/bano-fresh/backend
source venv/bin/activate
uvicorn server:app --host 0.0.0.0 --port 8001
```

Press Ctrl+C to stop after verifying it works.

### Step 7: Create Systemd Service

```bash
# Create service file
nano /etc/systemd/system/bano-fresh-backend.service
```

Paste this configuration:

```ini
[Unit]
Description=Bano Fresh FastAPI Backend
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/var/www/bano-fresh/backend
Environment="PATH=/var/www/bano-fresh/backend/venv/bin"
ExecStart=/var/www/bano-fresh/backend/venv/bin/uvicorn server:app --host 127.0.0.1 --port 8001 --workers 2
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Save and exit.

```bash
# Reload systemd, enable and start service
systemctl daemon-reload
systemctl enable bano-fresh-backend
systemctl start bano-fresh-backend

# Check status
systemctl status bano-fresh-backend

# View logs if needed
journalctl -u bano-fresh-backend -f
```

### Step 8: Configure Nginx Reverse Proxy

```bash
# Create Nginx configuration
nano /etc/nginx/sites-available/bano-fresh-api
```

Paste this configuration (replace `your-domain.com` with your actual domain):

```nginx
server {
    listen 80;
    server_name api.your-domain.com;  # Replace with your domain

    # For multiple domains, you can use:
    # server_name api.your-domain.com api2.your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:8001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket support (if needed)
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    # Increase timeouts
    proxy_connect_timeout 600;
    proxy_send_timeout 600;
    proxy_read_timeout 600;
    send_timeout 600;
}
```

Save and exit.

```bash
# Enable site
ln -s /etc/nginx/sites-available/bano-fresh-api /etc/nginx/sites-enabled/

# Test Nginx configuration
nginx -t

# Reload Nginx
systemctl reload nginx
```

### Step 9: Install SSL Certificate (Optional but Recommended)

```bash
# Install Certbot
apt install -y certbot python3-certbot-nginx

# Obtain SSL certificate (replace with your domain)
certbot --nginx -d api.your-domain.com

# Auto-renewal is set up automatically
# Test renewal
certbot renew --dry-run
```

### Step 10: Deploy Frontend to Hostinger (or Any Static Hosting)

From your local machine or Emergent environment:

```bash
# Navigate to frontend
cd frontend

# Update .env.production with your VPS backend URL
echo "REACT_APP_BACKEND_URL=https://api.your-domain.com" > .env.production

# Build for production
yarn build

# Upload the 'build' folder contents to Hostinger public_html
```

## 🔄 Managing the Application

### View Backend Logs
```bash
journalctl -u bano-fresh-backend -f
```

### Restart Backend
```bash
systemctl restart bano-fresh-backend
```

### Stop Backend
```bash
systemctl stop bano-fresh-backend
```

### Update Application Code
```bash
cd /var/www/bano-fresh
git pull origin main
cd backend
source venv/bin/activate
pip install -r requirements.txt
systemctl restart bano-fresh-backend
```

## 🌐 Hosting Multiple Websites on Same VPS

To host multiple websites, repeat Step 8 for each website with different:
- Server name (domain)
- Port number for backend (8001, 8002, 8003, etc.)
- Systemd service name
- Application directory

Example for second website:
```bash
# Second app directory
mkdir -p /var/www/second-app

# Second systemd service (port 8002)
nano /etc/systemd/system/second-app.service

# Second Nginx config
nano /etc/nginx/sites-available/second-app
```

## 🔍 Troubleshooting

### Backend not starting?
```bash
# Check logs
journalctl -u bano-fresh-backend -n 50

# Check if port is already in use
netstat -tulpn | grep 8001

# Test manually
cd /var/www/bano-fresh/backend
source venv/bin/activate
uvicorn server:app --host 127.0.0.1 --port 8001
```

### MongoDB connection issues?
- Verify MONGO_URL in .env
- Check MongoDB Atlas IP whitelist (allow 0.0.0.0/0 for testing)
- Ensure MongoDB Atlas user has correct permissions

### Nginx 502 Bad Gateway?
- Check if backend service is running: `systemctl status bano-fresh-backend`
- Verify port 8001 is listening: `netstat -tulpn | grep 8001`
- Check Nginx error logs: `tail -f /var/log/nginx/error.log`

### CORS errors from frontend?
- Update CORS_ORIGINS in backend/.env to include your frontend domain
- Restart backend: `systemctl restart bano-fresh-backend`

## 📊 Performance Optimization

### Enable Gzip Compression in Nginx
```bash
nano /etc/nginx/nginx.conf
```

Add inside `http` block:
```nginx
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;
```

### Set up Log Rotation
```bash
nano /etc/logrotate.d/bano-fresh
```

```
/var/log/bano-fresh/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 root root
}
```

## 🔒 Security Best Practices

1. **Keep system updated**: `apt update && apt upgrade` regularly
2. **Use strong passwords** for MongoDB and JWT secret
3. **Enable UFW firewall**: Only allow necessary ports
4. **Use SSL certificates**: Always use HTTPS in production
5. **Regular backups**: Backup MongoDB Atlas and application code
6. **Monitor logs**: Check application and Nginx logs regularly
7. **Limit SSH access**: Use SSH keys instead of passwords

## ✅ Verification Checklist

- [ ] Python 3.11 installed
- [ ] Backend service running
- [ ] Nginx configured and running
- [ ] MongoDB connection working
- [ ] SSL certificate installed (if using domain)
- [ ] Frontend deployed and connected to backend
- [ ] Admin login working
- [ ] All features tested (Products, Sales, POS, Reports)

## 📞 Support

If you encounter issues during deployment, check:
1. System logs: `journalctl -xe`
2. Backend logs: `journalctl -u bano-fresh-backend -f`
3. Nginx logs: `/var/log/nginx/error.log`

---

**Deployment completed successfully!** 🎉

Your Bano Fresh Inventory System should now be running on your VPS.
