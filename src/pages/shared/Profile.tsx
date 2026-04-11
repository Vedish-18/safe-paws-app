import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle()
      .then(({ data }) => { if (data) setProfile(data); });
  }, [user]);

  const calculateAge = (dob: string) => {
    if (!dob) return "";
    const diff = Date.now() - new Date(dob).getTime();
    return Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
  };

  const handleSave = async () => {
    if (!user || !profile) return;
    setLoading(true);
    try {
      const { error } = await supabase.from("profiles").update({
        full_name: profile.full_name,
        phone: profile.phone,
        email: profile.email,
        address: profile.address,
        date_of_birth: profile.date_of_birth,
        gender: profile.gender,
      }).eq("user_id", user.id);
      if (error) throw error;
      toast.success("Profile updated!");
      setEditing(false);
    } catch (err: any) { toast.error(err.message); } finally { setLoading(false); }
  };

  if (!profile) return <div className="text-muted-foreground">Loading...</div>;

  const fields = [
    { label: "Full Name", key: "full_name", type: "text" },
    { label: "Email", key: "email", type: "email" },
    { label: "Phone", key: "phone", type: "tel" },
    { label: "Address", key: "address", type: "text" },
    { label: "Date of Birth", key: "date_of_birth", type: "date" },
  ];

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-xs uppercase tracking-widest text-accent font-semibold">Account</p>
          <h2 className="text-2xl font-display text-foreground mt-1">Profile</h2>
        </div>
        {!editing && <Button variant="outline" onClick={() => setEditing(true)} className="rounded-2xl">Edit</Button>}
      </div>

      <div className="bg-card rounded-3xl p-8 shadow-sm space-y-5">
        {fields.map((f) => (
          <div key={f.key}>
            <label className="text-sm text-muted-foreground">{f.label}</label>
            <Input
              type={f.type}
              value={profile[f.key] || ""}
              onChange={(e) => setProfile((p: any) => ({ ...p, [f.key]: e.target.value }))}
              disabled={!editing}
              className="rounded-2xl bg-muted/50 border-0 h-12 mt-1"
            />
          </div>
        ))}

        {profile.date_of_birth && (
          <div>
            <label className="text-sm text-muted-foreground">Age</label>
            <p className="text-foreground font-medium mt-1">{calculateAge(profile.date_of_birth)} years</p>
          </div>
        )}

        <div>
          <label className="text-sm text-muted-foreground">Gender</label>
          <Select value={profile.gender || ""} onValueChange={(v) => setProfile((p: any) => ({ ...p, gender: v }))} disabled={!editing}>
            <SelectTrigger className="rounded-2xl bg-muted/50 border-0 h-12 mt-1">
              <SelectValue placeholder="Select Gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {editing && (
          <div className="flex gap-3">
            <Button onClick={handleSave} disabled={loading} className="rounded-2xl bg-primary text-primary-foreground flex-1">
              {loading ? "Saving..." : "Save"}
            </Button>
            <Button variant="outline" onClick={() => setEditing(false)} className="rounded-2xl">Cancel</Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
