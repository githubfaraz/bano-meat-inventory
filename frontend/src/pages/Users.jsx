import { useEffect, useState } from "react";
import axios from "axios";
import { API } from "@/App";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Trash2, UserCircle, Shield } from "lucide-react";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    full_name: "",
    is_admin: false,
  });

  // Check if current user is admin
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = currentUser?.is_admin || false;

  useEffect(() => {
    // If not admin, show error and don't fetch
    if (!isAdmin) {
      toast.error("Access denied: Only admin users can manage users");
      setLoading(false);
      return;
    }
    fetchUsers();
  }, [isAdmin]);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API}/users`);
      setUsers(response.data);
    } catch (error) {
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/users`, formData);
      toast.success("User created successfully");
      fetchUsers();
      setDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to create user");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await axios.delete(`${API}/users/${id}`);
      toast.success("User deleted successfully");
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to delete user");
    }
  };

  const resetForm = () => {
    setFormData({
      username: "",
      email: "",
      password: "",
      full_name: "",
      is_admin: false,
    });
  };

  if (loading) {
    return <div className="p-8">Loading users...</div>;
  }

  return (
    <div className="p-8" data-testid="users-page">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            User Management
          </h1>
          <p className="text-gray-600">Manage system users and permissions</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={resetForm} data-testid="add-user-button">
              <Plus className="h-5 w-5 mr-2" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name *</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  required
                  data-testid="user-fullname-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Username *</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                  data-testid="user-username-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  data-testid="user-email-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  data-testid="user-password-input"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_admin"
                  checked={formData.is_admin}
                  onChange={(e) => setFormData({ ...formData, is_admin: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300"
                  data-testid="user-admin-checkbox"
                />
                <Label htmlFor="is_admin" className="text-sm">
                  Administrator privileges
                </Label>
              </div>

              <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" data-testid="user-submit-button">
                Create User
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((user) => (
          <Card key={user.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    {user.full_name}
                    {user.is_admin && (
                      <Shield className="h-4 w-4 text-amber-500" title="Administrator" />
                    )}
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1">@{user.username}</p>
                </div>
                {user.username !== 'admin-bano' && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleDelete(user.id)} 
                    data-testid={`delete-user-${user.id}`}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <UserCircle className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-700">{user.email}</span>
                </div>
                <div className="text-xs text-gray-500">
                  Created: {new Date(user.created_at).toLocaleDateString()}
                </div>
                {user.username === 'admin-bano' && (
                  <div className="mt-2 px-2 py-1 bg-amber-50 text-amber-700 text-xs rounded">
                    System Administrator
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {users.length === 0 && (
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg">No users yet. Add your first user!</p>
        </div>
      )}
    </div>
  );
};

export default Users;
