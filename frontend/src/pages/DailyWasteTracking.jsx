import { useEffect, useState } from "react";
import axios from "axios";
import { API } from "../App";
import { formatDate, formatDateTime } from "../lib/utils";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";

const ITEMS_PER_PAGE = 10;

const DailyWasteTracking = () => {
  const [trackings, setTrackings] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingTracking, setEditingTracking] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isAdmin, setIsAdmin] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState({
    main_category_id: "",
    waste_kg: "",
    tracking_date: new Date().toISOString().split("T")[0],
    notes: "",
  });

  useEffect(() => {
    fetchCategories();
    checkAdminStatus();
  }, []);

  useEffect(() => {
    if (categories.length > 0) {
      fetchTrackings();
    }
  }, [selectedCategory, categories, startDate, endDate]);

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

  const fetchTrackings = async () => {
    try {
      const token = localStorage.getItem("token");
      const params = new URLSearchParams();
      
      if (selectedCategory !== "all") {
        params.append("main_category_id", selectedCategory);
      }
      if (startDate) {
        params.append("start_date", `${startDate}T00:00:00`);
      }
      if (endDate) {
        params.append("end_date", `${endDate}T23:59:59`);
      }
      
      const url = `${API}/daily-waste-tracking${params.toString() ? `?${params.toString()}` : ""}`;
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
        waste_kg: parseFloat(formData.waste_kg),
        tracking_date: formData.tracking_date,
        notes: formData.notes,
      };

      await axios.post(`${API}/daily-waste-tracking`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Waste tracking recorded successfully");
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
      waste_kg: tracking.waste_kg,
      tracking_date: tracking.tracking_date,
      notes: tracking.notes || "",
    });
  };

  const handleSaveEdit = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${API}/daily-waste-tracking/${editingTracking.id}`,
        editingTracking,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditingTracking(null);
      fetchTrackings();
      alert("Waste tracking updated successfully");
    } catch (error) {
      alert(error.response?.data?.detail || "Failed to update tracking");
    }
  };

  const handleDelete = async (trackingId) => {
    if (!window.confirm("Are you sure? This will adjust inventory calculations.")) return;
    
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API}/daily-waste-tracking/${trackingId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchTrackings();
      alert("Waste tracking deleted successfully");
    } catch (error) {
      alert(error.response?.data?.detail || "Failed to delete tracking");
    }
  };

  const resetForm = () => {
    setFormData({
      main_category_id: "",
      waste_kg: "",
      tracking_date: new Date().toISOString().split("T")[0],
      notes: "",
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

  // Pagination calculations
  const totalPages = Math.ceil(trackings.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentTrackings = trackings.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Daily Waste Tracking</h1>
          <p className="text-gray-600">Track end-of-day waste (spoilage, trimming) ({trackings.length} total)</p>
        </div>
        <button
          onClick={() => setShowAddDialog(true)}
          className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 flex items-center gap-2"
        >
          + Add Entry
        </button>
      </div>

      <div className="mb-6 bg-white rounded-lg shadow-md p-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div>
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
          <div>
            <label className="block text-sm font-medium mb-2">From Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">To Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border rounded-lg px-3 py-2"
            />
          </div>
          {(startDate || endDate) && (
            <div className="self-end">
              <button
                onClick={() => {
                  setStartDate("");
                  setEndDate("");
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm"
              >
                Clear Dates
              </button>
            </div>
          )}
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
                  Waste (kg)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Notes
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
                  <td colSpan={isAdmin ? 6 : 5} className="px-6 py-8 text-center text-gray-500">
                    No waste tracking entries yet. Add your first entry!
                  </td>
                </tr>
              ) : (
                currentTrackings.map((tracking) => (
                  <tr key={tracking.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatDate(tracking.tracking_date)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{getCategoryName(tracking.main_category_id)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-red-600">{tracking.waste_kg} kg</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500">{tracking.notes || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {formatDateTime(tracking.created_at)}
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                  className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>

              {[...Array(totalPages)].map((_, index) => {
                const page = index + 1;
                if (
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => handlePageChange(page)}
                        isActive={currentPage === page}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  );
                } else if (page === currentPage - 2 || page === currentPage + 2) {
                  return (
                    <PaginationItem key={page}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  );
                }
                return null;
              })}

              <PaginationItem>
                <PaginationNext
                  onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                  className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* Add Dialog */}
      {showAddDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Add Waste Tracking</h3>
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
                <label className="block text-sm font-medium mb-2">Waste Weight (kg) *</label>
                <input
                  type="number"
                  required
                  step="0.5"
                  min="0.01"
                  value={formData.waste_kg}
                  onChange={(e) => setFormData({ ...formData, waste_kg: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="Enter waste in kg"
                  autoFocus={false}
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
              <div>
                <label className="block text-sm font-medium mb-2">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  rows={3}
                  placeholder="Optional notes"
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
            <h3 className="text-xl font-bold mb-4">Edit Waste Tracking</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Waste Weight (kg) *</label>
                <input
                  type="number"
                  step="0.5"
                  min="0.01"
                  value={editingTracking.waste_kg}
                  onChange={(e) => setEditingTracking({ ...editingTracking, waste_kg: parseFloat(e.target.value) })}
                  className="w-full border rounded-lg px-3 py-2"
                  autoFocus={false}
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
              <div>
                <label className="block text-sm font-medium mb-2">Notes</label>
                <textarea
                  value={editingTracking.notes}
                  onChange={(e) => setEditingTracking({ ...editingTracking, notes: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  rows={3}
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

export default DailyWasteTracking;
