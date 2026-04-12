import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Clipboard, Utensils, Activity, AlertTriangle, MapPin, Upload, X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

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

      <AvailableInjuries />
    </div>
  );
};

const AvailableInjuries = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState<any[]>([]);
  const [selectedReport, setSelectedReport] = useState<any | null>(null);
  const [rescueMode, setRescueMode] = useState<any | null>(null);

  useEffect(() => {
    supabase.from("injury_reports").select("*").eq("status", "pending").order("created_at", { ascending: false })
      .then(({ data }) => setReports(data ?? []));
  }, []);

  const acceptCase = async (report: any) => {
    if (!user) return;
    const { error } = await supabase.from("injury_reports").update({ assigned_volunteer_id: user.id, status: "accepted" }).eq("id", report.id);
    if (!error) {
      await supabase.from("activity_logs").insert({ user_id: user.id, action: "Accepted rescue case", entity_type: "injury_report", entity_id: report.id });
      setReports((p) => p.filter((r) => r.id !== report.id));
      setSelectedReport(null);
      setRescueMode({ ...report, status: "accepted", assigned_volunteer_id: user.id });
      toast.success("Case accepted! Complete the rescue operation.");
    }
  };

  const updateRescue = async (id: string, updates: Partial<{ treatment_type: string; treatment_notes: string; severity: string; proof_image_url: string; status: string }>) => {
    const { error } = await supabase.from("injury_reports").update(updates).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Updated!");
    setRescueMode((prev: any) => prev ? { ...prev, ...updates } : null);
  };

  const uploadProof = async (id: string, file: File) => {
    const path = `proofs/${user!.id}/${Date.now()}.${file.name.split(".").pop()}`;
    const { error } = await supabase.storage.from("uploads").upload(path, file);
    if (error) { toast.error("Upload failed"); return; }
    const { data } = supabase.storage.from("uploads").getPublicUrl(path);
    await updateRescue(id, { proof_image_url: data.publicUrl });
    toast.success("Proof uploaded!");
  };

  const submitRescue = async () => {
    if (!rescueMode) return;
    if (!rescueMode.treatment_type) { toast.error("Select a treatment type"); return; }
    if (!rescueMode.proof_image_url) { toast.error("Upload proof of rescue"); return; }
    const { error } = await supabase.from("injury_reports").update({ status: "completed" }).eq("id", rescueMode.id);
    if (error) { toast.error(error.message); return; }
    await supabase.from("activity_logs").insert({ user_id: user!.id, action: "Completed rescue", entity_type: "injury_report", entity_id: rescueMode.id, details: `Treatment: ${rescueMode.treatment_type}` });
    toast.success("Rescue operation submitted!");
    setRescueMode(null);
  };

  // Rescue operation mode
  if (rescueMode) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-display text-foreground">Rescue Operation</h3>
          <Button variant="outline" size="sm" className="rounded-2xl" onClick={() => setRescueMode(null)}>← Back</Button>
        </div>
        <div className="bg-card rounded-3xl p-8 shadow-sm space-y-5 max-w-3xl">
          <h2 className="text-2xl font-display text-foreground">{rescueMode.title}</h2>
          {rescueMode.image_url && <img src={rescueMode.image_url} alt="" className="w-full max-h-64 object-cover rounded-2xl" />}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="text-muted-foreground">Location:</span><p className="text-foreground">{rescueMode.location}</p></div>
            <div><span className="text-muted-foreground">Severity:</span><p className="text-foreground capitalize">{rescueMode.severity}</p></div>
          </div>
          {rescueMode.description && <p className="text-sm text-muted-foreground">{rescueMode.description}</p>}
          {rescueMode.ai_summary && <div className="bg-accent/10 rounded-2xl p-4"><p className="text-sm text-accent font-semibold">AI Summary</p><p className="text-sm">{rescueMode.ai_summary}</p></div>}

          {rescueMode.location && (
            <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(rescueMode.location)}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-primary text-sm font-medium">
              <MapPin className="h-4 w-4" /> Navigate to Location
            </a>
          )}

          <div>
            <p className="text-sm font-medium text-foreground mb-2">Treatment Type *</p>
            <Select value={rescueMode.treatment_type || ""} onValueChange={(v) => updateRescue(rescueMode.id, { treatment_type: v, severity: v === "first_aid" ? "low" : "high" })}>
              <SelectTrigger className="rounded-2xl bg-muted/50 border-0 h-12"><SelectValue placeholder="Select treatment" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="first_aid">Treat on Spot / First Aid</SelectItem>
                <SelectItem value="veterinarian">Take to Veterinarian</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <p className="text-sm font-medium text-foreground mb-2">Treatment Notes</p>
            <Textarea className="rounded-2xl bg-muted/50 border-0" defaultValue={rescueMode.treatment_notes || ""} onBlur={(e) => updateRescue(rescueMode.id, { treatment_notes: e.target.value })} />
          </div>

          <div>
            <p className="text-sm font-medium text-foreground mb-2">Upload Proof of Rescue *</p>
            <label className="flex items-center gap-2 cursor-pointer text-accent text-sm font-medium">
              <Upload className="h-4 w-4" /> Upload Image
              <input type="file" accept="image/*" className="hidden" onChange={(e) => { if (e.target.files?.[0]) uploadProof(rescueMode.id, e.target.files[0]); }} />
            </label>
            {rescueMode.proof_image_url && <img src={rescueMode.proof_image_url} alt="Proof" className="mt-3 max-h-40 rounded-xl object-cover" />}
          </div>

          <Button onClick={submitRescue} className="w-full rounded-2xl h-12 bg-primary text-primary-foreground font-semibold">
            Submit Rescue Operation
          </Button>
        </div>
      </div>
    );
  }

  // Detail view popup
  if (selectedReport) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-display text-foreground">Injury Case Details</h3>
          <Button variant="outline" size="sm" className="rounded-2xl" onClick={() => setSelectedReport(null)}>← Back</Button>
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
        {reports.map((r) => (
          <button key={r.id} onClick={() => setSelectedReport(r)} className="bg-card rounded-2xl p-5 shadow-sm space-y-3 text-left hover:shadow-md transition-shadow">
            {r.image_url && <img src={r.image_url} alt={r.title} className="w-full h-32 object-cover rounded-xl" />}
            <p className="font-medium text-foreground">{r.title}</p>
            <p className="text-xs text-muted-foreground">{r.location}</p>
            {r.description && <p className="text-sm text-muted-foreground line-clamp-2">{r.description}</p>}
            <span className="inline-block text-xs px-3 py-1 rounded-full font-medium bg-coral/20 text-coral">View Details →</span>
          </button>
        ))}
        {reports.length === 0 && <p className="text-sm text-muted-foreground">No pending cases.</p>}
      </div>
    </div>
  );
};

export default VolunteerDashboard;
