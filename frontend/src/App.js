import { useState, useEffect } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import axios from "axios";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Products from "@/pages/Products";
import Vendors from "@/pages/Vendors";
import Customers from "@/pages/Customers";
import Purchases from "@/pages/Purchases";
import POS from "@/pages/POS";
import Sales from "@/pages/Sales";
import Reports from "@/pages/Reports";
import Users from "@/pages/Users";
// New Inventory System Components
import MainCategories from "@/pages/MainCategories";
import DerivedProducts from "@/pages/DerivedProducts";
import InventoryManagement from "@/pages/InventoryManagement";
import DailyPiecesTracking from "@/pages/DailyPiecesTracking";
import DailyWasteTracking from "@/pages/DailyWasteTracking";
import NewPOS from "@/pages/NewPOS";
import Layout from "@/components/Layout";
import { Toaster } from "@/components/ui/sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "https://bano-fresh-meat.preview.emergentagent.com";
export const API = `${BACKEND_URL}/api`;
console.log("🔧 App.js - BACKEND_URL:", BACKEND_URL);
console.log("🔧 App.js - API:", API);

// Axios interceptor for auth
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="App">
      <Toaster position="top-right" richColors />
      <BrowserRouter>
        <Routes>
          <Route
            path="/login"
            element={!isAuthenticated ? <Login setAuth={setIsAuthenticated} /> : <Navigate to="/" />}
          />
          <Route
            path="/"
            element={isAuthenticated ? <Layout setAuth={setIsAuthenticated} /> : <Navigate to="/login" />}
          >
            <Route index element={<Dashboard />} />
            <Route path="products" element={<Products />} />
            <Route path="vendors" element={<Vendors />} />
            <Route path="customers" element={<Customers />} />
            <Route path="purchases" element={<Purchases />} />
            <Route path="pos" element={<POS />} />
            <Route path="sales" element={<Sales />} />
            <Route path="reports" element={<Reports />} />
            <Route path="users" element={<Users />} />
            {/* New Inventory System Routes */}
            <Route path="main-categories" element={<MainCategories />} />
            <Route path="derived-products" element={<DerivedProducts />} />
            <Route path="inventory-management" element={<InventoryManagement />} />
            <Route path="daily-pieces-tracking" element={<DailyPiecesTracking />} />
            <Route path="daily-waste-tracking" element={<DailyWasteTracking />} />
            <Route path="new-pos" element={<NewPOS />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
