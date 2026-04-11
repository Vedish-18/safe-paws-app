import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const AdminMoneyDonations = () => {
  const [donations, setDonations] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    supabase.from("money_donations").select("*").order("created_at", { ascending: false })
      .then(({ data }) => setDonations(data ?? []));
  }, []);

  const total = donations.reduce((s, d) => s + Number(d.amount), 0);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-widest text-accent font-semibold">Admin</p>
        <h2 className="text-2xl font-display text-foreground mt-1">Money Donations</h2>
        <p className="text-lg font-bold text-foreground mt-2">Total: ₹{total.toLocaleString()}</p>
      </div>
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 rounded-2xl bg-muted/50 border-0 h-12" />
      </div>
      <div className="space-y-3">
        {donations.map((d) => (
          <div key={d.id} className="bg-card rounded-2xl p-5 shadow-sm flex justify-between items-center">
            <div>
              <p className="font-medium text-foreground">₹{Number(d.amount).toLocaleString()}</p>
              {d.note && <p className="text-xs text-muted-foreground">{d.note}</p>}
              <p className="text-xs text-muted-foreground">{new Date(d.created_at).toLocaleDateString()}</p>
            </div>
            <span className="text-xs px-3 py-1 rounded-full font-medium bg-accent/20 text-accent">{d.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminMoneyDonations;
