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
import { Plus, Edit, Trash2, AlertTriangle } from "lucide-react";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    category: "chicken",
    description: "",
    unit: "kg",
    price_per_unit: "",
    stock_quantity: "",
    reorder_level: "",
    sku: "",
    is_raw_material: false,
    purchase_cost: "",
    derived_from: "",
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API}/products`);
      setProducts(response.data);
    } catch (error) {
      toast.error("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        price_per_unit: parseFloat(formData.price_per_unit),
        stock_quantity: parseFloat(formData.stock_quantity),
        reorder_level: parseFloat(formData.reorder_level),
      };

      if (editingProduct) {
        await axios.put(`${API}/products/${editingProduct.id}`, data);
        toast.success("Product updated successfully");
      } else {
        await axios.post(`${API}/products`, data);
        toast.success("Product created successfully");
      }

      fetchProducts();
      setDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to save product");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await axios.delete(`${API}/products/${id}`);
      toast.success("Product deleted successfully");
      fetchProducts();
    } catch (error) {
      toast.error("Failed to delete product");
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      description: product.description || "",
      unit: product.unit,
      price_per_unit: product.price_per_unit.toString(),
      stock_quantity: product.stock_quantity.toString(),
      reorder_level: product.reorder_level.toString(),
      sku: product.sku || "",
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      category: "chicken",
      description: "",
      unit: "kg",
      price_per_unit: "",
      stock_quantity: "",
      reorder_level: "",
      sku: "",
    });
    setEditingProduct(null);
  };

  const getCategoryBadgeColor = (category) => {
    const colors = {
      chicken: "bg-yellow-100 text-yellow-800",
      mutton: "bg-red-100 text-red-800",
      frozen: "bg-blue-100 text-blue-800",
      liver: "bg-orange-100 text-orange-800",
      kidney: "bg-purple-100 text-purple-800",
    };
    return colors[category] || "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return <div className="p-8">Loading products...</div>;
  }

  return (
    <div className="p-8" data-testid="products-page">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Products
          </h1>
          <p className="text-gray-600">Manage your meat inventory</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={resetForm} data-testid="add-product-button">
              <Plus className="h-5 w-5 mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    data-testid="product-name-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger data-testid="product-category-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="chicken">Chicken</SelectItem>
                      <SelectItem value="mutton">Mutton</SelectItem>
                      <SelectItem value="frozen">Frozen</SelectItem>
                      <SelectItem value="liver">Liver</SelectItem>
                      <SelectItem value="kidney">Kidney</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  data-testid="product-description-input"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="unit">Unit *</Label>
                  <Select value={formData.unit} onValueChange={(value) => setFormData({ ...formData, unit: value })}>
                    <SelectTrigger data-testid="product-unit-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kg">Kilogram (kg)</SelectItem>
                      <SelectItem value="piece">Piece</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Price per Unit *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price_per_unit}
                    onChange={(e) => setFormData({ ...formData, price_per_unit: e.target.value })}
                    required
                    data-testid="product-price-input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="stock">Stock Quantity *</Label>
                  <Input
                    id="stock"
                    type="number"
                    step="0.01"
                    value={formData.stock_quantity}
                    onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                    required
                    data-testid="product-stock-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reorder">Reorder Level *</Label>
                  <Input
                    id="reorder"
                    type="number"
                    step="0.01"
                    value={formData.reorder_level}
                    onChange={(e) => setFormData({ ...formData, reorder_level: e.target.value })}
                    required
                    data-testid="product-reorder-input"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sku">SKU</Label>
                <Input
                  id="sku"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  data-testid="product-sku-input"
                />
              </div>

              <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" data-testid="product-submit-button">
                {editingProduct ? "Update Product" : "Add Product"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <Card key={product.id} className={product.stock_quantity <= product.reorder_level ? "border-2 border-orange-400" : ""}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg mb-2">{product.name}</CardTitle>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getCategoryBadgeColor(product.category)}`}>
                    {product.category}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(product)} data-testid={`edit-product-${product.id}`}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(product.id)} data-testid={`delete-product-${product.id}`}>
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Price:</span>
                  <span className="font-semibold">₹{product.price_per_unit}/{product.unit}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Stock:</span>
                  <div className="flex items-center gap-2">
                    {product.stock_quantity <= product.reorder_level && (
                      <AlertTriangle className="h-4 w-4 text-orange-500" />
                    )}
                    <span className={product.stock_quantity <= product.reorder_level ? "font-semibold text-orange-600" : "font-semibold"}>
                      {product.stock_quantity} {product.unit}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Reorder at:</span>
                  <span className="text-sm">{product.reorder_level} {product.unit}</span>
                </div>
                {product.sku && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">SKU:</span>
                    <span className="text-sm">{product.sku}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {products.length === 0 && (
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg">No products yet. Add your first product!</p>
        </div>
      )}
    </div>
  );
};

export default Products;
