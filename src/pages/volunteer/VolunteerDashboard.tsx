import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Clipboard, Utensils, Activity, AlertTriangle } from "lucide-react";

const VolunteerDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ operations: 0, foodPickups: 0, pendingCases: 0 });

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const [ops, food, pending] = await Promise.all([
        supabase.from("injury_reports").select("*", { count: "exact", head: true }).eq("assigned_volunteer_id", user.id),
        supabase.from("food_donations").select("*", { count: "exact", head: true }).eq("volunteer_id", user.id),
        supabase.from("injury_reports").select("*", { count: "exact", head: true }).eq("status", "pending"),
      ]);
      setStats({ operations: ops.count ?? 0, foodPickups: food.count ?? 0, pendingCases: pending.count ?? 0 });
    };
    fetch();
  }, [user]);

  const cards = [
    { label: "Operations", icon: <Clipboard className="h-8 w-8" />, path: "/volunteer/operations", color: "text-primary" },
    { label: "Food Pickups", icon: <Utensils className="h-8 w-8" />, path: "/volunteer/food-donations", color: "text-accent" },
    { label: "Activity", icon: <Activity className="h-8 w-8" />, path: "/volunteer/activity", color: "text-teal" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-widest text-accent font-semibold">Dashboard</p>
        <h2 className="text-2xl font-display text-foreground mt-1">Volunteer Hub</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card rounded-3xl p-6 shadow-sm">
          <Clipboard className="h-6 w-6 text-primary mb-2" />
          <p className="text-2xl font-bold text-foreground">{stats.operations}</p>
          <p className="text-sm text-muted-foreground">Operations Done</p>
        </div>
        <div className="bg-card rounded-3xl p-6 shadow-sm">
          <Utensils className="h-6 w-6 text-accent mb-2" />
          <p className="text-2xl font-bold text-foreground">{stats.foodPickups}</p>
          <p className="text-sm text-muted-foreground">Food Pickups</p>
        </div>
        <div className="bg-card rounded-3xl p-6 shadow-sm">
          <AlertTriangle className="h-6 w-6 text-coral mb-2" />
          <p className="text-2xl font-bold text-foreground">{stats.pendingCases}</p>
          <p className="text-sm text-muted-foreground">Pending Cases</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cards.map((c) => (
          <Link key={c.path} to={c.path} className="bg-card rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow text-center group">
            <div className={`${c.color} flex justify-center mb-3 group-hover:scale-110 transition-transform`}>{c.icon}</div>
            <p className="text-sm font-medium text-foreground">{c.label}</p>
          </Link>
        ))}
      </div>

      {/* Available Injuries */}
      <AvailableInjuries />
    </div>
  );
};

const AvailableInjuries = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState<any[]>([]);

  useEffect(() => {
    supabase.from("injury_reports").select("*").eq("status", "pending").order("created_at", { ascending: false })
      .then(({ data }) => setReports(data ?? []));
  }, []);

  const acceptCase = async (id: string) => {
    if (!user) return;
    const { error } = await supabase.from("injury_reports").update({ assigned_volunteer_id: user.id, status: "accepted" }).eq("id", id);
    if (!error) {
      await supabase.from("activity_logs").insert({ user_id: user.id, action: "Accepted rescue case", entity_type: "injury_report", entity_id: id });
      setReports((p) => p.filter((r) => r.id !== id));
    }
  };

  return (
    <div>
      <h3 className="text-lg font-display text-foreground mb-4">Available Injury Cases</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reports.map((r) => (
          <div key={r.id} className="bg-card rounded-2xl p-5 shadow-sm space-y-3">
            {r.image_url && <img src={r.image_url} alt={r.title} className="w-full h-32 object-cover rounded-xl" />}
            <p className="font-medium text-foreground">{r.title}</p>
            <p className="text-xs text-muted-foreground">{r.location}</p>
            {r.description && <p className="text-sm text-muted-foreground line-clamp-2">{r.description}</p>}
            <button onClick={() => acceptCase(r.id)} className="text-sm text-accent font-semibold hover:underline">Accept Case →</button>
          </div>
        ))}
        {reports.length === 0 && <p className="text-sm text-muted-foreground">No pending cases.</p>}
      </div>
    </div>
  );
};

export default VolunteerDashboard;
