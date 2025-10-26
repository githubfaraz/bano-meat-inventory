import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Trash2, TrendingDown, Calendar, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Button } from "../components/ui/button";

const DailyWasteTracking = () => {
  const [categories, setCategories] = useState([]);
  const [wasteRecords, setWasteRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    main_category_id: "",
    waste_kg: "",
    notes: "",
  });

  const API_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8001";

  useEffect(() => {
    fetchCategories();
    fetchWasteRecords();
  }, []);

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

  const fetchWasteRecords = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/api/daily-waste-tracking`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWasteRecords(response.data);
    } catch (error) {
      toast.error("Failed to fetch waste records");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    const wasteKg = parseFloat(formData.waste_kg);
    
    if (wasteKg <= 0) {
      toast.error("Waste weight must be greater than 0");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const data = {
        ...formData,
        waste_kg: wasteKg,
      };

      await axios.post(`${API_URL}/api/daily-waste-tracking`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      toast.success("Waste record saved successfully!");
      fetchWasteRecords();
      resetForm();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to save waste record");
    }
  };

  const resetForm = () => {
    setFormData({
      main_category_id: "",
      waste_kg: "",
      notes: "",
    });
    setDialogOpen(false);
  };

  const getTodayRecords = () => {
    const today = new Date().toISOString().split('T')[0];
    return wasteRecords.filter(record => record.tracking_date === today);
  };

  const getHistoricalRecords = () => {
    const today = new Date().toISOString().split('T')[0];
    return wasteRecords.filter(record => record.tracking_date !== today);
  };

  if (loading) {
    return <div className="p-8">Loading waste tracking...</div>;
  }

  const todayRecords = getTodayRecords();
  const historicalRecords = getHistoricalRecords();

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Daily Waste Tracking</h1>
          <p className="text-gray-600 mt-1">Record end-of-day processing and waste</p>
        </div>
        <Button
          onClick={() => setDialogOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Record Waste Entry
        </Button>
      </div>

      {/* Today's Records */}
      {todayRecords.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-emerald-600" />
            Today's Waste Records
          </h2>
          <div className="space-y-3">
            {todayRecords.map((record) => (
              <Card key={record.id} className="bg-emerald-50 border-emerald-200">
                <CardContent className="pt-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-emerald-900">
                          {record.main_category_name}
                        </h3>
                        <span className="text-xs text-gray-500">
                          {new Date(record.created_at).toLocaleTimeString('en-IN', { 
                            hour: '2-digit', 
                            minute: '2-digit',
                            hour12: true 
                          })}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Waste Amount</p>
                          <p className="font-semibold text-red-600">{record.waste_kg} kg</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Deducted From</p>
                          <p className="font-semibold text-gray-900">Inventory Stock</p>
                        </div>
                      </div>
                      {record.notes && (
                        <p className="text-sm text-gray-600 mt-2">
                          Notes: {record.notes}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Historical Records */}
      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <TrendingDown className="h-5 w-5 text-gray-600" />
          Historical Waste Records
        </h2>
        
        {historicalRecords.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Trash2 className="mx-auto h-12 w-12 text-gray-400 mb-3" />
              <p className="text-lg text-gray-600">No historical waste records</p>
              <p className="text-sm text-gray-500 mt-1">
                Start tracking daily waste to see historical data
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {historicalRecords.map((record) => (
              <Card key={record.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {record.main_category_name}
                        </h3>
                        <span className="text-sm text-gray-500">
                          {new Date(record.tracking_date).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Waste Amount</p>
                          <p className="font-semibold text-red-600">{record.waste_kg} kg</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Deducted From</p>
                          <p className="font-semibold text-gray-900">Inventory Stock</p>
                        </div>
                      </div>
                      {record.notes && (
                        <p className="text-sm text-gray-600 mt-2">
                          Notes: {record.notes}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Dialog for adding waste record */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Record Waste Entry</DialogTitle>
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
                Waste Amount (kg) *
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.waste_kg}
                onChange={(e) =>
                  setFormData({ ...formData, waste_kg: e.target.value })
                }
                className="w-full border rounded-lg px-3 py-2"
                placeholder="e.g., 15.00"
              />
              <p className="text-xs text-gray-500 mt-1">
                Total waste in kg to be deducted from inventory
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-blue-900 mb-1">
                    ℹ️ Note
                  </p>
                  <p className="text-sm text-blue-800">
                    This waste amount will be directly deducted from your inventory stock using FIFO (First In, First Out) method.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Notes (Optional)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                className="w-full border rounded-lg px-3 py-2"
                rows="3"
                placeholder="Optional notes about this waste entry..."
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
                Submit Waste Record
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DailyWasteTracking;
