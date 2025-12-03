import { useEffect, useState } from "react";
import axios from "axios";
import { API } from "@/App";
import { formatDateTime } from "../lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, ShoppingCart, TrendingUp, Weight } from "lucide-react";
import { toast } from "sonner";

// New Inventory Summary Component
const InventorySummarySection = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const API_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8001";

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/api/inventory-summary`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setInventory(response.data);
    } catch (error) {
      console.error("Failed to fetch inventory");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-xl">Current Inventory</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-500 py-4">Loading inventory...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Weight className="h-5 w-5 text-emerald-600" />
          Current Inventory
        </CardTitle>
      </CardHeader>
      <CardContent>
        {inventory.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {inventory.map((item) => (
              <div
                key={item.main_category_id}
                className={`p-4 rounded-lg border-2 ${
                  item.low_stock
                    ? "bg-red-50 border-red-200"
                    : "bg-emerald-50 border-emerald-200"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-lg text-gray-800">
                    {item.main_category_name}
                  </h3>
                  {item.low_stock && (
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  )}
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Weight:</span>
                    <span className="font-semibold text-emerald-700">
                      {item.total_weight_kg} kg
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Pieces:</span>
                    <span className="font-semibold text-blue-700">
                      {item.total_pieces}
                    </span>
                  </div>
                </div>
                {item.low_stock && (
                  <p className="text-xs text-red-600 mt-2 font-medium">
                    ⚠ Low Stock Alert
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">
            No inventory data available. Start by adding purchases!
          </p>
        )}
      </CardContent>
    </Card>
  );
};

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API}/dashboard/stats`);
      setStats(response.data);
    } catch (error) {
      toast.error("Failed to fetch dashboard stats");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="p-8" data-testid="dashboard-page">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
          Dashboard
        </h1>
        <p className="text-gray-600">Overview of your Bano Fresh business</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Today's Sales</CardTitle>
            <DollarSign className="h-5 w-5 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-700" data-testid="stats-today-sales">
              ₹{stats?.total_sales_today?.toFixed(2) || "0.00"}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Monthly Sales</CardTitle>
            <DollarSign className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-700" data-testid="stats-monthly-sales">
              ₹{stats?.total_sales_month?.toFixed(2) || "0.00"}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Today's Purchase</CardTitle>
            <ShoppingCart className="h-5 w-5 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-700" data-testid="stats-today-purchases">
              ₹{stats?.total_purchases_today?.toFixed(2) || "0.00"}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Monthly Purchase</CardTitle>
            <ShoppingCart className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-700" data-testid="stats-monthly-purchases">
              ₹{stats?.total_purchases_month?.toFixed(2) || "0.00"}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Today's Profit</CardTitle>
            <TrendingUp className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${stats?.profit_today >= 0 ? 'text-green-700' : 'text-red-700'}`} data-testid="stats-today-profit">
              ₹{stats?.profit_today?.toFixed(2) || "0.00"}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-teal-50 to-cyan-50 border-teal-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Monthly Profit</CardTitle>
            <TrendingUp className="h-5 w-5 text-teal-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${stats?.profit_month >= 0 ? 'text-teal-700' : 'text-red-700'}`} data-testid="stats-monthly-profit">
              ₹{stats?.profit_month?.toFixed(2) || "0.00"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Inventory Summary - New Section */}
      <InventorySummarySection />


      {/* Recent Sales */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Recent Sales</CardTitle>
        </CardHeader>
        <CardContent>
          {stats?.recent_sales?.length > 0 ? (
            <div className="space-y-4">
              {stats.recent_sales.map((sale) => (
                <div
                  key={sale.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  data-testid={`recent-sale-${sale.id}`}
                >
                  <div>
                    <p className="font-semibold text-gray-800">
                      {sale.customer_name || "Walk-in Customer"}
                    </p>
                    <p className="text-sm text-gray-600">
                      {formatDateTime(sale.created_at)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {sale.items.length} item(s) • {sale.payment_method.toUpperCase()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-emerald-600">₹{sale.total.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No sales yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
