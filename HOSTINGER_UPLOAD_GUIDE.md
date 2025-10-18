# 🚀 Bano Fresh Frontend - Hostinger Upload Guide

## ✅ Build Status: READY
Frontend built successfully with all latest changes:
- Admin-only user management
- No public registration
- Users page added
- Connected to: https://bano-meat-inventory.onrender.com

---

## 📦 Files to Upload

Your production build is ready in: `/app/frontend/build/`

**Files included:**
```
build/
├── index.html (main HTML file)
├── asset-manifest.json (build manifest)
├── .htaccess (URL rewriting - IMPORTANT!)
└── static/
    ├── css/
    │   ├── main.504e8a6b.css
    │   └── main.504e8a6b.css.map
    └── js/
        ├── main.6e17564d.js
        ├── main.6e17564d.js.map
        └── main.6e17564d.js.LICENSE.txt
```

---

## 📤 METHOD 1: Hostinger File Manager (Easiest)

### Step 1: Login to Hostinger

1. Go to: https://hpanel.hostinger.com
2. Enter your login credentials
3. Click "Sign In"

### Step 2: Access File Manager

1. In hPanel dashboard, find **"Files"** section
2. Click **"File Manager"**
3. A new tab will open with File Manager

### Step 3: Navigate to public_html

1. You should see a list of folders
2. Double-click on **"public_html"** folder
3. This is where your website files go

### Step 4: Backup & Clear Existing Files (IMPORTANT!)

**BEFORE deleting anything:**

1. Select all files in public_html (Ctrl+A or Cmd+A)
2. Click **"Compress"** or **"Download"** to backup
3. Save the backup to your computer

**Now clear the folder:**

1. Select all files again
2. Click **"Delete"** button
3. Confirm deletion
4. **EXCEPTION**: If you see these files, DON'T delete them:
   - `.htaccess` (related to email/domain)
   - `cgi-bin/` folder
   - `error_log` files
   - Any email-related folders

**TIP**: It's safe to delete:
- `index.html`, `index.php`
- Old website folders
- CSS/JS files from previous site

### Step 5: Upload New Files

**Option A - Upload as Zip (Recommended):**

Since you're working in Emergent environment, you'll need to:

1. Download the build folder to your local computer first
2. Create a ZIP of the build folder contents (NOT the build folder itself, just the contents)
3. In Hostinger File Manager, click **"Upload"**
4. Upload the ZIP file
5. Right-click the ZIP file → **"Extract"**
6. Delete the ZIP file after extraction

**Option B - Upload Files Directly:**

1. In Hostinger File Manager, click **"Upload"** button
2. Select these files from build folder:
   - `index.html`
   - `asset-manifest.json`
   - `.htaccess` ⚠️ IMPORTANT!
3. Upload the `static/` folder (with all CSS and JS inside)

### Step 6: Verify File Structure

After upload, your `public_html` should look like this:

```
public_html/
├── index.html
├── asset-manifest.json
├── .htaccess  ⚠️ Must be here!
└── static/
    ├── css/
    │   └── main.504e8a6b.css
    └── js/
        └── main.6e17564d.js
```

### Step 7: Check .htaccess File

**IMPORTANT**: The `.htaccess` file might not show by default because it starts with a dot.

To see hidden files:
1. In File Manager, look for **"Settings"** or **"Show Hidden Files"** option
2. Enable it
3. Verify `.htaccess` is present in public_html

If `.htaccess` is missing, create it:
1. Click **"New File"**
2. Name it: `.htaccess` (with the dot!)
3. Click "Create"
4. Right-click → "Edit"
5. Paste the .htaccess content (see below)
6. Save

### Step 8: Test Your Website

1. Wait 2-3 minutes for cache to clear
2. Open your domain in browser:
   ```
   http://yourdomain.com
   ```
   or
   ```
   https://yourdomain.com
   ```

3. You should see Bano Fresh login page with logo!

---

## 📤 METHOD 2: FTP Upload (Faster for Multiple Files)

### Step 1: Get FTP Credentials

1. In Hostinger hPanel, go to **"Files"** → **"FTP Accounts"**
2. You should see default FTP account
3. Note down:
   - **Server/Host**: Usually `ftp.yourdomain.com` or an IP address
   - **Username**: Your FTP username
   - **Password**: Click "Change Password" if you don't know it
   - **Port**: 21 (default)

