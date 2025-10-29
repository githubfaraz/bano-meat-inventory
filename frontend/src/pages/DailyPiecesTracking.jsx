import { useEffect, useState } from "react";
import axios from "axios";
import { API } from "../App";

const DailyPiecesTracking = () => {
  const [trackings, setTrackings] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingTracking, setEditingTracking] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isAdmin, setIsAdmin] = useState(false);
  const [formData, setFormData] = useState({
    main_category_id: "",
    pieces_sold: "",
    tracking_date: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    fetchCategories();
    checkAdminStatus();
  }, []);

  useEffect(() => {
    if (categories.length > 0) {
      fetchTrackings();
    }
  }, [selectedCategory, categories]);

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
    } catch (error) {
      console.error("Failed to fetch categories", error);
    }
  };

  const fetchTrackings = async () => {
    try {
      const token = localStorage.getItem("token");
      const url =
        selectedCategory === "all"
          ? `${API}/daily-pieces-tracking`
          : `${API}/daily-pieces-tracking?main_category_id=${selectedCategory}`;
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTrackings(response.data);
    } catch (error) {
      console.error("Failed to fetch trackings", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const data = {
        main_category_id: formData.main_category_id,
        pieces_sold: parseInt(formData.pieces_sold),
        tracking_date: formData.tracking_date,
      };

      await axios.post(`${API}/daily-pieces-tracking`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Pieces tracking recorded successfully");
      fetchTrackings();
      resetForm();
    } catch (error) {
      alert(error.response?.data?.detail || "Failed to record tracking");
    }
  };

  const handleEdit = (tracking) => {
    setEditingTracking({
      id: tracking.id,
      main_category_id: tracking.main_category_id,
      pieces_sold: tracking.pieces_sold,
      tracking_date: tracking.tracking_date,
    });
  };

  const handleSaveEdit = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${API}/daily-pieces-tracking/${editingTracking.id}`,
        editingTracking,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditingTracking(null);
      fetchTrackings();
      alert("Tracking updated successfully");
    } catch (error) {
      alert(error.response?.data?.detail || "Failed to update tracking");
    }
  };

  const handleDelete = async (trackingId) => {
    if (!window.confirm("Are you sure? This will adjust inventory calculations.")) return;
    
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API}/daily-pieces-tracking/${trackingId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchTrackings();
      alert("Tracking deleted successfully");
    } catch (error) {
      alert(error.response?.data?.detail || "Failed to delete tracking");
    }
  };

  const resetForm = () => {
    setFormData({
      main_category_id: "",
      pieces_sold: "",
      tracking_date: new Date().toISOString().split("T")[0],
    });
    setShowAddDialog(false);
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find((c) => c.id === categoryId);
    return category ? category.name : "Unknown";
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Daily Pieces Tracking</h1>
          <p className="text-gray-600">Track end-of-day pieces sold by count</p>
        </div>
        <button
          onClick={() => setShowAddDialog(true)}
          className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 flex items-center gap-2"
        >
          + Add Entry
        </button>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Filter by Category</label>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="border rounded-lg px-4 py-2 w-64"
        >
          <option value="all">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
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
                  Pieces Sold
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Recorded At
                </th>
                {isAdmin && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {trackings.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 5 : 4} className="px-6 py-8 text-center text-gray-500">
                    No tracking entries yet. Add your first entry!
                  </td>
                </tr>
              ) : (
                trackings.map((tracking) => (
                  <tr key={tracking.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {new Date(tracking.tracking_date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{getCategoryName(tracking.main_category_id)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-emerald-600">{tracking.pieces_sold} pieces</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {new Date(tracking.created_at).toLocaleString()}
                      </div>
                    </td>
                    {isAdmin && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(tracking)}
                            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(tracking.id)}
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

      {/* Add Dialog */}
      {showAddDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Add Pieces Tracking</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Category *</label>
                <select
                  required
                  value={formData.main_category_id}
                  onChange={(e) => setFormData({ ...formData, main_category_id: e.target.value })}
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
                <label className="block text-sm font-medium mb-2">Pieces Sold *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.pieces_sold}
                  onChange={(e) => setFormData({ ...formData, pieces_sold: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="Enter pieces sold"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Tracking Date *</label>
                <input
                  type="date"
                  required
                  value={formData.tracking_date}
                  onChange={(e) => setFormData({ ...formData, tracking_date: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Dialog */}
      {editingTracking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Edit Pieces Tracking</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Pieces Sold *</label>
                <input
                  type="number"
                  min="1"
                  value={editingTracking.pieces_sold}
                  onChange={(e) => setEditingTracking({ ...editingTracking, pieces_sold: parseInt(e.target.value) })}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Tracking Date *</label>
                <input
                  type="date"
                  value={editingTracking.tracking_date}
                  onChange={(e) => setEditingTracking({ ...editingTracking, tracking_date: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setEditingTracking(null)}
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

export default DailyPiecesTracking;