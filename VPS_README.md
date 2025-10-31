# VPS Deployment Branch

This branch contains the production-ready code for deploying Bano Fresh Inventory System on a self-managed VPS.

## 📋 Quick Start for VPS Deployment

### Prerequisites
- Self-managed VPS with root access
- Ubuntu 20.04/22.04 or Debian 11/12 (recommended)
- Minimum: 1GB RAM, 20GB disk space
- Domain or subdomain (optional but recommended)
- MongoDB Atlas account and connection string

### Deployment Steps

**Follow the comprehensive guide:** [VPS_DEPLOYMENT_GUIDE.md](/VPS_DEPLOYMENT_GUIDE.md)

### Quick Setup Commands

```bash
# 1. SSH into your VPS
ssh root@your-vps-ip

# 2. Update system
apt update && apt upgrade -y

# 3. Install Python 3.11
add-apt-repository ppa:deadsnakes/ppa -y
apt update
apt install -y python3.11 python3.11-venv python3.11-dev

# 4. Install Nginx
apt install -y nginx

# 5. Clone repository
mkdir -p /var/www/bano-fresh
cd /var/www/bano-fresh
git clone -b vps https://github.com/githubfaraz/bano-meat-inventory.git .

# 6. Setup backend
cd backend
python3.11 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# 7. Configure environment
cp .env.example .env
nano .env  # Add your MongoDB Atlas credentials

# 8. Create systemd service
# Follow VPS_DEPLOYMENT_GUIDE.md Section 7

# 9. Configure Nginx
# Follow VPS_DEPLOYMENT_GUIDE.md Section 8

# 10. Start services
systemctl start bano-fresh-backend
systemctl enable bano-fresh-backend
```

## 🔧 Configuration Files

### Backend Environment Variables
Location: `/var/www/bano-fresh/backend/.env`

Required variables:
- `MONGO_URL` - MongoDB Atlas connection string
- `DB_NAME` - Database name (default: bano_fresh)
- `JWT_SECRET_KEY` - Secure random string for JWT tokens
- `CORS_ORIGINS` - Frontend domain (use `*` for testing, specific domain for production)

### Systemd Service
Location: `/etc/systemd/system/bano-fresh-backend.service`

### Nginx Configuration
Location: `/etc/nginx/sites-available/bano-fresh-api`

## 🌐 Access Points

After deployment:

- **Backend API**: `https://your-domain.com` or `https://your-vps-ip`
- **API Documentation**: `https://your-domain.com/docs` (FastAPI auto-generated)
- **Health Check**: `https://your-domain.com/api/` (should return JSON)

## 🔐 Admin Credentials

**Default admin account:**
- Username: `admin-bano`
- Password: `India@54321`

⚠️ **IMPORTANT**: Change the admin password after first login!

## 📁 Directory Structure on VPS

```
/var/www/bano-fresh/
├── backend/
│   ├── venv/              # Python virtual environment
│   ├── .env               # Environment variables (create from .env.example)
│   ├── server.py          # Main FastAPI application
│   └── requirements.txt   # Python dependencies
├── frontend/              # Not needed on VPS (deploy separately)
├── VPS_DEPLOYMENT_GUIDE.md
└── README.md
```

## 🔄 Updating the Application

```bash
# SSH into VPS
ssh root@your-vps-ip

# Navigate to application directory
cd /var/www/bano-fresh

# Pull latest changes
git pull origin vps

# Activate virtual environment
cd backend
source venv/bin/activate

# Update dependencies (if changed)
pip install -r requirements.txt

# Restart backend service
systemctl restart bano-fresh-backend

# Check status
systemctl status bano-fresh-backend
```

## 📊 Monitoring

### Check Service Status
```bash
systemctl status bano-fresh-backend
```

### View Logs
```bash
# Real-time logs
journalctl -u bano-fresh-backend -f

# Last 50 lines
journalctl -u bano-fresh-backend -n 50
```

### Check Nginx Logs
```bash
tail -f /var/log/nginx/error.log
tail -f /var/log/nginx/access.log
```

## 🐛 Troubleshooting

### Backend not starting?
```bash
# Check logs
journalctl -u bano-fresh-backend -n 100

# Test manually
cd /var/www/bano-fresh/backend
source venv/bin/activate
uvicorn server:app --host 127.0.0.1 --port 8001
```

### MongoDB connection issues?
- Verify `MONGO_URL` in `.env`
- Check MongoDB Atlas IP whitelist (allow 0.0.0.0/0 for testing)
- Ensure MongoDB user has correct permissions

### Nginx 502 Bad Gateway?
```bash
# Check if backend is running
systemctl status bano-fresh-backend

# Check if port 8001 is listening
netstat -tulpn | grep 8001

# Check Nginx error logs
tail -50 /var/log/nginx/error.log
```

## 🔒 Security Checklist

- [ ] Changed default admin password
- [ ] Updated JWT_SECRET_KEY with secure random string
- [ ] Configured CORS_ORIGINS to specific domain (not `*`)
- [ ] Enabled UFW firewall
- [ ] Installed SSL certificate (Let's Encrypt)
- [ ] MongoDB Atlas IP whitelist configured
- [ ] Regular system updates enabled
- [ ] Backup strategy in place

## 🚀 Frontend Deployment

The frontend should be deployed separately to:
- Hostinger (static files)
- Netlify
- Vercel
- Or any static hosting service

**Frontend environment variable:**
```
REACT_APP_BACKEND_URL=https://your-vps-domain.com
```

Build and deploy:
```bash
cd frontend
echo "REACT_APP_BACKEND_URL=https://api.banofresh.com" > .env.production
yarn build
# Upload build/ contents to hosting
```

## 📞 Support

For deployment issues:
1. Check [VPS_DEPLOYMENT_GUIDE.md](/VPS_DEPLOYMENT_GUIDE.md)
2. Review [ADMIN_FIX_DOCUMENTATION.md](/ADMIN_FIX_DOCUMENTATION.md)
3. Check service logs
4. Verify all environment variables

## 🔄 Multiple Websites on Same VPS

To host multiple applications:
1. Use different ports for each backend (8001, 8002, 8003, etc.)
2. Create separate systemd services
3. Create separate Nginx configurations
4. Use different domains/subdomains

Example:
- App 1: `api.banofresh.com` → port 8001
- App 2: `api.example.com` → port 8002

## 📦 Production Checklist

Before going live:

**Backend:**
- [ ] .env configured with production values
- [ ] Systemd service created and enabled
- [ ] Nginx configured with SSL
- [ ] Firewall configured (UFW)
- [ ] Logs rotation configured

**Database:**
- [ ] MongoDB Atlas cluster running
- [ ] IP whitelist configured
- [ ] Backup enabled

**Frontend:**
- [ ] Built with production backend URL
- [ ] Uploaded to hosting
- [ ] Domain configured

**Testing:**
- [ ] Admin login working
- [ ] All CRUD operations tested
- [ ] POS system functional
- [ ] Report generation working

---

**Branch:** vps  
**Status:** Production Ready  
**Python Version:** 3.11  
**MongoDB:** Atlas (remote)  
**Deployment Type:** Self-managed VPS
