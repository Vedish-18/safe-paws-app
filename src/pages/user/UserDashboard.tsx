import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { AlertTriangle, Utensils, IndianRupee, Activity, FileText } from "lucide-react";

const UserDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ reports: 0, foodDonations: 0, moneyTotal: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        if (!user) return;
        const [rep, food, money] = await Promise.all([
          supabase.from("injury_reports").select("*", { count: "exact", head: true }).eq("reporter_id", user.id),
          supabase.from("food_donations").select("*", { count: "exact", head: true }).eq("donor_id", user.id),
          supabase.from("money_donations").select("amount").eq("donor_id", user.id),
        ]);
        setStats({
          reports: rep.count ?? 0,
          foodDonations: food.count ?? 0,
          moneyTotal: money.data?.reduce((s, r) => s + Number(r.amount), 0) ?? 0,
        });
      } catch {} finally { setLoading(false); }
    };
    fetchStats();
  }, [user]);

  const cards = [
    { label: "Report Injury", icon: <AlertTriangle className="h-8 w-8" />, path: "/user/report-injury", color: "text-coral" },
    { label: "Food Donation", icon: <Utensils className="h-8 w-8" />, path: "/user/food-donation", color: "text-accent" },
    { label: "Money Donation", icon: <IndianRupee className="h-8 w-8" />, path: "/user/money-donation", color: "text-primary" },
    { label: "Activity", icon: <Activity className="h-8 w-8" />, path: "/user/activity", color: "text-teal" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-widest text-accent font-semibold">Dashboard</p>
        <h2 className="text-2xl font-display text-foreground mt-1">Welcome Back</h2>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <FileText className="h-6 w-6 text-coral" />
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.reports}</p>
              <p className="text-sm text-muted-foreground">Reports Filed</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <Utensils className="h-6 w-6 text-accent" />
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.foodDonations}</p>
              <p className="text-sm text-muted-foreground">Food Donations</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <IndianRupee className="h-6 w-6 text-primary" />
            <div>
              <p className="text-2xl font-bold text-foreground">₹{stats.moneyTotal.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Total Donated</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map((c) => (
          <Link key={c.path} to={c.path} className="bg-card rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow text-center group">
            <div className={`${c.color} flex justify-center mb-3 group-hover:scale-110 transition-transform`}>{c.icon}</div>
            <p className="text-sm font-medium text-foreground">{c.label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default UserDashboard;
