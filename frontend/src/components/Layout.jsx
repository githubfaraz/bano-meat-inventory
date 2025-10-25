import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, Package, Users, ShoppingCart, TrendingUp, LogOut, Store, 
  ShoppingBag, FileText, UserCog, List, Box, Warehouse, PieChart, Trash2 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const Layout = ({ setAuth }) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get current user from localStorage
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = user?.is_admin || false;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setAuth(false);
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const navItems = [
    { path: "/", icon: LayoutDashboard, label: "Dashboard" },
    // Inventory System
    { path: "/main-categories", icon: List, label: "Main Categories", section: "new", adminOnly: true },
    { path: "/derived-products", icon: Box, label: "Derived Products", section: "new", adminOnly: true },
    { path: "/inventory-management", icon: Warehouse, label: "Inventory", section: "new" },
    { path: "/daily-pieces-tracking", icon: PieChart, label: "Daily Pieces", section: "new" },
    { path: "/daily-waste-tracking", icon: Trash2, label: "Daily Waste", section: "new" },
    { path: "/new-pos", icon: ShoppingCart, label: "New POS", section: "new" },
    // General
    { path: "/sales", icon: TrendingUp, label: "Sales", section: "common" },
    { path: "/vendors", icon: Store, label: "Vendors", section: "common" },
    { path: "/customers", icon: Users, label: "Customers", section: "common" },
    { path: "/reports", icon: FileText, label: "Reports", section: "common" },
    { path: "/users", icon: UserCog, label: "Users", adminOnly: true, section: "common" },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <img 
              src="https://customer-assets.emergentagent.com/job_98f43d7c-462e-47e8-bf72-c54d3fbfbeeb/artifacts/kkp6xmyc_bano_fresh_logo.png" 
              alt="Bano Fresh Logo" 
              className="h-12 w-12 object-contain"
            />
            <h1 className="text-2xl font-bold text-emerald-600" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Bano Fresh
            </h1>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {/* New Inventory System */}
          <div className="mb-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-4">
              Inventory System
            </p>
            {navItems
              .filter((item) => item.section === "new" && (!item.adminOnly || isAdmin))
              .map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? "bg-emerald-50 text-emerald-600 font-semibold"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                    data-testid={`nav-${item.label.toLowerCase()}`}
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                );
              })}
          </div>

          {/* Common/General */}
          <div className="mb-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-4">
              General
            </p>
            {navItems
              .filter((item) => item.section === "common" && (!item.adminOnly || isAdmin))
              .map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? "bg-emerald-50 text-emerald-600 font-semibold"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                    data-testid={`nav-${item.label.toLowerCase()}`}
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                );
              })}
          </div>
        </nav>

        <div className="p-4 border-t border-gray-200">
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="w-full justify-start gap-3 text-red-600 hover:text-red-700 hover:bg-red-50"
            data-testid="logout-button"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
