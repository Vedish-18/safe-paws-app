import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Heart, Utensils, IndianRupee, Users } from "lucide-react";

const AdminDashboard = () => {
  const [stats, setStats] = useState({ rescues: 0, foodDonations: 0, moneyRaised: 0, users: 0 });

  useEffect(() => {
    const fetch = async () => {
      const [r, f, m, u] = await Promise.all([
        supabase.from("injury_reports").select("*", { count: "exact", head: true }),
        supabase.from("food_donations").select("*", { count: "exact", head: true }),
        supabase.from("money_donations").select("amount"),
        supabase.from("profiles").select("*", { count: "exact", head: true }),
      ]);
      setStats({
        rescues: r.count ?? 0,
        foodDonations: f.count ?? 0,
        moneyRaised: m.data?.reduce((s, d) => s + Number(d.amount), 0) ?? 0,
        users: u.count ?? 0,
      });
    };
    fetch();
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
    </div>
  );
};

export default AdminDashboard;
