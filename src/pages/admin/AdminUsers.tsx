import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const AdminUsers = () => {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [roles, setRoles] = useState<Record<string, string>>({});
  const [activities, setActivities] = useState<Record<string, any[]>>({});
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"user" | "volunteer">("user");
  const [selectedUser, setSelectedUser] = useState<any | null>(null);

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
            <button key={p.id} onClick={() => setSelectedUser(p)} className="w-full bg-card rounded-2xl p-5 shadow-sm text-left hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-foreground">{p.full_name || "Unnamed"}</p>
                  <p className="text-xs text-muted-foreground">{p.email} • {p.phone || "No phone"}</p>
                </div>
                <span className="text-xs px-3 py-1 rounded-full font-medium bg-primary/20 text-primary capitalize">{roles[p.user_id] || "user"}</span>
              </div>
              {userActs.length > 0 && (
                <p className="text-xs text-muted-foreground mt-2">{userActs.length} actions logged</p>
              )}
            </button>
          );
        })}
        {filtered.length === 0 && <p className="text-sm text-muted-foreground">No {activeTab === "user" ? "users" : "volunteers"} found.</p>}
      </div>

      {/* User Profile Popup */}
      <Dialog open={!!selectedUser} onOpenChange={(open) => { if (!open) setSelectedUser(null); }}>
        <DialogContent className="max-w-lg rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-display">
              {selectedUser?.full_name || "Unnamed"} — Profile
            </DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                {selectedUser.avatar_url ? (
                  <img src={selectedUser.avatar_url} alt="" className="w-16 h-16 rounded-full object-cover" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-2xl font-bold text-muted-foreground">
                    {(selectedUser.full_name || "U")[0].toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="font-semibold text-foreground">{selectedUser.full_name || "Unnamed"}</p>
                  <p className="text-sm text-muted-foreground capitalize">{roles[selectedUser.user_id] || "user"}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">Email:</span><p className="text-foreground">{selectedUser.email || "—"}</p></div>
                <div><span className="text-muted-foreground">Phone:</span><p className="text-foreground">{selectedUser.phone || "—"}</p></div>
                <div><span className="text-muted-foreground">Gender:</span><p className="text-foreground capitalize">{selectedUser.gender || "—"}</p></div>
                <div><span className="text-muted-foreground">DOB:</span><p className="text-foreground">{selectedUser.date_of_birth || "—"}</p></div>
                <div className="col-span-2"><span className="text-muted-foreground">Address:</span><p className="text-foreground">{selectedUser.address || "—"}</p></div>
                <div className="col-span-2"><span className="text-muted-foreground">Joined:</span><p className="text-foreground">{new Date(selectedUser.created_at).toLocaleDateString()}</p></div>
              </div>

              {/* Activity log */}
              {(activities[selectedUser.user_id] || []).length > 0 && (
                <div className="border-t border-border pt-3">
                  <p className="text-sm font-semibold text-foreground mb-2">Recent Activity</p>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {(activities[selectedUser.user_id] || []).map((act) => (
                      <div key={act.id} className="flex justify-between text-xs">
                        <span className="text-foreground">{act.action}{act.details ? ` — ${act.details}` : ""}</span>
                        <span className="text-muted-foreground whitespace-nowrap ml-2">{new Date(act.created_at).toLocaleDateString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsers;
