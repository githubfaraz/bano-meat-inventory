import { useEffect, useState } from "react";
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
import { Plus, Edit, Trash2, DollarSign, Calendar, Download } from "lucide-react";
import { formatDate } from "@/lib/utils";

const ExtraExpenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [expenseTypes, setExpenseTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [formData, setFormData] = useState({
    expense_date: new Date().toISOString().split("T")[0],
    expense_type: "",
    description: "",
    amount: "",
    notes: "",
  });

  useEffect(() => {
    checkAdminStatus();
    fetchExpenseTypes();
    fetchExpenses();
  }, []);

  useEffect(() => {
    fetchExpenses();
  }, [startDate, endDate, selectedType]);

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

  const fetchExpenseTypes = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API}/expense-types`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setExpenseTypes(response.data.map((t) => t.name) || []);
    } catch (error) {
      console.error("Failed to fetch expense types:", error);
      toast.error("Failed to load expense types");
      setExpenseTypes([]);
    }
  };

  const fetchExpenses = async () => {
    try {
      const token = localStorage.getItem("token");
      let url = `${API}/extra-expenses`;
      const params = [];

      if (selectedType !== "all") {
        params.push(`expense_type=${selectedType}`);
      }
      if (startDate) {
        params.push(`start_date=${startDate}`);
      }
      if (endDate) {
        params.push(`end_date=${endDate}`);
      }

      if (params.length > 0) {
        url += `?${params.join("&")}`;
      }

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setExpenses(response.data || []);
    } catch (error) {
      console.error("Failed to fetch expenses:", error);
      toast.error("Failed to fetch expenses");
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const payload = {
        expense_date: formData.expense_date,
        expense_type: formData.expense_type,
        description: formData.description,
        amount: parseFloat(formData.amount),
        notes: formData.notes || "",
      };

      if (editingExpense) {
        await axios.put(`${API}/extra-expenses/${editingExpense.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Expense updated successfully");
      } else {
        await axios.post(`${API}/extra-expenses`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Expense added successfully");
      }

      fetchExpenses();
      setDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error("Failed to save expense:", error);
      toast.error(error.response?.data?.detail || "Failed to save expense");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this expense?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API}/extra-expenses/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Expense deleted successfully");
      fetchExpenses();
    } catch (error) {
      console.error("Failed to delete expense:", error);
      toast.error("Failed to delete expense");
    }
  };

  const handleEdit = (expense) => {
    setEditingExpense(expense);
    setFormData({
      expense_date: expense.expense_date || new Date().toISOString().split("T")[0],
      expense_type: expense.expense_type || "",
      description: expense.description || "",
      amount: expense.amount?.toString() || "",
      notes: expense.notes || "",
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      expense_date: new Date().toISOString().split("T")[0],
      expense_type: "",
      description: "",
      amount: "",
      notes: "",
    });
    setEditingExpense(null);
  };

  const handleExport = async (format) => {
    try {
      const params = new URLSearchParams();
      if (selectedType !== "all") params.append("expense_type", selectedType);
      if (startDate) params.append("start_date", startDate);
      if (endDate) params.append("end_date", endDate);
      params.append("format", format);

      const url = `${API}/reports/extra-expenses?${params.toString()}`;
      const response = await axios.get(url, {
        responseType: "blob",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const blob = new Blob([response.data]);
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;

      const extension = format === "excel" ? "xlsx" : format;
      link.download = `extra_expenses_report.${extension}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);

      toast.success(`Report exported as ${format.toUpperCase()}`);
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Failed to export report");
    }
  };

  const calculateTotals = () => {
    const total = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
    return {
      total: total.toFixed(2),
      count: expenses.length,
    };
  };

  if (loading) {
    return <div className="p-8">Loading expenses...</div>;
  }

  const totals = calculateTotals();

  return (
    <div className="p-8" data-testid="extra-expenses-page">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
            Extra Expenses
          </h1>
          <p className="text-gray-600">
            Track daily expenses like tea, food, petrol, etc. ({totals.count} expenses, Total: ₹{totals.total})
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={resetForm}>
              <Plus className="h-5 w-5 mr-2" />
              Add Expense
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-xl" onOpenAutoFocus={(e) => e.preventDefault()}>
            <DialogHeader>
              <DialogTitle>{editingExpense ? "Edit Expense" : "Add New Expense"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="expense_date">Date *</Label>
                <Input
                  id="expense_date"
                  type="date"
                  value={formData.expense_date}
                  onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })}
                  required
                  max={new Date().toISOString().split("T")[0]}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expense_type">Expense Type *</Label>
                <select
                  id="expense_type"
                  value={formData.expense_type}
                  onChange={(e) => setFormData({ ...formData, expense_type: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                >
                  <option value="">Select Type</option>
                  {expenseTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  placeholder="e.g., Morning tea for staff"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount (₹) *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                  placeholder="Enter amount"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  rows={3}
                  placeholder="Additional notes..."
                />
              </div>

              <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700">
                {editingExpense ? "Update Expense" : "Add Expense"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="mb-6 bg-white rounded-lg shadow-md p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-2">Filter by Type</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="border rounded-lg px-4 py-2 w-full"
            >
              <option value="all">All Types</option>
              {expenseTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border rounded-lg px-4 py-2 w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border rounded-lg px-4 py-2 w-full"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setStartDate("");
                setEndDate("");
                setSelectedType("all");
              }}
              className="border border-gray-300 rounded-lg px-4 py-2 w-full hover:bg-gray-50 text-gray-700"
            >
              Clear Filters
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-4 border-t">
          <Download className="h-4 w-4 text-gray-600" />
          <span className="text-sm text-gray-600 mr-2">Export:</span>
          <button
            onClick={() => handleExport("csv")}
            className="border border-gray-300 rounded px-3 py-1 text-sm hover:bg-gray-50"
          >
            CSV
          </button>
          <button
            onClick={() => handleExport("excel")}
            className="border border-gray-300 rounded px-3 py-1 text-sm hover:bg-gray-50"
          >
            Excel
          </button>
          <button
            onClick={() => handleExport("pdf")}
            className="border border-gray-300 rounded px-3 py-1 text-sm hover:bg-gray-50"
          >
            PDF
          </button>
        </div>
      </div>

      {/* Expenses Table */}
      <Card>
        <CardHeader>
          <CardTitle>Expense Records</CardTitle>
        </CardHeader>
        <CardContent>
          {expenses.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg">No expenses found. Add your first expense!</p>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenses.map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          {formatDate(expense.expense_date)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700">
                          {expense.expense_type}
                        </span>
                      </TableCell>
                      <TableCell>{expense.description}</TableCell>
                      <TableCell className="text-right">
                        <span className="font-semibold text-emerald-600">
                          ₹{(expense.amount || 0).toFixed(2)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">
                          {expense.notes || "-"}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex gap-2 justify-center">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(expense)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          {isAdmin && (
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(expense.id)}>
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          )}
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
    </div>
  );
};

export default ExtraExpenses;
