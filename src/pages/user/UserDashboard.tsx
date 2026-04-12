import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { AlertTriangle, Utensils, IndianRupee, Activity, FileText } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const COLORS = ["hsl(0,80%,65%)", "hsl(170,60%,45%)", "hsl(215,70%,30%)", "hsl(40,80%,55%)"];

const UserDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ reports: 0, foodDonations: 0, moneyTotal: 0 });
  const [monthlyData, setMonthlyData] = useState<{ month: string; reports: number; food: number; money: number }[]>([]);
  const [actionSplit, setActionSplit] = useState<{ name: string; value: number }[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;

      const [rep, food, money] = await Promise.all([
        supabase.from("injury_reports").select("created_at", { count: "exact" }).eq("reporter_id", user.id),
        supabase.from("food_donations").select("created_at", { count: "exact" }).eq("donor_id", user.id),
        supabase.from("money_donations").select("amount, created_at").eq("donor_id", user.id),
      ]);

      const reports = rep.count ?? 0;
      const foodDonations = food.count ?? 0;
      const moneyTotal = money.data?.reduce((sum, row) => sum + Number(row.amount), 0) ?? 0;

      setStats({ reports, foodDonations, moneyTotal });
      setActionSplit([
        { name: "Reports", value: reports },
        { name: "Food Donations", value: foodDonations },
        { name: "Money Donations", value: money.data?.length ?? 0 },
      ]);

      const months: Record<string, { reports: number; food: number; money: number }> = {};
      const now = new Date();
      for (let index = 5; index >= 0; index--) {
        const date = new Date(now.getFullYear(), now.getMonth() - index, 1);
        const key = date.toLocaleString("default", { month: "short", year: "2-digit" });
        months[key] = { reports: 0, food: 0, money: 0 };
      }

      rep.data?.forEach((item) => {
        const key = new Date(item.created_at).toLocaleString("default", { month: "short", year: "2-digit" });
        if (months[key]) months[key].reports++;
      });

      food.data?.forEach((item) => {
        const key = new Date(item.created_at).toLocaleString("default", { month: "short", year: "2-digit" });
        if (months[key]) months[key].food++;
      });

      money.data?.forEach((item) => {
        const key = new Date(item.created_at).toLocaleString("default", { month: "short", year: "2-digit" });
        if (months[key]) months[key].money++;
      });

      setMonthlyData(Object.entries(months).map(([month, value]) => ({ month, ...value })));
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
              <p className="text-2xl font-bold text-foreground">Rs {stats.moneyTotal.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Total Donated</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map((card) => (
          <Link key={card.path} to={card.path} className="bg-card rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow text-center group">
            <div className={`${card.color} flex justify-center mb-3 group-hover:scale-110 transition-transform`}>{card.icon}</div>
            <p className="text-sm font-medium text-foreground">{card.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-card rounded-3xl p-6 shadow-sm">
          <h3 className="text-lg font-display text-foreground mb-4">Your Monthly Contributions</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
              <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px", color: "hsl(var(--foreground))" }} />
              <Legend />
              <Bar dataKey="reports" name="Reports" fill={COLORS[0]} radius={[6, 6, 0, 0]} />
              <Bar dataKey="food" name="Food Donations" fill={COLORS[1]} radius={[6, 6, 0, 0]} />
              <Bar dataKey="money" name="Money Donations" fill={COLORS[2]} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card rounded-3xl p-6 shadow-sm">
          <h3 className="text-lg font-display text-foreground mb-4">Action Breakdown</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={actionSplit.filter((item) => item.value > 0)} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {actionSplit.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px", color: "hsl(var(--foreground))" }} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
