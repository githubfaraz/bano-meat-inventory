# Bano Fresh Inventory Management System

A full-stack inventory management application for Bano Fresh meat business, managing raw chicken, mutton, livers, kidneys, boneless/curry-cut, and frozen items.

## 🏗️ Tech Stack

- **Backend**: FastAPI (Python 3.11), MongoDB Atlas
- **Frontend**: React 19, Tailwind CSS, Shadcn UI
- **Authentication**: JWT-based with admin-only user creation
- **Database**: MongoDB (async with Motor)

## 📁 Project Structure

```
/
├── backend/                  # FastAPI backend
│   ├── .env                  # Environment variables
│   ├── server.py             # Main FastAPI application
│   ├── requirements.txt      # Python dependencies
│   └── ADMIN_CREDENTIALS.txt # Admin login credentials
├── frontend/                 # React frontend
│   ├── src/                  # React source code
│   ├── public/               # Static assets
│   ├── package.json          # Node.js dependencies
│   └── .env                  # Frontend environment variables
└── test_result.md            # Testing protocols and results
```

## 🚀 Features

- **Inventory Management**: Track raw materials and derived products
- **POS System**: Point of Sale with receipt printing (thermal printer compatible)
- **Purchase Management**: Record raw material purchases
- **Product Derivation**: Simple workflow for derived products (boneless, curry cut, etc.)
- **Vendor Management**: Manage supplier information
- **Customer Management**: Track customer details
- **Sales Tracking**: Record and monitor sales
- **User Management**: Admin-only user creation
- **Reports**: Export data in Excel, CSV, and PDF formats
- **Stock Alerts**: Low inventory notifications

## 🔐 Admin Credentials

See `backend/ADMIN_CREDENTIALS.txt` for admin login details.

## 🛠️ Local Development Setup

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn server:app --reload --host 0.0.0.0 --port 8001
```

### Frontend

```bash
cd frontend
yarn install
yarn start
```

## 📝 Environment Variables

### Backend (.env)
```
MONGO_URL=your_mongodb_atlas_connection_string
DB_NAME=your_database_name
JWT_SECRET_KEY=your_jwt_secret_key
CORS_ORIGINS=http://localhost:3000
```

### Frontend (.env)
```
REACT_APP_BACKEND_URL=http://localhost:8001
```

## 📦 Deployment

This application is designed to be deployed on:
- **Backend**: Self-managed VPS (Linux)
- **Frontend**: Static hosting (Hostinger, Netlify, Vercel, etc.)
- **Database**: MongoDB Atlas (free tier)

## 🔄 API Endpoints

All backend API routes are prefixed with `/api`:
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - Admin-only user creation
- `GET /api/products` - List all products
- `POST /api/products` - Create product
- `GET /api/vendors` - List all vendors
- `GET /api/customers` - List all customers
- `POST /api/sales` - Create sale
- `POST /api/purchases` - Create purchase
- `GET /api/reports/export` - Export reports

## 📄 License

Proprietary - Bano Fresh Inventory System

## 👤 Contact

For support or inquiries, contact the development team.
