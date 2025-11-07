import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Plus, TrendingUp, Package, Weight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Button } from "../components/ui/button";

const InventoryManagement = () => {
  const [purchases, setPurchases] = useState([]);
  const [categories, setCategories] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [formData, setFormData] = useState({
    main_category_id: "",
    vendor_id: "",
    total_weight_kg: "",
    total_pieces: "",
    cost_per_kg: "",
    notes: "",
  });

  const API_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8001";

  useEffect(() => {
    fetchCategories();
    fetchVendors();
  }, []);

  useEffect(() => {
    if (categories.length > 0) {
      fetchPurchases();
    }
  }, [selectedCategory, categories]);

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/api/main-categories`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories(response.data);
    } catch (error) {
      toast.error("Failed to fetch categories");
    }
  };

  const fetchVendors = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/api/vendors`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setVendors(response.data);
    } catch (error) {
      toast.error("Failed to fetch vendors");
    }
  };

  const fetchPurchases = async () => {
    try {
      const token = localStorage.getItem("token");
      const url =
        selectedCategory === "all"
          ? `${API_URL}/api/inventory-purchases`
          : `${API_URL}/api/inventory-purchases?main_category_id=${selectedCategory}`;
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPurchases(response.data);
    } catch (error) {
      toast.error("Failed to fetch purchases");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const data = {
        ...formData,
        total_weight_kg: parseFloat(formData.total_weight_kg),
        total_pieces: formData.total_pieces ? parseInt(formData.total_pieces) : null,
        cost_per_kg: parseFloat(formData.cost_per_kg),
      };

      await axios.post(`${API_URL}/api/inventory-purchases`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Purchase recorded successfully");
      fetchPurchases();
      resetForm();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to record purchase");
    }
  };

  const resetForm = () => {
    setFormData({
      main_category_id: "",
      vendor_id: "",
      total_weight_kg: "",
      total_pieces: "",
      cost_per_kg: "",
      notes: "",
    });
    setDialogOpen(false);
  };

  if (loading) {
    return <div className="p-8">Loading inventory...</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
        <Button
          onClick={() => setDialogOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Record Purchase
        </Button>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">
          Filter by Category
        </label>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-64 border rounded-lg px-3 py-2"
        >
          <option value="all">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-4">
        {purchases.map((purchase) => (
          <Card key={purchase.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Package className="h-5 w-5 text-emerald-600" />
                    <h3 className="text-lg font-semibold">
                      {purchase.main_category_name}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    Vendor: {purchase.vendor_name}
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    <div>
                      <p className="text-xs text-gray-500">Total Weight</p>
                      <p className="text-lg font-semibold text-emerald-600">
                        {purchase.total_weight_kg} kg
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Remaining Weight</p>
                      <p className="text-lg font-semibold text-blue-600">
                        {purchase.remaining_weight_kg} kg
                      </p>
                    </div>
                    {purchase.total_pieces && (
                      <>
                        <div>
                          <p className="text-xs text-gray-500">Total Pieces</p>
                          <p className="text-lg font-semibold">
                            {purchase.total_pieces}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Remaining Pieces</p>
                          <p className="text-lg font-semibold">
                            {purchase.remaining_pieces}
                          </p>
                        </div>
                      </>
                    )}
                    <div>
                      <p className="text-xs text-gray-500">Cost per kg</p>
                      <p className="text-lg font-semibold">₹{purchase.cost_per_kg}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Total Cost</p>
                      <p className="text-lg font-semibold text-gray-900">
                        ₹{purchase.total_cost}
                      </p>
                    </div>
                  </div>
                  {purchase.notes && (
                    <p className="text-sm text-gray-600 mt-3">
                      Notes: {purchase.notes}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Purchase Date</p>
                  <p className="text-sm font-medium">
                    {new Date(purchase.purchase_date).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(purchase.purchase_date).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {purchases.length === 0 && (
        <div className="text-center py-12">
          <TrendingUp className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-4 text-lg text-gray-600">No purchases recorded yet</p>
          <p className="text-sm text-gray-500">
            {selectedCategory === "all"
              ? "Record your first inventory purchase"
              : "No purchases for this category"}
          </p>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Record Inventory Purchase</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Main Category *
                </label>
                <select
                  required
                  value={formData.main_category_id}
                  onChange={(e) =>
                    setFormData({ ...formData, main_category_id: e.target.value })
                  }
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
                  value={formData.vendor_id}
                  onChange={(e) =>
                    setFormData({ ...formData, vendor_id: e.target.value })
                  }
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
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Total Weight (kg) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.total_weight_kg}
                  onChange={(e) =>
                    setFormData({ ...formData, total_weight_kg: e.target.value })
                  }
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="e.g., 50.5"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Total Pieces (Optional)
                </label>
                <input
                  type="number"
                  value={formData.total_pieces}
                  onChange={(e) =>
                    setFormData({ ...formData, total_pieces: e.target.value })
                  }
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="e.g., 100"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Cost per kg (₹) *
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.cost_per_kg}
                onChange={(e) =>
                  setFormData({ ...formData, cost_per_kg: e.target.value })
                }
                className="w-full border rounded-lg px-3 py-2"
                placeholder="e.g., 280.00"
              />
            </div>

            {formData.total_weight_kg && formData.cost_per_kg && (
              <div className="bg-emerald-50 p-4 rounded-lg">
                <p className="text-sm text-gray-700">
                  Total Cost:{" "}
                  <span className="text-xl font-bold text-emerald-700">
                    ₹
                    {(
                      parseFloat(formData.total_weight_kg || 0) *
                      parseFloat(formData.cost_per_kg || 0)
                    ).toFixed(2)}
                  </span>
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                className="w-full border rounded-lg px-3 py-2"
                rows="3"
                placeholder="Optional notes about this purchase"
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                Record Purchase
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InventoryManagement;
