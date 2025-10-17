# Bano Fresh - Laravel 11 Backend Deployment Guide

## What You Have
- Laravel 11 API Backend
- React Frontend (already built)
- MySQL Database
- Optimized for Hostinger Shared Hosting

## Deployment Steps

### Step 1: Upload Backend to Hostinger

1. **Create a folder structure in Hostinger:**
   - Login to Hostinger hPanel
   - Go to File Manager
   - Create folder: `bano-fresh-api` (outside public_html)
   - Upload all Laravel files to `bano-fresh-api`

2. **Set up symlink:**
   - In File Manager, go to `public_html`
   - Delete all existing files
   - Create a symlink or copy contents of `bano-fresh-api/public` to `public_html/api`

### Step 2: Create MySQL Database

1. In Hostinger hPanel, go to **Databases** → **MySQL Databases**
2. Create new database:
   - **Database name**: `bano_fresh`
   - **Username**: `bano_user`
   - **Password**: (generate strong password)
3. Note down: database name, username, password, host (usually localhost)

### Step 3: Configure Laravel

1. Edit `.env` file in `bano-fresh-api` folder:
   ```
   APP_NAME="Bano Fresh"
   APP_ENV=production
   APP_KEY=base64:GENERATE_THIS_KEY
   APP_DEBUG=false
   APP_URL=https://yourdomain.com

   DB_CONNECTION=mysql
   DB_HOST=localhost
   DB_PORT=3306
   DB_DATABASE=bano_fresh
   DB_USERNAME=bano_user
   DB_PASSWORD=your_db_password

   JWT_SECRET=GENERATE_THIS_SECRET
   ```

2. Generate APP_KEY via terminal or online generator

### Step 4: Run Migrations

1. SSH into Hostinger (if available) or use Hostinger terminal
2. Run:
   ```
   cd bano-fresh-api
   php artisan migrate
   php artisan key:generate
   php artisan jwt:secret
   ```

### Step 5: Upload React Frontend

1. Update `frontend/.env.production` with:
   ```
   REACT_APP_BACKEND_URL=https://yourdomain.com/api
   ```
2. Build: `yarn build`
3. Upload `build` folder contents to `public_html`

### Step 6: Test

Visit: `https://yourdomain.com`

## Troubleshooting

- **500 Error**: Check storage permissions
- **Database Error**: Verify .env database credentials
- **API not found**: Check .htaccess in public folder
