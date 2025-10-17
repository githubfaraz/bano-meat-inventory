# Bano Fresh Backend - Render Deployment Guide

## Files to Upload to GitHub:

1. server.py - Main backend API
2. requirements.txt - Python dependencies
3. render.yaml - Render configuration
4. runtime.txt - Python version

## Step-by-Step Deployment:

### STEP 1: Upload to GitHub

1. Go to: https://github.com/new
2. Create repository: `bano-fresh-backend` (Public)
3. Click "uploading an existing file"
4. Upload ALL files from this backend folder
5. Commit changes

### STEP 2: Deploy on Render

1. Go to: https://render.com
2. Sign up / Log in
3. Click "New +" → "Web Service"
4. Click "Connect GitHub" (authorize Render)
5. Select repository: `bano-fresh-backend`
6. Render will auto-detect settings from render.yaml
7. Click "Create Web Service"

### STEP 3: Wait for Deployment

- Deployment takes 3-5 minutes
- Watch the logs for any errors
- Once complete, you'll get a URL like:
  `https://bano-fresh-api.onrender.com`

### STEP 4: Test Your Backend

Visit: `https://bano-fresh-api.onrender.com/api/`

You should see:
```json
{"message": "Meat Inventory API"}
```

### STEP 5: Save Your Backend URL

Copy the URL - you'll need it for frontend configuration!

## Troubleshooting

If deployment fails:
- Check logs in Render dashboard
- Verify MongoDB connection string
- Ensure all files were uploaded correctly

## Environment Variables (Already in render.yaml)

- MONGO_URL: Your MongoDB Atlas connection
- DB_NAME: bano_fresh
- JWT_SECRET_KEY: Secret for authentication
- CORS_ORIGINS: * (allows frontend to connect)
