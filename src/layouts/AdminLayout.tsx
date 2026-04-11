import { LayoutDashboard, Users, AlertTriangle, Utensils, IndianRupee } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";

const AdminLayout = () => (
  <DashboardLayout
    role="admin"
    navItems={[
      { label: "Dashboard", path: "/admin", icon: <LayoutDashboard className="h-5 w-5" /> },
      { label: "Users", path: "/admin/users", icon: <Users className="h-5 w-5" /> },
      { label: "Injury Reports", path: "/admin/injury-reports", icon: <AlertTriangle className="h-5 w-5" /> },
      { label: "Food Donations", path: "/admin/food-donations", icon: <Utensils className="h-5 w-5" /> },
      { label: "Money Donations", path: "/admin/money-donations", icon: <IndianRupee className="h-5 w-5" /> },
    ]}
  />
);

export default AdminLayout;
