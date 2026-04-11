import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Search, MapPin, Upload } from "lucide-react";

const Operations = () => {
  const { user } = useAuth();
  const [ops, setOps] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [selected, setSelected] = useState<any | null>(null);

  useEffect(() => { if (user) fetchOps(); }, [user]);

  const fetchOps = async () => {
    const { data } = await supabase.from("injury_reports").select("*")
      .eq("assigned_volunteer_id", user!.id)
      .order("created_at", { ascending: sort === "oldest" });
    setOps(data ?? []);
  };

  const filtered = ops.filter((o) => o.title.toLowerCase().includes(search.toLowerCase()));

  const updateReport = async (id: string, updates: Partial<{ treatment_type: string; treatment_notes: string; severity: string; proof_image_url: string; status: string }>) => {
    const { error } = await supabase.from("injury_reports").update(updates).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Updated!");
    fetchOps();
    setSelected(null);
  };

  const uploadProof = async (id: string, file: File) => {
    const path = `proofs/${user!.id}/${Date.now()}.${file.name.split(".").pop()}`;
    await supabase.storage.from("uploads").upload(path, file);
    const { data } = supabase.storage.from("uploads").getPublicUrl(path);
    await updateReport(id, { proof_image_url: data.publicUrl, status: "completed" });
  };

  if (selected) {
    return (
      <div className="space-y-6 max-w-3xl">
        <Button variant="outline" onClick={() => setSelected(null)} className="rounded-2xl">← Back</Button>
        <div className="bg-card rounded-3xl p-8 shadow-sm space-y-5">
          <h2 className="text-2xl font-display text-foreground">{selected.title}</h2>
          {selected.image_url && <img src={selected.image_url} alt="" className="w-full max-h-64 object-cover rounded-2xl" />}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="text-muted-foreground">Location:</span> <p className="text-foreground">{selected.location}</p></div>
            <div><span className="text-muted-foreground">Status:</span> <p className="text-foreground capitalize">{selected.status}</p></div>
            <div><span className="text-muted-foreground">Severity:</span> <p className="text-foreground">{selected.severity}</p></div>
          </div>
          {selected.description && <p className="text-sm text-foreground">{selected.description}</p>}
          {selected.ai_summary && <div className="bg-accent/10 rounded-2xl p-4"><p className="text-sm text-accent font-semibold">AI Summary</p><p className="text-sm">{selected.ai_summary}</p></div>}

          {selected.location && (
            <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selected.location)}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-primary text-sm font-medium">
              <MapPin className="h-4 w-4" /> Navigate to Location
            </a>
          )}

          <div>
            <p className="text-sm font-medium text-foreground mb-2">Treatment Type</p>
            <Select value={selected.treatment_type || ""} onValueChange={(v) => updateReport(selected.id, { treatment_type: v, severity: v === "first_aid" ? "low" : "high" })}>
              <SelectTrigger className="rounded-2xl bg-muted/50 border-0 h-12"><SelectValue placeholder="Select treatment" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="first_aid">Treat on Spot / First Aid</SelectItem>
                <SelectItem value="veterinarian">Take to Veterinarian</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <p className="text-sm font-medium text-foreground mb-2">Treatment Notes</p>
            <Textarea className="rounded-2xl bg-muted/50 border-0" defaultValue={selected.treatment_notes || ""} onBlur={(e) => updateReport(selected.id, { treatment_notes: e.target.value })} />
          </div>

          <div>
            <p className="text-sm font-medium text-foreground mb-2">Upload Proof</p>
            <label className="flex items-center gap-2 cursor-pointer text-accent text-sm font-medium">
              <Upload className="h-4 w-4" /> Upload Image
              <input type="file" accept="image/*" className="hidden" onChange={(e) => { if (e.target.files?.[0]) uploadProof(selected.id, e.target.files[0]); }} />
            </label>
            {selected.proof_image_url && <img src={selected.proof_image_url} alt="Proof" className="mt-3 max-h-40 rounded-xl object-cover" />}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-widest text-accent font-semibold">Operations</p>
        <h2 className="text-2xl font-display text-foreground mt-1">Accepted Cases</h2>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search cases..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 rounded-2xl bg-muted/50 border-0 h-12" />
        </div>
        <Select value={sort} onValueChange={(v) => { setSort(v); }}>
          <SelectTrigger className="w-40 rounded-2xl bg-muted/50 border-0 h-12"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((o) => (
          <button key={o.id} onClick={() => setSelected(o)} className="bg-card rounded-2xl p-5 shadow-sm text-left hover:shadow-md transition-shadow">
            {o.image_url && <img src={o.image_url} alt="" className="w-full h-28 object-cover rounded-xl mb-3" />}
            <p className="font-medium text-foreground">{o.title}</p>
            <p className="text-xs text-muted-foreground mt-1">{o.location}</p>
            <span className={`inline-block mt-2 text-xs px-3 py-1 rounded-full font-medium ${o.status === "accepted" ? "bg-accent/20 text-accent" : o.status === "completed" ? "bg-primary/20 text-primary" : "bg-coral/20 text-coral"}`}>{o.status}</span>
          </button>
        ))}
      </div>
      {filtered.length === 0 && <p className="text-sm text-muted-foreground">No operations found.</p>}
    </div>
  );
};

export default Operations;
