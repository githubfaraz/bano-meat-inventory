import { useEffect, useState } from "react";
import axios from "axios";
import { API } from "@/App";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { toast } from "sonner";
import { TrendingUp, Calendar, Edit, Trash2, Plus } from "lucide-react";

const ITEMS_PER_PAGE = 10;

const Sales = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingSale, setEditingSale] = useState(null);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [editFormData, setEditFormData] = useState({
    customer_id: "",
    customer_name: "",
    items: [],
    discount: 0,
    tax: 0,
    payment_method: "cash",
    sale_date: ""
  });

  useEffect(() => {
    fetchSales();
    fetchProducts();
    fetchCustomers();
  }, []);

  const fetchSales = async () => {
    try {
      const response = await axios.get(`${API}/pos-sales`);
      
      const normalizedSales = Array.isArray(response.data) ? response.data.map(sale => ({
        ...sale,
        items: (sale.items || []).map(item => ({
          product_id: item.derived_product_id || item.main_category_id || '',
          product_name: item.derived_product_name || item.main_category_name || 'Unknown',
          quantity: item.quantity_pieces != null && item.quantity_pieces > 0 ? item.quantity_pieces : item.quantity_kg || 0,
          unit: item.quantity_pieces != null && item.quantity_pieces > 0 ? 'pcs' : 'kg',
          price_per_unit: item.selling_price || 0,
          total: item.total || 0
        }))
      })) : [];
      
      setSales(normalizedSales);
    } catch (error) {
      toast.error("Failed to fetch sales");
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API}/products`);
      setProducts(response.data);
    } catch (error) {
      toast.error("Failed to fetch products");
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await axios.get(`${API}/customers`);
      setCustomers(response.data);
    } catch (error) {
      toast.error("Failed to fetch customers");
    }
  };

  const handleEditSale = (sale) => {
    setEditingSale(sale);
    setEditFormData({
      customer_id: sale.customer_id || "",
      customer_name: sale.customer_name || "",
      items: (sale.items || []).map(item => ({
        product_id: item.product_id || "",
        product_name: item.product_name || "Unknown",
        quantity: Number(item.quantity || 0),
        price_per_unit: Number(item.price_per_unit || 0),
        unit: item.unit || "kg",
        total: Number(item.total || 0)
      })),
      discount: Number(sale.discount || 0),
      tax: Number(sale.tax || 0),
      payment_method: (sale.payment_method || "cash").toLowerCase(),
      sale_date: new Date(sale.created_at || sale.sale_date).toISOString().split('T')[0]
    });
    setEditDialogOpen(true);
  };

  const handleUpdateSale = async (e) => {
    e.preventDefault();
    try {
      const subtotal = editFormData.items.reduce((sum, item) => sum + item.total, 0);
      const total = subtotal - editFormData.discount + editFormData.tax;

      const saleData = {
        customer_id: editFormData.customer_id || null,
        customer_name: editFormData.customer_name || null,
        items: editFormData.items,
        subtotal,
        discount: parseFloat(editFormData.discount),
        tax: parseFloat(editFormData.tax),
        total,
        payment_method: editFormData.payment_method,
        sale_date: editFormData.sale_date
      };

      await axios.put(`${API}/pos-sales/${editingSale.id}`, saleData);
      toast.success("Sale updated successfully");
      fetchSales();
      setEditDialogOpen(false);
      setEditingSale(null);
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to update sale");
    }
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...editFormData.items];
    newItems[index][field] = field === 'quantity' || field === 'price_per_unit' ? parseFloat(value) || 0 : value;
    
    if (field === 'quantity' || field === 'price_per_unit') {
      newItems[index].total = newItems[index].quantity * newItems[index].price_per_unit;
    }
    
    setEditFormData({ ...editFormData, items: newItems });
  };

  const handleRemoveItem = (index) => {
    const newItems = editFormData.items.filter((_, i) => i !== index);
    setEditFormData({ ...editFormData, items: newItems });
  };

  const handleAddItem = () => {
    setEditFormData({
      ...editFormData,
      items: [...editFormData.items, {
        product_id: "",
        product_name: "",
        quantity: 0,
        price_per_unit: 0,
        unit: "kg",
        total: 0
      }]
    });
  };

  const handleProductSelect = (index, productId) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      const newItems = [...editFormData.items];
      newItems[index] = {
        ...newItems[index],
        product_id: product.id,
        product_name: product.name,
        price_per_unit: product.price_per_unit,
        unit: product.unit
      };
      setEditFormData({ ...editFormData, items: newItems });
    }
  };

  if (loading) {
    return <div className="p-8">Loading sales...</div>;
  }

  const totalRevenue = sales.reduce((sum, sale) => sum + Number(sale.total || 0), 0);

  // Pagination calculations
  const totalPages = Math.ceil(sales.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentSales = sales.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="p-8" data-testid="sales-page">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
          Sales History
        </h1>
        <p className="text-gray-600">View all transactions ({sales.length} total)</p>
      </div>

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
        {currentSales.map((sale) => (
          <Card key={sale.id} data-testid={`sale-${sale.id}`}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg mb-1">
                    {sale.customer_name || "Walk-in Customer"}
                  </CardTitle>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    {new Date(sale.created_at || sale.sale_date).toLocaleString()}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-2xl font-bold text-emerald-600">₹{Number(sale.total || 0).toFixed(2)}</p>
                    <p className="text-xs text-gray-500 mt-1">{(sale.payment_method || 'cash').toUpperCase()}</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleEditSale(sale)} data-testid={`edit-sale-${sale.id}`}>
                    <Edit className="h-4 w-4" />
                  </Button>
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
                      <p className="font-medium">{item.product_name || 'Unknown'}</p>
                      <p className="text-sm text-gray-600">
                        {Number(item.quantity || 0)} {item.unit || 'kg'} × ₹{Number(item.price_per_unit || 0).toFixed(2)}
                      </p>
                    </div>
                    <p className="font-semibold">₹{Number(item.total || 0).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal:</span>
                  <span>₹{Number(sale.subtotal || 0).toFixed(2)}</span>
                </div>
                {Number(sale.discount || 0) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Discount:</span>
                    <span className="text-red-600">-₹{Number(sale.discount || 0).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax:</span>
                  <span>₹{Number(sale.tax || 0).toFixed(2)}</span>
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
                // Show first page, last page, current page, and pages around current
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

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" onOpenAutoFocus={(e) => e.preventDefault()} onCloseAutoFocus={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Edit Sale</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateSale} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customer">Customer</Label>
                <Select
                  value={editFormData.customer_id || "walk-in"}
                  onValueChange={(value) => {
                    if (value === "walk-in") {
                      setEditFormData({
                        ...editFormData,
                        customer_id: "",
                        customer_name: ""
                      });
                    } else {
                      const customer = customers.find(c => c.id === value);
                      setEditFormData({
                        ...editFormData,
                        customer_id: value,
                        customer_name: customer ? customer.name : ""
                      });
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Walk-in Customer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="walk-in">Walk-in Customer</SelectItem>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sale_date">Sale Date</Label>
                <Input
                  id="sale_date"
                  type="date"
                  value={editFormData.sale_date}
                  onChange={(e) => setEditFormData({ ...editFormData, sale_date: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>Items</Label>
                <Button type="button" size="sm" onClick={handleAddItem}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Item
                </Button>
              </div>
              
              {editFormData.items.map((item, index) => (
                <div key={index} className="border p-3 rounded space-y-2">
                  <div className="grid grid-cols-5 gap-2">
                    <div className="col-span-2">
                      <Label>Product</Label>
                      <Select
                        value={item.product_id}
                        onValueChange={(value) => handleProductSelect(index, value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select product" />
                        </SelectTrigger>
                        <SelectContent>
                          {products.map((product) => (
                            <SelectItem key={product.id} value={product.id}>
                              {product.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label>Quantity</Label>
                      <Input
                        type="number"
                        step="0.5"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <Label>Price/Unit</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={item.price_per_unit}
                        onChange={(e) => handleItemChange(index, 'price_per_unit', e.target.value)}
                      />
                    </div>
                    
                    <div className="flex items-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveItem(index)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    Total: ₹{Number(item.total || 0).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="discount">Discount (₹)</Label>
                <Input
                  id="discount"
                  type="number"
                  step="0.01"
                  value={editFormData.discount}
                  onChange={(e) => setEditFormData({ ...editFormData, discount: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tax">Tax (₹)</Label>
                <Input
                  id="tax"
                  type="number"
                  step="0.01"
                  value={editFormData.tax}
                  onChange={(e) => setEditFormData({ ...editFormData, tax: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="payment_method">Payment Method</Label>
                <Select
                  value={editFormData.payment_method}
                  onValueChange={(value) => setEditFormData({ ...editFormData, payment_method: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                    <SelectItem value="upi">UPI</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="text-right space-y-1">
                <p className="text-sm text-gray-600">
                  Subtotal: ₹{(editFormData.items || []).reduce((sum, item) => sum + Number(item.total || 0), 0).toFixed(2)}
                </p>
                <p className="text-sm text-gray-600">
                  Discount: -₹{Number(editFormData.discount || 0).toFixed(2)}
                </p>
                <p className="text-sm text-gray-600">
                  Tax: ₹{Number(editFormData.tax || 0).toFixed(2)}
                </p>
                <p className="text-xl font-bold text-emerald-600">
                  Total: ₹{((editFormData.items || []).reduce((sum, item) => sum + Number(item.total || 0), 0) - Number(editFormData.discount || 0) + Number(editFormData.tax || 0)).toFixed(2)}
                </p>
              </div>
            </div>

            <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700">
              Update Sale
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Sales;
