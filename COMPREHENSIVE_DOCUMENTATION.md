# 🥩 Bano Fresh Meat Shop Inventory System - Complete Documentation

## 📋 Table of Contents
1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Database Schema](#database-schema)
4. [API Endpoints](#api-endpoints)
5. [Frontend Pages](#frontend-pages)
6. [User Workflows](#user-workflows)
7. [Deployment Guide](#deployment-guide)
8. [Troubleshooting](#troubleshooting)

---

## 1. System Overview

### Purpose
A comprehensive inventory management system specifically designed for meat shops (Bano Fresh) that handles:
- Multiple categories of meat (Chicken, Mutton, Fish, etc.)
- Derived/processed products under each category
- Weight-based inventory tracking
- Piece-based tracking for end-of-day reconciliation
- Point of Sale with automatic inventory deduction
- Vendor and customer management
- Sales tracking and reporting

### Key Features
✅ **Main Category Management** - Create categories like Chicken, Mutton, Fish, Frozen  
✅ **Derived Products** - Create end products with SKU and daily price updates  
✅ **Inventory Tracking** - Weight and pieces tracking at main category level  
✅ **FIFO Auto-Deduction** - Automatic inventory deduction from purchases  
✅ **Daily Pieces Tracking** - Manual end-of-day pieces reconciliation  
✅ **Smart POS** - Cascading dropdowns (Category → Product)  
✅ **Dashboard** - Real-time inventory summary with low stock alerts  
✅ **Admin Controls** - Role-based access for admin vs staff  

---

## 2. Architecture

### Technology Stack

**Backend:**
- Framework: FastAPI (Python 3.11)
- Database: MongoDB (NoSQL)
- ORM: Motor (Async MongoDB Driver)
- Authentication: JWT (JSON Web Tokens)
- Validation: Pydantic

**Frontend:**
- Framework: React 19
- Routing: React Router DOM v7
- UI Library: Shadcn UI + Radix UI
- Styling: Tailwind CSS v3
- HTTP Client: Axios
- State: React Hooks (useState, useEffect)
- Notifications: Sonner (Toast)

**Database:**
- Local: MongoDB (for development/testing)
- Production: MongoDB Atlas (cloud)

### System Architecture Diagram

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │ HTTPS
       ▼
┌─────────────┐
│   Nginx     │ (Reverse Proxy)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   FastAPI   │ (Port 8001)
│   Backend   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   MongoDB   │ (Port 27017)
└─────────────┘
```

---

## 3. Database Schema

### Collections

#### 3.1 **main_categories**
Main product categories (Chicken, Mutton, Fish, etc.)

```javascript
{
  id: "uuid",
  name: "Chicken",
  description: "Fresh chicken products",
  created_at: "2025-01-01T00:00:00Z",
  updated_at: "2025-01-01T00:00:00Z"
}
```

#### 3.2 **derived_products**
End products that customers buy

```javascript
{
  id: "uuid",
  main_category_id: "uuid-of-main-category",
  name: "Chicken Boneless",
  sku: "CHK-BNL-001",
  selling_price: 350.00,  // Per kg, updated daily
  description: "Premium boneless chicken",
  created_at: "2025-01-01T00:00:00Z",
  updated_at: "2025-01-01T00:00:00Z"
}
```

#### 3.3 **inventory_purchases**
Records of inventory purchases (FIFO basis for deduction)

```javascript
{
  id: "uuid",
  main_category_id: "uuid",
  main_category_name: "Chicken",
  vendor_id: "uuid",
  vendor_name: "ABC Farms",
  purchase_date: "2025-01-01T10:00:00Z",
  total_weight_kg: 50.5,
  total_pieces: 100,  // Optional
  remaining_weight_kg: 45.2,  // Decreases on sales
  remaining_pieces: 90,  // Decreases on daily tracking
  cost_per_kg: 280.00,
  total_cost: 14140.00,  // total_weight * cost_per_kg
  notes: "Fresh morning delivery",
  created_at: "2025-01-01T10:00:00Z"
}
```

#### 3.4 **daily_pieces_tracking**
End-of-day pieces sold tracking

```javascript
{
  id: "uuid",
  main_category_id: "uuid",
  main_category_name: "Chicken",
  tracking_date: "2025-01-01",  // YYYY-MM-DD
  pieces_sold: 25,
  created_at: "2025-01-01T20:00:00Z"
}
```

#### 3.5 **pos_sales**
Point of sale transactions

```javascript
{
  id: "uuid",
  customer_id: "uuid or null",
  customer_name: "John Doe" or "Walk-in Customer",
  items: [
    {
      derived_product_id: "uuid",
      derived_product_name: "Chicken Boneless",
      main_category_id: "uuid",
      main_category_name: "Chicken",
      quantity_kg: 2.5,
      selling_price: 350.00,
      total: 875.00
    }
  ],
  subtotal: 875.00,
  tax: 43.75,  // 5% tax
  discount: 0.00,
  total: 918.75,
  payment_method: "cash|card|upi",
  sale_date: "2025-01-01T14:30:00Z",
  created_at: "2025-01-01T14:30:00Z"
}
```

#### 3.6 **vendors** (Existing)
```javascript
{
  id: "uuid",
  name: "ABC Farms",
  contact_person: "Ramesh Kumar",
  phone: "+91-9876543210",
  email: "abc@farms.com",
  address: "Farm Road, Village",
  notes: "Reliable supplier"
}
```

#### 3.7 **customers** (Existing)
```javascript
{
  id: "uuid",
  name: "John Doe",
  phone: "+91-9876543211",
  email: "john@email.com",
  address: "123 Street",
  total_purchases: 5000.00
}
```

#### 3.8 **users** (Existing)
```javascript
{
  id: "uuid",
  username: "admin-bano",
  email: "admin@banofresh.com",
  password: "hashed_password",
  full_name: "Admin User",
  is_admin: true,
  created_at: "2025-01-01T00:00:00Z"
}
```

---

## 4. API Endpoints

### Authentication
```
POST /api/auth/login
POST /api/auth/register (Admin only)
```

### Main Categories
```
GET    /api/main-categories          - List all categories
POST   /api/main-categories          - Create category (Admin only)
PUT    /api/main-categories/{id}     - Update category (Admin only)
DELETE /api/main-categories/{id}     - Delete category (Admin only)
```

### Derived Products
```
GET    /api/derived-products                              - List products (filter by category optional)
POST   /api/derived-products                              - Create product (Admin only)
PUT    /api/derived-products/{id}                         - Update product (Admin only)
DELETE /api/derived-products/{id}                         - Delete product (Admin only)
```

### Inventory Purchases
```
GET    /api/inventory-purchases                           - List purchases (filter by category optional)
POST   /api/inventory-purchases                           - Record purchase
GET    /api/inventory-summary                             - Get inventory summary by category
```

### Daily Pieces Tracking
```
GET    /api/daily-pieces-tracking                         - List tracking (filter by category/date)
POST   /api/daily-pieces-tracking                         - Record daily pieces sold
```

### POS Sales
```
POST   /api/pos-sales                                     - Create sale (auto-deducts inventory)
GET    /api/pos-sales                                     - List sales (filter by date range)
```

### Vendors (Existing)
```
GET    /api/vendors
POST   /api/vendors
PUT    /api/vendors/{id}
DELETE /api/vendors/{id}
```

### Customers (Existing)
```
GET    /api/customers
POST   /api/customers
PUT    /api/customers/{id}
DELETE /api/customers/{id}
```

### Users (Admin only - Existing)
```
GET    /api/users
POST   /api/users
```

---

## 5. Frontend Pages

### New Inventory System Pages

#### 5.1 **Main Categories** (`/main-categories`)
- **Purpose**: Manage main product categories
- **Access**: Admin only
- **Features**:
  - Create new categories
  - Edit category names and descriptions
  - Delete categories (if no derived products exist)
  - View category cards

#### 5.2 **Derived Products** (`/derived-products`)
- **Purpose**: Manage end products under categories
- **Access**: Admin only (viewing allowed for staff)
- **Features**:
  - Create products with SKU and selling price
  - Update selling price daily
  - Filter products by category
  - Edit product details
  - Delete products

#### 5.3 **Inventory Management** (`/inventory-management`)
- **Purpose**: Record inventory purchases
- **Access**: All authenticated users
- **Features**:
  - Select main category
  - Select vendor from dropdown
  - Enter weight (mandatory) and pieces (optional)
  - Enter cost per kg
  - Auto-calculate total cost
  - View purchase history
  - Filter by category

#### 5.4 **Daily Pieces Tracking** (`/daily-pieces-tracking`)
- **Purpose**: Manual end-of-day pieces reconciliation
- **Access**: All authenticated users
- **Features**:
  - Select category
  - Enter pieces sold
  - Select date (default: today)
  - Auto-deducts pieces from inventory (FIFO)
  - View tracking history
  - Today's summary cards

#### 5.5 **New POS** (`/new-pos`)
- **Purpose**: Point of Sale with auto-inventory deduction
- **Access**: All authenticated users
- **Features**:
  - **Cascading Dropdowns**: Category → Derived Product
  - Enter quantity in kg
  - Add multiple items to cart
  - Select customer (walk-in or registered)
  - Apply discount and tax
  - Choose payment method
  - Auto-deducts weight from inventory (FIFO)
  - Complete sale

#### 5.6 **Dashboard** (Updated)
- **Purpose**: Overview and inventory summary
- **Access**: All authenticated users
- **Features**:
  - Sales stats cards (existing)
  - **NEW**: Real-time inventory summary by category
  - Weight and pieces display
  - Low stock alerts (< 10kg)
  - Color-coded cards (green: good, red: low stock)

### Legacy Pages (Old System)
- Products (Old) - `/products`
- Purchases (Old) - `/purchases`
- POS (Old) - `/pos`

### Common Pages (Unchanged)
- Sales - `/sales`
- Vendors - `/vendors`
- Customers - `/customers`
- Reports - `/reports`
- Users - `/users` (Admin only)

---

## 6. User Workflows

### 6.1 Admin Daily Workflow

**Morning Setup:**
1. Login with admin credentials
2. Check Dashboard → Inventory Summary
3. Go to Main Categories → Verify/add categories if needed
4. Go to Derived Products → Update selling prices if meat prices changed

**Receiving Stock:**
1. Go to Inventory Management
2. Select main category (e.g., Chicken)
3. Select vendor
4. Enter total weight received (e.g., 50kg)
5. Enter total pieces (e.g., 100 pieces)
6. Enter cost per kg
7. Add optional notes
8. Submit → Inventory recorded

**Selling Products:**
1. Go to New POS
2. Select Main Category (e.g., Chicken)
3. Select Derived Product (e.g., Boneless)
4. Enter quantity in kg (e.g., 2.5)
5. Add to cart
6. Repeat for more items
7. Select customer or walk-in
8. Apply discount if any
9. Choose payment method
10. Complete Sale → Auto-deducts from inventory

**End of Day:**
1. Go to Daily Pieces Tracking
2. For each category, enter pieces sold today
3. System auto-deducts from inventory purchases
4. Check Dashboard for remaining inventory

### 6.2 Staff Workflow

**Daily Operations:**
1. Login with staff credentials
2. Can view Dashboard and inventory
3. Can record purchases (Inventory Management)
4. Can use New POS for sales
5. Can enter Daily Pieces Tracking
6. **Cannot**: Manage categories, products, or users

---

## 7. Deployment Guide

### 🚨 **CRITICAL: Deployment Architecture**

**This application uses a SPLIT DEPLOYMENT setup:**

```
┌─────────────────────────────────────────────────────────────┐
│  FRONTEND (Hostinger Shared Hosting)                        │
│  - React build deployed to Hostinger                        │
│  - Static files served by Hostinger                         │
│  - URL: https://banofresh.com                               │
│  - Makes API calls to backend VPS                           │
└─────────────────────────────────────────────────────────────┘
                           │
                           │ HTTPS API Calls
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  BACKEND (VPS with Root Access)                             │
│  - FastAPI on Port 8001 (systemd service)                   │
│  - Nginx reverse proxy                                      │
│  - URL: https://backend.banofresh.com (or VPS IP)          │
│  - Connects to MongoDB Atlas                                │
└─────────────────────────────────────────────────────────────┘
                           │
                           │ MongoDB Connection
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  DATABASE (MongoDB Atlas Cloud)                             │
│  - Managed MongoDB cluster                                  │
│  - IP Whitelist required for VPS                            │
└─────────────────────────────────────────────────────────────┘
```

### 7.1 Backend Deployment (VPS)

**Location:** Self-managed VPS (typically `/var/www/bano-fresh/backend`)

**Prerequisites:**
- VPS with Python 3.11 and root access
- MongoDB Atlas account with IP whitelist configured
- Domain/subdomain for backend (e.g., backend.banofresh.com) OR VPS IP

**Backend Deployment Steps:**
```bash
# 1. Clone repository
git clone https://github.com/githubfaraz/bano-meat-inventory.git
cd bano-meat-inventory/backend

# 2. Setup Python environment
python3.11 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# 3. Configure .env
cp .env.example .env
nano .env
```

**Required .env Configuration:**
```env
MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority
DB_NAME=bano_fresh_inventory
JWT_SECRET_KEY=your_super_secret_jwt_key_change_this
CORS_ORIGINS=https://banofresh.com
# IMPORTANT: CORS_ORIGINS must match your Hostinger frontend URL
```

```bash
# 4. Create systemd service
sudo nano /etc/systemd/system/bano-fresh-backend.service
```

**Systemd Service File Content:**
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

```bash
# 5. Start and enable service
sudo systemctl daemon-reload
sudo systemctl start bano-fresh-backend
sudo systemctl enable bano-fresh-backend
sudo systemctl status bano-fresh-backend

# 6. Configure Nginx reverse proxy
sudo nano /etc/nginx/sites-available/default
```

**Nginx Configuration:**
```nginx
server {
    listen 80;
    server_name backend.banofresh.com;  # Your backend domain or VPS IP

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
    }
}
```

```bash
# 7. Test and reload Nginx
sudo nginx -t
sudo systemctl reload nginx

# 8. Verify backend is running
curl http://localhost:8001/api/main-categories
# Should return JSON data
```

### 7.2 Frontend Deployment (Hostinger Shared Hosting)

**Location:** Hostinger shared hosting (typically `public_html/`)

**CRITICAL CONFIGURATION:**

The frontend MUST be configured to point to the VPS backend URL.

**Step 1: Configure .env.production on your LOCAL machine**

```bash
cd frontend
nano .env.production
```

**Add this EXACT configuration:**
```env
REACT_APP_BACKEND_URL=https://backend.banofresh.com
# OR if no domain, use VPS IP:
# REACT_APP_BACKEND_URL=http://YOUR_VPS_IP
```

**Step 2: Build the frontend**
```bash
cd frontend
yarn install
yarn build
# This creates the 'build/' folder with compiled React app
```

**Step 3: Upload to Hostinger**

Upload the ENTIRE contents of the `build/` folder to Hostinger:
```
Local: frontend/build/*
   ↓ Upload via FTP/SFTP/Hostinger File Manager
Hostinger: public_html/
```

**Files to upload:**
- `index.html`
- `asset-manifest.json`
- `favicon.ico`
- `logo192.png`, `logo512.png`
- `manifest.json`
- `robots.txt`
- `static/` folder (contains all JS/CSS)

**Step 4: Configure Hostinger (if needed)**

Some Hostinger setups need `.htaccess` for React Router:
```bash
# In Hostinger public_html/, create/edit .htaccess
nano .htaccess
```

Add:
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

**Step 5: Verify Deployment**

1. Visit your Hostinger URL: `https://banofresh.com`
2. Open browser console (F12)
3. Check network tab - API calls should go to `https://backend.banofresh.com/api/*`
4. Login and verify all features work

### 7.3 Important Notes

**🔴 CRITICAL POINTS:**

1. **Backend and Frontend are SEPARATE servers**
   - Backend: VPS (your own server)
   - Frontend: Hostinger (shared hosting)

2. **Backend URL Configuration:**
   - Frontend `.env.production` must point to backend VPS
   - Use domain: `https://backend.banofresh.com`
   - OR VPS IP: `http://123.45.67.89`

3. **CORS Configuration:**
   - Backend `.env` CORS_ORIGINS must include Hostinger frontend URL
   - Example: `CORS_ORIGINS=https://banofresh.com`

4. **After ANY frontend code changes:**
   ```bash
   cd frontend
   yarn build
   # Upload new build/ folder to Hostinger
   ```

5. **After ANY backend code changes:**
   ```bash
   sudo systemctl restart bano-fresh-backend
   ```

6. **MongoDB Atlas IP Whitelist:**
   - Must whitelist VPS IP address
   - Check current IP: `curl ifconfig.me`
   - Add to MongoDB Atlas → Network Access

### 7.4 Quick Deployment Checklist

**Backend (VPS):**
- [ ] Backend code uploaded to VPS
- [ ] `.env` configured with MongoDB URL and CORS
- [ ] systemd service running (`sudo systemctl status bano-fresh-backend`)
- [ ] Nginx configured and running
- [ ] VPS IP whitelisted in MongoDB Atlas
- [ ] API accessible: `curl http://VPS_IP/api/main-categories`

**Frontend (Hostinger):**
- [ ] `.env.production` points to backend VPS URL
- [ ] `yarn build` completed successfully
- [ ] `build/` folder uploaded to Hostinger `public_html/`
- [ ] `.htaccess` configured for React Router
- [ ] Website loads: `https://banofresh.com`
- [ ] Browser console shows no CORS errors
- [ ] API calls go to correct backend URL

### 7.2 Local Development

**Backend:**
```bash
cd backend
python3.11 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Set MONGO_URL=mongodb://localhost:27017
uvicorn server:app --reload --host 0.0.0.0 --port 8001
```

**Frontend:**
```bash
cd frontend
yarn install
yarn start
# Runs on http://localhost:3000
```

---

## 8. Troubleshooting

### Common Issues

#### Issue 1: MongoDB Connection Error
**Symptom:** `ServerSelectionTimeoutError` or SSL handshake failed

**Solutions:**
1. Check MongoDB Atlas IP whitelist (add 0.0.0.0/0 for testing)
2. Verify MONGO_URL in .env file
3. Ensure Python 3.11 (not 3.13+)
4. Try standard connection string instead of SRV

#### Issue 2: Frontend can't connect to backend
**Symptom:** Login fails, CORS errors

**Solutions:**
1. Verify REACT_APP_BACKEND_URL in .env.production
2. Check CORS_ORIGINS in backend .env
3. Ensure backend is running on correct port
4. Check Nginx configuration

#### Issue 3: Pieces not deducting
**Symptom:** Daily pieces tracking doesn't reduce inventory

**Solutions:**
1. Check if purchases have total_pieces field populated
2. Verify FIFO logic in backend
3. Ensure tracking date is correct
4. Check backend logs for deduction errors

#### Issue 4: POS not deducting weight
**Symptom:** Sales complete but inventory unchanged

**Solutions:**
1. Check if main_category_id is correctly passed
2. Verify FIFO logic in POS endpoint
3. Check backend logs for auto-deduction
4. Ensure purchases have remaining_weight_kg > 0

---

## 9. System Design Decisions

### Why FIFO (First In, First Out)?
- Ensures oldest inventory is used first
- Prevents meat spoilage
- Industry standard for perishable goods

### Why Weight-based inventory?
- Meat is sold by weight (kg)
- More accurate than piece-based
- Standard practice in meat shops

### Why Pieces optional?
- Not all purchases have countable pieces
- Some items (ground meat, chunks) can't be counted
- Flexibility for different meat types

### Why Manual Daily Pieces Tracking?
- Physical count at end of day is more accurate
- Staff can reconcile with actual pieces in shop
- Catches discrepancies early

### Why Cascading Dropdowns in POS?
- Prevents selling wrong product category combination
- Reduces user error
- Faster product selection

---

## 10. Future Enhancements (Roadmap)

### Phase 1 (Completed)
✅ Main Categories  
✅ Derived Products  
✅ Inventory Purchases  
✅ Daily Pieces Tracking  
✅ New POS with Auto-Deduction  
✅ Inventory Dashboard  

### Phase 2 (Planned)
- [ ] Bulk Price Update (update all product prices at once)
- [ ] Low Stock Email Alerts
- [ ] Sales Reports by Category
- [ ] Vendor Performance Analytics
- [ ] Barcode Scanning for Products
- [ ] Thermal Printer Integration
- [ ] Mobile App (React Native)

### Phase 3 (Future)
- [ ] Multi-location Support
- [ ] Advanced Analytics Dashboard
- [ ] Customer Loyalty Program
- [ ] Automated Reorder Suggestions
- [ ] WhatsApp Notifications
- [ ] Payment Gateway Integration

---

## 11. Security Considerations

### Authentication
- JWT tokens with expiry
- Password hashing with bcrypt
- Admin-only endpoints protected

### Data Validation
- Pydantic models for request validation
- Type checking on all inputs
- SQL injection prevention (NoSQL)

### Production Checklist
- [ ] Change default admin password
- [ ] Use strong JWT_SECRET_KEY
- [ ] Enable HTTPS with SSL certificate
- [ ] Set specific CORS_ORIGINS (not *)
- [ ] Enable MongoDB Atlas IP whitelist
- [ ] Regular database backups
- [ ] Monitor logs for suspicious activity

---

## 12. Support & Maintenance

### Regular Maintenance
- **Daily**: Check inventory levels, backup database
- **Weekly**: Review system logs, check for errors
- **Monthly**: Update dependencies, security patches

### Database Backup
```bash
# MongoDB backup
mongodump --uri="mongodb_connection_string" --out=/backup/

# Restore
mongorestore --uri="mongodb_connection_string" /backup/
```

### Logs Location
- **Backend**: `/var/log/supervisor/backend.err.log`
- **Nginx**: `/var/log/nginx/error.log`
- **MongoDB**: Check MongoDB Atlas dashboard

---

## 13. Admin Credentials

**Default Admin:**
- Username: `admin-bano`
- Password: `India@54321`

⚠️ **IMPORTANT**: Change this password after first login!

---

## 14. Contact & Support

For technical support or feature requests:
- Check this documentation first
- Review VPS_DEPLOYMENT_GUIDE.md for deployment issues
- Check ADMIN_FIX_DOCUMENTATION.md for security features

---

**Version**: 1.0.0  
**Last Updated**: October 20, 2024  
**System Status**: ✅ Production Ready  
**Author**: Bano Fresh Development Team
