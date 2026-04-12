import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Clipboard, Utensils, Activity, AlertTriangle, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const COLORS = ["hsl(215,70%,30%)", "hsl(170,60%,45%)", "hsl(0,80%,65%)", "hsl(40,80%,55%)"];

const VolunteerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ operations: 0, foodPickups: 0, pendingCases: 0 });
  const [monthlyData, setMonthlyData] = useState<{ month: string; operations: number; completed: number; food: number }[]>([]);
  const [actionSplit, setActionSplit] = useState<{ name: string; value: number }[]>([]);

  const fetchStats = async () => {
    if (!user) return;

    const [ops, food, pending, operationRows, foodRows] = await Promise.all([
      supabase.from("injury_reports").select("*", { count: "exact", head: true }).eq("assigned_volunteer_id", user.id),
      supabase.from("food_donations").select("*", { count: "exact", head: true }).eq("volunteer_id", user.id),
      supabase.from("injury_reports").select("*", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("injury_reports").select("created_at, status").eq("assigned_volunteer_id", user.id),
      supabase.from("food_donations").select("created_at, status").eq("volunteer_id", user.id),
    ]);

    const operations = ops.count ?? 0;
    const foodPickups = food.count ?? 0;
    const pendingCases = pending.count ?? 0;
    const completedOperations = operationRows.data?.filter((item) => item.status === "completed").length ?? 0;

    setStats({ operations, foodPickups, pendingCases });
    setActionSplit([
      { name: "Assigned Operations", value: operations },
      { name: "Completed Rescues", value: completedOperations },
      { name: "Food Pickups", value: foodPickups },
    ]);

    const months: Record<string, { operations: number; completed: number; food: number }> = {};
    const now = new Date();
    for (let index = 5; index >= 0; index--) {
      const date = new Date(now.getFullYear(), now.getMonth() - index, 1);
      const key = date.toLocaleString("default", { month: "short", year: "2-digit" });
      months[key] = { operations: 0, completed: 0, food: 0 };
    }

    operationRows.data?.forEach((item) => {
      const key = new Date(item.created_at).toLocaleString("default", { month: "short", year: "2-digit" });
      if (!months[key]) return;
      months[key].operations++;
      if (item.status === "completed") {
        months[key].completed++;
      }
    });

    foodRows.data?.forEach((item) => {
      const key = new Date(item.created_at).toLocaleString("default", { month: "short", year: "2-digit" });
      if (months[key]) months[key].food++;
    });

    setMonthlyData(Object.entries(months).map(([month, value]) => ({ month, ...value })));
  };

  useEffect(() => {
    if (!user) return;

    fetchStats();

    const injuryChannel = supabase
      .channel(`volunteer-dashboard-injury-${user.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "injury_reports" }, fetchStats)
      .subscribe();

    const foodChannel = supabase
      .channel(`volunteer-dashboard-food-${user.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "food_donations" }, fetchStats)
      .subscribe();

    return () => {
      supabase.removeChannel(injuryChannel);
      supabase.removeChannel(foodChannel);
    };
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
          <p className="text-sm text-muted-foreground">Assigned Operations</p>
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
        {cards.map((card) => (
          <Link key={card.path} to={card.path} className="bg-card rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow text-center group">
            <div className={`${card.color} flex justify-center mb-3 group-hover:scale-110 transition-transform`}>{card.icon}</div>
            <p className="text-sm font-medium text-foreground">{card.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-card rounded-3xl p-6 shadow-sm">
          <h3 className="text-lg font-display text-foreground mb-4">Your Monthly Work</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
              <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px", color: "hsl(var(--foreground))" }} />
              <Legend />
              <Bar dataKey="operations" name="Assigned Operations" fill={COLORS[0]} radius={[6, 6, 0, 0]} />
              <Bar dataKey="completed" name="Completed Rescues" fill={COLORS[1]} radius={[6, 6, 0, 0]} />
              <Bar dataKey="food" name="Food Pickups" fill={COLORS[2]} radius={[6, 6, 0, 0]} />
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

      <AvailableInjuries onStatsChange={fetchStats} onAccepted={() => navigate("/volunteer/operations")} />
    </div>
  );
};

const AvailableInjuries = ({
  onStatsChange,
  onAccepted,
}: {
  onStatsChange: () => Promise<void>;
  onAccepted: () => void;
}) => {
  const { user } = useAuth();
  const [reports, setReports] = useState<any[]>([]);
  const [selectedReport, setSelectedReport] = useState<any | null>(null);

  const fetchReports = async () => {
    const { data } = await supabase
      .from("injury_reports")
      .select("*")
      .eq("status", "pending")
      .is("assigned_volunteer_id", null)
      .order("created_at", { ascending: false });

    setReports(data ?? []);
  };

  useEffect(() => {
    fetchReports();

    const channel = supabase
      .channel("available-injury-cases")
      .on("postgres_changes", { event: "*", schema: "public", table: "injury_reports" }, () => {
        fetchReports();
        onStatsChange();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const acceptCase = async (report: any) => {
    if (!user) return;

    const { data, error } = await supabase
      .from("injury_reports")
      .update({ assigned_volunteer_id: user.id })
      .eq("id", report.id)
      .eq("status", "pending")
      .is("assigned_volunteer_id", null)
      .select("*")
      .single();

    if (error || !data) {
      toast.error(error?.message || "This case is no longer available.");
      fetchReports();
      onStatsChange();
      return;
    }

    await supabase.from("activity_logs").insert({
      user_id: user.id,
      action: "Accepted rescue case",
      entity_type: "injury_report",
      entity_id: report.id,
    });

    setReports((current) => current.filter((item) => item.id !== report.id));
    setSelectedReport(null);
    await onStatsChange();
    toast.success("Case assigned to you and moved to your operations page.");
    onAccepted();
  };

  if (selectedReport) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-display text-foreground">Injury Case Details</h3>
          <Button variant="outline" size="sm" className="rounded-2xl" onClick={() => setSelectedReport(null)}>
            Back
          </Button>
        </div>
        <div className="bg-card rounded-3xl p-8 shadow-sm space-y-5 max-w-3xl">
          <h2 className="text-2xl font-display text-foreground">{selectedReport.title}</h2>
          {selectedReport.image_url && <img src={selectedReport.image_url} alt="" className="w-full max-h-64 object-cover rounded-2xl" />}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="text-muted-foreground">Location:</span><p className="text-foreground">{selectedReport.location || "Not specified"}</p></div>
            <div><span className="text-muted-foreground">Status:</span><p className="text-foreground capitalize">{selectedReport.status}</p></div>
            <div><span className="text-muted-foreground">Severity:</span><p className="text-foreground capitalize">{selectedReport.severity || "Unknown"}</p></div>
            <div><span className="text-muted-foreground">Reported:</span><p className="text-foreground">{new Date(selectedReport.created_at).toLocaleDateString()}</p></div>
          </div>
          {selectedReport.description && <p className="text-sm text-foreground">{selectedReport.description}</p>}
          {selectedReport.ai_summary && <div className="bg-accent/10 rounded-2xl p-4"><p className="text-sm text-accent font-semibold">AI Summary</p><p className="text-sm">{selectedReport.ai_summary}</p></div>}
          {selectedReport.location && (
            <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedReport.location)}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-primary text-sm font-medium">
              <MapPin className="h-4 w-4" /> View on Map
            </a>
          )}
          <Button onClick={() => acceptCase(selectedReport)} className="w-full rounded-2xl h-12 bg-accent text-accent-foreground font-semibold">
            Accept This Case
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-lg font-display text-foreground mb-4">Available Injury Cases</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reports.map((report) => (
          <button key={report.id} onClick={() => setSelectedReport(report)} className="bg-card rounded-2xl p-5 shadow-sm space-y-3 text-left hover:shadow-md transition-shadow">
            {report.image_url && <img src={report.image_url} alt={report.title} className="w-full h-32 object-cover rounded-xl" />}
            <p className="font-medium text-foreground">{report.title}</p>
            <p className="text-xs text-muted-foreground">{report.location}</p>
            {report.description && <p className="text-sm text-muted-foreground line-clamp-2">{report.description}</p>}
            <span className="inline-block text-xs px-3 py-1 rounded-full font-medium bg-coral/20 text-coral">View Details</span>
          </button>
        ))}
        {reports.length === 0 && <p className="text-sm text-muted-foreground">No pending cases.</p>}
      </div>
    </div>
  );
};

export default VolunteerDashboard;
