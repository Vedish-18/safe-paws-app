import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Search, Upload } from "lucide-react";

const VolunteerFoodDonations = () => {
  const { user } = useAuth();
  const [donations, setDonations] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => { fetchDonations(); }, []);

  const fetchDonations = async () => {
    const { data } = await supabase.from("food_donations").select("*").order("created_at", { ascending: false });
    setDonations(data ?? []);
  };

  const claimDonation = async (id: string) => {
    if (!user) return;
    const { error } = await supabase.from("food_donations").update({ volunteer_id: user.id, status: "claimed" }).eq("id", id);
    if (!error) {
      await supabase.from("activity_logs").insert({ user_id: user.id, action: "Claimed food donation", entity_type: "food_donation", entity_id: id });
      toast.success("Donation claimed!");
      fetchDonations();
    }
  };

  const uploadProof = async (id: string, file: File) => {
    const path = `food-proofs/${user!.id}/${Date.now()}.${file.name.split(".").pop()}`;
    await supabase.storage.from("uploads").upload(path, file);
    const { data } = supabase.storage.from("uploads").getPublicUrl(path);
    await supabase.from("food_donations").update({ proof_image_url: data.publicUrl, status: "delivered" }).eq("id", id);
    toast.success("Proof uploaded and marked as delivered!");
    fetchDonations();
  };

  const filtered = donations.filter((d) => d.food_type.toLowerCase().includes(search.toLowerCase()) || d.pickup_point.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-widest text-accent font-semibold">Food Donations</p>
        <h2 className="text-2xl font-display text-foreground mt-1">Available Food</h2>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 rounded-2xl bg-muted/50 border-0 h-12" />
      </div>

      <div className="space-y-3">
        {filtered.map((d) => (
          <div key={d.id} className="bg-card rounded-2xl p-5 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium text-foreground">{d.food_type} — {d.quantity}</p>
                <p className="text-xs text-muted-foreground">{d.pickup_point}</p>
              </div>
              <span className={`text-xs px-3 py-1 rounded-full font-medium ${d.status === "available" ? "bg-accent/20 text-accent" : d.status === "claimed" ? "bg-primary/20 text-primary" : "bg-coral/20 text-coral"}`}>{d.status}</span>
            </div>
            <div className="mt-3 flex gap-2">
              {d.status === "available" && (
                <Button size="sm" onClick={() => claimDonation(d.id)} className="rounded-2xl bg-accent text-accent-foreground text-xs">Claim</Button>
              )}
              {d.status === "claimed" && d.volunteer_id === user?.id && (
                <label className="flex items-center gap-1 cursor-pointer text-xs text-primary font-medium">
                  <Upload className="h-3 w-3" /> Upload Proof
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => { if (e.target.files?.[0]) uploadProof(d.id, e.target.files[0]); }} />
                </label>
              )}
            </div>
            {d.proof_image_url && <img src={d.proof_image_url} alt="Proof" className="mt-3 max-h-32 rounded-xl object-cover" />}
          </div>
        ))}
        {filtered.length === 0 && <p className="text-sm text-muted-foreground">No food donations found.</p>}
      </div>
    </div>
  );
};

export default VolunteerFoodDonations;
