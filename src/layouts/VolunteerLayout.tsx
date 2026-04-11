import { LayoutDashboard, Clipboard, Utensils, Activity } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";

const VolunteerLayout = () => (
  <DashboardLayout
    role="volunteer"
    navItems={[
      { label: "Dashboard", path: "/volunteer", icon: <LayoutDashboard className="h-5 w-5" /> },
      { label: "Operations", path: "/volunteer/operations", icon: <Clipboard className="h-5 w-5" /> },
      { label: "Food Donations", path: "/volunteer/food-donations", icon: <Utensils className="h-5 w-5" /> },
      { label: "Activity", path: "/volunteer/activity", icon: <Activity className="h-5 w-5" /> },
    ]}
  />
);

export default VolunteerLayout;
