#!/bin/bash

# Instructions to upload backend to GitHub
# Replace YOUR_GITHUB_USERNAME with your actual username

echo "📦 Preparing Bano Fresh Backend for GitHub..."

# Navigate to backend directory
cd /app/backend

# Initialize git (if not already)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Bano Fresh Backend"

# Add your GitHub repository as remote
# REPLACE 'YOUR_GITHUB_USERNAME' with your actual GitHub username
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/bano-fresh-backend.git

# Push to GitHub
git branch -M main
git push -u origin main

echo "✅ Backend uploaded to GitHub!"