### Step 2: Download FTP Client

**Recommended**: FileZilla (Free)
- Download: https://filezilla-project.org/download.php?type=client
- Install it on your computer

**Alternatives**:
- WinSCP (Windows)
- Cyberduck (Mac)
- Commander One (Mac)

### Step 3: Connect via FTP

**In FileZilla:**

1. Open FileZilla
2. Enter at the top:
   - **Host**: ftp.yourdomain.com
   - **Username**: (from Hostinger)
   - **Password**: (from Hostinger)
   - **Port**: 21
3. Click **"Quickconnect"**
4. Accept any certificate warnings

### Step 4: Navigate & Upload

**Left side** = Your computer
**Right side** = Hostinger server

1. On the right side, navigate to `public_html/`
2. Delete old files (after backing up)
3. On the left side, navigate to your build folder
4. Select ALL files and folders in build/
5. Right-click → **"Upload"**
6. Wait for upload to complete

### Step 5: Verify Upload

1. Check right side (server) has all files
2. Verify `.htaccess` is uploaded
3. Check `static/` folder has css/ and js/ subfolders

---

## 🔧 Troubleshooting

### Problem: "Page not found" or "404 Error"

**Solution:**
- Make sure `.htaccess` file is in public_html
- Check if file is named correctly (with the dot at start)
- Verify .htaccess content is correct

### Problem: "Blank white page"

**Solution:**
1. Open browser Console (F12)
2. Check for errors
3. Usually means files are in wrong location
4. Verify `static/` folder is directly in public_html

### Problem: "Network Error" when trying to login

**Solution:**
1. Check backend is running: https://bano-meat-inventory.onrender.com/api/
2. Wait 30 seconds (Render free tier wakes up)
3. Try again

### Problem: ".htaccess file not visible"

**Solution:**
- In File Manager, enable "Show Hidden Files"
- Files starting with dot (.) are hidden by default

### Problem: "Page refreshes to 404"

**Solution:**
- .htaccess is missing or incorrect
- Upload/recreate .htaccess file

### Problem: "CSS/Styling not loading"

**Solution:**
- Check `static/` folder uploaded correctly
- Clear browser cache (Ctrl+F5)
- Check browser console for 404 errors on CSS files

---

## 🔐 Enable SSL (HTTPS) - Optional but Recommended

After your site is working on HTTP:

1. Go to Hostinger hPanel
2. Navigate to **"SSL"** section
3. Find your domain
4. Click **"Install SSL"** or **"Activate"**
5. Choose **"Free Let's Encrypt SSL"**
6. Wait 5-10 minutes for activation
7. Your site will be available on `https://yourdomain.com`

---

## ✅ Post-Upload Checklist

After uploading, verify:

```
☐ Login page loads with Bano Fresh logo
☐ Can login with admin credentials (admin-bano / India@54321)
☐ Dashboard loads with navigation menu
☐ All menu items accessible (Dashboard, Products, Vendors, etc.)
☐ Users page accessible (admin only)
☐ POS system works
☐ Reports can be generated
☐ No console errors (F12)
```

---

## 📝 .htaccess File Content

If you need to recreate .htaccess manually, use this content:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_FILENAME} !-l
  RewriteRule . /index.html [L]
</IfModule>

# Enable CORS
<IfModule mod_headers.c>
  Header set Access-Control-Allow-Origin "*"
</IfModule>

# Disable directory browsing
Options -Indexes

# Set default charset
AddDefaultCharset UTF-8

# Cache static assets
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/gif "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
</IfModule>

# Compression
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript
</IfModule>
```

---

## 🎯 Quick Summary

**What to Upload:**
- All files from `/app/frontend/build/` folder

**Where to Upload:**
- Hostinger `public_html/` folder

**Important Files:**
- `.htaccess` (enables React routing)
- `index.html` (main page)
- `static/` folder (CSS & JS)

**After Upload:**
- Visit your domain
- Login with: admin-bano / India@54321
- Create additional users
- Start using Bano Fresh!

---

## 🆘 Need Help?

If you encounter issues during upload, let me know:
1. What method you're using (File Manager or FTP)
2. What error you're seeing
3. Screenshot if possible

I'll help you troubleshoot! 🚀
