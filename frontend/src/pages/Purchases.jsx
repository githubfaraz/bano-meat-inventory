import { useEffect, useState } from "react";
import axios from "axios";
import { API } from "@/App";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Calendar, Trash2, TrendingDown, Edit } from "lucide-react";

const Purchases = () => {
  const [purchases, setPurchases] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [rawMaterials, setRawMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState(null);
  const [formData, setFormData] = useState({
    vendor_id: "",
    raw_material_id: "",
    quantity: "",
    cost_per_unit: "",
    purchase_date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [purchasesRes, vendorsRes, productsRes] = await Promise.all([
        axios.get(`${API}/purchases`),
        axios.get(`${API}/vendors`),
        axios.get(`${API}/products`)
      ]);
      setPurchases(purchasesRes.data);
      setVendors(vendorsRes.data);
      setRawMaterials(productsRes.data.filter(p => p.is_raw_material));
    } catch (error) {
      toast.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        vendor_id: formData.vendor_id,
        raw_material_id: formData.raw_material_id,
        quantity: parseFloat(formData.quantity),
        cost_per_unit: parseFloat(formData.cost_per_unit),
        total_cost: parseFloat(formData.quantity) * parseFloat(formData.cost_per_unit),
        purchase_date: formData.purchase_date
      };

      if (editingPurchase) {
        await axios.put(`${API}/purchases/${editingPurchase.id}`, data);
        toast.success("Purchase updated successfully");
      } else {
        await axios.post(`${API}/purchases`, data);
        toast.success("Purchase recorded successfully");
      }
      fetchData();
      setDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error(error.response?.data?.detail || (editingPurchase ? "Failed to update purchase" : "Failed to record purchase"));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this purchase record?")) return;
    try {
      await axios.delete(`${API}/purchases/${id}`);
      toast.success("Purchase deleted successfully");
      fetchData();
    } catch (error) {
      toast.error("Failed to delete purchase");
    }
  };

  const handleEdit = (purchase) => {
    setEditingPurchase(purchase);
    setFormData({
      vendor_id: purchase.vendor_id,
      raw_material_id: purchase.raw_material_id,
      quantity: purchase.quantity.toString(),
      cost_per_unit: purchase.cost_per_unit.toString(),
      purchase_date: new Date(purchase.purchase_date).toISOString().split('T')[0],
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      vendor_id: "",
      raw_material_id: "",
      quantity: "",
      cost_per_unit: "",
      purchase_date: new Date().toISOString().split('T')[0],
    });
    setEditingPurchase(null);
  };

  const calculateTotal = () => {
    const qty = parseFloat(formData.quantity) || 0;
    const cost = parseFloat(formData.cost_per_unit) || 0;
    return (qty * cost).toFixed(2);
  };

  if (loading) {
    return <div className="p-8">Loading purchases...</div>;
  }

  const totalPurchaseCost = purchases.reduce((sum, p) => sum + p.total_cost, 0);

  return (
    <div className="p-8" data-testid="purchases-page">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Purchases
          </h1>
          <p className="text-gray-600">Record raw material purchases from vendors</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={resetForm} data-testid="add-purchase-button">
              <Plus className="h-5 w-5 mr-2" />
              Record Purchase
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-xl" onOpenAutoFocus={(e) => e.preventDefault()} onCloseAutoFocus={(e) => e.preventDefault()}>
            <DialogHeader>
              <DialogTitle>{editingPurchase ? "Edit Purchase" : "Record New Purchase"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="vendor">Vendor *</Label>
                <Select value={formData.vendor_id} onValueChange={(value) => setFormData({ ...formData, vendor_id: value })} required>
                  <SelectTrigger data-testid="purchase-vendor-select">
                    <SelectValue placeholder="Select vendor" />
                  </SelectTrigger>
                  <SelectContent>
                    {vendors.map((vendor) => (
                      <SelectItem key={vendor.id} value={vendor.id}>
                        {vendor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="raw_material">Raw Material *</Label>
                <Select value={formData.raw_material_id} onValueChange={(value) => setFormData({ ...formData, raw_material_id: value })} required>
                  <SelectTrigger data-testid="purchase-material-select">
                    <SelectValue placeholder="Select raw material" />
                  </SelectTrigger>
                  <SelectContent>
                    {rawMaterials.map((material) => (
                      <SelectItem key={material.id} value={material.id}>
                        {material.name} (Current: {material.stock_quantity} {material.unit})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    step="0.5"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    required
                    data-testid="purchase-quantity-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cost">Cost per Unit *</Label>
                  <Input
                    id="cost"
                    type="number"
                    step="0.01"
                    value={formData.cost_per_unit}
                    onChange={(e) => setFormData({ ...formData, cost_per_unit: e.target.value })}
                    required
                    data-testid="purchase-cost-input"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Purchase Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.purchase_date}
                  onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
                  data-testid="purchase-date-input"
                />
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Cost:</span>
                  <span className="text-2xl font-bold text-emerald-600" data-testid="purchase-total-display">₹{calculateTotal()}</span>
                </div>
              </div>

              <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" data-testid="purchase-submit-button">
                {editingPurchase ? "Update Purchase" : "Record Purchase"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Card */}
      <Card className="mb-6 bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 mb-1">Total Purchase Cost</p>
              <p className="text-4xl font-bold text-orange-700" data-testid="total-purchase-cost">
                ₹{totalPurchaseCost.toFixed(2)}
              </p>
            </div>
            <TrendingDown className="h-12 w-12 text-orange-600" />
          </div>
        </CardContent>
      </Card>

      {/* Purchases List */}
      <div className="space-y-4">
        {purchases.map((purchase) => (
          <Card key={purchase.id} data-testid={`purchase-${purchase.id}`}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg mb-1">
                    {purchase.raw_material_name}
                  </CardTitle>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    {new Date(purchase.purchase_date).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-2xl font-bold text-orange-600">₹{purchase.total_cost.toFixed(2)}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(purchase)} data-testid={`edit-purchase-${purchase.id}`}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(purchase.id)} data-testid={`delete-purchase-${purchase.id}`}>
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Vendor</p>
                  <p className="font-semibold">{purchase.vendor_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Quantity</p>
                  <p className="font-semibold">{purchase.quantity} {purchase.unit}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Cost per Unit</p>
                  <p className="font-semibold">₹{purchase.cost_per_unit.toFixed(2)}/{purchase.unit}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {purchases.length === 0 && (
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg">No purchases yet. Record your first purchase!</p>
        </div>
      )}
    </div>
  );
};

export default Purchases;
