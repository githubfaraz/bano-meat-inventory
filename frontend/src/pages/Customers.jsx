import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { API } from "@/App";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Phone, Mail, MapPin, DollarSign, Receipt, CreditCard, CheckCircle, Search, ChevronDown } from "lucide-react";
import { formatDateTime } from "@/lib/utils";

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [customerLedger, setCustomerLedger] = useState([]);
  const [ledgerLoading, setLedgerLoading] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [customerSearchTerm, setCustomerSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
  });

  const customerDropdownRef = useRef(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    if (selectedCustomerId && selectedCustomerId !== "") {
      fetchCustomerLedger(selectedCustomerId);
    } else {
      setCustomerLedger([]);
    }
  }, [selectedCustomerId]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (customerDropdownRef.current && !customerDropdownRef.current.contains(event.target)) {
        setShowCustomerDropdown(false);
        setCustomerSearchTerm("");
      }
    };

    if (showCustomerDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showCustomerDropdown]);

  const fetchCustomers = async () => {
    try {
      const response = await axios.get(`${API}/customers`);
      setCustomers(response.data || []);
    } catch (error) {
      console.error("Failed to fetch customers:", error);
      toast.error("Failed to fetch customers");
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerLedger = async (customerId) => {
    setLedgerLoading(true);
    try {
      const response = await axios.get(`${API}/pos-sales`);
      // Filter sales for the selected customer
      const customerSales = (response.data || []).filter(sale => sale.customer_id === customerId);
      // Sort by date descending (newest first)
      customerSales.sort((a, b) => new Date(b.sale_date || 0) - new Date(a.sale_date || 0));
      setCustomerLedger(customerSales);
    } catch (error) {
      console.error("Failed to fetch customer ledger:", error);
      toast.error("Failed to fetch customer ledger");
      setCustomerLedger([]);
    } finally {
      setLedgerLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCustomer) {
        await axios.put(`${API}/customers/${editingCustomer.id}`, formData);
        toast.success("Customer updated successfully");
      } else {
        await axios.post(`${API}/customers`, formData);
        toast.success("Customer created successfully");
      }

      fetchCustomers();
      setDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error("Failed to save customer:", error);
      toast.error(error.response?.data?.detail || "Failed to save customer");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this customer?")) return;
    try {
      await axios.delete(`${API}/customers/${id}`);
      toast.success("Customer deleted successfully");
      if (selectedCustomerId === id) {
        setSelectedCustomerId("");
      }
      fetchCustomers();
    } catch (error) {
      console.error("Failed to delete customer:", error);
      toast.error("Failed to delete customer");
    }
  };

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name || "",
      phone: customer.phone || "",
      email: customer.email || "",
      address: customer.address || "",
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      phone: "",
      email: "",
      address: "",
    });
    setEditingCustomer(null);
  };

  const handleMarkAsPaid = (sale) => {
    setSelectedSale(sale);
    setPaymentMethod("cash");
    setPaymentDialogOpen(true);
  };

  const confirmMarkAsPaid = async () => {
    if (!selectedSale) return;

    try {
      // Update the sale with new payment method
      await axios.put(`${API}/pos-sales/${selectedSale.id}`, {
        ...selectedSale,
        payment_method: paymentMethod,
      });

      toast.success("Payment marked as paid successfully");
      setPaymentDialogOpen(false);
      setSelectedSale(null);

      // Refresh ledger
      if (selectedCustomerId) {
        fetchCustomerLedger(selectedCustomerId);
      }

      // Refresh customers to update total purchases
      fetchCustomers();
    } catch (error) {
      console.error("Failed to update payment:", error);
      toast.error(error.response?.data?.detail || "Failed to update payment");
    }
  };

  const getSelectedCustomer = () => {
    if (!selectedCustomerId || selectedCustomerId === "") return null;
    return customers.find(c => c.id === selectedCustomerId) || null;
  };

  // Get sorted customers (ascending by name)
  const getSortedCustomers = () => {
    return [...customers].sort((a, b) => a.name.localeCompare(b.name));
  };

  // Filter customers based on search term
  const getFilteredCustomers = () => {
    const sortedCustomers = getSortedCustomers();
    if (!customerSearchTerm) return sortedCustomers;

    return sortedCustomers.filter((customer) =>
      customer.name.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
      (customer.phone && customer.phone.includes(customerSearchTerm))
    );
  };

  // Get selected customer display name
  const getSelectedCustomerName = () => {
    if (!selectedCustomerId || selectedCustomerId === "") {
      return "-- Select a customer to view ledger --";
    }
    const customer = customers.find(c => c.id === selectedCustomerId);
    return customer ? `${customer.name} - ${customer.phone}` : "-- Select a customer to view ledger --";
  };

  // Handle customer selection from dropdown
  const handleCustomerSelect = (customerId) => {
    setSelectedCustomerId(customerId);
    setShowCustomerDropdown(false);
    setCustomerSearchTerm("");
  };

  const calculateLedgerStats = () => {
    const totalSales = customerLedger.reduce((sum, sale) => sum + (sale.total || 0), 0);
    const creditSales = customerLedger.filter(sale => sale.payment_method === "credit");
    const totalCredit = creditSales.reduce((sum, sale) => sum + (sale.total || 0), 0);
    const paidSales = customerLedger.filter(sale => sale.payment_method !== "credit");
    const totalPaid = paidSales.reduce((sum, sale) => sum + (sale.total || 0), 0);

    return {
      totalSales,
      totalCredit,
      totalPaid,
      creditCount: creditSales.length,
    };
  };

  if (loading) {
    return <div className="p-8">Loading customers...</div>;
  }

  const selectedCustomer = getSelectedCustomer();
  const ledgerStats = selectedCustomerId && selectedCustomerId !== "" ? calculateLedgerStats() : null;

  return (
    <div className="p-8" data-testid="customers-page">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Customers
          </h1>
          <p className="text-gray-600">Manage your customer base ({customers.length} total)</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={resetForm} data-testid="add-customer-button">
              <Plus className="h-5 w-5 mr-2" />
              Add Customer
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-xl" onOpenAutoFocus={(e) => e.preventDefault()} onCloseAutoFocus={(e) => e.preventDefault()}>
            <DialogHeader>
              <DialogTitle>{editingCustomer ? "Edit Customer" : "Add New Customer"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Customer Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  data-testid="customer-name-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                  data-testid="customer-phone-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  data-testid="customer-email-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  data-testid="customer-address-input"
                />
              </div>

              <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" data-testid="customer-submit-button">
                {editingCustomer ? "Update Customer" : "Add Customer"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Customer Selection and Ledger */}
      <div className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Customer Ledger
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Label>Select Customer</Label>
              <div className="relative mt-1" ref={customerDropdownRef}>
                <div
                  onClick={() => setShowCustomerDropdown(!showCustomerDropdown)}
                  className="w-full border rounded-lg px-3 py-2 cursor-pointer bg-white flex items-center justify-between hover:border-gray-400"
                >
                  <span className={selectedCustomerId ? "text-gray-900" : "text-gray-500"}>
                    {getSelectedCustomerName()}
                  </span>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
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
                      {/* Clear Selection Option */}
                      <div
                        onClick={() => handleCustomerSelect("")}
                        className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${
                          selectedCustomerId === "" ? "bg-emerald-50 font-semibold" : ""
                        }`}
                      >
                        -- Clear Selection --
                      </div>

                      {/* Filtered Customers */}
                      {getFilteredCustomers().length > 0 ? (
                        getFilteredCustomers().map((customer) => (
                          <div
                            key={customer.id}
                            onClick={() => handleCustomerSelect(customer.id)}
                            className={`px-4 py-2 cursor-pointer hover:bg-emerald-50 ${
                              selectedCustomerId === customer.id ? "bg-emerald-100 font-semibold" : ""
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

            {selectedCustomer && (
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Customer Name</p>
                    <p className="font-semibold">{selectedCustomer.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-semibold">{selectedCustomer.phone}</p>
                  </div>
                  {ledgerStats && (
                    <>
                      <div>
                        <p className="text-sm text-gray-600">Total Credit</p>
                        <p className="font-semibold text-red-600">₹{ledgerStats.totalCredit.toFixed(2)}</p>
                        <p className="text-xs text-gray-500">{ledgerStats.creditCount} pending</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Total Paid</p>
                        <p className="font-semibold text-emerald-600">₹{ledgerStats.totalPaid.toFixed(2)}</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {ledgerLoading ? (
              <div className="text-center py-8">Loading ledger...</div>
            ) : selectedCustomerId && selectedCustomerId !== "" && customerLedger.length > 0 ? (
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead className="text-right">Subtotal</TableHead>
                      <TableHead className="text-right">Discount</TableHead>
                      <TableHead className="text-right">Tax</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead className="text-center">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customerLedger.map((sale) => (
                      <TableRow key={sale.id}>
                        <TableCell className="font-medium">
                          {formatDateTime(sale.sale_date)}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {(sale.items || []).slice(0, 2).map((item, idx) => (
                              <div key={idx} className="text-gray-600">
                                {item.derived_product_name} ({item.quantity_kg}kg)
                              </div>
                            ))}
                            {(sale.items || []).length > 2 && (
                              <div className="text-xs text-gray-500">
                                +{sale.items.length - 2} more
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">₹{(sale.subtotal || 0).toFixed(2)}</TableCell>
                        <TableCell className="text-right text-red-600">
                          {(sale.discount || 0) > 0 ? `-₹${sale.discount.toFixed(2)}` : '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          {(sale.tax || 0) > 0 ? `₹${sale.tax.toFixed(2)}` : '-'}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          ₹{(sale.total || 0).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                            sale.payment_method === "credit"
                              ? "bg-red-100 text-red-700"
                              : "bg-emerald-100 text-emerald-700"
                          }`}>
                            {sale.payment_method === "credit" ? (
                              <CreditCard className="h-3 w-3" />
                            ) : (
                              <CheckCircle className="h-3 w-3" />
                            )}
                            {(sale.payment_method || "cash").toUpperCase()}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          {sale.payment_method === "credit" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                              onClick={() => handleMarkAsPaid(sale)}
                            >
                              Mark as Paid
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : selectedCustomerId && selectedCustomerId !== "" ? (
              <div className="text-center py-8 text-gray-500">
                No purchase history found for this customer
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Select a customer to view their purchase ledger
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Customers Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Customers</CardTitle>
        </CardHeader>
        <CardContent>
          {customers.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg">No customers yet. Add your first customer!</p>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead className="text-right">Total Purchases</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell className="font-medium">{customer.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          {customer.phone}
                        </div>
                      </TableCell>
                      <TableCell>
                        {customer.email ? (
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-gray-400" />
                            {customer.email}
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {customer.address ? (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            {customer.address}
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="font-semibold text-emerald-600">
                          ₹{(customer.total_purchases || 0).toFixed(2)}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex gap-2 justify-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(customer)}
                            data-testid={`edit-customer-${customer.id}`}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(customer.id)}
                            data-testid={`delete-customer-${customer.id}`}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Confirmation Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark Credit as Paid</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-gray-600">
              Confirm that the credit payment has been received for this sale:
            </p>
            {selectedSale && (
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Sale Date:</span>
                  <span className="text-sm font-medium">{formatDateTime(selectedSale.sale_date)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Amount:</span>
                  <span className="text-sm font-semibold text-emerald-600">₹{(selectedSale.total || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Items:</span>
                  <span className="text-sm font-medium">{(selectedSale.items || []).length} item(s)</span>
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label>Payment Method Received</Label>
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
            <div className="flex gap-2 justify-end pt-4">
              <Button variant="outline" onClick={() => setPaymentDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                className="bg-emerald-600 hover:bg-emerald-700"
                onClick={confirmMarkAsPaid}
              >
                Confirm Payment Received
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Customers;
