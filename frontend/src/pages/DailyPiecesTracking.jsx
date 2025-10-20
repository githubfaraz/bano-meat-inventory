import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Plus, Calendar, TrendingDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Button } from "../components/ui/button";

const DailyPiecesTracking = () => {
  const [trackings, setTrackings] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [formData, setFormData] = useState({
    main_category_id: "",
    pieces_sold: "",
    tracking_date: new Date().toISOString().split("T")[0],
  });

  const API_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8001";

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (categories.length > 0) {
      fetchTrackings();
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
    }
  };

  const fetchTrackings = async () => {
    try {
      const token = localStorage.getItem("token");
      const url =
        selectedCategory === "all"
          ? `${API_URL}/api/daily-pieces-tracking`
          : `${API_URL}/api/daily-pieces-tracking?main_category_id=${selectedCategory}`;
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTrackings(response.data);
    } catch (error) {
      toast.error("Failed to fetch tracking data");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const data = {
        main_category_id: formData.main_category_id,
        pieces_sold: parseInt(formData.pieces_sold),
        tracking_date: formData.tracking_date,
      };

      await axios.post(`${API_URL}/api/daily-pieces-tracking`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Pieces tracking recorded successfully");
      fetchTrackings();
      resetForm();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to record tracking");
    }
  };

  const resetForm = () => {
    setFormData({
      main_category_id: "",
      pieces_sold: "",
      tracking_date: new Date().toISOString().split("T")[0],
    });
    setDialogOpen(false);
  };

  const getTodayTrackings = () => {
    const today = new Date().toISOString().split("T")[0];
    return trackings.filter((t) => t.tracking_date === today);
  };

  if (loading) {
    return <div className="p-8">Loading tracking data...</div>;
  }

  const todayTrackings = getTodayTrackings();

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Daily Pieces Tracking
        </h1>
        <Button
          onClick={() => setDialogOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Track Pieces Sold
        </Button>
      </div>

      {todayTrackings.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            Today's Tracking
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {todayTrackings.map((tracking) => (
              <Card key={tracking.id} className="bg-emerald-50">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">
                        {tracking.main_category_name}
                      </p>
                      <p className="text-2xl font-bold text-emerald-700">
                        {tracking.pieces_sold}
                      </p>
                      <p className="text-xs text-gray-500">pieces sold</p>
                    </div>
                    <TrendingDown className="h-8 w-8 text-emerald-600" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">
          Filter by Category
        </label>
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

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Tracking History</h2>
        {trackings.map((tracking) => (
          <Card key={tracking.id}>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <Calendar className="h-5 w-5 text-emerald-600" />
                  <div>
                    <p className="font-semibold text-gray-900">
                      {tracking.main_category_name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {new Date(tracking.tracking_date).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-emerald-700">
                    {tracking.pieces_sold}
                  </p>
                  <p className="text-sm text-gray-600">pieces sold</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {trackings.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-4 text-lg text-gray-600">No tracking data yet</p>
          <p className="text-sm text-gray-500">
            {selectedCategory === "all"
              ? "Start tracking daily pieces sold"
              : "No tracking data for this category"}
          </p>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Track Pieces Sold</DialogTitle>
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
              <label className="block text-sm font-medium mb-2">Date *</label>
              <input
                type="date"
                required
                value={formData.tracking_date}
                onChange={(e) =>
                  setFormData({ ...formData, tracking_date: e.target.value })
                }
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Pieces Sold *
              </label>
              <input
                type="number"
                required
                min="0"
                value={formData.pieces_sold}
                onChange={(e) =>
                  setFormData({ ...formData, pieces_sold: e.target.value })
                }
                className="w-full border rounded-lg px-3 py-2"
                placeholder="e.g., 50"
              />
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> This will automatically deduct the pieces
                from your inventory purchases (FIFO basis).
              </p>
            </div>

            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                Record Tracking
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DailyPiecesTracking;
