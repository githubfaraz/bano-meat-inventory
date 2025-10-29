import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Plus, Edit2, Trash2, Package, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Button } from "../components/ui/button";

const DerivedProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [formData, setFormData] = useState({
    main_category_id: "",
    name: "",
    sku: "",
    sale_unit: "weight",
    package_weight_kg: "",
    selling_price: "",
    description: "",
  });

  const API_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8001";

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (categories.length > 0) {
      fetchProducts();
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
      console.error(error);
    }
  };

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem("token");
      const url =
        selectedCategory === "all"
          ? `${API_URL}/api/derived-products`
          : `${API_URL}/api/derived-products?main_category_id=${selectedCategory}`;
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(response.data);
    } catch (error) {
      toast.error("Failed to fetch products");
      console.error(error);
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
        selling_price: parseFloat(formData.selling_price),
        package_weight_kg: formData.sale_unit === "package" && formData.package_weight_kg 
          ? parseFloat(formData.package_weight_kg) 
          : null,
      };

      if (editingProduct) {
        await axios.put(
          `${API_URL}/api/derived-products/${editingProduct.id}`,
          data,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success("Product updated successfully");
      } else {
        await axios.post(`${API_URL}/api/derived-products`, data, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Product created successfully");
      }
      fetchProducts();
      resetForm();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to save product");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/api/derived-products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Product deleted successfully");
      fetchProducts();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to delete product");
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      main_category_id: product.main_category_id,
      name: product.name,
      sku: product.sku,
      sale_unit: product.sale_unit || "weight",
      package_weight_kg: product.package_weight_kg?.toString() || "",
      selling_price: product.selling_price.toString(),
      description: product.description || "",
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      main_category_id: "",
      name: "",
      sku: "",
      sale_unit: "weight",
      package_weight_kg: "",
      selling_price: "",
      description: "",
    });
    setEditingProduct(null);
    setDialogOpen(false);
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find((c) => c.id === categoryId);
    return category ? category.name : "Unknown";
  };

  // Get sale unit options based on selected category
  const getSaleUnitOptions = () => {
    const selectedCat = categories.find((c) => c.id === formData.main_category_id);
    const categoryName = selectedCat?.name?.toLowerCase() || "";
    
    // Show "Pieces" option for Mutton and Frozen categories
    const showPiecesOption = categoryName.includes("mutton") || categoryName.includes("frozen");
    
    return showPiecesOption;
  };

  if (loading) {
    return <div className="p-8">Loading products...</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Derived Products</h1>
        <Button
          onClick={() => setDialogOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Filter by Category</label>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <Card key={product.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="text-lg font-semibold">
                  {product.name}
                </CardTitle>
                <p className="text-sm text-emerald-600 font-medium">
                  {getCategoryName(product.main_category_id)}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(product)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(product.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">SKU:</span>
                  <span className="text-sm font-medium">{product.sku}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Unit:</span>
                  <span className="text-sm font-medium">
                    {product.sale_unit === "weight" 
                      ? "Weight (kg)" 
                      : product.sale_unit === "package" && product.package_weight_kg
                        ? `Package (${product.package_weight_kg * 1000}g)`
                        : "Package"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Price:</span>
                  <span className="text-lg font-bold text-emerald-600">
                    ₹{product.selling_price}{product.sale_unit === "weight" ? "/kg" : "/pkg"}
                  </span>
                </div>
                {product.description && (
                  <p className="text-sm text-gray-600 mt-2">{product.description}</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {products.length === 0 && (
        <div className="text-center py-12">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-4 text-lg text-gray-600">No products yet</p>
          <p className="text-sm text-gray-500">
            {selectedCategory === "all"
              ? "Create your first derived product"
              : "No products in this category"}
          </p>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? "Edit Product" : "Add New Product"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
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
              <label className="block text-sm font-medium mb-2">
                Product Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
                placeholder="e.g., Chicken Boneless"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">SKU *</label>
              <input
                type="text"
                required
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
                placeholder="e.g., CHK-BNL-001"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Sale Unit *</label>
              <select
                required
                value={formData.sale_unit}
                onChange={(e) => setFormData({ ...formData, sale_unit: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="weight">Weight (kg) - Sold by exact weight</option>
                <option value="package">Package - Sold by fixed package</option>
                {getSaleUnitOptions() && (
                  <option value="pieces">Pieces - Sold by count</option>
                )}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                {formData.sale_unit === "weight" 
                  ? "For fresh items sold by weight (e.g., Boneless Chicken)"
                  : formData.sale_unit === "pieces"
                  ? "For items sold by count (e.g., 1 piece = 1 unit)"
                  : "For pre-packaged items (e.g., Frozen Nuggets 500g)"}
              </p>
            </div>

            {formData.sale_unit === "package" && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  Package Weight (kg) *
                </label>
                <input
                  type="number"
                  step="0.001"
                  required
                  value={formData.package_weight_kg}
                  onChange={(e) =>
                    setFormData({ ...formData, package_weight_kg: e.target.value })
                  }
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="e.g., 0.5 for 500g, 0.1 for 100g"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Weight of one package in kg (e.g., 0.5 = 500g, 0.25 = 250g)
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">
                Selling Price (₹) *
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.selling_price}
                onChange={(e) =>
                  setFormData({ ...formData, selling_price: e.target.value })
                }
                className="w-full border rounded-lg px-3 py-2"
                placeholder={formData.sale_unit === "weight" ? "e.g., 350 per kg" : "e.g., 250 per package"}
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.sale_unit === "weight" ? "Price per kg" : "Price per package"}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full border rounded-lg px-3 py-2"
                rows="3"
                placeholder="Optional description"
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
                {editingProduct ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DerivedProducts;
