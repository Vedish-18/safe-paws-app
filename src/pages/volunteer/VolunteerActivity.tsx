import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const VolunteerActivity = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase.from("activity_logs").select("*").eq("user_id", user.id).order("created_at", { ascending: false })
      .then(({ data }) => setLogs(data ?? []));
  }, [user]);

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <p className="text-xs uppercase tracking-widest text-accent font-semibold">Activity</p>
        <h2 className="text-2xl font-display text-foreground mt-1">Activity Log</h2>
      </div>
      <div className="space-y-3">
        {logs.map((l) => (
          <div key={l.id} className="bg-card rounded-2xl p-5 shadow-sm">
            <div className="flex justify-between">
              <p className="font-medium text-foreground">{l.action}</p>
              <p className="text-xs text-muted-foreground">{new Date(l.created_at).toLocaleString()}</p>
            </div>
            {l.details && <p className="text-sm text-muted-foreground mt-1">{l.details}</p>}
          </div>
        ))}
        {logs.length === 0 && <p className="text-sm text-muted-foreground">No activity yet.</p>}
      </div>
    </div>
  );
};

export default VolunteerActivity;
