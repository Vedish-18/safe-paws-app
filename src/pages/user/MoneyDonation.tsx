import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const MoneyDonation = () => {
  const { user } = useAuth();
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => { if (user) fetchHistory(); }, [user]);

  const fetchHistory = async () => {
    const { data } = await supabase.from("money_donations").select("*").eq("donor_id", user!.id).order("created_at", { ascending: false });
    setHistory(data ?? []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !amount) return;
    setShowPayment(true);
  };

  const confirmPayment = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { error } = await supabase.from("money_donations").insert({
        donor_id: user.id,
        amount: parseFloat(amount),
        note,
        status: "completed",
      });
      if (error) throw error;
      await supabase.from("activity_logs").insert({ user_id: user.id, action: "Donated money", details: `₹${amount}`, entity_type: "money_donation" });
      toast.success("Donation successful! Thank you for your generosity.");
      setAmount("");
      setNote("");
      setShowPayment(false);
      fetchHistory();
    } catch (err: any) { toast.error(err.message); } finally { setLoading(false); }
  };

  if (showPayment) {
    return (
      <div className="space-y-8 max-w-md mx-auto">
        <div className="bg-card rounded-3xl p-8 shadow-sm text-center space-y-6">
          <h2 className="text-2xl font-display text-foreground">Payment</h2>
          <div className="bg-accent/10 rounded-2xl p-6">
            <p className="text-4xl font-bold text-foreground">₹{parseFloat(amount).toLocaleString()}</p>
            <p className="text-sm text-muted-foreground mt-2">Donation Amount</p>
          </div>
          <div className="space-y-3">
            <Button onClick={confirmPayment} disabled={loading} className="w-full rounded-2xl h-12 bg-accent text-accent-foreground font-semibold">
              {loading ? "Processing..." : "Confirm Payment"}
            </Button>
            <Button variant="outline" onClick={() => setShowPayment(false)} className="w-full rounded-2xl h-12">
              Cancel
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <p className="text-xs uppercase tracking-widest text-accent font-semibold">Community Care</p>
        <h2 className="text-2xl font-display text-foreground mt-1">Money Donation</h2>
      </div>

      <form onSubmit={handleSubmit} className="bg-card rounded-3xl p-8 shadow-sm space-y-5">
        <Input type="number" placeholder="Amount (₹)" value={amount} onChange={(e) => setAmount(e.target.value)} required min="1" className="rounded-2xl bg-muted/50 border-0 h-12" />
        <Textarea placeholder="Note (optional)" value={note} onChange={(e) => setNote(e.target.value)} className="rounded-2xl bg-muted/50 border-0" />
        <Button type="submit" className="w-full rounded-2xl h-12 bg-primary text-primary-foreground font-semibold">
          Proceed to Payment
        </Button>
      </form>

      <div>
        <h3 className="text-lg font-display text-foreground mb-4">Donation History</h3>
        <div className="space-y-3">
          {history.map((h) => (
            <div key={h.id} className="bg-card rounded-2xl p-5 shadow-sm flex justify-between items-center">
              <div>
                <p className="font-medium text-foreground">₹{Number(h.amount).toLocaleString()}</p>
                {h.note && <p className="text-xs text-muted-foreground">{h.note}</p>}
              </div>
              <span className="text-xs px-3 py-1 rounded-full font-medium bg-accent/20 text-accent">{h.status}</span>
            </div>
          ))}
          {history.length === 0 && <p className="text-sm text-muted-foreground">No donations yet.</p>}
        </div>
      </div>
    </div>
  );
};

export default MoneyDonation;
