# BANO FRESH MEAT INVENTORY - PROJECT REFERENCE GUIDE

**Last Updated:** December 30, 2025
**Version:** 1.0
**Project Type:** Full-Stack Inventory Management & POS System
**Industry:** Meat Retail Business

---

## TABLE OF CONTENTS

1. [Project Overview](#1-project-overview)
2. [Technology Stack](#2-technology-stack)
3. [Project Structure](#3-project-structure)
4. [Database Schema](#4-database-schema)
5. [API Endpoints](#5-api-endpoints)
6. [Key Features](#6-key-features)
7. [Business Logic & Workflows](#7-business-logic--workflows)
8. [Component Architecture](#8-component-architecture)
9. [Configuration](#9-configuration)
10. [Security](#10-security)
11. [Deployment](#11-deployment)
12. [Quick Reference](#12-quick-reference)

---

## 1. PROJECT OVERVIEW

### Purpose
Bano Fresh Meat Inventory Management System is a specialized application for managing meat shop operations, including:
- Raw material inventory tracking
- Derived product management
- Point-of-sale transactions
- Daily reconciliation (pieces & waste)
- Comprehensive reporting & analytics

### Architecture
```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   React     │ ◄─────► │   FastAPI    │ ◄─────► │  MongoDB    │
│  Frontend   │  HTTP   │   Backend    │  Motor  │   Atlas     │
│  (Port 80)  │         │  (Port 8001) │         │   (Cloud)   │
└─────────────┘         └──────────────┘         └─────────────┘
```

### Key Characteristics
- **Single Page Application (SPA)** with React Router
- **RESTful API** with FastAPI
- **NoSQL Database** (MongoDB)
- **JWT Authentication**
- **Role-Based Access Control** (Admin/Staff)
- **Real-time Inventory** with FIFO deduction
- **Multi-unit Sales** (weight/package/pieces)

---

## 2. TECHNOLOGY STACK

### Backend Stack
| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| Framework | FastAPI | 0.110.1 | Web framework |
| Server | Uvicorn | 0.25.0 | ASGI server |
| Database | MongoDB | Latest | NoSQL database |
| DB Driver | Motor | 3.7.1 | Async MongoDB driver |
| Authentication | PyJWT | 2.10.1 | JWT tokens |
| Password Hash | Passlib + Bcrypt | 1.7.4 | Secure hashing |
| Validation | Pydantic | 2.12.0 | Data validation |
| Excel Export | openpyxl | 3.1.5 | Excel generation |
| PDF Export | reportlab | 4.4.4 | PDF generation |
| Data Processing | pandas | 2.3.3 | Data manipulation |
| Timezone | pytz | 2025.2 | IST timezone |

### Frontend Stack
| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| Framework | React | 19.0.0 | UI framework |
| Router | React Router DOM | 7.5.1 | Client-side routing |
| Build Tool | Create React App + CRACO | 7.1.0 | Build tooling |
| UI Library | Shadcn UI (Radix) | Latest | Component library |
| Styling | Tailwind CSS | 3.4.17 | Utility-first CSS |
| HTTP Client | Axios | 1.8.4 | API requests |
| Forms | React Hook Form | 7.56.2 | Form management |
| Validation | Zod | 3.24.4 | Schema validation |
| Notifications | Sonner | 2.0.3 | Toast notifications |
| Date Handling | date-fns | 4.1.0 | Date utilities |
| Icons | Lucide React | 0.507.0 | Icon library |

### Database
- **Type:** MongoDB (NoSQL Document Database)
- **Collections:** 14 main collections
- **Hosting:** MongoDB Atlas (Cloud) for production
- **Local:** MongoDB Community for development

---

## 3. PROJECT STRUCTURE

```
bano-meat-inventory/
│
├── backend/                              # FastAPI Backend Application
│   ├── server.py                         # Main application (3,267 lines)
│   ├── requirements.txt                  # Python dependencies (77 packages)
│   ├── .env                              # Environment variables (not in git)
│   ├── .env.example                      # Environment template
│   ├── ADMIN_CREDENTIALS.txt             # Default admin credentials
│   ├── clear_database.py                 # Database utility script
│   ├── check_sales.py                    # Sales verification script
│   └── server_backup.py                  # Backup of previous version
│
├── frontend/                             # React Frontend Application
│   ├── public/                           # Static assets
│   ├── src/
│   │   ├── App.js                        # Main app with routing
│   │   ├── index.js                      # React entry point
│   │   ├── index.css                     # Global styles + Tailwind
│   │   │
│   │   ├── components/                   # React components
│   │   │   ├── Layout.jsx                # Main layout with sidebar
│   │   │   ├── ErrorBoundary.jsx         # Error handling
│   │   │   └── ui/                       # Shadcn UI components (47 files)
│   │   │       ├── button.jsx
│   │   │       ├── input.jsx
│   │   │       ├── select.jsx
│   │   │       ├── dialog.jsx
│   │   │       ├── table.jsx
│   │   │       └── ... (42 more components)
│   │   │
│   │   ├── pages/                        # Feature pages (19 pages, 8,110 lines)
│   │   │   ├── Login.jsx                 # Authentication page
│   │   │   ├── Dashboard.jsx             # Dashboard with stats (520 lines)
│   │   │   ├── MainCategories.jsx        # Category management (admin)
│   │   │   ├── DerivedProducts.jsx       # Product management (admin)
│   │   │   ├── InventoryManagement.jsx   # Inventory view & summary
│   │   │   ├── PurchaseHistory.jsx       # Purchase records
│   │   │   ├── NewPOS.jsx                # Point of Sale (875 lines)
│   │   │   ├── Sales.jsx                 # Sales records & management
│   │   │   ├── DailyPiecesTracking.jsx   # Pieces reconciliation
│   │   │   ├── DailyWasteTracking.jsx    # Waste tracking
│   │   │   ├── Products.jsx              # Legacy products
│   │   │   ├── Vendors.jsx               # Vendor management
│   │   │   ├── Customers.jsx             # Customer management
│   │   │   ├── Reports.jsx               # Report exports (450 lines)
│   │   │   └── Users.jsx                 # User management (admin)
│   │   │
│   │   ├── hooks/                        # Custom React hooks
│   │   │   └── use-toast.js              # Toast notification hook
│   │   │
│   │   └── lib/                          # Utility functions
│   │       └── utils.js                  # Helper utilities (clsx, cn)
│   │
│   ├── package.json                      # Node dependencies
│   ├── craco.config.js                   # Build configuration
│   ├── tailwind.config.js                # Tailwind CSS config
│   ├── postcss.config.js                 # PostCSS config
│   └── jsconfig.json                     # JavaScript config
│
├── Documentation/                        # Project documentation
│   ├── README.md                         # Project overview
│   ├── COMPREHENSIVE_DOCUMENTATION.md    # Complete system docs
│   ├── DEPLOYMENT_GUIDE.md               # Deployment instructions
│   ├── VPS_DEPLOYMENT_GUIDE.md           # VPS-specific deployment
│   ├── BACKEND_DEPLOYMENT_STEPS.md       # Backend deployment
│   └── test_result.md                    # Testing protocols
│
└── Configuration Files
    ├── .gitignore                        # Git ignore rules
    ├── package.json                      # Root package.json
    └── yarn.lock                         # Yarn dependency lock
```

---

## 4. DATABASE SCHEMA

### Overview
- **Database Name:** `bano_fresh`
- **Total Collections:** 14
- **Database Type:** MongoDB (NoSQL)
- **Connection:** MongoDB Atlas (Cloud)

### Collections

#### 4.1 users
**Purpose:** User authentication and authorization

```javascript
{
  id: "uuid-string",                      // Unique identifier
  username: "admin-bano",                 // Login username
  email: "admin@banofresh.com",           // Email address
  password: "bcrypt_hashed_password",     // Hashed password
  full_name: "Bano Fresh Admin",          // Display name
  is_admin: true,                         // Admin flag
  created_at: "2025-01-01T00:00:00+05:30" // IST timestamp
}
```

**Indexes:** `username` (unique), `email` (unique)

---

#### 4.2 main_categories
**Purpose:** Main product categories (Chicken, Mutton, Fish, etc.)

```javascript
{
  id: "uuid-string",
  name: "Chicken",                        // Category name
  description: "Fresh chicken products",  // Optional description
  created_at: "2025-01-01T00:00:00+05:30",
  updated_at: "2025-01-01T00:00:00+05:30"
}
```

**Common Categories:**
- Chicken
- Mutton
- Fish
- Frozen Products
- Liver & Organs
- Kidney
- Processed Meats

---

#### 4.3 derived_products
**Purpose:** End products that customers purchase, derived from main categories

```javascript
{
  id: "uuid-string",
  main_category_id: "uuid-string",        // FK to main_categories
  name: "Chicken Boneless",               // Product name
  sku: "CHK-BNL-001",                     // Stock Keeping Unit
  sale_unit: "weight",                    // "weight" | "package" | "pieces"
  package_weight_kg: 0.5,                 // Only for package unit (optional)
  selling_price: 350.00,                  // Price per unit
  description: "Premium boneless chicken", // Optional description
  created_at: "2025-01-01T00:00:00+05:30",
  updated_at: "2025-01-01T00:00:00+05:30"
}
```

**Sale Units:**
- `weight`: Sold by kg (e.g., 2.5 kg)
- `package`: Sold by package count (e.g., 3 packages of 500g each)
- `pieces`: Sold by piece count (e.g., 12 pieces)

---

#### 4.4 inventory_purchases
**Purpose:** Raw material inventory purchases with FIFO tracking

```javascript
{
  id: "uuid-string",
  main_category_id: "uuid-string",        // FK to main_categories
  main_category_name: "Chicken",          // Denormalized for performance
  vendor_id: "uuid-string",               // FK to vendors
  vendor_name: "ABC Farms",               // Denormalized
  purchase_date: "2025-01-01T10:00:00+05:30", // Purchase timestamp
  total_weight_kg: 50.5,                  // Original weight purchased
  total_pieces: 100,                      // Original pieces (optional)
  remaining_weight_kg: 45.2,              // Current remaining (FIFO deducted)
  remaining_pieces: 90,                   // Current remaining pieces
  cost_per_kg: 280.00,                    // Purchase cost per kg
  total_cost: 14140.00,                   // Total purchase cost
  notes: "Fresh morning delivery",        // Optional notes
  created_at: "2025-01-01T10:00:00+05:30"
}
```

**Key Behavior:**
- `remaining_weight_kg` decreases on each sale (FIFO)
- `remaining_pieces` decreases on pieces tracking
- When `remaining_weight_kg` reaches 0, purchase is depleted

---

#### 4.5 pos_sales
**Purpose:** Point of Sale transactions (New POS system)

```javascript
{
  id: "uuid-string",
  customer_id: "uuid-string | null",      // FK to customers (optional)
  customer_name: "John Doe",              // Customer name (walk-in or registered)
  items: [                                // Array of sale items
    {
      derived_product_id: "uuid-string",  // FK to derived_products
      derived_product_name: "Chicken Boneless",
      main_category_id: "uuid-string",    // FK to main_categories
      main_category_name: "Chicken",
      quantity_kg: 2.5,                   // Weight in kg (for weight/package units)
      quantity_pieces: null,              // Pieces count (for pieces unit)
      selling_price: 350.00,              // Price per unit
      total: 875.00                       // Item total (quantity * price)
    }
  ],
  subtotal: 875.00,                       // Sum of item totals
  tax: 43.75,                             // Tax amount
  discount: 0.00,                         // Discount amount
  total: 918.75,                          // Final total (subtotal + tax - discount)
  payment_method: "cash",                 // "cash" | "card" | "upi"
  sale_date: "2025-01-01T14:30:00+05:30", // Sale timestamp
  created_at: "2025-01-01T14:30:00+05:30"
}
```

**Automatic Actions on Sale:**
1. Deduct inventory from `inventory_purchases` (FIFO)
2. Update `customer.total_purchases` (if registered customer)
3. Create `pos_sales` record

---

#### 4.6 daily_pieces_tracking
**Purpose:** End-of-day pieces reconciliation by category

```javascript
{
  id: "uuid-string",
  main_category_id: "uuid-string",        // FK to main_categories
  main_category_name: "Chicken",          // Denormalized
  tracking_date: "2025-01-01",            // Date (YYYY-MM-DD)
  pieces_sold: 25,                        // Number of pieces sold
  created_at: "2025-01-01T20:00:00+05:30"
}
```

**Usage:**
- Manual reconciliation at end of day
- Deducts pieces from `inventory_purchases.remaining_pieces` (FIFO)
- One record per category per day

---

#### 4.7 daily_waste_tracking
**Purpose:** Daily waste tracking by category

```javascript
{
  id: "uuid-string",
  main_category_id: "uuid-string",        // FK to main_categories
  main_category_name: "Chicken",          // Denormalized
  tracking_date: "2025-01-01",            // Date (YYYY-MM-DD)
  waste_kg: 1.5,                          // Weight of waste
  notes: "Spoilage due to power outage",  // Reason for waste
  created_at: "2025-01-01T20:00:00+05:30"
}
```

**Automatic Actions:**
- Deducts waste from `inventory_purchases.remaining_weight_kg` (FIFO)

---

#### 4.8 extra_expenses
**Purpose:** Daily operational expenses tracking (tea, petrol, staff food, etc.)

```javascript
{
  id: "uuid-string",
  expense_date: "2025-01-01",             // Date (YYYY-MM-DD)
  expense_type: "Tea",                    // Type of expense
  description: "Morning tea for staff",   // Expense description
  amount: 150.00,                         // Amount in Rs
  notes: "5 cups @ Rs 30 each",          // Optional notes
  created_at: "2025-01-01T10:00:00+05:30"
}
```

**Predefined Expense Types:**
- Tea
- Coffee
- Staff Food
- Petrol
- Transport
- Electricity
- Water
- Gas
- Maintenance
- Cleaning
- Stationery
- Repairs
- Miscellaneous

**Key Features:**
- Filter by expense type and date range
- Export to CSV/Excel/PDF with totals
- Delete requires admin privileges
- All users can add/edit expenses

---

#### 4.9 vendors
**Purpose:** Vendor/supplier management

```javascript
{
  id: "uuid-string",
  name: "ABC Farms",                      // Vendor name
  contact_person: "Ramesh Kumar",         // Contact person
  phone: "+91-9876543210",                // Phone number
  email: "abc@farms.com",                 // Email (optional)
  address: "Farm Road, Village",          // Address (optional)
  created_at: "2025-01-01T00:00:00+05:30"
}
```

---

#### 4.10 customers
**Purpose:** Customer database

```javascript
{
  id: "uuid-string",
  name: "John Doe",                       // Customer name
  phone: "+91-9876543210",                // Phone number
  email: "john@example.com",              // Email (optional)
  address: "123 Street, City",            // Address (optional)
  total_purchases: 15000.00,              // Lifetime purchase value
  created_at: "2025-01-01T00:00:00+05:30"
}
```

**Auto-Updated:**
- `total_purchases` increments on each sale

---

#### 4.11 products (Legacy)
**Purpose:** Legacy product system (backward compatibility)

```javascript
{
  id: "uuid-string",
  name: "Chicken Breast",
  category: "chicken",
  description: "Fresh chicken breast",
  unit: "kg",
  price_per_unit: 320.00,
  stock_quantity: 45.5,
  reorder_level: 10.0,
  sku: "CHK-BRS-001",
  is_raw_material: true,
  purchase_cost: 280.00,
  derived_from: null,
  created_at: "2025-01-01T00:00:00+05:30",
  updated_at: "2025-01-01T00:00:00+05:30"
}
```

**Status:** Maintained for backward compatibility

---

#### 4.12 sales (Legacy)
**Purpose:** Legacy sales system

**Status:** Maintained for backward compatibility. New sales use `pos_sales`.

---

#### 4.13 purchases (Legacy)
**Purpose:** Legacy purchase system

**Status:** Maintained for backward compatibility. New purchases use `inventory_purchases`.

---

### Database Relationships

```
users
  └── (no FK relationships)

main_categories
  ├── → derived_products (one-to-many)
  ├── → inventory_purchases (one-to-many)
  ├── → daily_pieces_tracking (one-to-many)
  └── → daily_waste_tracking (one-to-many)

derived_products
  ├── ← main_categories (many-to-one)
  └── → pos_sales.items (one-to-many)

inventory_purchases
  ├── ← main_categories (many-to-one)
  └── ← vendors (many-to-one)

pos_sales
  ├── ← customers (many-to-one, optional)
  └── ← derived_products (many-to-many via items array)

vendors
  └── → inventory_purchases (one-to-many)

customers
  └── → pos_sales (one-to-many)
```

---

## 5. API ENDPOINTS

**Base URL:** `http://localhost:8001/api`
**Total Endpoints:** 58

### Authentication Endpoints (2)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/login` | User login (returns JWT token) | No |
| GET | `/auth/me` | Get current user info | Yes |

**Login Request:**
```json
{
  "username": "admin-bano",
  "password": "India@54321"
}
```

**Login Response:**
```json
{
  "access_token": "eyJ...",
  "token_type": "bearer",
  "user": {
    "id": "...",
    "username": "admin-bano",
    "email": "admin@banofresh.com",
    "full_name": "Bano Fresh Admin",
    "is_admin": true
  }
}
```

---

### User Management (3 - Admin Only)

| Method | Endpoint | Description | Admin Only |
|--------|----------|-------------|------------|
| POST | `/users` | Create new user | Yes |
| GET | `/users` | List all users | Yes |
| DELETE | `/users/{user_id}` | Delete user | Yes |

---

### Main Categories (4)

| Method | Endpoint | Description | Admin Only |
|--------|----------|-------------|------------|
| GET | `/main-categories` | List all categories | No |
| POST | `/main-categories` | Create category | Yes |
| PUT | `/main-categories/{id}` | Update category | Yes |
| DELETE | `/main-categories/{id}` | Delete category | Yes |

**Query Parameters (GET):**
- None (returns all categories)

---

### Derived Products (4)

| Method | Endpoint | Description | Admin Only |
|--------|----------|-------------|------------|
| GET | `/derived-products` | List products | No |
| POST | `/derived-products` | Create product | Yes |
| PUT | `/derived-products/{id}` | Update product | Yes |
| DELETE | `/derived-products/{id}` | Delete product | Yes |

**Query Parameters (GET):**
- `main_category_id` (optional): Filter by category

---

### Inventory Purchases (6)

| Method | Endpoint | Description | Admin Only |
|--------|----------|-------------|------------|
| GET | `/inventory-purchases` | List purchases | No |
| POST | `/inventory-purchases` | Create purchase | No |
| PUT | `/inventory-purchases/{id}` | Update purchase | No |
| DELETE | `/inventory-purchases/{id}` | Delete purchase | Yes |
| GET | `/inventory-summary` | Get inventory summary | No |
| GET | `/stock-alerts` | Low stock alerts | No |

**Query Parameters (GET /inventory-purchases):**
- `start_date` (optional): Filter from date (YYYY-MM-DD)
- `end_date` (optional): Filter to date (YYYY-MM-DD)
- `main_category_id` (optional): Filter by category

**Inventory Summary Response:**
```json
[
  {
    "main_category_id": "...",
    "main_category_name": "Chicken",
    "total_weight_kg": 125.5,
    "total_pieces": 250,
    "total_cost": 35140.00
  }
]
```

---

### POS Sales (4)

| Method | Endpoint | Description | Admin Only |
|--------|----------|-------------|------------|
| POST | `/pos-sales` | Create sale | No |
| GET | `/pos-sales` | List sales | No |
| PUT | `/pos-sales/{id}` | Update sale | No |
| DELETE | `/pos-sales/{id}` | Delete sale | Yes |

**Query Parameters (GET):**
- `start_date` (optional): Filter from date
- `end_date` (optional): Filter to date
- `main_category_id` (optional): Filter by category

**Create Sale Request:**
```json
{
  "customer_id": "uuid | null",
  "customer_name": "John Doe",
  "items": [
    {
      "derived_product_id": "uuid",
      "quantity_kg": 2.5,
      "quantity_pieces": null
    }
  ],
  "payment_method": "cash",
  "discount": 0,
  "tax": 0,
  "sale_date": "2025-01-01T14:30:00+05:30"
}
```

---

### Daily Tracking (8)

**Pieces Tracking:**

| Method | Endpoint | Description | Admin Only |
|--------|----------|-------------|------------|
| GET | `/daily-pieces-tracking` | List tracking records | No |
| POST | `/daily-pieces-tracking` | Add tracking | No |
| PUT | `/daily-pieces-tracking/{id}` | Update tracking | No |
| DELETE | `/daily-pieces-tracking/{id}` | Delete tracking | Yes |

**Waste Tracking:**

| Method | Endpoint | Description | Admin Only |
|--------|----------|-------------|------------|
| GET | `/daily-waste-tracking` | List waste records | No |
| POST | `/daily-waste-tracking` | Add waste | No |
| PUT | `/daily-waste-tracking/{id}` | Update waste | No |
| DELETE | `/daily-waste-tracking/{id}` | Delete waste | Yes |

---

### Extra Expenses (4)

| Method | Endpoint | Description | Admin Only |
|--------|----------|-------------|------------|
| GET | `/extra-expenses` | List expenses | No |
| POST | `/extra-expenses` | Create expense | No |
| PUT | `/extra-expenses/{id}` | Update expense | No |
| DELETE | `/extra-expenses/{id}` | Delete expense | Yes |

**Query Parameters (GET):**
- `expense_type` (optional): Filter by type (Tea, Coffee, etc.)
- `start_date` (optional): Filter from date (YYYY-MM-DD)
- `end_date` (optional): Filter to date (YYYY-MM-DD)

**Create Expense Request:**
```json
{
  "expense_date": "2025-01-01",
  "expense_type": "Tea",
  "description": "Morning tea for staff",
  "amount": 150.00,
  "notes": "5 cups @ Rs 30 each"
}
```

**Response:**
```json
{
  "id": "uuid",
  "expense_date": "2025-01-01",
  "expense_type": "Tea",
  "description": "Morning tea for staff",
  "amount": 150.00,
  "notes": "5 cups @ Rs 30 each",
  "created_at": "2025-01-01T10:00:00+05:30"
}
```

---

### Vendors (4)

| Method | Endpoint | Description | Admin Only |
|--------|----------|-------------|------------|
| GET | `/vendors` | List vendors | No |
| POST | `/vendors` | Create vendor | No |
| PUT | `/vendors/{id}` | Update vendor | No |
| DELETE | `/vendors/{id}` | Delete vendor | No |

---

### Customers (4)

| Method | Endpoint | Description | Admin Only |
|--------|----------|-------------|------------|
| GET | `/customers` | List customers | No |
| POST | `/customers` | Create customer | No |
| PUT | `/customers/{id}` | Update customer | No |
| DELETE | `/customers/{id}` | Delete customer | No |

---

### Reports (5)

| Method | Endpoint | Description | Admin Only |
|--------|----------|-------------|------------|
| GET | `/reports/sales` | Sales report | No |
| GET | `/reports/inventory` | Inventory report | No |
| GET | `/reports/purchases` | Purchase report | No |
| GET | `/reports/profit-loss` | Profit & Loss report | No |
| GET | `/reports/extra-expenses` | Extra Expenses report | No |

**Query Parameters (All Reports):**
- `start_date` (optional): From date (YYYY-MM-DD)
- `end_date` (optional): To date (YYYY-MM-DD)
- `format` (optional): `json` | `csv` | `excel` | `pdf` (default: json)
- `main_category_id` (optional): Filter by category (not applicable for extra-expenses)
- `expense_type` (optional): Filter by expense type (only for extra-expenses)

**Response Formats:**
- **JSON:** Returns data as JSON
- **CSV:** Returns CSV file download
- **Excel:** Returns .xlsx file download
- **PDF:** Returns PDF file download

---

### Dashboard (1)

| Method | Endpoint | Description | Admin Only |
|--------|----------|-------------|------------|
| GET | `/dashboard/stats` | Dashboard statistics | No |

**Response:**
```json
{
  "inventory_summary": [...],
  "today_sales": 12500.00,
  "today_purchases": 25000.00,
  "month_sales": 250000.00,
  "month_purchases": 180000.00,
  "profit_margin": 28.5,
  "low_stock_alerts": 3,
  "recent_sales": [...]
}
```

---

## 6. KEY FEATURES

### 6.1 Inventory Management

#### Main Categories
- Define product categories (Chicken, Mutton, Fish, Frozen, etc.)
- Admin-only creation and management
- Hierarchical organization

#### Derived Products
- Create end products from main categories
- Multiple sale units:
  - **Weight-based:** Sold by kg (e.g., Chicken Boneless - 2.5 kg)
  - **Package-based:** Sold by package count (e.g., Frozen Nuggets - 500g packs)
  - **Pieces-based:** Sold by pieces (e.g., Chicken Wings - 12 pieces)
- SKU management
- Daily price updates
- Admin-only management

#### Inventory Purchases
- Record raw material purchases
- Track weight (kg) and pieces
- Vendor association
- Purchase date tracking
- Cost per kg recording
- FIFO (First-In-First-Out) automatic deduction
- Real-time remaining quantity tracking

#### Inventory Summary
- Real-time inventory by category
- Total weight and pieces available
- Total inventory value
- Low stock alerts
- Waste integration

---

### 6.2 Point of Sale (POS) System

**Features:**
- Cascading dropdowns: Category → Product selection
- Multi-unit support (weight/package/pieces)
- Walk-in customer or registered customer
- Multiple items per sale
- Tax calculation
- Discount application
- Payment methods: Cash, Card, UPI
- Custom sale date/time
- Automatic inventory deduction (FIFO)
- Receipt generation (thermal printer compatible)

**Workflow:**
1. Select main category (e.g., Chicken)
2. Select derived product (e.g., Chicken Boneless)
3. Enter quantity:
   - Weight: Enter kg (e.g., 2.5 kg)
   - Package: Enter package count (auto-converts to kg)
   - Pieces: Enter piece count
4. Add to cart (can add multiple items)
5. Select customer (walk-in or registered)
6. Apply discount/tax
7. Choose payment method
8. Complete sale
   - Inventory auto-deducted (FIFO from oldest purchases)
   - Customer total_purchases updated
   - Receipt generated

**FIFO Deduction Example:**
```
Inventory Purchases (sorted by purchase_date):
1. Jan 1: 50 kg, remaining: 30 kg
2. Jan 2: 40 kg, remaining: 40 kg
3. Jan 3: 60 kg, remaining: 60 kg

Sale: 50 kg of Chicken
Deduction:
- From Purchase 1: 30 kg (depleted)
- From Purchase 2: 20 kg (remaining: 20 kg)
- Purchase 3: Untouched
```

---

### 6.3 Daily Tracking

#### Pieces Tracking
- End-of-day reconciliation
- Track actual pieces sold per category
- Date-wise tracking
- Manual deduction from inventory purchases (FIFO)
- Handles discrepancy between weight and pieces

**Use Case:**
- Shop counts 50 chicken pieces sold today
- Staff enters 50 pieces in tracking
- System deducts 50 pieces from inventory (FIFO)

#### Waste Tracking
- Record daily waste by category
- Weight-based tracking (kg)
- Notes for waste reasons (spoilage, damage, etc.)
- Automatic deduction from inventory (FIFO)
- Admin-only deletion

**Use Case:**
- 2 kg chicken spoiled due to power outage
- Staff enters waste with reason
- System deducts 2 kg from inventory

#### Extra Expenses Tracking
- Record daily operational expenses
- 13 predefined expense types (Tea, Coffee, Staff Food, Petrol, Transport, Electricity, Water, Gas, Maintenance, Cleaning, Stationery, Repairs, Miscellaneous)
- Date-wise expense tracking
- Amount and description recording
- Optional notes for details
- Filter by expense type and date range
- Export to CSV/Excel/PDF with totals
- Admin-only deletion

**Use Case:**
- Staff purchases tea for Rs 150
- Enter expense: Type=Tea, Description="Morning tea for staff", Amount=150
- Can add notes: "5 cups @ Rs 30 each"
- View all tea expenses for the month
- Export monthly expense report

---

### 6.4 Vendor & Customer Management

#### Vendors
- Contact information (name, person, phone, email, address)
- Purchase history linkage
- Easy vendor selection in purchases

#### Customers
- Customer database
- Contact details
- Total purchases tracking (lifetime value)
- Walk-in vs. registered customers
- Quick customer selection in POS

---

### 6.5 Reporting & Analytics

#### Dashboard
- Real-time inventory summary
- Today's sales & purchases
- Month's sales & purchases
- Profit calculations
- Low stock alerts
- Recent sales list

#### Export Reports
- **Sales Report:** Detailed sales with date range filter
- **Inventory Report:** Current stock levels by category
- **Purchase Report:** Purchase history
- **Profit & Loss:** Revenue vs. costs analysis

**Export Formats:**
- JSON (API response)
- CSV (Excel-compatible)
- Excel (.xlsx)
- PDF (formatted report)

---

### 6.6 Authentication & Authorization

#### User Management (Admin Only)
- Create users with admin/staff roles
- Username and password-based login
- Email and full name tracking
- Admin-only user deletion

#### JWT Authentication
- Token-based authentication
- 24-hour token expiry
- Automatic token refresh on login
- Secure password hashing (bcrypt)

#### Role-Based Access Control
**Admin-only features:**
- User creation/deletion
- Main category management (create, update, delete)
- Derived product management (create, update, delete)
- Delete tracking records (pieces/waste)
- Delete sales/purchases

**Staff features:**
- View all data
- Create purchases
- Create sales
- Add tracking records
- Update own records

---

### 6.7 Advanced Features

#### FIFO Inventory Deduction
- Automatic deduction from oldest purchases first
- Weight and pieces tracking
- Purchase-level remaining quantity
- Prevents negative inventory

#### Timezone Consistency
- All timestamps in IST (Asia/Kolkata)
- Consistent datetime handling across frontend/backend
- ISO 8601 format storage

#### Data Integrity
- Inventory validation before sales
- Stock availability checks
- Transaction-like updates
- Error handling and rollback
- Referential integrity (denormalized data)

#### Flexible Decimal Input
- Support for various decimal precisions
- Automatic rounding to 2 decimal places
- Weight-based calculations
- Currency formatting

---

## 7. BUSINESS LOGIC & WORKFLOWS

### 7.1 Purchase Workflow

```
┌─────────────────────────────────────────────────────────┐
│ 1. Staff navigates to Purchase History                 │
│ 2. Clicks "Add Purchase"                               │
│ 3. Fills form:                                         │
│    - Select main category (e.g., Chicken)              │
│    - Select vendor                                     │
│    - Enter weight (kg): 50.5                           │
│    - Enter pieces (optional): 100                      │
│    - Enter cost per kg: 280                            │
│    - Select purchase date                              │
│    - Add notes (optional)                              │
│ 4. Submit                                              │
│ 5. Backend creates inventory_purchase:                 │
│    - total_weight_kg = 50.5                            │
│    - remaining_weight_kg = 50.5                        │
│    - total_pieces = 100                                │
│    - remaining_pieces = 100                            │
│    - total_cost = 50.5 * 280 = 14,140                  │
│ 6. Inventory is now available for sales                │
└─────────────────────────────────────────────────────────┘
```

---

### 7.2 POS Sale Workflow

```
┌─────────────────────────────────────────────────────────┐
│ 1. Staff navigates to New POS                          │
│ 2. Selects category: Chicken                           │
│ 3. Selects product: Chicken Boneless                   │
│ 4. Product details auto-populate:                      │
│    - Sale unit: weight                                 │
│    - Selling price: 350/kg                             │
│ 5. Enters quantity: 2.5 kg                             │
│ 6. Clicks "Add to Cart"                                │
│ 7. Item added to cart (can add more items)             │
│ 8. Enters customer name or selects registered customer │
│ 9. Applies discount (optional): 0                      │
│ 10. Applies tax (optional): 5%                         │
│ 11. Selects payment method: Cash                       │
│ 12. Reviews total: 2.5 * 350 * 1.05 = 918.75          │
│ 13. Clicks "Complete Sale"                             │
│                                                         │
│ Backend Processing:                                     │
│ ├─ Validates inventory availability                    │
│ ├─ Deducts inventory (FIFO):                           │
│ │  ├─ Finds oldest purchase with Chicken               │
│ │  ├─ Deducts 2.5 kg from remaining_weight_kg          │
│ │  └─ If depleted, moves to next purchase              │
│ ├─ Creates pos_sale record                             │
│ ├─ Updates customer.total_purchases (+918.75)          │
│ └─ Returns success                                     │
│                                                         │
│ 14. Frontend shows success toast                       │
│ 15. Receipt can be printed                             │
└─────────────────────────────────────────────────────────┘
```

---

### 7.3 FIFO Inventory Deduction Logic

**Scenario:** Sale of 50 kg Chicken

**Inventory Purchases (before sale):**
```
Purchase 1 (Jan 1): total: 50 kg, remaining: 30 kg
Purchase 2 (Jan 2): total: 40 kg, remaining: 40 kg
Purchase 3 (Jan 3): total: 60 kg, remaining: 60 kg
```

**Sale:** 50 kg Chicken

**Deduction Algorithm:**
```python
quantity_needed = 50  # kg to deduct
purchases = get_purchases_sorted_by_date_asc()  # Oldest first

for purchase in purchases:
    if quantity_needed <= 0:
        break

    if purchase.remaining_weight_kg > 0:
        deduction = min(purchase.remaining_weight_kg, quantity_needed)
        purchase.remaining_weight_kg -= deduction
        quantity_needed -= deduction
        update_purchase(purchase)

if quantity_needed > 0:
    raise InsufficientInventoryError()
```

**After Deduction:**
```
Purchase 1 (Jan 1): remaining: 0 kg (depleted)
Purchase 2 (Jan 2): remaining: 20 kg (30 kg deducted)
Purchase 3 (Jan 3): remaining: 60 kg (untouched)
```

**Inventory depleted:** 30 + 20 = 50 kg ✓

---

### 7.4 Daily Reconciliation Workflow

#### Pieces Tracking

```
┌─────────────────────────────────────────────────────────┐
│ End of Day - Pieces Reconciliation                     │
│                                                         │
│ 1. Staff physically counts pieces sold today           │
│    - Chicken: 50 pieces sold                           │
│ 2. Navigates to Daily Pieces Tracking                  │
│ 3. Clicks "Add Tracking"                               │
│ 4. Fills form:                                         │
│    - Select category: Chicken                          │
│    - Select date: Today (2025-01-01)                   │
│    - Enter pieces sold: 50                             │
│ 5. Submit                                              │
│                                                         │
│ Backend Processing:                                     │
│ ├─ Creates daily_pieces_tracking record                │
│ ├─ Deducts 50 pieces from inventory (FIFO):            │
│ │  ├─ Purchase 1: deduct 30 pieces (depleted)          │
│ │  └─ Purchase 2: deduct 20 pieces                     │
│ └─ Returns success                                     │
└─────────────────────────────────────────────────────────┘
```

#### Waste Tracking

```
┌─────────────────────────────────────────────────────────┐
│ Daily Waste Entry                                       │
│                                                         │
│ 1. Staff identifies waste (spoilage, damage, etc.)     │
│    - 2 kg chicken spoiled                              │
│ 2. Navigates to Daily Waste Tracking                   │
│ 3. Clicks "Add Waste"                                  │
│ 4. Fills form:                                         │
│    - Select category: Chicken                          │
│    - Select date: Today                                │
│    - Enter waste (kg): 2                               │
│    - Enter notes: "Power outage - 2 hours"             │
│ 5. Submit                                              │
│                                                         │
│ Backend Processing:                                     │
│ ├─ Creates daily_waste_tracking record                 │
│ ├─ Deducts 2 kg from inventory (FIFO)                  │
│ └─ Returns success                                     │
└─────────────────────────────────────────────────────────┘
```

---

### 7.5 Report Generation Workflow

```
┌─────────────────────────────────────────────────────────┐
│ 1. Staff navigates to Reports page                     │
│ 2. Selects report type: Sales Report                   │
│ 3. Enters date range:                                  │
│    - Start date: 2025-01-01                            │
│    - End date: 2025-01-31                              │
│ 4. Optionally filters by category                      │
│ 5. Selects export format: Excel                        │
│ 6. Clicks "Generate Report"                            │
│                                                         │
│ Backend Processing:                                     │
│ ├─ Queries pos_sales collection with filters           │
│ ├─ Aggregates data:                                    │
│ │  ├─ Total sales by date                              │
│ │  ├─ Total sales by category                          │
│ │  ├─ Total sales by product                           │
│ │  └─ Payment method breakdown                         │
│ ├─ Generates Excel file using openpyxl                 │
│ └─ Returns file download                               │
│                                                         │
│ 7. Frontend triggers download                          │
│ 8. File saved: sales_report_2025-01-01_to_2025-01-31.xlsx │
└─────────────────────────────────────────────────────────┘
```

---

## 8. COMPONENT ARCHITECTURE

### 8.1 Backend Architecture (FastAPI)

#### Layered Structure
```
┌─────────────────────────────────────────────┐
│        Presentation Layer                   │
│        (FastAPI Routes)                     │
│  - /api/auth/*                              │
│  - /api/users/*                             │
│  - /api/main-categories/*                   │
│  - /api/derived-products/*                  │
│  - /api/inventory-purchases/*               │
│  - /api/pos-sales/*                         │
│  - /api/daily-*-tracking/*                  │
│  - /api/extra-expenses/*                    │
│  - /api/vendors/*                           │
│  - /api/customers/*                         │
│  - /api/reports/*                           │
│  - /api/dashboard/*                         │
└─────────────────────────────────────────────┘
            ↓
┌─────────────────────────────────────────────┐
│        Business Logic Layer                 │
│        (Route Handlers)                     │
│  - Authentication & Authorization           │
│  - Data Validation (Pydantic)               │
│  - FIFO Inventory Deduction                 │
│  - Report Generation                        │
│  - Timezone Handling                        │
└─────────────────────────────────────────────┘
            ↓
┌─────────────────────────────────────────────┐
│        Data Access Layer                    │
│        (MongoDB Motor)                      │
│  - CRUD Operations                          │
│  - Aggregations                             │
│  - Transactions (updates)                   │
└─────────────────────────────────────────────┘
            ↓
┌─────────────────────────────────────────────┐
│        Database                             │
│        (MongoDB Atlas)                      │
│  - 14 Collections                           │
│  - Indexes                                  │
└─────────────────────────────────────────────┘
```

#### Key Components

**Authentication:**
- JWT token generation on login
- Token validation via dependency injection
- Password hashing with bcrypt
- Admin role checks

**Authorization:**
```python
# Admin-only dependency
def get_current_admin_user(current_user: User = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user

# Usage in routes
@app.post("/api/main-categories")
async def create_category(
    category: MainCategoryCreate,
    current_user: User = Depends(get_current_admin_user)
):
    # Only admins can access this route
    ...
```

**Pydantic Models (32 models):**
- Request models: `*Create`, `*Update`
- Response models: Full entities
- Internal models: `DashboardStats`, `InventorySummary`, `POSSaleItem`

**Timezone Handling:**
```python
import pytz
from datetime import datetime

IST = pytz.timezone('Asia/Kolkata')

def get_ist_now():
    return datetime.now(IST)

# All timestamps stored with IST timezone
created_at = get_ist_now().isoformat()
```

**CORS Configuration:**
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

### 8.2 Frontend Architecture (React)

#### Component Hierarchy

```
App.js (BrowserRouter)
│
├─ Route: /login
│  └─ Login.jsx
│
└─ Route: / (Protected)
   └─ Layout.jsx
      ├─ Sidebar (Navigation)
      │  ├─ Dashboard
      │  ├─ Main Categories (admin)
      │  ├─ Derived Products (admin)
      │  ├─ Inventory Management
      │  ├─ Purchase History
      │  ├─ New POS
      │  ├─ Sales
      │  ├─ Daily Pieces Tracking
      │  ├─ Daily Waste Tracking
      │  ├─ Extra Expenses
      │  ├─ Vendors
      │  ├─ Customers
      │  ├─ Reports
      │  └─ Users (admin)
      │
      ├─ Header
      │  └─ User Dropdown (Logout)
      │
      └─ Outlet (Page Content)
         ├─ Dashboard.jsx
         ├─ MainCategories.jsx
         ├─ DerivedProducts.jsx
         ├─ InventoryManagement.jsx
         ├─ PurchaseHistory.jsx
         ├─ NewPOS.jsx
         ├─ Sales.jsx
         ├─ DailyPiecesTracking.jsx
         ├─ DailyWasteTracking.jsx
         ├─ ExtraExpenses.jsx
         ├─ Vendors.jsx
         ├─ Customers.jsx
         ├─ Reports.jsx
         └─ Users.jsx
```

#### State Management

**Local Component State:**
```javascript
const [categories, setCategories] = useState([]);
const [products, setProducts] = useState([]);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);
```

**Authentication State (LocalStorage):**
```javascript
// Login
localStorage.setItem('token', access_token);
localStorage.setItem('user', JSON.stringify(user));

// Get current user
const user = JSON.parse(localStorage.getItem('user') || '{}');
const isAdmin = user.is_admin;

// Logout
localStorage.removeItem('token');
localStorage.removeItem('user');
navigate('/login');
```

**Axios Configuration:**
```javascript
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001/api';

// Request interceptor (add auth token)
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor (handle 401 errors)
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

#### UI Component Library (Shadcn - 47 components)

**Form Components:**
- Input, Textarea, Select, Checkbox, RadioGroup
- Button, Label, Form (React Hook Form integration)
- Calendar, DatePicker
- Combobox (searchable select)

**Layout Components:**
- Card, CardHeader, CardContent, CardFooter
- Dialog, Sheet (side panel)
- Tabs, TabsList, TabsTrigger, TabsContent
- Separator, ScrollArea

**Feedback Components:**
- Toast (Sonner)
- Alert, AlertDescription
- Badge
- Skeleton (loading state)

**Data Components:**
- Table, TableHeader, TableBody, TableRow, TableCell
- Pagination

**Advanced Components:**
- Command (⌘K menu)
- Popover, DropdownMenu
- Carousel
- HoverCard, Tooltip

**Usage Example:**
```javascript
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { toast } from "sonner";

function MyForm() {
  const handleSubmit = async () => {
    try {
      await api.post('/endpoint', data);
      toast.success('Success!');
    } catch (error) {
      toast.error('Error: ' + error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input type="text" placeholder="Enter name" />
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Select option" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="1">Option 1</SelectItem>
          <SelectItem value="2">Option 2</SelectItem>
        </SelectContent>
      </Select>
      <Button type="submit">Submit</Button>
    </form>
  );
}
```

---

## 9. CONFIGURATION

### 9.1 Backend Configuration

**Environment Variables (.env):**
```bash
# MongoDB Connection
MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
DB_NAME=bano_fresh

# JWT Security
JWT_SECRET_KEY=your-secret-key-here-change-in-production

# CORS Configuration
CORS_ORIGINS=*  # Change to specific origins in production
```

**Key Settings:**
```python
# server.py
PORT = 8001
ACCESS_TOKEN_EXPIRE_HOURS = 24
TIMEZONE = 'Asia/Kolkata'
PASSWORD_HASH_SCHEME = 'bcrypt'
```

**Running the Backend:**
```bash
cd backend
pip install -r requirements.txt
uvicorn server:app --reload --port 8001
```

---

### 9.2 Frontend Configuration

**Environment Variables (.env):**
```bash
# Backend API URL
REACT_APP_BACKEND_URL=http://localhost:8001

# Optional Settings
REACT_APP_ENABLE_VISUAL_EDITS=false
ENABLE_HEALTH_CHECK=false
DISABLE_HOT_RELOAD=false
```

**Build Configuration (craco.config.js):**
```javascript
const path = require('path');

module.exports = {
  webpack: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
    configure: (webpackConfig) => {
      // Disable watch for node_modules and .git
      webpackConfig.watchOptions = {
        ignored: ['**/node_modules', '**/.git'],
      };
      return webpackConfig;
    },
  },
};
```

**Tailwind Configuration (tailwind.config.js):**
```javascript
module.exports = {
  darkMode: ["class"],
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        // ... more colors
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
```

**Running the Frontend:**
```bash
cd frontend
yarn install
yarn start  # Development
yarn build  # Production build
```

---

## 10. SECURITY

### 10.1 Authentication

**Password Hashing:**
```python
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Hash password
hashed_password = pwd_context.hash(plain_password)

# Verify password
is_valid = pwd_context.verify(plain_password, hashed_password)
```

**JWT Token Generation:**
```python
import jwt
from datetime import datetime, timedelta

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(hours=24)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm="HS256")
    return encoded_jwt
```

**Token Validation:**
```python
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer

security = HTTPBearer()

async def get_current_user(token: str = Depends(security)):
    try:
        payload = jwt.decode(token.credentials, SECRET_KEY, algorithms=["HS256"])
        user_id = payload.get("sub")
        user = await get_user_by_id(user_id)
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
```

---

### 10.2 Authorization

**Role-Based Access Control:**
```python
# Admin-only decorator
def admin_required(current_user: User = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user

# Usage
@app.delete("/api/users/{user_id}")
async def delete_user(
    user_id: str,
    admin: User = Depends(admin_required)  # Only admins can delete users
):
    ...
```

**Frontend Authorization:**
```javascript
// Layout.jsx - Conditional rendering
const user = JSON.parse(localStorage.getItem('user') || '{}');
const isAdmin = user.is_admin;

return (
  <Sidebar>
    <NavLink to="/dashboard">Dashboard</NavLink>

    {/* Admin-only links */}
    {isAdmin && (
      <>
        <NavLink to="/main-categories">Main Categories</NavLink>
        <NavLink to="/derived-products">Derived Products</NavLink>
        <NavLink to="/users">Users</NavLink>
      </>
    )}

    {/* All users */}
    <NavLink to="/inventory">Inventory</NavLink>
    <NavLink to="/pos">New POS</NavLink>
  </Sidebar>
);
```

---

### 10.3 Data Security

**Input Validation (Pydantic):**
```python
from pydantic import BaseModel, Field, validator

class MainCategoryCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: str | None = None

    @validator('name')
    def name_must_not_be_empty(cls, v):
        if not v.strip():
            raise ValueError('Name cannot be empty')
        return v.strip()
```

**SQL Injection Prevention:**
- MongoDB is NoSQL, not vulnerable to SQL injection
- Use parameterized queries
- Validate all inputs with Pydantic

**XSS Prevention:**
- React automatically escapes content
- Avoid `dangerouslySetInnerHTML`
- Sanitize user inputs

**CORS Protection:**
```python
# Production configuration
CORS_ORIGINS = [
    "https://your-frontend-domain.com",
    "https://www.your-frontend-domain.com"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)
```

---

### 10.4 Default Credentials

**Default Admin Account:**
```
Username: admin-bano
Password: India@54321
Email: admin@banofresh.com
```

**IMPORTANT:** Change default password in production!

```python
# Create new admin user and delete default
# 1. Login as admin-bano
# 2. Create new admin user
# 3. Logout
# 4. Login as new admin
# 5. Delete admin-bano user
```

---

## 11. DEPLOYMENT

### 11.1 Production Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      CLIENT                             │
│                  (Web Browser)                          │
└─────────────────────────────────────────────────────────┘
                        │ HTTPS
                        ↓
┌─────────────────────────────────────────────────────────┐
│              STATIC HOSTING (Frontend)                  │
│          Netlify / Vercel / Hostinger                   │
│               - React Build Files                       │
│               - CDN Delivery                            │
└─────────────────────────────────────────────────────────┘
                        │ HTTPS API Calls
                        ↓
┌─────────────────────────────────────────────────────────┐
│                  REVERSE PROXY                          │
│                     Nginx                               │
│               - SSL Termination                         │
│               - Load Balancing                          │
│               - Static File Serving                     │
└─────────────────────────────────────────────────────────┘
                        │ HTTP (local)
                        ↓
┌─────────────────────────────────────────────────────────┐
│               BACKEND SERVER (VPS)                      │
│                FastAPI + Uvicorn                        │
│                   Port: 8001                            │
│              - Process Manager: PM2                     │
│              - Auto-restart on crash                    │
└─────────────────────────────────────────────────────────┘
                        │ MongoDB Protocol
                        ↓
┌─────────────────────────────────────────────────────────┐
│                 DATABASE (Cloud)                        │
│                  MongoDB Atlas                          │
│              - Automatic Backups                        │
│              - Automatic Scaling                        │
│              - High Availability                        │
└─────────────────────────────────────────────────────────┘
```

---

### 11.2 Backend Deployment (VPS)

**Server Requirements:**
- OS: Ubuntu 20.04+ or similar Linux
- RAM: Minimum 1GB
- CPU: 1 vCPU minimum
- Storage: 20GB minimum

**Deployment Steps:**

1. **Install Python & Dependencies:**
```bash
sudo apt update
sudo apt install python3.11 python3-pip python3-venv nginx
```

2. **Clone Repository:**
```bash
cd /var/www
git clone <repository-url> bano-inventory
cd bano-inventory/backend
```

3. **Create Virtual Environment:**
```bash
python3.11 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

4. **Configure Environment:**
```bash
cp .env.example .env
nano .env
# Set production values:
# - MONGO_URL (MongoDB Atlas connection string)
# - JWT_SECRET_KEY (generate random secret)
# - CORS_ORIGINS (your frontend domain)
```

5. **Install PM2 (Process Manager):**
```bash
sudo npm install -g pm2
```

6. **Create PM2 Configuration:**
```bash
# ecosystem.config.js
module.exports = {
  apps: [{
    name: 'bano-backend',
    script: '/var/www/bano-inventory/backend/venv/bin/uvicorn',
    args: 'server:app --host 0.0.0.0 --port 8001',
    cwd: '/var/www/bano-inventory/backend',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production'
    }
  }]
};
```

7. **Start Backend:**
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup  # Enable auto-start on boot
```

8. **Configure Nginx:**
```bash
sudo nano /etc/nginx/sites-available/bano-backend

# Nginx configuration
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:8001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

sudo ln -s /etc/nginx/sites-available/bano-backend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

9. **Install SSL Certificate:**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d api.yourdomain.com
```

---

### 11.3 Frontend Deployment

**Build for Production:**
```bash
cd frontend
yarn install
yarn build
# Creates optimized build in frontend/build/
```

**Option 1: Netlify**
```bash
# netlify.toml
[build]
  command = "cd frontend && yarn build"
  publish = "frontend/build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

# Environment variables (set in Netlify dashboard):
REACT_APP_BACKEND_URL=https://api.yourdomain.com
```

**Option 2: Vercel**
```json
// vercel.json
{
  "buildCommand": "cd frontend && yarn build",
  "outputDirectory": "frontend/build",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

**Option 3: Hostinger (cPanel)**
1. Build locally: `yarn build`
2. Upload `build/` contents to `public_html/`
3. Create `.htaccess`:
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

---

### 11.4 MongoDB Atlas Setup

1. **Create Cluster:**
   - Go to https://www.mongodb.com/cloud/atlas
   - Create free tier cluster (M0)
   - Choose region closest to VPS

2. **Configure Database Access:**
   - Create database user with strong password
   - Note credentials

3. **Configure Network Access:**
   - Add VPS IP address to IP whitelist
   - Or allow access from anywhere (0.0.0.0/0) for development

4. **Get Connection String:**
   - Click "Connect" on cluster
   - Choose "Connect your application"
   - Copy connection string
   - Replace `<password>` with your database password
   - Set as `MONGO_URL` in backend `.env`

---

### 11.5 Maintenance & Monitoring

**Backend Logs:**
```bash
# View logs
pm2 logs bano-backend

# Restart backend
pm2 restart bano-backend

# Stop backend
pm2 stop bano-backend
```

**Nginx Logs:**
```bash
# Access logs
sudo tail -f /var/log/nginx/access.log

# Error logs
sudo tail -f /var/log/nginx/error.log
```

**Database Backups:**
- MongoDB Atlas: Automatic daily backups (free tier)
- Manual backup: Use `mongodump` command

**Updates:**
```bash
# Pull latest code
cd /var/www/bano-inventory
git pull

# Restart backend
pm2 restart bano-backend

# Rebuild frontend (if needed)
cd frontend
yarn build
# Upload to hosting
```

---

## 12. QUICK REFERENCE

### 12.1 Key File Locations

**Backend:**
- Main application: `C:\wamp64\www\bano-meat-inventory\backend\server.py`
- Dependencies: `C:\wamp64\www\bano-meat-inventory\backend\requirements.txt`
- Environment: `C:\wamp64\www\bano-meat-inventory\backend\.env`

**Frontend:**
- Main app: `C:\wamp64\www\bano-meat-inventory\frontend\src\App.js`
- Layout: `C:\wamp64\www\bano-meat-inventory\frontend\src\components\Layout.jsx`
- POS: `C:\wamp64\www\bano-meat-inventory\frontend\src\pages\NewPOS.jsx`
- Dashboard: `C:\wamp64\www\bano-meat-inventory\frontend\src\pages\Dashboard.jsx`

---

### 12.2 Common Commands

**Backend:**
```bash
# Start development server
cd backend
uvicorn server:app --reload --port 8001

# Install dependencies
pip install -r requirements.txt

# Clear database (USE WITH CAUTION)
python clear_database.py
```

**Frontend:**
```bash
# Start development server
cd frontend
yarn start

# Install dependencies
yarn install

# Build for production
yarn build

# Run tests
yarn test
```

**Git:**
```bash
# View status
git status

# View recent commits
git log --oneline -10

# Pull latest changes
git pull

# Create commit
git add .
git commit -m "Description"
git push
```

---

### 12.3 API Quick Reference

**Authentication:**
```bash
# Login
POST /api/auth/login
Body: {"username": "admin-bano", "password": "India@54321"}

# Get current user
GET /api/auth/me
Headers: {"Authorization": "Bearer <token>"}
```

**Common Operations:**
```bash
# List main categories
GET /api/main-categories

# List derived products for a category
GET /api/derived-products?main_category_id=<id>

# Get inventory summary
GET /api/inventory-summary

# Create POS sale
POST /api/pos-sales
Body: {
  "customer_name": "John",
  "items": [{"derived_product_id": "<id>", "quantity_kg": 2.5}],
  "payment_method": "cash"
}

# Generate sales report
GET /api/reports/sales?start_date=2025-01-01&end_date=2025-01-31&format=excel
```

---

### 12.4 Troubleshooting

**Backend not starting:**
```bash
# Check if port 8001 is in use
netstat -ano | findstr :8001

# Kill process if needed (Windows)
taskkill /PID <pid> /F

# Check MongoDB connection
# Verify MONGO_URL in .env
```

**Frontend not connecting to backend:**
```bash
# Check REACT_APP_BACKEND_URL in .env
# Should be: http://localhost:8001 (development)

# Clear browser cache and localStorage
# Open browser console (F12)
localStorage.clear();
location.reload();
```

**401 Unauthorized errors:**
```bash
# Token expired - login again
# Check token in localStorage
localStorage.getItem('token');

# Check token validity on backend
# Decode JWT at https://jwt.io/
```

**Inventory deduction not working:**
```bash
# Check inventory availability
GET /api/inventory-summary

# Check purchase records
GET /api/inventory-purchases?main_category_id=<id>

# Verify remaining_weight_kg > 0
```

---

### 12.5 Project Statistics

| Metric | Value |
|--------|-------|
| Total Lines of Code | 12,000+ |
| Backend (server.py) | 3,267 lines |
| Frontend Pages | 20 pages, 8,584 lines |
| UI Components | 47 Shadcn components |
| API Endpoints | 58 endpoints |
| Database Collections | 14 collections |
| Pydantic Models | 32 models |
| Dependencies (Backend) | 77 packages |
| Dependencies (Frontend) | 50+ packages |

---

### 12.6 Recent Changes (from Git Log)

```
7490f29 - Allow flexible decimal input precision across purchase and inventory forms
cf823ae - input limit removed from purchase form
39c8311 - Set Sales page to show today's records by default
cad0fce - Fix Sales page error by handling old POS sales data schema
ab5ee86 - bug fixed
```

---

## CONCLUSION

This document provides a comprehensive reference for the Bano Fresh Meat Inventory Management System. It covers:

- Complete technology stack and architecture
- Database schema with 14 collections
- 58 API endpoints with examples
- Business logic and workflows (FIFO, POS, tracking)
- Component architecture (backend & frontend)
- Security and authentication
- Deployment instructions
- Quick reference for common tasks

**Use this document to:**
- Understand the entire system architecture
- Reference API endpoints and data models
- Troubleshoot common issues
- Deploy to production
- Onboard new developers

**Project Status:** Production-ready, actively deployed
**Last Updated:** December 30, 2025
**Maintained By:** Bano Fresh Development Team

---

**For additional information, refer to:**
- `README.md` - Project overview
- `COMPREHENSIVE_DOCUMENTATION.md` - Detailed system documentation
- `DEPLOYMENT_GUIDE.md` - Deployment instructions
- `VPS_DEPLOYMENT_GUIDE.md` - VPS-specific deployment
- `BACKEND_DEPLOYMENT_STEPS.md` - Backend deployment steps
