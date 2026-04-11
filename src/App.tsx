import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";

import UserLayout from "./layouts/UserLayout";
import UserDashboard from "./pages/user/UserDashboard";
import ReportInjury from "./pages/user/ReportInjury";
import FoodDonation from "./pages/user/FoodDonation";
import MoneyDonation from "./pages/user/MoneyDonation";
import UserActivity from "./pages/user/UserActivity";

import VolunteerLayout from "./layouts/VolunteerLayout";
import VolunteerDashboard from "./pages/volunteer/VolunteerDashboard";
import Operations from "./pages/volunteer/Operations";
import VolunteerFoodDonations from "./pages/volunteer/VolunteerFoodDonations";
import VolunteerActivity from "./pages/volunteer/VolunteerActivity";

import AdminLayout from "./layouts/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminInjuryReports from "./pages/admin/AdminInjuryReports";
import AdminFoodDonations from "./pages/admin/AdminFoodDonations";
import AdminMoneyDonations from "./pages/admin/AdminMoneyDonations";

import Profile from "./pages/shared/Profile";
import SettingsPage from "./pages/shared/SettingsPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* User Routes */}
            <Route path="/user" element={<ProtectedRoute requiredRole="user"><UserLayout /></ProtectedRoute>}>
              <Route index element={<UserDashboard />} />
              <Route path="report-injury" element={<ReportInjury />} />
              <Route path="food-donation" element={<FoodDonation />} />
              <Route path="money-donation" element={<MoneyDonation />} />
              <Route path="activity" element={<UserActivity />} />
              <Route path="profile" element={<Profile />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>

            {/* Volunteer Routes */}
            <Route path="/volunteer" element={<ProtectedRoute requiredRole="volunteer"><VolunteerLayout /></ProtectedRoute>}>
              <Route index element={<VolunteerDashboard />} />
              <Route path="operations" element={<Operations />} />
              <Route path="food-donations" element={<VolunteerFoodDonations />} />
              <Route path="activity" element={<VolunteerActivity />} />
              <Route path="profile" element={<Profile />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>

            {/* Admin Routes */}
            <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminLayout /></ProtectedRoute>}>
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="injury-reports" element={<AdminInjuryReports />} />
              <Route path="food-donations" element={<AdminFoodDonations />} />
              <Route path="money-donations" element={<AdminMoneyDonations />} />
              <Route path="profile" element={<Profile />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
