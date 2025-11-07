import { useEffect, useState } from "react";
import axios from "axios";
import { API } from "@/App";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { TrendingUp, Calendar, Filter } from "lucide-react";

const Sales = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [editingSale, setEditingSale] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    checkAdminStatus();
    fetchSales();
  }, []);

  const checkAdminStatus = () => {
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        setIsAdmin(user.is_admin || false);
      }
    } catch (error) {
      console.error("Error checking admin status:", error);
      setIsAdmin(false);
    }
  };

  const fetchSales = async (filters = {}) => {
    try {
      const token = localStorage.getItem("token");
      let url = `${API}/pos-sales`;
      const params = new URLSearchParams();
      
      if (filters.start_date) params.append("start_date", filters.start_date);
      if (filters.end_date) params.append("end_date", filters.end_date);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSales(response.data);
    } catch (error) {
      toast.error("Failed to fetch sales");
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = () => {
    if (startDate && endDate && startDate > endDate) {
      toast.error("Start date must be before end date");
      return;
    }
    fetchSales({ start_date: startDate, end_date: endDate });
  };

  const handleClearFilter = () => {
    setStartDate("");
    setEndDate("");
    fetchSales();
  };

  const handleEditSale = (sale) => {
    setEditingSale({
      ...sale,
      payment_method: sale.payment_method || "cash",
      discount: sale.discount || 0,
      tax: sale.tax || 0,
    });
  };

  const handleSaveEdit = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${API}/pos-sales/${editingSale.id}`,
        {
          payment_method: editingSale.payment_method,
          discount: editingSale.discount,
          tax: editingSale.tax,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Sale updated successfully");
      setEditingSale(null);
      fetchSales({ start_date: startDate, end_date: endDate });
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to update sale");
    }
  };

  const handleDeleteSale = async (saleId) => {
    if (!window.confirm("Are you sure you want to delete this sale? This will restore the inventory.")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API}/pos-sales/${saleId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Sale deleted successfully");
      fetchSales({ start_date: startDate, end_date: endDate });
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to delete sale");
    }
  };

  if (loading) {
    return <div className="p-8">Loading sales...</div>;
  }

  const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);

  return (
    <div className="p-8" data-testid="sales-page">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
          Sales History
        </h1>
        <p className="text-gray-600">View all transactions</p>
      </div>

      {/* Date Filter */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-600" />
              <span className="font-medium text-gray-700">Filter by Date:</span>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">From:</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="border rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">To:</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="border rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <button
              onClick={handleFilter}
              className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 text-sm"
            >
              Apply Filter
            </button>
            {(startDate || endDate) && (
              <button
                onClick={handleClearFilter}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm"
              >
                Clear Filter
              </button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Revenue Card */}
      <Card className="mb-6 bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 mb-1">Total Revenue</p>
              <p className="text-4xl font-bold text-emerald-700" data-testid="total-revenue">
                ₹{totalRevenue.toFixed(2)}
              </p>
            </div>
            <TrendingUp className="h-12 w-12 text-emerald-600" />
          </div>
        </CardContent>
      </Card>

      {/* Sales List */}
      <div className="space-y-4">
        {sales.map((sale) => (
          <Card key={sale.id} data-testid={`sale-${sale.id}`}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg mb-1">
                    {sale.customer_name || "Walk-in Customer"}
                  </CardTitle>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    {new Date(sale.created_at).toLocaleString()}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-emerald-600">₹{sale.total.toFixed(2)}</p>
                  <p className="text-xs text-gray-500 mt-1">{sale.payment_method.toUpperCase()}</p>
                  {isAdmin && (
                    <div className="flex gap-2 mt-2 justify-end">
                      <button
                        onClick={() => handleEditSale(sale)}
                        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteSale(sale.id)}
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="font-semibold text-gray-700 mb-2">Items:</p>
                {sale.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded"
                  >
                    <div>
                      <p className="font-medium">{item.derived_product_name}</p>
                      <p className="text-sm text-gray-600">
                        {item.main_category_name} • {item.quantity_kg}kg × ₹{item.selling_price.toFixed(2)}/kg
                      </p>
                    </div>
                    <p className="font-semibold">₹{item.total.toFixed(2)}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal:</span>
                  <span>₹{sale.subtotal.toFixed(2)}</span>
                </div>
                {sale.discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Discount:</span>
                    <span className="text-red-600">-₹{sale.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax:</span>
                  <span>₹{sale.tax.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {sales.length === 0 && (
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg">No sales yet. Start selling!</p>
        </div>
      )}

      {/* Edit Sale Dialog */}
      {editingSale && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Edit Sale</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Payment Method</label>
                <select
                  value={editingSale.payment_method}
                  onChange={(e) => setEditingSale({ ...editingSale, payment_method: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="upi">UPI</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Discount (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={editingSale.discount}
                  onChange={(e) => setEditingSale({ ...editingSale, discount: parseFloat(e.target.value) || 0 })}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Tax (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={editingSale.tax}
                  onChange={(e) => setEditingSale({ ...editingSale, tax: parseFloat(e.target.value) || 0 })}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-sm text-gray-600">Subtotal: ₹{editingSale.subtotal.toFixed(2)}</p>
                <p className="text-sm text-gray-600">Discount: -₹{editingSale.discount.toFixed(2)}</p>
                <p className="text-sm text-gray-600">Tax: +₹{editingSale.tax.toFixed(2)}</p>
                <p className="text-lg font-bold text-emerald-600 mt-2">
                  New Total: ₹{(editingSale.subtotal - editingSale.discount + editingSale.tax).toFixed(2)}
                </p>
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setEditingSale(null)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sales;
