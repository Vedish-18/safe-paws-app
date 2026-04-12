import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Heart, Utensils, IndianRupee, Users } from "lucide-react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from "recharts";

const COLORS = ["hsl(0,80%,65%)", "hsl(170,60%,45%)", "hsl(215,70%,30%)", "hsl(40,80%,55%)"];

const AdminDashboard = () => {
  const [stats, setStats] = useState({ rescues: 0, foodDonations: 0, moneyRaised: 0, users: 0 });
  const [roleCounts, setRoleCounts] = useState<{ name: string; value: number }[]>([]);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [overviewData, setOverviewData] = useState<{ name: string; value: number }[]>([]);

  useEffect(() => {
    const fetchAll = async () => {
      const [r, f, m, u, roles, injuries, foods] = await Promise.all([
        supabase.from("injury_reports").select("*", { count: "exact", head: true }),
        supabase.from("food_donations").select("*", { count: "exact", head: true }),
        supabase.from("money_donations").select("amount"),
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("user_roles").select("role"),
        supabase.from("injury_reports").select("created_at"),
        supabase.from("food_donations").select("created_at"),
      ]);

      const rescues = r.count ?? 0;
      const foodDonations = f.count ?? 0;
      const moneyRaised = m.data?.reduce((s, d) => s + Number(d.amount), 0) ?? 0;
      const usersCount = u.count ?? 0;

      setStats({ rescues, foodDonations, moneyRaised, users: usersCount });

      // Overview bar chart data
      setOverviewData([
        { name: "Animals Rescued", value: rescues },
        { name: "Food Donations", value: foodDonations },
        { name: "Money Raised (₹)", value: moneyRaised },
      ]);

      // Role distribution
      const rc: Record<string, number> = {};
      roles.data?.forEach((r) => { rc[r.role] = (rc[r.role] || 0) + 1; });
      setRoleCounts(Object.entries(rc).map(([name, value]) => ({ name, value })));

      // Monthly activity (last 6 months)
      const months: Record<string, { injuries: number; food: number }> = {};
      const now = new Date();
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = d.toLocaleString("default", { month: "short", year: "2-digit" });
        months[key] = { injuries: 0, food: 0 };
      }
      injuries.data?.forEach((item) => {
        const d = new Date(item.created_at);
        const key = d.toLocaleString("default", { month: "short", year: "2-digit" });
        if (months[key]) months[key].injuries++;
      });
      foods.data?.forEach((item) => {
        const d = new Date(item.created_at);
        const key = d.toLocaleString("default", { month: "short", year: "2-digit" });
        if (months[key]) months[key].food++;
      });
      setMonthlyData(Object.entries(months).map(([month, v]) => ({ month, ...v })));
    };
    fetchAll();
  }, []);

  const cards = [
    { label: "Animals Rescued", value: stats.rescues, icon: <Heart className="h-8 w-8 text-coral" /> },
    { label: "Food Donations", value: stats.foodDonations, icon: <Utensils className="h-8 w-8 text-accent" /> },
    { label: "Money Raised", value: `₹${stats.moneyRaised.toLocaleString()}`, icon: <IndianRupee className="h-8 w-8 text-primary" /> },
    { label: "Total Users", value: stats.users, icon: <Users className="h-8 w-8 text-teal" /> },
  ];

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-widest text-accent font-semibold">Admin</p>
        <h2 className="text-2xl font-display text-foreground mt-1">Dashboard Overview</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="bg-card rounded-3xl p-6 shadow-sm">
            {c.icon}
            <p className="text-3xl font-bold text-foreground mt-3">{c.value}</p>
            <p className="text-sm text-muted-foreground">{c.label}</p>
          </div>
        ))}
      </div>

      {/* Overview Graph - Total counts */}
      <div className="bg-card rounded-3xl p-6 shadow-sm">
        <h3 className="text-lg font-display text-foreground mb-4">Total Overview</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={overviewData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="name" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
            <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
            <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px", color: "hsl(var(--foreground))" }} />
            <Bar dataKey="value" name="Count" radius={[6, 6, 0, 0]}>
              {overviewData.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Activity Bar Chart */}
        <div className="bg-card rounded-3xl p-6 shadow-sm">
          <h3 className="text-lg font-display text-foreground mb-4">Monthly Activity</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
              <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px", color: "hsl(var(--foreground))" }} />
              <Legend />
              <Bar dataKey="injuries" name="Injury Reports" fill="hsl(0,80%,65%)" radius={[6, 6, 0, 0]} />
              <Bar dataKey="food" name="Food Donations" fill="hsl(170,60%,45%)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Role Distribution Pie Chart */}
        <div className="bg-card rounded-3xl p-6 shadow-sm">
          <h3 className="text-lg font-display text-foreground mb-4">User Roles Distribution</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={roleCounts} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {roleCounts.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px", color: "hsl(var(--foreground))" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
