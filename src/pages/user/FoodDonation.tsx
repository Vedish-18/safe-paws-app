import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const FoodDonation = () => {
  const { user } = useAuth();
  const [form, setForm] = useState({ foodType: "", quantity: "", pickupPoint: "" });
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => { if (user) fetchHistory(); }, [user]);

  const fetchHistory = async () => {
    const { data } = await supabase.from("food_donations").select("*").eq("donor_id", user!.id).order("created_at", { ascending: false });
    setHistory(data ?? []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      const { error } = await supabase.from("food_donations").insert({
        donor_id: user.id,
        food_type: form.foodType,
        quantity: form.quantity,
        pickup_point: form.pickupPoint,
      });
      if (error) throw error;
      await supabase.from("activity_logs").insert({ user_id: user.id, action: "Donated food", details: `${form.foodType} (${form.quantity})`, entity_type: "food_donation" });
      toast.success("Food donation submitted!");
      setForm({ foodType: "", quantity: "", pickupPoint: "" });
      fetchHistory();
    } catch (err: any) { toast.error(err.message); } finally { setLoading(false); }
  };

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <p className="text-xs uppercase tracking-widest text-accent font-semibold">Community Care</p>
        <h2 className="text-2xl font-display text-foreground mt-1">Food Donation</h2>
      </div>

      <form onSubmit={handleSubmit} className="bg-card rounded-3xl p-8 shadow-sm space-y-5">
        <Input placeholder="Food Type (e.g., Rice, Chapati)" value={form.foodType} onChange={(e) => setForm((p) => ({ ...p, foodType: e.target.value }))} required className="rounded-2xl bg-muted/50 border-0 h-12" />
        <Input placeholder="Quantity" value={form.quantity} onChange={(e) => setForm((p) => ({ ...p, quantity: e.target.value }))} required className="rounded-2xl bg-muted/50 border-0 h-12" />
        <Input placeholder="Pickup Point" value={form.pickupPoint} onChange={(e) => setForm((p) => ({ ...p, pickupPoint: e.target.value }))} required className="rounded-2xl bg-muted/50 border-0 h-12" />
        <Button type="submit" disabled={loading} className="w-full rounded-2xl h-12 bg-primary text-primary-foreground font-semibold">
          {loading ? "Submitting..." : "Submit Donation"}
        </Button>
      </form>

      <div>
        <h3 className="text-lg font-display text-foreground mb-4">Donation History</h3>
        <div className="space-y-3">
          {history.map((h) => (
            <div key={h.id} className="bg-card rounded-2xl p-5 shadow-sm flex justify-between items-center">
              <div>
                <p className="font-medium text-foreground">{h.food_type} — {h.quantity}</p>
                <p className="text-xs text-muted-foreground">{h.pickup_point}</p>
              </div>
              <span className={`text-xs px-3 py-1 rounded-full font-medium ${h.status === "available" ? "bg-accent/20 text-accent" : "bg-primary/20 text-primary"}`}>{h.status}</span>
            </div>
          ))}
          {history.length === 0 && <p className="text-sm text-muted-foreground">No donations yet.</p>}
        </div>
      </div>
    </div>
  );
};

export default FoodDonation;
