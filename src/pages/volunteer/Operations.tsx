import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Search, MapPin, Upload } from "lucide-react";

const getOperationStatus = (operation: { status: string; assigned_volunteer_id?: string | null }) => {
  if (operation.status === "completed") {
    return { label: "completed", className: "bg-primary/20 text-primary" };
  }

  if (operation.assigned_volunteer_id) {
    return { label: "pending", className: "bg-accent/20 text-accent" };
  }

  return { label: operation.status, className: "bg-coral/20 text-coral" };
};

const Operations = () => {
  const { user } = useAuth();
  const [ops, setOps] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [selected, setSelected] = useState<any | null>(null);

  const fetchOps = async () => {
    if (!user) return;

    const { data } = await supabase
      .from("injury_reports")
      .select("*")
      .eq("assigned_volunteer_id", user.id)
      .order("created_at", { ascending: sort === "oldest" });

    setOps(data ?? []);
  };

  useEffect(() => {
    if (!user) return;

    fetchOps();

    const channel = supabase
      .channel(`volunteer-operations-${user.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "injury_reports" }, fetchOps)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, sort]);

  const filtered = ops.filter((operation) => operation.title.toLowerCase().includes(search.toLowerCase()));

  const updateReport = async (
    id: string,
    updates: Partial<{
      treatment_type: string;
      treatment_notes: string;
      severity: string;
      proof_image_url: string;
      status: string;
    }>,
  ) => {
    const { data, error } = await supabase
      .from("injury_reports")
      .update(updates)
      .eq("id", id)
      .select("*")
      .single();

    if (error || !data) {
      toast.error(error?.message || "Unable to update the operation.");
      return null;
    }

    setOps((current) => current.map((item) => (item.id === id ? data : item)));
    setSelected((current: any) => (current?.id === id ? data : current));
    return data;
  };

  const uploadProof = async (id: string, file: File) => {
    const path = `proofs/${user!.id}/${Date.now()}.${file.name.split(".").pop()}`;
    const { error } = await supabase.storage.from("uploads").upload(path, file);
    if (error) {
      toast.error("Upload failed");
      return;
    }

    const { data } = supabase.storage.from("uploads").getPublicUrl(path);
    const updated = await updateReport(id, { proof_image_url: data.publicUrl });
    if (updated) {
      toast.success("Proof uploaded. Submit the operation to mark the rescue complete.");
    }
  };

  const submitOperation = async () => {
    if (!selected) return;
    if (!selected.treatment_type) {
      toast.error("Select a treatment type");
      return;
    }
    if (!selected.proof_image_url) {
      toast.error("Upload proof of rescue before submitting");
      return;
    }

    const updated = await updateReport(selected.id, { status: "completed" });
    if (!updated) return;

    await supabase.from("activity_logs").insert({
      user_id: user!.id,
      action: "Completed rescue",
      entity_type: "injury_report",
      entity_id: selected.id,
      details: `Treatment: ${selected.treatment_type}`,
    });

    toast.success("Rescue verified and operation marked complete.");
  };

  if (selected) {
    const statusMeta = getOperationStatus(selected);

    return (
      <div className="space-y-6 max-w-3xl">
        <Button variant="outline" onClick={() => setSelected(null)} className="rounded-2xl">
          Back
        </Button>
        <div className="bg-card rounded-3xl p-8 shadow-sm space-y-5">
          <h2 className="text-2xl font-display text-foreground">{selected.title}</h2>
          {selected.image_url && <img src={selected.image_url} alt="" className="w-full max-h-64 object-cover rounded-2xl" />}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="text-muted-foreground">Location:</span> <p className="text-foreground">{selected.location}</p></div>
            <div><span className="text-muted-foreground">Status:</span> <p className="text-foreground capitalize">{statusMeta.label}</p></div>
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
            <Select value={selected.treatment_type || ""} onValueChange={(value) => updateReport(selected.id, { treatment_type: value, severity: value === "first_aid" ? "low" : "high" })}>
              <SelectTrigger className="rounded-2xl bg-muted/50 border-0 h-12"><SelectValue placeholder="Select treatment" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="first_aid">Treat on Spot / First Aid</SelectItem>
                <SelectItem value="veterinarian">Take to Veterinarian</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <p className="text-sm font-medium text-foreground mb-2">Treatment Notes</p>
            <Textarea className="rounded-2xl bg-muted/50 border-0" defaultValue={selected.treatment_notes || ""} onBlur={(event) => updateReport(selected.id, { treatment_notes: event.target.value })} />
          </div>

          <div>
            <p className="text-sm font-medium text-foreground mb-2">Upload Proof</p>
            <label className="flex items-center gap-2 cursor-pointer text-accent text-sm font-medium">
              <Upload className="h-4 w-4" /> Upload Image
              <input type="file" accept="image/*" className="hidden" onChange={(event) => { if (event.target.files?.[0]) uploadProof(selected.id, event.target.files[0]); }} />
            </label>
            {selected.proof_image_url && <img src={selected.proof_image_url} alt="Proof" className="mt-3 max-h-40 rounded-xl object-cover" />}
          </div>

          {selected.status !== "completed" && (
            <Button onClick={submitOperation} className="w-full rounded-2xl h-12 bg-primary text-primary-foreground font-semibold">
              Submit Rescue Operation
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-widest text-accent font-semibold">Operations</p>
        <h2 className="text-2xl font-display text-foreground mt-1">Assigned Cases</h2>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search cases..." value={search} onChange={(event) => setSearch(event.target.value)} className="pl-10 rounded-2xl bg-muted/50 border-0 h-12" />
        </div>
        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger className="w-40 rounded-2xl bg-muted/50 border-0 h-12"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((operation) => {
          const statusMeta = getOperationStatus(operation);

          return (
            <button key={operation.id} onClick={() => setSelected(operation)} className="bg-card rounded-2xl p-5 shadow-sm text-left hover:shadow-md transition-shadow">
              {operation.image_url && <img src={operation.image_url} alt="" className="w-full h-28 object-cover rounded-xl mb-3" />}
              <p className="font-medium text-foreground">{operation.title}</p>
              <p className="text-xs text-muted-foreground mt-1">{operation.location}</p>
              <span className={`inline-block mt-2 text-xs px-3 py-1 rounded-full font-medium ${statusMeta.className}`}>{statusMeta.label}</span>
            </button>
          );
        })}
      </div>
      {filtered.length === 0 && <p className="text-sm text-muted-foreground">No operations found.</p>}
    </div>
  );
};

export default Operations;
