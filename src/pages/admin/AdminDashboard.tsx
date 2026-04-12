import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Heart, Utensils, HandCoins, Users } from "lucide-react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const COLORS = ["hsl(0,80%,65%)", "hsl(170,60%,45%)", "hsl(215,70%,30%)", "hsl(40,80%,55%)"];

const AdminDashboard = () => {
  const [stats, setStats] = useState({ rescues: 0, foodDonations: 0, moneyDonations: 0, users: 0 });
  const [roleCounts, setRoleCounts] = useState<{ name: string; value: number }[]>([]);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [overviewData, setOverviewData] = useState<{ name: string; value: number }[]>([]);

  useEffect(() => {
    const fetchAll = async () => {
      const [rescuesResult, foodResult, moneyResult, usersResult, roles, injuries, foods] = await Promise.all([
        supabase.from("injury_reports").select("*", { count: "exact", head: true }).eq("status", "completed"),
        supabase.from("food_donations").select("*", { count: "exact", head: true }),
        supabase.from("money_donations").select("*", { count: "exact", head: true }),
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("user_roles").select("role"),
        supabase.from("injury_reports").select("created_at, status"),
        supabase.from("food_donations").select("created_at"),
      ]);

      const rescues = rescuesResult.count ?? 0;
      const foodDonations = foodResult.count ?? 0;
      const moneyDonations = moneyResult.count ?? 0;
      const usersCount = usersResult.count ?? 0;

      setStats({ rescues, foodDonations, moneyDonations, users: usersCount });
      setOverviewData([
        { name: "Animals Rescued", value: rescues },
        { name: "Food Donations", value: foodDonations },
        { name: "Money Donations", value: moneyDonations },
      ]);

      const roleCountMap: Record<string, number> = {};
      roles.data?.forEach((role) => {
        roleCountMap[role.role] = (roleCountMap[role.role] || 0) + 1;
      });
      setRoleCounts(Object.entries(roleCountMap).map(([name, value]) => ({ name, value })));

      const months: Record<string, { injuries: number; food: number }> = {};
      const now = new Date();
      for (let index = 5; index >= 0; index--) {
        const date = new Date(now.getFullYear(), now.getMonth() - index, 1);
        const key = date.toLocaleString("default", { month: "short", year: "2-digit" });
        months[key] = { injuries: 0, food: 0 };
      }

      injuries.data?.forEach((item) => {
        if (item.status !== "completed") return;
        const date = new Date(item.created_at);
        const key = date.toLocaleString("default", { month: "short", year: "2-digit" });
        if (months[key]) months[key].injuries++;
      });

      foods.data?.forEach((item) => {
        const date = new Date(item.created_at);
        const key = date.toLocaleString("default", { month: "short", year: "2-digit" });
        if (months[key]) months[key].food++;
      });

      setMonthlyData(Object.entries(months).map(([month, value]) => ({ month, ...value })));
    };

    fetchAll();
  }, []);

  const cards = [
    { label: "Animals Rescued", value: stats.rescues, icon: <Heart className="h-8 w-8 text-coral" /> },
    { label: "Food Donations", value: stats.foodDonations, icon: <Utensils className="h-8 w-8 text-accent" /> },
    { label: "Money Donations", value: stats.moneyDonations, icon: <HandCoins className="h-8 w-8 text-primary" /> },
    { label: "Total Users", value: stats.users, icon: <Users className="h-8 w-8 text-teal" /> },
  ];

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-widest text-accent font-semibold">Admin</p>
        <h2 className="text-2xl font-display text-foreground mt-1">Dashboard Overview</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div key={card.label} className="bg-card rounded-3xl p-6 shadow-sm">
            {card.icon}
            <p className="text-3xl font-bold text-foreground mt-3">{card.value}</p>
            <p className="text-sm text-muted-foreground">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-card rounded-3xl p-6 shadow-sm">
        <h3 className="text-lg font-display text-foreground mb-4">Total Overview</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={overviewData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="name" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
            <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
            <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px", color: "hsl(var(--foreground))" }} />
            <Bar dataKey="value" name="Count" radius={[6, 6, 0, 0]}>
              {overviewData.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-3xl p-6 shadow-sm">
          <h3 className="text-lg font-display text-foreground mb-4">Monthly Activity</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
              <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px", color: "hsl(var(--foreground))" }} />
              <Legend />
              <Bar dataKey="injuries" name="Animals Rescued" fill="hsl(0,80%,65%)" radius={[6, 6, 0, 0]} />
              <Bar dataKey="food" name="Food Donations" fill="hsl(170,60%,45%)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card rounded-3xl p-6 shadow-sm">
          <h3 className="text-lg font-display text-foreground mb-4">User Roles Distribution</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={roleCounts} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {roleCounts.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
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
