# Backend Deployment Guide - Step by Step

## 📋 Prerequisites

Before starting, ensure you have:
- VPS server with SSH access (root or sudo privileges)
- Python 3.11 installed
- MongoDB Atlas account with connection string
- Domain/subdomain for backend (optional, can use IP)

---

## 🚀 Step-by-Step Backend Deployment

### Step 1: Connect to Your VPS

```bash
# SSH into your VPS
ssh root@YOUR_VPS_IP
# OR
ssh your-username@YOUR_VPS_IP
```

### Step 2: Install Required System Packages

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Python 3.11 (if not installed)
sudo apt install python3.11 python3.11-venv python3-pip -y

# Install Nginx
sudo apt install nginx -y

# Install Git (if not installed)
sudo apt install git -y
```

### Step 3: Create Application Directory

```bash
# Create directory for the application
sudo mkdir -p /var/www/bano-fresh
cd /var/www/bano-fresh

# Set proper ownership (replace 'your-username' with your actual username)
# If you're root, you can skip this
sudo chown -R $USER:$USER /var/www/bano-fresh
```

### Step 4: Upload Backend Code

**Option A: Using Git (Recommended)**
```bash
cd /var/www/bano-fresh
git clone https://github.com/githubfaraz/bano-meat-inventory.git .
# OR if you have the code locally, use SCP/SFTP to upload
```

**Option B: Using SCP (from your local machine)**
```bash
# From your LOCAL machine, run:
scp -r /path/to/local/backend root@YOUR_VPS_IP:/var/www/bano-fresh/
```

**Option C: Using SFTP Client**
- Use FileZilla, WinSCP, or any SFTP client
- Connect to your VPS
- Upload the entire `backend/` folder to `/var/www/bano-fresh/backend/`

### Step 5: Setup Python Virtual Environment

```bash
cd /var/www/bano-fresh/backend

# Create virtual environment
python3.11 -m venv venv

# Activate virtual environment
source venv/bin/activate

# Upgrade pip
pip install --upgrade pip
```

### Step 6: Install Python Dependencies

```bash
# Make sure you're in the backend directory with venv activated
cd /var/www/bano-fresh/backend
source venv/bin/activate

# Install all dependencies
pip install -r requirements.txt

# Verify installation
pip list | grep fastapi
pip list | grep pymongo
pip list | grep uvicorn
```

### Step 7: Configure Environment Variables

```bash
cd /var/www/bano-fresh/backend

# Create .env file
nano .env
```

**Add the following content (replace with your actual values):**
```env
# MongoDB Configuration
MONGO_URL=mongodb+srv://bano_admin:YOUR_PASSWORD@bano-fresh.armyfua.mongodb.net/?retryWrites=true&w=majority&appName=bano-fresh
DB_NAME=bano_fresh_inventory

# JWT Configuration
JWT_SECRET_KEY=your_super_secret_random_key_change_this_immediately

# CORS Configuration (your frontend URL)
CORS_ORIGINS=https://banofresh.com
```

**Save and exit:**
- Press `Ctrl + X`
- Press `Y` to confirm
- Press `Enter`

**Important:** Generate a secure JWT secret key:
```bash
# Generate random secret key
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
# Copy the output and use it as JWT_SECRET_KEY
```

### Step 8: Test Backend Manually

```bash
# Make sure virtual environment is activated
cd /var/www/bano-fresh/backend
source venv/bin/activate

# Run the server manually to test
uvicorn server:app --host 127.0.0.1 --port 8001

# You should see:
# INFO:     Started server process
# INFO:     Application startup complete.
# INFO:     Uvicorn running on http://127.0.0.1:8001
```

**In another terminal, test the API:**
```bash
curl http://127.0.0.1:8001/api/main-categories
# Should return JSON data (or empty array if no categories yet)
```

**If working, press `Ctrl + C` to stop the server.**

### Step 9: Create Systemd Service

```bash
# Create service file
sudo nano /etc/systemd/system/bano-fresh-backend.service
```

**Add the following content:**
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

**Save and exit** (`Ctrl + X`, `Y`, `Enter`)

### Step 10: Enable and Start the Service

```bash
# Reload systemd to recognize new service
sudo systemctl daemon-reload

# Enable service to start on boot
sudo systemctl enable bano-fresh-backend

# Start the service
sudo systemctl start bano-fresh-backend

# Check status
sudo systemctl status bano-fresh-backend
```

**You should see:**
```
● bano-fresh-backend.service - Bano Fresh FastAPI Backend
   Loaded: loaded (/etc/systemd/system/bano-fresh-backend.service; enabled)
   Active: active (running) since ...
```

**If there are errors, check logs:**
```bash
sudo journalctl -u bano-fresh-backend -f
```

### Step 11: Configure Nginx Reverse Proxy

```bash
# Backup existing Nginx config
sudo cp /etc/nginx/sites-available/default /etc/nginx/sites-available/default.backup

# Edit Nginx configuration
sudo nano /etc/nginx/sites-available/default
```

**Replace or add the following configuration:**
```nginx
server {
    listen 80;
    server_name backend.banofresh.com;  # Replace with your domain or use _ for any domain

    # Backend API
    location /api {
        proxy_pass http://127.0.0.1:8001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # CORS headers (if needed)
        add_header Access-Control-Allow-Origin *;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
        add_header Access-Control-Allow-Headers "Authorization, Content-Type";
    }
}
```

**Save and exit** (`Ctrl + X`, `Y`, `Enter`)

### Step 12: Test and Reload Nginx

```bash
# Test Nginx configuration for syntax errors
sudo nginx -t

# If test passes, reload Nginx
sudo systemctl reload nginx

