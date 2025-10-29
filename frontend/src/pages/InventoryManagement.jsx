import { useEffect, useState } from "react";
import axios from "axios";
import { API } from "../App";

const InventoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [detailData, setDetailData] = useState({ purchases: [], waste: [], sales: [] });
  const [activeTab, setActiveTab] = useState("purchases");
  const [error, setError] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchCategories();
    checkAdminStatus();
  }, []);

  const checkAdminStatus = () => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      setIsAdmin(user.is_admin || false);
    }
  };

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API}/main-categories`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setLoading(false);
    }
  };

  const fetchDetailData = async (categoryId) => {
    try {
      const token = localStorage.getItem("token");
      setError("");
      
      const [purchasesRes, wasteRes, salesRes] = await Promise.all([
        axios.get(`${API}/inventory-purchases?main_category_id=${categoryId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API}/daily-waste-tracking?main_category_id=${categoryId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API}/pos-sales?main_category_id=${categoryId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setDetailData({
        purchases: purchasesRes.data,
        waste: wasteRes.data,
        sales: salesRes.data,
      });
    } catch (error) {
      console.error("Error fetching detail data:", error);
      setError("Failed to fetch detail data");
    }
  };

  const handleViewDetails = (category) => {
    setSelectedCategory(category);
    setActiveTab("purchases");
    fetchDetailData(category.id);
  };

  const handleEditPurchase = async (purchase) => {
    setEditingPurchase({
      id: purchase.id,
      main_category_id: purchase.main_category_id,
      vendor_id: purchase.vendor_id,
      raw_weight_kg: purchase.raw_weight_kg,
      total_pieces: purchase.total_pieces || 0,
      cost_per_kg: purchase.cost_per_kg,
      notes: purchase.notes || ""
    });
  };

  const handleSaveEdit = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${API}/inventory-purchases/${editingPurchase.id}`,
        editingPurchase,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditingPurchase(null);
      fetchDetailData(selectedCategory.id);
      fetchCategories();
      alert("Purchase updated successfully");
    } catch (error) {
      alert(error.response?.data?.detail || "Failed to update purchase");
    }
  };

  const handleDeletePurchase = async (purchaseId) => {
    if (!window.confirm("Are you sure? This will adjust inventory calculations.")) return;
    
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API}/inventory-purchases/${purchaseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchDetailData(selectedCategory.id);
      fetchCategories();
      alert("Purchase deleted successfully");
    } catch (error) {
      alert(error.response?.data?.detail || "Failed to delete purchase");
    }
  };

  const getCategoryIcon = (categoryName) => {
    const name = categoryName.toLowerCase();
    if (name.includes('chicken')) return '🐔';
    if (name.includes('mutton')) return '🐑';
    if (name.includes('fish')) return '🐟';
    if (name.includes('frozen')) return '❄️';
    return '📦';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!selectedCategory) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Inventory Overview</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="bg-white rounded-lg shadow-md p-6 border-l-4 border-emerald-500"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <span className="text-3xl">{getCategoryIcon(cat.name)}</span>
                  {cat.name}
                </h3>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Current Stock</p>
                  <p className="text-2xl font-bold text-emerald-600">
                    {cat.remaining_weight_kg} kg
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Pieces</p>
                  <p className="text-xl font-semibold">{cat.remaining_pieces || 0}</p>
                </div>
                <button
                  onClick={() => handleViewDetails(cat)}
                  className="w-full mt-4 bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center gap-4">
        <button
          onClick={() => setSelectedCategory(null)}
          className="text-emerald-600 hover:text-emerald-700 flex items-center gap-2"
        >
          ← Back to Overview
        </button>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <span className="text-3xl">{getCategoryIcon(selectedCategory.name)}</span>
          {selectedCategory.name} - Detailed View
        </h1>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-emerald-50 rounded-lg p-6 mb-6">
        <h3 className="font-semibold text-lg mb-4">Current Stock Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-600">Total Stock</p>
            <p className="text-2xl font-bold text-emerald-600">
              {selectedCategory.remaining_weight_kg} kg
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Today's Waste</p>
            <p className="text-2xl font-bold text-red-600">0 kg</p>
            <p className="text-xs text-gray-500">(0%)</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Week's Waste</p>
            <p className="text-2xl font-bold text-orange-600">0 kg</p>
            <p className="text-xs text-gray-500">(0%)</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Pieces</p>
            <p className="text-2xl font-bold text-blue-600">
              {selectedCategory.remaining_pieces || 0}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab("purchases")}
            className={`flex-1 py-3 px-6 font-medium transition-colors ${
              activeTab === "purchases"
                ? "bg-emerald-500 text-white"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            📦 Purchase History
          </button>
          <button
            onClick={() => setActiveTab("waste")}
            className={`flex-1 py-3 px-6 font-medium transition-colors ${
              activeTab === "waste"
                ? "bg-emerald-500 text-white"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            🗑️ Waste History
          </button>
          <button
            onClick={() => setActiveTab("sales")}
            className={`flex-1 py-3 px-6 font-medium transition-colors ${
              activeTab === "sales"
                ? "bg-emerald-500 text-white"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            🛒 Sales History
          </button>
        </div>

        <div className="p-6">
          {activeTab === "purchases" && (
            <div className="space-y-4">
              {detailData.purchases.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No purchase records</p>
              ) : (
                detailData.purchases.map((purchase) => (
                  <div key={purchase.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Vendor: {purchase.vendor_name || 'Unknown'}</p>
                          <p className="text-sm font-medium">Total Weight</p>
                          <p className="text-lg font-bold text-emerald-600">{purchase.raw_weight_kg} kg</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Remaining</p>
                          <p className="text-lg font-bold text-blue-600">{purchase.remaining_weight_kg} kg</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Total Pieces</p>
                          <p className="text-lg font-bold">{purchase.total_pieces || 0}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Remaining Pieces</p>
                          <p className="text-lg font-bold">{purchase.remaining_pieces || 0}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Cost/kg</p>
                          <p className="text-lg font-bold">₹{purchase.cost_per_kg}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Total Cost</p>
                          <p className="text-lg font-bold text-orange-600">₹{purchase.total_cost}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-sm text-gray-500">Notes: {purchase.notes || '...'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">Purchase Date</p>
                        <p className="text-sm text-gray-600">{new Date(purchase.purchase_date).toLocaleDateString()}</p>
                        <p className="text-xs text-gray-400">{new Date(purchase.purchase_date).toLocaleTimeString()}</p>
                        {isAdmin && (
                          <div className="flex gap-2 mt-2">
                            <button
                              onClick={() => handleEditPurchase(purchase)}
                              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeletePurchase(purchase.id)}
                              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "waste" && (
            <div className="space-y-4">
              {detailData.waste.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No waste records</p>
              ) : (
                detailData.waste.map((waste) => (
                  <div key={waste.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium">Waste Amount</p>
                          <p className="text-2xl font-bold text-red-600">{waste.waste_kg} kg</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Deducted From</p>
                          <p className="text-lg">Inventory Stock</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">Date</p>
                        <p className="text-sm text-gray-600">{new Date(waste.tracking_date).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "sales" && (
            <div className="space-y-4">
              {detailData.sales.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No sales records</p>
              ) : (
                detailData.sales.map((sale) => (
                  <div key={sale.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-semibold text-lg">{sale.customer_name || 'Walk-in Customer'}</p>
                        <p className="text-sm text-gray-600">{sale.payment_method?.toUpperCase()}</p>
                        <div className="mt-2">
                          {sale.items?.map((item, idx) => (
                            <div key={idx} className="text-sm">
                              <span className="font-medium">{item.product_name}</span>
                              <span className="text-gray-600 ml-2">
                                {item.weight_kg ? `${item.weight_kg}kg × ₹${item.price_per_kg}/kg` : `${item.quantity}pcs × ₹${item.price}/pc`}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-emerald-600">₹{sale.final_amount}</p>
                        <p className="text-sm text-gray-600">{new Date(sale.created_at).toLocaleDateString()}</p>
                        <p className="text-xs text-gray-400">{new Date(sale.created_at).toLocaleTimeString()}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Edit Purchase Dialog */}
      {editingPurchase && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Edit Purchase</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Raw Weight (kg) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={editingPurchase.raw_weight_kg}
                  onChange={(e) => setEditingPurchase({ ...editingPurchase, raw_weight_kg: parseFloat(e.target.value) })}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Total Pieces</label>
                <input
                  type="number"
                  value={editingPurchase.total_pieces}
                  onChange={(e) => setEditingPurchase({ ...editingPurchase, total_pieces: parseInt(e.target.value) || 0 })}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Cost per kg *</label>
                <input
                  type="number"
                  step="0.01"
                  value={editingPurchase.cost_per_kg}
                  onChange={(e) => setEditingPurchase({ ...editingPurchase, cost_per_kg: parseFloat(e.target.value) })}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Notes</label>
                <textarea
                  value={editingPurchase.notes}
                  onChange={(e) => setEditingPurchase({ ...editingPurchase, notes: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  rows={3}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setEditingPurchase(null)}
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

export default InventoryManagement;