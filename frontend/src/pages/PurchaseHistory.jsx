import { useEffect, useState } from "react";
import axios from "axios";
import { API } from "../App";

const PurchaseHistory = () => {
  const [purchases, setPurchases] = useState([]);
  const [categories, setCategories] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState(null);
  const [showAddPurchase, setShowAddPurchase] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [addPurchaseForm, setAddPurchaseForm] = useState({
    main_category_id: "",
    vendor_id: "",
    raw_weight_kg: "",
    total_pieces: "",
    cost_per_kg: "",
    purchase_date: new Date().toISOString().split("T")[0],
    notes: ""
  });

  useEffect(() => {
    fetchCategories();
    fetchVendors();
    checkAdminStatus();
  }, []);

  useEffect(() => {
    if (categories.length > 0) {
      fetchPurchases();
    }
  }, [selectedCategory, startDate, endDate, categories]);

  const checkAdminStatus = () => {
    const userStr = localStorage.getItem("user");
    if (userStr && userStr !== "undefined" && userStr !== "null") {
      try {
        const user = JSON.parse(userStr);
        setIsAdmin(user.is_admin || false);
      } catch (error) {
        console.error("Error parsing user:", error);
        setIsAdmin(false);
      }
    }
  };

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API}/main-categories`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories(response.data);
    } catch (error) {
      console.error("Failed to fetch categories", error);
    }
  };

  const fetchVendors = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API}/vendors`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setVendors(response.data);
    } catch (error) {
      console.error("Error fetching vendors:", error);
    }
  };

  const fetchPurchases = async () => {
    try {
      const token = localStorage.getItem("token");
      let url = `${API}/inventory-purchases`;
      const params = [];
      
      if (selectedCategory !== "all") {
        params.push(`main_category_id=${selectedCategory}`);
      }
      if (startDate) {
        params.push(`start_date=${startDate}`);
      }
      if (endDate) {
        params.push(`end_date=${endDate}`);
      }
      
      if (params.length > 0) {
        url += `?${params.join("&")}`;
      }

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPurchases(response.data);
    } catch (error) {
      console.error("Failed to fetch purchases", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditPurchase = async (purchase) => {
    const formatDate = (dateString) => {
      if (!dateString) return new Date().toISOString().split('T')[0];
      try {
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
      } catch {
        return new Date().toISOString().split('T')[0];
      }
    };

    setEditingPurchase({
      id: purchase.id,
      main_category_id: purchase.main_category_id,
      vendor_id: purchase.vendor_id,
      raw_weight_kg: purchase.raw_weight_kg || 0,
      total_pieces: purchase.total_pieces || 0,
      cost_per_kg: purchase.cost_per_kg || 0,
      purchase_date: formatDate(purchase.purchase_date),
      notes: purchase.notes || ""
    });
  };

  const handleSaveEdit = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${API}/inventory-purchases/${editingPurchase.id}`,
        {
          main_category_id: editingPurchase.main_category_id,
          vendor_id: editingPurchase.vendor_id,
          total_weight_kg: parseFloat(editingPurchase.raw_weight_kg),
          total_pieces: parseInt(editingPurchase.total_pieces) || 0,
          cost_per_kg: parseFloat(editingPurchase.cost_per_kg),
          purchase_date: editingPurchase.purchase_date,
          notes: editingPurchase.notes || ""
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditingPurchase(null);
      fetchPurchases();
      alert("Purchase updated successfully");
    } catch (error) {
      console.error("Edit error:", error);
      const errorMessage = error.response?.data?.detail 
        || error.response?.data?.message 
        || error.message 
        || "Failed to update purchase";
      alert(errorMessage);
    }
  };

  const handleDeletePurchase = async (purchaseId) => {
    if (!window.confirm("Are you sure? This will adjust inventory calculations.")) return;
    
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API}/inventory-purchases/${purchaseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchPurchases();
      alert("Purchase deleted successfully");
    } catch (error) {
      alert(error.response?.data?.detail || "Failed to delete purchase");
    }
  };

  const handleAddPurchase = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${API}/inventory-purchases`, {
        main_category_id: addPurchaseForm.main_category_id,
        vendor_id: addPurchaseForm.vendor_id,
        total_weight_kg: parseFloat(addPurchaseForm.raw_weight_kg),
        total_pieces: parseInt(addPurchaseForm.total_pieces) || 0,
        cost_per_kg: parseFloat(addPurchaseForm.cost_per_kg),
        purchase_date: addPurchaseForm.purchase_date,
        notes: addPurchaseForm.notes
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setShowAddPurchase(false);
      setAddPurchaseForm({
        main_category_id: "",
        vendor_id: "",
        raw_weight_kg: "",
        total_pieces: "",
        cost_per_kg: "",
        purchase_date: new Date().toISOString().split("T")[0],
        notes: ""
      });
      fetchPurchases();
      alert("Purchase added successfully");
    } catch (error) {
      console.error("Add purchase error:", error);
      const errorMessage = error.response?.data?.detail 
        || error.response?.data?.message 
        || error.message 
        || "Failed to add purchase";
      alert(errorMessage);
    }
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find((c) => c.id === categoryId);
    return category ? category.name : "Unknown";
  };

  const getVendorName = (vendorId) => {
    const vendor = vendors.find((v) => v.id === vendorId);
    return vendor ? vendor.name : "Unknown";
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Purchase History</h1>
          <p className="text-gray-600">View and manage all inventory purchases</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowAddPurchase(true)}
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 flex items-center gap-2"
          >
            + Add Purchase
          </button>
        )}
      </div>

      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Filter by Category</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border rounded-lg px-4 py-2 w-full"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border rounded-lg px-4 py-2 w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border rounded-lg px-4 py-2 w-full"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vendor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Weight (kg)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pieces
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cost/kg
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Cost
                </th>
                {isAdmin && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {purchases.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 8 : 7} className="px-6 py-8 text-center text-gray-500">
                    No purchases found. Add your first purchase!
                  </td>
                </tr>
              ) : (
                purchases.map((purchase) => (
                  <tr key={purchase.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {new Date(purchase.purchase_date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{purchase.main_category_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{purchase.vendor_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-emerald-600">{purchase.raw_weight_kg || purchase.total_weight_kg} kg</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{purchase.total_pieces || 0}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">₹{purchase.cost_per_kg}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900">₹{purchase.total_cost?.toFixed(2)}</div>
                    </td>
                    {isAdmin && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex gap-2">
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
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAddPurchase && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Add New Purchase</h3>
            <form onSubmit={handleAddPurchase} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Category *</label>
                <select
                  required
                  value={addPurchaseForm.main_category_id}
                  onChange={(e) => setAddPurchaseForm({ ...addPurchaseForm, main_category_id: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Vendor *</label>
                <select
                  required
                  value={addPurchaseForm.vendor_id}
                  onChange={(e) => setAddPurchaseForm({ ...addPurchaseForm, vendor_id: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="">Select Vendor</option>
                  {vendors.map((vendor) => (
                    <option key={vendor.id} value={vendor.id}>
                      {vendor.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Raw Weight (kg) *</label>
                <input
                  type="number"
                  required
                  step="0.5"
                  min="0.01"
                  value={addPurchaseForm.raw_weight_kg}
                  onChange={(e) => setAddPurchaseForm({ ...addPurchaseForm, raw_weight_kg: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="Enter weight in kg"
                  autoFocus={false}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Total Pieces (Optional)</label>
                <input
                  type="number"
                  min="0"
                  value={addPurchaseForm.total_pieces}
                  onChange={(e) => setAddPurchaseForm({ ...addPurchaseForm, total_pieces: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="Enter total pieces"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Cost per kg *</label>
                <input
                  type="number"
                  required
                  step="0.01"
                  min="0"
                  value={addPurchaseForm.cost_per_kg}
                  onChange={(e) => setAddPurchaseForm({ ...addPurchaseForm, cost_per_kg: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="Enter cost per kg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Purchase Date *</label>
                <input
                  type="date"
                  required
                  value={addPurchaseForm.purchase_date}
                  onChange={(e) => setAddPurchaseForm({ ...addPurchaseForm, purchase_date: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Notes</label>
                <textarea
                  value={addPurchaseForm.notes}
                  onChange={(e) => setAddPurchaseForm({ ...addPurchaseForm, notes: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  rows={3}
                  placeholder="Optional notes"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowAddPurchase(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
                >
                  Add Purchase
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingPurchase && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Edit Purchase</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Category *</label>
                <select
                  value={editingPurchase.main_category_id}
                  onChange={(e) => setEditingPurchase({ ...editingPurchase, main_category_id: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Vendor *</label>
                <select
                  value={editingPurchase.vendor_id}
                  onChange={(e) => setEditingPurchase({ ...editingPurchase, vendor_id: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  {vendors.map((vendor) => (
                    <option key={vendor.id} value={vendor.id}>
                      {vendor.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Raw Weight (kg) *</label>
                <input
                  type="number"
                  step="0.5"
                  min="0.01"
                  value={editingPurchase.raw_weight_kg}
                  onChange={(e) => setEditingPurchase({ ...editingPurchase, raw_weight_kg: parseFloat(e.target.value) })}
                  className="w-full border rounded-lg px-3 py-2"
                  autoFocus={false}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Total Pieces</label>
                <input
                  type="number"
                  min="0"
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
                  min="0"
                  value={editingPurchase.cost_per_kg}
                  onChange={(e) => setEditingPurchase({ ...editingPurchase, cost_per_kg: parseFloat(e.target.value) })}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Purchase Date *</label>
                <input
                  type="date"
                  value={editingPurchase.purchase_date}
                  onChange={(e) => setEditingPurchase({ ...editingPurchase, purchase_date: e.target.value })}
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

export default PurchaseHistory;
