import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Plus, TrendingUp, Package, AlertTriangle, ArrowLeft, ShoppingCart, Trash2, ShoppingBag } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";

const InventoryManagement = () => {
  const [inventorySummary, setInventorySummary] = useState([]);
  const [categories, setCategories] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);
  const [selectedCategoryForDetail, setSelectedCategoryForDetail] = useState(null);
  const [detailData, setDetailData] = useState({
    purchases: [],
    wasteHistory: [],
    salesHistory: [],
  });
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
    fetchInventorySummary();
    fetchCategories();
    fetchVendors();
  }, []);

  const fetchInventorySummary = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/api/inventory-summary`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setInventorySummary(response.data);
    } catch (error) {
      toast.error("Failed to fetch inventory summary");
    } finally {
      setLoading(false);
    }
  };

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

  const fetchDetailData = async (categoryId) => {
    try {
      const token = localStorage.getItem("token");
      
      const purchasesRes = await axios.get(
        `${API_URL}/api/inventory-purchases?main_category_id=${categoryId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const wasteRes = await axios.get(
        `${API_URL}/api/daily-waste-tracking?main_category_id=${categoryId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const salesRes = await axios.get(`${API_URL}/api/pos-sales`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const categorySales = salesRes.data.filter(sale =>
        sale.items.some(item => item.main_category_id === categoryId)
      );

      setDetailData({
        purchases: purchasesRes.data,
        wasteHistory: wasteRes.data,
        salesHistory: categorySales,
      });
    } catch (error) {
      toast.error("Failed to fetch detail data");
    }
  };

  const handleViewDetails = (category) => {
    setSelectedCategoryForDetail(category);
    fetchDetailData(category.main_category_id);
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
      fetchInventorySummary();
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
    setPurchaseDialogOpen(false);
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
    return <div className="p-8">Loading inventory...</div>;
  }

  if (selectedCategoryForDetail) {
    return (
      <div className="p-8">
        <div className="flex items-center gap-4 mb-6">
          <Button
            onClick={() => setSelectedCategoryForDetail(null)}
            variant="outline"
            size="sm"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Overview
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {getCategoryIcon(selectedCategoryForDetail.main_category_name)}{" "}
              {selectedCategoryForDetail.main_category_name} - Detailed View
            </h1>
          </div>
        </div>

        <Card className="mb-6 bg-gradient-to-br from-emerald-50 to-teal-50">
          <CardHeader>
            <CardTitle>Current Stock Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600">Total Stock</p>
                <p className="text-2xl font-bold text-emerald-700">
                  {selectedCategoryForDetail.total_weight_kg} kg
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Today's Waste</p>
                <p className="text-2xl font-bold text-red-600">
                  {selectedCategoryForDetail.today_waste_kg} kg
                </p>
                <p className="text-xs text-gray-500">
                  ({selectedCategoryForDetail.today_waste_percentage}%)
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Week's Waste</p>
                <p className="text-2xl font-bold text-orange-600">
                  {selectedCategoryForDetail.week_waste_kg} kg
                </p>
                <p className="text-xs text-gray-500">
                  ({selectedCategoryForDetail.week_waste_percentage}%)
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Pieces</p>
                <p className="text-2xl font-bold text-blue-600">
                  {selectedCategoryForDetail.total_pieces}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="purchases" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="purchases">
              <ShoppingBag className="mr-2 h-4 w-4" />
              Purchase History
            </TabsTrigger>
            <TabsTrigger value="waste">
              <Trash2 className="mr-2 h-4 w-4" />
              Waste History
            </TabsTrigger>
            <TabsTrigger value="sales">
              <ShoppingCart className="mr-2 h-4 w-4" />
              Sales History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="purchases" className="space-y-4 mt-4">
            {detailData.purchases.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Package className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                  <p className="text-lg text-gray-600">No purchase records</p>
                </CardContent>
              </Card>
            ) : (
              detailData.purchases.map((purchase) => (
                <Card key={purchase.id}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="text-sm text-gray-600 mb-2">
                          Vendor: {purchase.vendor_name}
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <p className="text-xs text-gray-500">Total Weight</p>
                            <p className="text-lg font-semibold text-emerald-600">
                              {purchase.total_weight_kg} kg
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Remaining</p>
                            <p className="text-lg font-semibold text-blue-600">
                              {purchase.remaining_weight_kg} kg
                            </p>
                          </div>
                          {purchase.total_pieces && (
                            <>
                              <div>
                                <p className="text-xs text-gray-500">Total Pieces</p>
                                <p className="text-lg font-semibold">{purchase.total_pieces}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Remaining Pieces</p>
                                <p className="text-lg font-semibold">{purchase.remaining_pieces}</p>
                              </div>
                            </>
                          )}
                          <div>
                            <p className="text-xs text-gray-500">Cost/kg</p>
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
                          <p className="text-sm text-gray-600 mt-3">Notes: {purchase.notes}</p>
                        )}
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-xs text-gray-500">Purchase Date</p>
                        <p className="text-sm font-medium">
                          {new Date(purchase.purchase_date).toLocaleDateString('en-IN')}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(purchase.purchase_date).toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="waste" className="space-y-4 mt-4">
            {detailData.wasteHistory.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Trash2 className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                  <p className="text-lg text-gray-600">No waste records</p>
                </CardContent>
              </Card>
            ) : (
              detailData.wasteHistory.map((waste) => (
                <Card key={waste.id}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-gray-500">Waste Amount</p>
                            <p className="text-lg font-semibold text-red-600">
                              {waste.waste_kg} kg
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Deducted From</p>
                            <p className="text-lg font-semibold text-gray-900">
                              Inventory Stock
                            </p>
                          </div>
                        </div>
                        {waste.notes && (
                          <p className="text-sm text-gray-600 mt-3">Notes: {waste.notes}</p>
                        )}
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-xs text-gray-500">Date</p>
                        <p className="text-sm font-medium">
                          {new Date(waste.tracking_date).toLocaleDateString('en-IN')}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="sales" className="space-y-4 mt-4">
            {detailData.salesHistory.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <ShoppingCart className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                  <p className="text-lg text-gray-600">No sales records</p>
                </CardContent>
              </Card>
            ) : (
              detailData.salesHistory.map((sale) => (
                <Card key={sale.id}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {sale.customer_name || "Walk-in Customer"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {sale.payment_method.toUpperCase()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-emerald-600">₹{sale.total.toFixed(2)}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(sale.sale_date).toLocaleDateString('en-IN')}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(sale.sale_date).toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {sale.items
                        .filter(item => item.main_category_id === selectedCategoryForDetail.main_category_id)
                        .map((item, idx) => (
                          <div
                            key={idx}
                            className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded"
                          >
                            <div>
                              <p className="font-medium">{item.derived_product_name}</p>
                              <p className="text-sm text-gray-600">
                                {item.quantity_kg}kg × ₹{item.selling_price}/kg
                              </p>
                            </div>
                            <p className="font-semibold">₹{item.total.toFixed(2)}</p>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inventory Overview</h1>
          <p className="text-gray-600 mt-1">Monitor stock levels and waste across all categories</p>
        </div>
        <Button
          onClick={() => setPurchaseDialogOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Record Purchase
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {inventorySummary.map((category) => (
          <Card
            key={category.main_category_id}
            className={`hover:shadow-lg transition-all cursor-pointer ${
              category.low_stock ? 'border-red-300 bg-red-50' : 'border-gray-200'
            }`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl flex items-center gap-2">
                  <span className="text-3xl">{getCategoryIcon(category.main_category_name)}</span>
                  {category.main_category_name}
                </CardTitle>
                {category.low_stock && (
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-3 rounded-lg border">
                    <p className="text-xs text-gray-600 mb-1">Current Stock</p>
                    <p className="text-2xl font-bold text-emerald-700">
                      {category.total_weight_kg} kg
                    </p>
                    {category.total_pieces > 0 && (
                      <p className="text-xs text-gray-500 mt-1">
                        {category.total_pieces} pieces
                      </p>
                    )}
                  </div>
                  <div className="bg-white p-3 rounded-lg border">
                    <p className="text-xs text-gray-600 mb-1">Today's Waste</p>
                    <p className="text-2xl font-bold text-red-600">
                      {category.today_waste_kg} kg
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      ({category.today_waste_percentage}%)
                    </p>
                  </div>
                </div>
                
                <div className="bg-white p-3 rounded-lg border">
                  <p className="text-xs text-gray-600 mb-1">This Week's Waste</p>
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-xl font-bold text-orange-600">
                        {category.week_waste_kg} kg
                      </p>
                      <p className="text-xs text-gray-500">
                        Average: {category.week_waste_percentage}%
                      </p>
                    </div>
                  </div>
                </div>

                {category.low_stock && (
                  <div className="bg-red-100 border border-red-300 rounded-lg p-2">
                    <p className="text-sm text-red-800 font-medium flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      Low Stock Alert
                    </p>
                  </div>
                )}

                <Button
                  onClick={() => handleViewDetails(category)}
                  className="w-full"
                  variant="outline"
                >
                  View Details →
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {inventorySummary.length === 0 && (
        <Card>
          <CardContent className="py-16 text-center">
            <Package className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <p className="text-xl text-gray-600 mb-2">No inventory data</p>
            <p className="text-sm text-gray-500">
              Create main categories and start recording purchases
            </p>
          </CardContent>
        </Card>
      )}

      <Dialog open={purchaseDialogOpen} onOpenChange={setPurchaseDialogOpen}>
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