# Check Nginx status
sudo systemctl status nginx
```

### Step 13: Configure Firewall (if applicable)

```bash
# Allow HTTP traffic
sudo ufw allow 80/tcp

# Allow HTTPS traffic (if using SSL later)
sudo ufw allow 443/tcp

# Check firewall status
sudo ufw status
```

### Step 14: Verify Backend is Accessible

**From the VPS itself:**
```bash
curl http://127.0.0.1:8001/api/main-categories
```

**From the internet (replace with your domain/IP):**
```bash
curl http://YOUR_VPS_IP/api/main-categories
# OR
curl http://backend.banofresh.com/api/main-categories
```

**You should get JSON response** (empty array `[]` if no data, or actual data)

### Step 15: Configure MongoDB Atlas IP Whitelist

1. Go to [MongoDB Atlas Dashboard](https://cloud.mongodb.com)
2. Select your cluster
3. Click **Network Access** → **IP Access List**
4. Click **Add IP Address**
5. Add your VPS IP:
   ```bash
   # Get your VPS IP
   curl ifconfig.me
   ```
6. Add the IP to MongoDB Atlas
7. Wait 1-2 minutes for it to take effect

### Step 16: Test Full Backend Functionality

```bash
# Test login endpoint
curl -X POST http://YOUR_VPS_IP/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin-bano","password":"India@54321"}'

# Should return:
# {"access_token":"eyJ...", "token_type":"bearer", "user":{...}}
```

---

## 🔧 Useful Commands

### Service Management
```bash
# Start backend
sudo systemctl start bano-fresh-backend

# Stop backend
sudo systemctl stop bano-fresh-backend

# Restart backend (after code changes)
sudo systemctl restart bano-fresh-backend

# Check status
sudo systemctl status bano-fresh-backend

# View logs
sudo journalctl -u bano-fresh-backend -f
# Press Ctrl+C to exit logs
```

### Nginx Management
```bash
# Test Nginx config
sudo nginx -t

# Reload Nginx (after config changes)
sudo systemctl reload nginx

# Restart Nginx
sudo systemctl restart nginx

# Check status
sudo systemctl status nginx

# View error logs
sudo tail -f /var/log/nginx/error.log
```

### Updating Backend Code
```bash
# Navigate to backend directory
cd /var/www/bano-fresh/backend

# Pull latest changes (if using Git)
git pull origin main

# Or upload new files via SCP/SFTP

# Activate virtual environment
source venv/bin/activate

# Install any new dependencies
pip install -r requirements.txt

# Restart the service
sudo systemctl restart bano-fresh-backend

# Check if running
sudo systemctl status bano-fresh-backend
```

---

## 🐛 Troubleshooting

### Backend Not Starting
```bash
# Check logs
sudo journalctl -u bano-fresh-backend -n 50

# Common issues:
# 1. MongoDB connection error → Check MONGO_URL in .env
# 2. Port already in use → Check if another process is using port 8001
# 3. Permission issues → Ensure files are readable
```

### MongoDB Connection Errors
```bash
# Check if VPS IP is whitelisted
curl ifconfig.me

# Verify .env file
cat /var/www/bano-fresh/backend/.env | grep MONGO_URL

# Test MongoDB connection
cd /var/www/bano-fresh/backend
source venv/bin/activate
python3 -c "from motor.motor_asyncio import AsyncIOMotorClient; import os; from dotenv import load_dotenv; load_dotenv(); print('Testing...'); import asyncio; asyncio.run(AsyncIOMotorClient(os.environ['MONGO_URL']).admin.command('ping')); print('✅ Connected')"
```

### 502 Bad Gateway Error
```bash
# Backend service not running
sudo systemctl status bano-fresh-backend

# If not running, check logs
sudo journalctl -u bano-fresh-backend -n 50

# Restart service
sudo systemctl restart bano-fresh-backend
```

---

## ✅ Deployment Checklist

- [ ] VPS server accessible via SSH
- [ ] Python 3.11 installed
- [ ] Backend code uploaded to `/var/www/bano-fresh/backend/`
- [ ] Virtual environment created and activated
- [ ] Dependencies installed from `requirements.txt`
- [ ] `.env` file configured with MongoDB URL, JWT secret, CORS
- [ ] Backend tested manually (works on localhost:8001)
- [ ] Systemd service created and enabled
- [ ] Service started and running
- [ ] Nginx installed and configured
- [ ] Nginx configuration tested and reloaded
- [ ] Firewall configured (ports 80, 443 open)
- [ ] MongoDB Atlas IP whitelisted
- [ ] Backend accessible from internet
- [ ] Login endpoint tested and working

---

## 🎯 Expected URLs

After successful deployment:

- **Backend API:** `http://YOUR_VPS_IP/api/*` or `http://backend.banofresh.com/api/*`
- **Health Check:** `http://YOUR_VPS_IP/api/main-categories`
- **Login:** `POST http://YOUR_VPS_IP/api/auth/login`

---

## 🔐 Security Notes

1. **Change default admin password** immediately after deployment
2. **Keep JWT_SECRET_KEY secure** - never commit to Git
3. **Use HTTPS in production** - Install SSL certificate (Let's Encrypt)
4. **Regular backups** - Backup MongoDB data regularly
5. **Update dependencies** - Keep packages up to date
6. **Monitor logs** - Check for suspicious activity

---

## 📞 Need Help?

If you encounter issues:
1. Check backend logs: `sudo journalctl -u bano-fresh-backend -f`
2. Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
3. Verify service status: `sudo systemctl status bano-fresh-backend`
4. Test MongoDB connection from VPS
5. Ensure VPS IP is whitelisted in MongoDB Atlas

---

**Deployment Complete! Your backend should now be running and accessible.**
