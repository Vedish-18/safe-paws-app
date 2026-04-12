import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const AdminUsers = () => {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [roles, setRoles] = useState<Record<string, string>>({});
  const [activities, setActivities] = useState<Record<string, any[]>>({});
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"user" | "volunteer">("user");

  useEffect(() => {
    const fetch = async () => {
      const [{ data: p }, { data: r }, { data: a }] = await Promise.all([
        supabase.from("profiles").select("*").order("created_at", { ascending: false }),
        supabase.from("user_roles").select("*"),
        supabase.from("activity_logs").select("*").order("created_at", { ascending: false }),
      ]);
      setProfiles(p ?? []);
      const rm: Record<string, string> = {};
      r?.forEach((role) => { rm[role.user_id] = role.role; });
      setRoles(rm);
      const am: Record<string, any[]> = {};
      a?.forEach((act) => {
        if (!am[act.user_id]) am[act.user_id] = [];
        am[act.user_id].push(act);
      });
      setActivities(am);
    };
    fetch();
  }, []);

  const filtered = profiles.filter((p) => {
    const matchSearch = (p.full_name || "").toLowerCase().includes(search.toLowerCase()) || (p.email || "").toLowerCase().includes(search.toLowerCase());
    return matchSearch && roles[p.user_id] === activeTab;
  });

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-widest text-accent font-semibold">Admin</p>
        <h2 className="text-2xl font-display text-foreground mt-1">User Management</h2>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {(["user", "volunteer"] as const).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-2.5 rounded-2xl text-sm font-semibold capitalize transition-colors ${activeTab === tab ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
            {tab === "user" ? "Users" : "Volunteers"}
          </button>
        ))}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 rounded-2xl bg-muted/50 border-0 h-12" />
      </div>

      <div className="space-y-3">
        {filtered.map((p) => {
          const userActs = activities[p.user_id] || [];
          return (
            <div key={p.id} className="bg-card rounded-2xl p-5 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-foreground">{p.full_name || "Unnamed"}</p>
                  <p className="text-xs text-muted-foreground">{p.email} • {p.phone || "No phone"}</p>
                  {p.address && <p className="text-xs text-muted-foreground mt-0.5">{p.address}</p>}
                </div>
                <span className="text-xs px-3 py-1 rounded-full font-medium bg-primary/20 text-primary capitalize">{roles[p.user_id] || "user"}</span>
              </div>
              {userActs.length > 0 && (
                <div className="mt-3 border-t border-border pt-3">
                  <p className="text-xs font-semibold text-muted-foreground mb-1">Recent Actions</p>
                  <div className="space-y-1">
                    {userActs.slice(0, 3).map((act) => (
                      <div key={act.id} className="flex justify-between text-xs">
                        <span className="text-foreground">{act.action}{act.details ? ` — ${act.details}` : ""}</span>
                        <span className="text-muted-foreground">{new Date(act.created_at).toLocaleDateString()}</span>
                      </div>
                    ))}
                    {userActs.length > 3 && <p className="text-xs text-muted-foreground">+{userActs.length - 3} more</p>}
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && <p className="text-sm text-muted-foreground">No {activeTab === "user" ? "users" : "volunteers"} found.</p>}
      </div>
    </div>
  );
};

export default AdminUsers;
