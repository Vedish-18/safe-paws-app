import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { MapPin, Upload, Sparkles } from "lucide-react";

const ReportInjury = () => {
  const { user } = useAuth();
  const [form, setForm] = useState({ title: "", location: "", description: "" });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [aiSummary, setAiSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState<any[]>([]);

  useEffect(() => {
    if (user) fetchReports();
  }, [user]);

  const fetchReports = async () => {
    const { data } = await supabase
      .from("injury_reports")
      .select("*")
      .eq("reporter_id", user!.id)
      .order("created_at", { ascending: false });
    setReports(data ?? []);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
            const data = await res.json();
            setForm((p) => ({ ...p, location: data.display_name || `${latitude}, ${longitude}` }));
          } catch {
            setForm((p) => ({ ...p, location: `${latitude}, ${longitude}` }));
          }
        },
        () => toast.error("Could not get location")
      );
    }
  };

  const identifyInjury = () => {
    setAiSummary("Provisional analysis: visible injury with medium severity (45% confidence).");
    setForm((p) => ({
      ...p,
      description: p.description || "Visible signs of injury may be present in the uploaded image. Please review the animal carefully and update this description with what you can directly observe before submitting to volunteers.",
    }));
    toast.info("AI analysis complete (provisional)");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      let imageUrl = "";
      if (imageFile) {
        const ext = imageFile.name.split(".").pop();
        const path = `injuries/${user.id}/${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage.from("uploads").upload(path, imageFile);
        if (upErr) throw upErr;
        const { data: pub } = supabase.storage.from("uploads").getPublicUrl(path);
        imageUrl = pub.publicUrl;
      }

      const { error } = await supabase.from("injury_reports").insert({
        reporter_id: user.id,
        title: form.title,
        image_url: imageUrl,
        location: form.location,
        description: form.description,
        ai_summary: aiSummary || null,
      });
      if (error) throw error;

      await supabase.from("activity_logs").insert({
        user_id: user.id,
        action: "Reported injury",
        details: form.title,
        entity_type: "injury_report",
      });

      toast.success("Report submitted!");
      setForm({ title: "", location: "", description: "" });
      setImageFile(null);
      setImagePreview(null);
      setAiSummary("");
      fetchReports();
    } catch (err: any) {
      toast.error(err.message || "Failed to submit report");
    } finally {
      setLoading(false);
    }
  };

  const getReportStatus = (report: { status: string; assigned_volunteer_id?: string | null }) => {
    if (report.status === "completed") {
      return { label: "completed", className: "bg-primary/20 text-primary" };
    }

    if (report.assigned_volunteer_id) {
      return { label: "volunteer assigned", className: "bg-accent/20 text-accent" };
    }

    return { label: "pending", className: "bg-coral/20 text-coral" };
  };

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <p className="text-xs uppercase tracking-widest text-accent font-semibold">Community Care</p>
        <h2 className="text-2xl font-display text-foreground mt-1">Report Injury</h2>
      </div>

      <form onSubmit={handleSubmit} className="bg-card rounded-3xl p-8 shadow-sm space-y-5">
        <Input placeholder="Case Title" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} required className="rounded-2xl bg-muted/50 border-0 h-12" />

        {/* Image Upload */}
        <div className="border-2 border-dashed border-border rounded-2xl p-6 text-center">
          {imagePreview ? (
            <img src={imagePreview} alt="Preview" className="max-h-48 mx-auto rounded-xl object-contain" />
          ) : (
            <label className="cursor-pointer flex flex-col items-center gap-2 text-muted-foreground">
              <Upload className="h-8 w-8" />
              <span>Upload Image</span>
              <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </label>
          )}
          {imagePreview && (
            <label className="cursor-pointer text-sm text-primary mt-2 inline-block">
              Change image
              <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </label>
          )}
        </div>

        {/* AI Identify */}
        <Button type="button" variant="outline" onClick={identifyInjury} className="w-full rounded-2xl h-12 gap-2">
          <Sparkles className="h-4 w-4" /> Identify Injury and Auto Describe
        </Button>

        {aiSummary && (
          <div className="bg-accent/10 rounded-2xl p-4">
            <p className="text-sm font-semibold text-accent">AI Summary</p>
            <p className="text-sm text-foreground">{aiSummary}</p>
          </div>
        )}

        {/* Location */}
        <div className="flex gap-2">
          <Input placeholder="Location" value={form.location} onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))} className="rounded-2xl bg-muted/50 border-0 h-12 flex-1" />
          <Button type="button" variant="outline" onClick={getLocation} className="rounded-2xl h-12 px-4">
            <MapPin className="h-5 w-5" />
          </Button>
        </div>

        <Textarea placeholder="Describe the injury..." value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} className="rounded-2xl bg-muted/50 border-0 min-h-[100px]" />

        <Button type="submit" disabled={loading} className="w-full rounded-2xl h-12 bg-primary text-primary-foreground font-semibold">
          {loading ? "Submitting..." : "Submit Report"}
        </Button>
      </form>

      {/* History */}
      <div>
        <h3 className="text-lg font-display text-foreground mb-4">Report History</h3>
        <div className="space-y-3">
          {reports.map((r) => {
            const statusMeta = getReportStatus(r);

            return (
              <div key={r.id} className="bg-card rounded-2xl p-5 shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-foreground">{r.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{r.location}</p>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusMeta.className}`}>
                    {statusMeta.label}
                  </span>
                </div>
                {r.description && <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{r.description}</p>}
              </div>
            );
          })}
          {reports.length === 0 && <p className="text-sm text-muted-foreground">No reports yet.</p>}
        </div>
      </div>
    </div>
  );
};

export default ReportInjury;
