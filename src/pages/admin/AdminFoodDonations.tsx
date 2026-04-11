import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const AdminFoodDonations = () => {
  const [donations, setDonations] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    supabase.from("food_donations").select("*").order("created_at", { ascending: false })
      .then(({ data }) => setDonations(data ?? []));
  }, []);

  const filtered = donations.filter((d) => d.food_type.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-widest text-accent font-semibold">Admin</p>
        <h2 className="text-2xl font-display text-foreground mt-1">Food Donations</h2>
      </div>
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 rounded-2xl bg-muted/50 border-0 h-12" />
      </div>
      <div className="space-y-3">
        {filtered.map((d) => (
          <div key={d.id} className="bg-card rounded-2xl p-5 shadow-sm flex justify-between items-center">
            <div>
              <p className="font-medium text-foreground">{d.food_type} — {d.quantity}</p>
              <p className="text-xs text-muted-foreground">{d.pickup_point}</p>
            </div>
            <span className={`text-xs px-3 py-1 rounded-full font-medium ${d.status === "available" ? "bg-accent/20 text-accent" : "bg-primary/20 text-primary"}`}>{d.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminFoodDonations;
