import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const AdminUsers = () => {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [roles, setRoles] = useState<Record<string, string>>({});
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");

  useEffect(() => {
    const fetch = async () => {
      const { data: p } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
      const { data: r } = await supabase.from("user_roles").select("*");
      setProfiles(p ?? []);
      const rm: Record<string, string> = {};
      r?.forEach((role) => { rm[role.user_id] = role.role; });
      setRoles(rm);
    };
    fetch();
  }, []);

  const filtered = profiles.filter((p) => {
    const matchSearch = (p.full_name || "").toLowerCase().includes(search.toLowerCase()) || (p.email || "").toLowerCase().includes(search.toLowerCase());
    const matchRole = filterRole === "all" || roles[p.user_id] === filterRole;
    return matchSearch && matchRole;
  });

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-widest text-accent font-semibold">Admin</p>
        <h2 className="text-2xl font-display text-foreground mt-1">{filterRole === "volunteer" ? "Volunteer" : "User"} Profiles</h2>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 rounded-2xl bg-muted/50 border-0 h-12" />
        </div>
        <div className="flex gap-2">
          {["all", "user", "volunteer", "admin"].map((r) => (
            <button key={r} onClick={() => setFilterRole(r)} className={`px-4 py-2 rounded-2xl text-sm font-medium capitalize transition-colors ${filterRole === r ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map((p) => (
          <div key={p.id} className="bg-card rounded-2xl p-5 shadow-sm flex justify-between items-center">
            <div>
              <p className="font-medium text-foreground">{p.full_name || "Unnamed"}</p>
              <p className="text-xs text-muted-foreground">{p.email} • {p.phone}</p>
            </div>
            <span className="text-xs px-3 py-1 rounded-full font-medium bg-primary/20 text-primary capitalize">{roles[p.user_id] || "user"}</span>
          </div>
        ))}
        {filtered.length === 0 && <p className="text-sm text-muted-foreground">No profiles found.</p>}
      </div>
    </div>
  );
};

export default AdminUsers;
