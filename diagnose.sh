#!/bin/bash

echo "================================================"
echo "Bano Fresh - Server Diagnostic Script"
echo "================================================"
echo ""

# Check backend
echo "1. Checking Backend Status..."
if curl -s http://localhost:8001 > /dev/null 2>&1; then
    echo "   ✅ Backend is running on port 8001"
else
    echo "   ❌ Backend is NOT running on port 8001"
    echo "   Action: Start backend with: uvicorn server:app --host 0.0.0.0 --port 8001"
fi
echo ""

# Check frontend build
echo "2. Checking Frontend Build..."
if [ -d "frontend/build" ]; then
    echo "   ✅ Frontend build folder exists"
    echo "   Build date: $(stat -c %y frontend/build 2>/dev/null || stat -f %Sm frontend/build)"
else
    echo "   ❌ Frontend build folder NOT found"
    echo "   Action: Run 'yarn build' in frontend directory"
fi
echo ""

# Check .env files
echo "3. Checking Environment Files..."
if [ -f "backend/.env" ]; then
    echo "   ✅ Backend .env exists"
    if grep -q "MONGO_URL" backend/.env; then
        echo "      ✅ MONGO_URL is set"
    else
        echo "      ❌ MONGO_URL is missing"
    fi
else
    echo "   ❌ Backend .env NOT found"
fi

if [ -f "frontend/.env.production" ]; then
    echo "   ✅ Frontend .env.production exists"
    if grep -q "REACT_APP_BACKEND_URL" frontend/.env.production; then
        echo "      ✅ REACT_APP_BACKEND_URL is set"
    else
        echo "      ❌ REACT_APP_BACKEND_URL is missing"
    fi
else
    echo "   ❌ Frontend .env.production NOT found"
fi
echo ""

# Check required packages
echo "4. Checking Python Packages..."
if pip list | grep -q "fastapi\|uvicorn\|pymongo"; then
    echo "   ✅ Core Python packages installed"
else
    echo "   ❌ Some Python packages missing"
    echo "   Action: Run 'pip install -r backend/requirements.txt'"
fi
echo ""

# Check Node modules
echo "5. Checking Node Modules..."
if [ -d "frontend/node_modules" ]; then
    echo "   ✅ Node modules installed"
else
    echo "   ❌ Node modules NOT installed"
    echo "   Action: Run 'yarn install' or 'npm install' in frontend directory"
fi
echo ""

# Check MongoDB connectivity
echo "6. Testing MongoDB Connection..."
if cd backend && python3 -c "from motor.motor_asyncio import AsyncIOMotorClient; import os; import asyncio; from dotenv import load_dotenv; load_dotenv(); asyncio.run(AsyncIOMotorClient(os.environ['MONGO_URL']).admin.command('ping')); print('✅ MongoDB connection successful')" 2>/dev/null; then
    :
else
    echo "   ❌ MongoDB connection failed"
    echo "   Action: Check MONGO_URL in backend/.env and MongoDB Atlas IP whitelist"
fi
cd ..
echo ""

echo "================================================"
echo "Diagnostic Complete"
echo "================================================"
echo ""
echo "Quick Fix Commands:"
echo "-------------------"
echo "# Rebuild frontend:"
echo "cd frontend && yarn build"
echo ""
echo "# Restart backend:"
echo "cd backend && uvicorn server:app --host 0.0.0.0 --port 8001 --reload"
echo ""
echo "# Clear browser cache and localStorage:"
echo "Open browser console and run: localStorage.clear()"
echo ""
