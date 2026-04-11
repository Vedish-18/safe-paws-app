import { LayoutDashboard, AlertTriangle, Utensils, IndianRupee, Activity } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";

const UserLayout = () => (
  <DashboardLayout
    role="user"
    navItems={[
      { label: "Dashboard", path: "/user", icon: <LayoutDashboard className="h-5 w-5" /> },
      { label: "Report Injury", path: "/user/report-injury", icon: <AlertTriangle className="h-5 w-5" /> },
      { label: "Food Donation", path: "/user/food-donation", icon: <Utensils className="h-5 w-5" /> },
      { label: "Money Donation", path: "/user/money-donation", icon: <IndianRupee className="h-5 w-5" /> },
      { label: "Activity", path: "/user/activity", icon: <Activity className="h-5 w-5" /> },
    ]}
  />
);

export default UserLayout;
