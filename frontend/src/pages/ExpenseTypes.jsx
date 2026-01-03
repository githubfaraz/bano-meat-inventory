import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { formatDate } from "../lib/utils";
import { Plus, Edit2, Trash2, Settings } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Button } from "../components/ui/button";

const ExpenseTypes = () => {
  const [expenseTypes, setExpenseTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingType, setEditingType] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
  });

  const API_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8001";

  useEffect(() => {
    fetchExpenseTypes();
  }, []);

  const fetchExpenseTypes = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/api/expense-types`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setExpenseTypes(response.data);
    } catch (error) {
      toast.error("Failed to fetch expense types");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      if (editingType) {
        await axios.put(
          `${API_URL}/api/expense-types/${editingType.id}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success("Expense type updated successfully");
      } else {
        await axios.post(`${API_URL}/api/expense-types`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Expense type created successfully");
      }
      fetchExpenseTypes();
      resetForm();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to save expense type");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this expense type?"))
      return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/api/expense-types/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Expense type deleted successfully");
      fetchExpenseTypes();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to delete expense type");
    }
  };

  const handleEdit = (type) => {
    setEditingType(type);
    setFormData({
      name: type.name,
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({ name: "" });
    setEditingType(null);
    setDialogOpen(false);
  };

  if (loading) {
    return <div className="p-8">Loading expense types...</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Expense Types</h1>
          <p className="text-gray-600">({expenseTypes.length} total)</p>
        </div>
        <Button
          onClick={() => setDialogOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Expense Type
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {expenseTypes.map((type) => (
          <Card key={type.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Settings className="h-5 w-5 text-emerald-600" />
                {type.name}
              </CardTitle>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(type)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(type.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-gray-400 mt-2">
                Created: {formatDate(type.created_at)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {expenseTypes.length === 0 && (
        <div className="text-center py-12">
          <Settings className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-4 text-lg text-gray-600">No expense types yet</p>
          <p className="text-sm text-gray-500">
            Create your first expense type
          </p>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingType ? "Edit Expense Type" : "Add New Expense Type"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Expense Type Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
                placeholder="e.g., Tea, Coffee, Petrol"
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
                {editingType ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExpenseTypes;
