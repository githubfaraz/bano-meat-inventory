import { useEffect, useState } from "react";
import axios from "axios";
import { API } from "@/App";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Trash2, ShoppingCart, Printer } from "lucide-react";

const POS = () => {
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [cart, setCart] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState("walk-in");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState("");
  const [discount, setDiscount] = useState(0);
  const [taxRate, setTaxRate] = useState(5);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchCustomers();
  }, []);

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

  const addToCart = () => {
    if (!selectedProduct || !quantity || parseFloat(quantity) <= 0) {
      toast.error("Please select a product and enter valid quantity");
      return;
    }

    const product = products.find((p) => p.id === selectedProduct);
    if (!product) return;

    const qty = parseFloat(quantity);
    if (qty > product.stock_quantity) {
      toast.error(`Only ${product.stock_quantity} ${product.unit} available in stock`);
      return;
    }

    const existingItem = cart.find((item) => item.product_id === product.id);
    if (existingItem) {
      const newQty = existingItem.quantity + qty;
      if (newQty > product.stock_quantity) {
        toast.error(`Only ${product.stock_quantity} ${product.unit} available in stock`);
        return;
      }
      setCart(
        cart.map((item) =>
          item.product_id === product.id
            ? { ...item, quantity: newQty, total: newQty * product.price_per_unit }
            : item
        )
      );
    } else {
      setCart([
        ...cart,
        {
          product_id: product.id,
          product_name: product.name,
          quantity: qty,
          unit: product.unit,
          price_per_unit: product.price_per_unit,
          total: qty * product.price_per_unit,
        },
      ]);
    }

    setSelectedProduct("");
    setQuantity("");
    toast.success("Item added to cart");
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter((item) => item.product_id !== productId));
  };

  const calculateTotals = () => {
    const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
    const discountAmount = (subtotal * discount) / 100;
    const taxableAmount = subtotal - discountAmount;
    const taxAmount = (taxableAmount * taxRate) / 100;
    const total = taxableAmount + taxAmount;

    return { subtotal, discountAmount, taxAmount, total };
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.error("Cart is empty");
      return;
    }

    setLoading(true);
    try {
      const { subtotal, discountAmount, taxAmount, total } = calculateTotals();
      const customer = selectedCustomer === "walk-in" ? null : customers.find((c) => c.id === selectedCustomer);

      const saleData = {
        customer_id: selectedCustomer === "walk-in" ? null : selectedCustomer,
        customer_name: customer?.name || "Walk-in Customer",
        items: cart,
        subtotal,
        tax: taxAmount,
        discount: discountAmount,
        total,
        payment_method: paymentMethod,
      };

      const response = await axios.post(`${API}/sales`, saleData);
      toast.success("Sale completed successfully!");

      // Generate receipt
      printReceipt(response.data, customer);

      // Reset
      setCart([]);
      setSelectedCustomer("walk-in");
      setDiscount(0);
      setPaymentMethod("cash");
      fetchProducts();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to complete sale");
    } finally {
      setLoading(false);
    }
  };

  const printReceipt = (sale, customer) => {
    const { subtotal, discountAmount, taxAmount, total } = calculateTotals();

    const receiptContent = `
      <div class="receipt-content">
        <div class="text-center font-bold" style="font-size: 16px; margin-bottom: 8px;">
          MEAT INVENTORY
        </div>
        <div class="text-center" style="margin-bottom: 12px;">
          Receipt #${sale.id.substring(0, 8)}
        </div>
        <div class="border-bottom" style="margin-bottom: 8px;">
          <div>Date: ${new Date(sale.created_at).toLocaleString()}</div>
          <div>Customer: ${customer?.name || "Walk-in Customer"}</div>
          ${customer?.phone ? `<div>Phone: ${customer.phone}</div>` : ""}
        </div>
        <table style="margin: 8px 0;">
          <thead>
            <tr>
              <th style="text-align: left;">Item</th>
              <th style="text-align: right;">Qty</th>
              <th style="text-align: right;">Price</th>
              <th style="text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${cart
              .map(
                (item) => `
              <tr>
                <td>${item.product_name}</td>
                <td class="text-right">${item.quantity} ${item.unit}</td>
                <td class="text-right">₹${item.price_per_unit.toFixed(2)}</td>
                <td class="text-right">₹${item.total.toFixed(2)}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
        <div class="border-top" style="margin-top: 8px;">
          <table style="width: 100%;">
            <tr>
              <td>Subtotal:</td>
              <td class="text-right">₹${subtotal.toFixed(2)}</td>
            </tr>
            ${discount > 0 ? `
            <tr>
              <td>Discount (${discount}%):</td>
              <td class="text-right">-₹${discountAmount.toFixed(2)}</td>
            </tr>
            ` : ""}
            <tr>
              <td>Tax (${taxRate}%):</td>
              <td class="text-right">₹${taxAmount.toFixed(2)}</td>
            </tr>
            <tr class="font-bold" style="font-size: 14px;">
              <td>Total:</td>
              <td class="text-right">₹${total.toFixed(2)}</td>
            </tr>
            <tr>
              <td>Payment:</td>
              <td class="text-right">${paymentMethod.toUpperCase()}</td>
            </tr>
          </table>
        </div>
        <div class="text-center border-top" style="margin-top: 12px; padding-top: 8px; font-size: 11px;">
          Thank you for your business!
        </div>
      </div>
    `;

    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Receipt</title>
          <style>
            body { font-family: 'Courier New', monospace; }
            .receipt-content { width: 80mm; padding: 10px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { padding: 2px 0; }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            .border-top { border-top: 1px dashed #000; padding-top: 4px; margin-top: 4px; }
            .border-bottom { border-bottom: 1px dashed #000; padding-bottom: 4px; margin-bottom: 4px; }
            .font-bold { font-weight: bold; }
            @media print {
              @page { size: 80mm auto; margin: 0; }
            }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          ${receiptContent}
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const { subtotal, discountAmount, taxAmount, total } = calculateTotals();

  return (
    <div className="p-8" data-testid="pos-page">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
          Point of Sale
        </h1>
        <p className="text-gray-600">Create new sales transactions</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Product Selection */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Add Items</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 space-y-2">
                  <Label>Product</Label>
                  <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                    <SelectTrigger data-testid="pos-product-select">
                      <SelectValue placeholder="Select product" />
                    </SelectTrigger>
                    <SelectContent>
                      {products
                        .filter((p) => p.stock_quantity > 0)
                        .map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name} - ₹{product.price_per_unit}/{product.unit} (Stock: {product.stock_quantity})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Quantity</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Qty"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      data-testid="pos-quantity-input"
                    />
                    <Button onClick={addToCart} className="bg-emerald-600 hover:bg-emerald-700" data-testid="pos-add-to-cart-button">
                      <Plus className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cart Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Cart Items ({cart.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {cart.length > 0 ? (
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div
                      key={item.product_id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                      data-testid={`cart-item-${item.product_id}`}
                    >
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800">{item.product_name}</p>
                        <p className="text-sm text-gray-600">
                          {item.quantity} {item.unit} × ₹{item.price_per_unit.toFixed(2)}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="font-bold text-emerald-600">₹{item.total.toFixed(2)}</p>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFromCart(item.product_id)}
                          data-testid={`remove-cart-item-${item.product_id}`}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">Cart is empty</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right: Summary & Checkout */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedCustomer || "walk-in"} onValueChange={setSelectedCustomer}>
                <SelectTrigger data-testid="pos-customer-select">
                  <SelectValue placeholder="Walk-in Customer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="walk-in">Walk-in Customer</SelectItem>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name} - {customer.phone}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Discount (%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={discount}
                  onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                  data-testid="pos-discount-input"
                />
              </div>

              <div className="space-y-2">
                <Label>Tax Rate (%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={taxRate}
                  onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                  data-testid="pos-tax-input"
                />
              </div>

              <div className="space-y-2">
                <Label>Payment Method</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger data-testid="pos-payment-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                    <SelectItem value="upi">UPI</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-4 border-t space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-semibold">₹{subtotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Discount ({discount}%):</span>
                    <span className="font-semibold text-red-600">-₹{discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax ({taxRate}%):</span>
                  <span className="font-semibold">₹{taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span>Total:</span>
                  <span className="text-emerald-600" data-testid="pos-total-amount">₹{total.toFixed(2)}</span>
                </div>
              </div>

              <Button
                onClick={handleCheckout}
                disabled={cart.length === 0 || loading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 h-12 text-lg"
                data-testid="pos-checkout-button"
              >
                <Printer className="h-5 w-5 mr-2" />
                {loading ? "Processing..." : "Checkout & Print"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default POS;
