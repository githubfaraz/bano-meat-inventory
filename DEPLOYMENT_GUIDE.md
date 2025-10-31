# Bano Fresh Inventory - Server Deployment Guide

## 🚀 Quick Deployment Steps

### 1. Backend Setup

```bash
cd /path/to/your/backend

# Install dependencies
pip install -r requirements.txt

# Create .env file with your settings
cat > .env << 'EOF'
MONGO_URL="mongodb+srv://bano_admin:YOUR_PASSWORD@bano-fresh.armyfua.mongodb.net/?retryWrites=true&w=majority&appName=bano-fresh"
DB_NAME="bano_fresh"
JWT_SECRET_KEY="your-secret-key-here"
CORS_ORIGINS="*"
EOF

# Start backend
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

### 2. Frontend Setup

```bash
cd /path/to/your/frontend

# Install dependencies
yarn install
# OR
npm install

# Create .env.production file
cat > .env.production << 'EOF'
REACT_APP_BACKEND_URL=http://YOUR_SERVER_IP:8001
EOF

# Build for production
yarn build
# OR
npm run build

# The build folder will contain your production files
# Deploy the 'build' folder to your web server
```

### 3. Serve Frontend with Nginx

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    root /path/to/frontend/build;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location /api {
        proxy_pass http://localhost:8001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 4. PM2 for Backend (Production)

```bash
# Install PM2
npm install -g pm2

# Start backend with PM2
cd /path/to/backend
pm2 start "uvicorn server:app --host 0.0.0.0 --port 8001" --name bano-fresh-backend

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

## ✅ Verification Checklist

After deployment, verify:

- [ ] Backend is running: `curl http://localhost:8001/api/health` (if health endpoint exists)
- [ ] Frontend loads without errors
- [ ] Login works and redirects to dashboard
- [ ] All navigation menus are visible
- [ ] Can access Inventory Management page
- [ ] Can access Daily Pieces and Daily Waste pages
- [ ] Admin users can see Main Categories and Derived Products
- [ ] POS page loads correctly

## 🔧 Troubleshooting

### Issue: Blank pages or missing navigation
**Solution:** 
1. Clear browser cache: Ctrl+Shift+Delete
2. Clear localStorage: Open console and run `localStorage.clear()`
3. Rebuild frontend: `yarn build`
4. Refresh page

### Issue: "undefined is not valid JSON" error
**Solution:**
1. Clear localStorage in browser console: `localStorage.clear()`
2. Refresh the page
3. Login again

### Issue: Backend connection errors
**Solution:**
1. Check backend is running: `curl http://localhost:8001`
2. Verify .env.production has correct REACT_APP_BACKEND_URL
3. Check CORS settings in backend .env

### Issue: MongoDB connection errors
**Solution:**
1. Verify MongoDB Atlas IP whitelist includes your server IP
2. Check connection string in backend/.env
3. Ensure network connectivity to MongoDB Atlas

## 📱 Admin Credentials

Default admin credentials (change after first login):
- Username: `admin-bano`
- Password: `India@54321`

## 🎯 Feature Checklist

All features implemented:
- ✅ JWT Authentication with admin roles
- ✅ Main Categories Management (Admin only)
- ✅ Derived Products with sale units (Weight/Package/Pieces)
- ✅ Inventory Management with Add Purchase
- ✅ Purchase History with Edit/Delete (Admin only)
- ✅ Daily Pieces Tracking with Edit/Delete (Admin only)
- ✅ Daily Waste Tracking with Edit/Delete (Admin only)
- ✅ POS with receipt printing
- ✅ Sales tracking
- ✅ Vendor and Customer management
- ✅ Reports and Dashboard
- ✅ User management (Admin only)

## 🔐 Security Notes

- Change default admin password immediately
- Keep JWT_SECRET_KEY secure
- Use HTTPS in production
- Regularly backup MongoDB database
- Keep dependencies updated

## 📞 Support

If issues persist after following this guide:
1. Check browser console for JavaScript errors
2. Check backend logs for Python errors
3. Verify all environment variables are set correctly
4. Ensure MongoDB Atlas cluster is online and accessible
