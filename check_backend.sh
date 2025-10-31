#!/bin/bash

echo "============================================="
echo "Bano Fresh - Backend Diagnostic Check"
echo "============================================="
echo ""

# Check Python/FastAPI backend processes
echo "1. Checking for Python/FastAPI backend processes..."
if ps aux | grep -i "[u]vicorn\|[f]astapi\|[s]erver.py" | grep -v grep; then
    echo "   ✅ Backend Python process is RUNNING"
else
    echo "   ❌ No backend Python process found"
fi
echo ""

# Check what's listening on common ports
echo "2. Checking what's running on common ports..."
echo "   Port 8000:"
sudo lsof -i :8000 2>/dev/null || echo "      Nothing on port 8000"
echo "   Port 8001:"
sudo lsof -i :8001 2>/dev/null || echo "      Nothing on port 8001"
echo "   Port 5000:"
sudo lsof -i :5000 2>/dev/null || echo "      Nothing on port 5000"
echo ""

# Check Nginx configuration
echo "3. Checking Nginx configuration for backend proxy..."
if [ -f /etc/nginx/sites-available/default ]; then
    echo "   Found /etc/nginx/sites-available/default"
    echo "   Backend proxy configuration:"
    grep -A10 "location.*api\|proxy_pass" /etc/nginx/sites-available/default 2>/dev/null | head -20
elif [ -f /etc/nginx/nginx.conf ]; then
    echo "   Checking /etc/nginx/nginx.conf"
    grep -A10 "location.*api\|proxy_pass" /etc/nginx/nginx.conf 2>/dev/null | head -20
else
    echo "   ⚠️  Could not find Nginx config"
fi
echo ""

# Check PM2 processes
echo "4. Checking PM2 processes..."
if command -v pm2 &> /dev/null; then
    pm2 list
else
    echo "   PM2 not installed"
fi
echo ""

# Check systemd services
echo "5. Checking systemd services for backend..."
systemctl list-units --type=service --state=running | grep -i "bano\|fresh\|backend\|fastapi" || echo "   No related systemd services found"
echo ""

# Check supervisor processes
echo "6. Checking supervisor processes..."
if command -v supervisorctl &> /dev/null; then
    sudo supervisorctl status | grep -i "backend\|bano" || echo "   No backend in supervisor"
else
    echo "   Supervisor not installed"
fi
echo ""

echo "============================================="
echo "Diagnostic Complete"
echo "============================================="
echo ""
echo "Next steps:"
echo "1. If you see a backend process running, note the port number"
echo "2. Check the Nginx proxy_pass URL"
echo "3. Your frontend needs to connect to that backend URL"
