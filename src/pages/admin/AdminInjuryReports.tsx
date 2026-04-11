import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const AdminInjuryReports = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    supabase.from("injury_reports").select("*").order("created_at", { ascending: false })
      .then(({ data }) => setReports(data ?? []));
  }, []);

  const filtered = reports.filter((r) => r.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-widest text-accent font-semibold">Admin</p>
        <h2 className="text-2xl font-display text-foreground mt-1">Injury Reports</h2>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search reports..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 rounded-2xl bg-muted/50 border-0 h-12" />
      </div>

      <div className="space-y-3">
        {filtered.map((r) => (
          <div key={r.id} className="bg-card rounded-2xl p-5 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium text-foreground">{r.title}</p>
                <p className="text-xs text-muted-foreground">{r.location} • {new Date(r.created_at).toLocaleDateString()}</p>
              </div>
              <span className={`text-xs px-3 py-1 rounded-full font-medium ${r.status === "pending" ? "bg-coral/20 text-coral" : r.status === "accepted" ? "bg-accent/20 text-accent" : "bg-primary/20 text-primary"}`}>{r.status}</span>
            </div>
            {r.description && <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{r.description}</p>}
            {r.image_url && <img src={r.image_url} alt="" className="mt-3 max-h-32 rounded-xl object-cover" />}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminInjuryReports;
