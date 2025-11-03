import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Plus, Trash2, ShoppingCart, Printer, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";

const NewPOS = () => {
  const [categories, setCategories] = useState([]);
  const [derivedProducts, setDerivedProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [cart, setCart] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantityKg, setQuantityKg] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState("walk-in");
  const [discount, setDiscount] = useState(0);
  const [taxRate, setTaxRate] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [loading, setLoading] = useState(false);
  const [customerSearchTerm, setCustomerSearchTerm] = useState("");
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);

  const API_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8001";

  useEffect(() => {
    fetchCategories();
    fetchCustomers();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      fetchDerivedProducts(selectedCategory);
    } else {
      setDerivedProducts([]);
      setSelectedProduct("");
    }
  }, [selectedCategory]);

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

  const fetchDerivedProducts = async (categoryId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${API_URL}/api/derived-products?main_category_id=${categoryId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDerivedProducts(response.data);
    } catch (error) {
      toast.error("Failed to fetch products");
    }
  };

  const fetchCustomers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/api/customers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCustomers(response.data);
    } catch (error) {
      toast.error("Failed to fetch customers");
    }
  };

  // Filter customers based on search term
  const filteredCustomers = customers.filter((customer) =>
    customer.name.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
    (customer.phone && customer.phone.includes(customerSearchTerm))
  );

  // Get the display name for selected customer
  const getSelectedCustomerName = () => {
    if (selectedCustomer === "walk-in") return "Walk-in Customer";
    const customer = customers.find((c) => c.id === selectedCustomer);
    return customer ? customer.name : "Select Customer";
  };

  // Handle customer selection
  const handleCustomerSelect = (customerId) => {
    setSelectedCustomer(customerId);
    setShowCustomerDropdown(false);
    setCustomerSearchTerm("");
  };

  const addToCart = () => {
    if (!selectedCategory || !selectedProduct || !quantityKg || parseFloat(quantityKg) <= 0) {
      toast.error("Please select category, product and enter valid quantity");
      return;
    }

    const product = derivedProducts.find((p) => p.id === selectedProduct);
    const category = categories.find((c) => c.id === selectedCategory);
    if (!product || !category) return;

    const qty = parseFloat(quantityKg);
    let quantityInKg = qty;
    
    // If product is sold by package, convert packages to kg
    if (product.sale_unit === "package") {
      quantityInKg = qty * product.package_weight_kg;
    }
    
    const total = qty * product.selling_price;

    const cartItem = {
      derived_product_id: product.id,
      derived_product_name: product.name,
      main_category_id: category.id,
      main_category_name: category.name,
      quantity_kg: quantityInKg,  // Always store in kg for inventory deduction
      quantity_display: product.sale_unit === "package" ? `${qty} pkg` : `${qty} kg`,
      selling_price: product.selling_price,
      sale_unit: product.sale_unit,
      total: total,
    };

    setCart([...cart, cartItem]);
    setSelectedCategory("");
    setSelectedProduct("");
    setQuantityKg("");
    toast.success("Item added to cart");
  };

  const removeFromCart = (index) => {
    const newCart = cart.filter((_, i) => i !== index);
    setCart(newCart);
    toast.success("Item removed from cart");
  };

  const calculateTotals = () => {
    const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
    const discountAmount = (subtotal * discount) / 100;
    const taxableAmount = subtotal - discountAmount;
    const taxAmount = (taxableAmount * taxRate) / 100;
    const total = taxableAmount + taxAmount;

    return {
      subtotal: subtotal.toFixed(2),
      discountAmount: discountAmount.toFixed(2),
      taxAmount: taxAmount.toFixed(2),
      total: total.toFixed(2),
    };
  };

  const printReceipt = (saleData) => {
    const totals = calculateTotals();
    const customerName = selectedCustomer === "walk-in" 
      ? "Walk-in Customer" 
      : customers.find((c) => c.id === selectedCustomer)?.name;
    
    const receiptContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt - Bano Fresh</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 20px; }
          .header h1 { margin: 0; color: #059669; }
          .info { margin-bottom: 20px; }
          .items table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .items th, .items td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
          .items th { background-color: #f3f4f6; }
          .totals { margin-top: 20px; text-align: right; }
          .totals div { margin: 5px 0; }
          .total-final { font-size: 1.2em; font-weight: bold; color: #059669; }
          .footer { margin-top: 30px; text-align: center; font-size: 0.9em; color: #6b7280; }
          @media print {
            body { margin: 0; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>BANO FRESH</h1>
          <p>Premium Meat Shop</p>
          <p style="font-size: 0.9em;">Date: ${new Date().toLocaleString()}</p>
        </div>
        
        <div class="info">
          <strong>Customer:</strong> ${customerName}<br>
          <strong>Payment Method:</strong> ${paymentMethod.toUpperCase()}
        </div>
        
        <div class="items">
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Category</th>
                <th>Qty (kg)</th>
                <th>Price/kg</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${cart.map(item => `
                <tr>
                  <td>${item.derived_product_name}</td>
                  <td>${item.main_category_name}</td>
                  <td>${item.quantity_kg}</td>
                  <td>₹${item.selling_price}</td>
                  <td>₹${item.total.toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        
        <div class="totals">
          <div>Subtotal: ₹${totals.subtotal}</div>
          <div style="color: #dc2626;">Discount (${discount}%): -₹${totals.discountAmount}</div>
          <div>Tax (${taxRate}%): ₹${totals.taxAmount}</div>
          <div class="total-final">Total: ₹${totals.total}</div>
        </div>
        
        <div class="footer">
          <p>Thank you for shopping with Bano Fresh!</p>
          <p>Visit us again</p>
        </div>
        
        <script>
          window.onload = function() {
            window.print();
          }
        </script>
      </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(receiptContent);
    printWindow.document.close();
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.error("Cart is empty");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const totals = calculateTotals();

      const saleData = {
        customer_id: selectedCustomer === "walk-in" ? null : selectedCustomer,
        customer_name: selectedCustomer === "walk-in" ? "Walk-in Customer" : customers.find((c) => c.id === selectedCustomer)?.name,
        items: cart,
        subtotal: parseFloat(totals.subtotal),
        tax: parseFloat(totals.taxAmount),
        discount: parseFloat(totals.discountAmount),
        total: parseFloat(totals.total),
        payment_method: paymentMethod,
      };

      await axios.post(`${API_URL}/api/pos-sales`, saleData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Sale completed successfully!");
      
      // Print receipt
      printReceipt(saleData);
      
      // Reset form
      setCart([]);
      setSelectedCustomer("walk-in");
      setDiscount(0);
      setPaymentMethod("cash");
      
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to complete sale");
    } finally {
      setLoading(false);
    }
  };

  const totals = calculateTotals();

  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-6">
        <ShoppingCart className="h-8 w-8 text-emerald-600" />
        <h1 className="text-3xl font-bold text-gray-900">Point of Sale</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side - Product Selection */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Add Items</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Main Category *
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
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
                    Derived Product *
                  </label>
                  <select
                    value={selectedProduct}
                    onChange={(e) => setSelectedProduct(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2"
                    disabled={!selectedCategory}
                  >
                    <option value="">Select Product</option>
                    {derivedProducts.map((prod) => (
                      <option key={prod.id} value={prod.id}>
                        {prod.name} - ₹{prod.selling_price}/kg
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={quantityKg}
                    onChange={(e) => setQuantityKg(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder={
                      selectedProduct && derivedProducts.find(p => p.id === selectedProduct)?.sale_unit === "package"
                        ? "e.g., 3 (packages)"
                        : "e.g., 2.5 (kg)"
                    }
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {selectedProduct && derivedProducts.find(p => p.id === selectedProduct)?.sale_unit === "package"
                      ? "Enter number of packages"
                      : "Enter weight in kg"}
                  </p>
                </div>
                <div className="flex items-end">
                  <Button
                    onClick={addToCart}
                    className="w-full bg-emerald-600 hover:bg-emerald-700"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add to Cart
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cart Items */}
          <Card>
            <CardHeader>
              <CardTitle>Cart Items</CardTitle>
            </CardHeader>
            <CardContent>
              {cart.length === 0 ? (
                <p className="text-center text-gray-500 py-8">Cart is empty</p>
              ) : (
                <div className="space-y-2">
                  {cart.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-semibold">{item.derived_product_name}</p>
                        <p className="text-sm text-gray-600">
                          {item.main_category_name} • {item.quantity_display} × ₹{item.selling_price}{item.sale_unit === "package" ? "/pkg" : "/kg"}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="text-lg font-bold text-emerald-600">
                          ₹{item.total.toFixed(2)}
                        </p>
                        <button
                          onClick={() => removeFromCart(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Side - Checkout */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer & Payment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Customer</label>
                <div className="relative">
                  <div
                    onClick={() => setShowCustomerDropdown(!showCustomerDropdown)}
                    className="w-full border rounded-lg px-3 py-2 cursor-pointer bg-white flex items-center justify-between hover:border-gray-400"
                  >
                    <span>{getSelectedCustomerName()}</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>

                  {showCustomerDropdown && (
                    <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-80 overflow-hidden">
                      {/* Search Input */}
                      <div className="p-2 border-b sticky top-0 bg-white">
                        <div className="relative">
                          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Search customers..."
                            value={customerSearchTerm}
                            onChange={(e) => setCustomerSearchTerm(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full pl-9 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            autoFocus
                          />
                        </div>
                      </div>

                      {/* Customer List */}
                      <div className="max-h-60 overflow-y-auto">
                        {/* Walk-in Customer Option */}
                        <div
                          onClick={() => handleCustomerSelect("walk-in")}
                          className={`px-4 py-2 cursor-pointer hover:bg-emerald-50 ${
                            selectedCustomer === "walk-in" ? "bg-emerald-100 font-semibold" : ""
                          }`}
                        >
                          Walk-in Customer
                        </div>

                        {/* Filtered Customers */}
                        {filteredCustomers.length > 0 ? (
                          filteredCustomers.map((customer) => (
                            <div
                              key={customer.id}
                              onClick={() => handleCustomerSelect(customer.id)}
                              className={`px-4 py-2 cursor-pointer hover:bg-emerald-50 ${
                                selectedCustomer === customer.id ? "bg-emerald-100 font-semibold" : ""
                              }`}
                            >
                              <div className="flex justify-between items-center">
                                <span>{customer.name}</span>
                                {customer.phone && (
                                  <span className="text-sm text-gray-500">{customer.phone}</span>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="px-4 py-3 text-gray-500 text-center">
                            No customers found
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Discount (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={discount}
                  onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Tax Rate (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={taxRate}
                  onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="upi">UPI</option>
                </select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold">₹{totals.subtotal}</span>
              </div>
              <div className="flex justify-between text-red-600">
                <span>Discount ({discount}%)</span>
                <span>-₹{totals.discountAmount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax ({taxRate}%)</span>
                <span className="font-semibold">₹{totals.taxAmount}</span>
              </div>
              <div className="border-t pt-3 flex justify-between text-lg">
                <span className="font-bold">Total</span>
                <span className="font-bold text-emerald-600">
                  ₹{totals.total}
                </span>
              </div>

              <Button
                onClick={handleCheckout}
                disabled={cart.length === 0 || loading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 mt-4"
              >
                {loading ? "Processing..." : "Complete Sale"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default NewPOS;
