import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

const SettingsPage = () => {
  const [theme, setTheme] = useState<"light" | "dark" | "system">("light");

  useEffect(() => {
    const saved = localStorage.getItem("theme") as typeof theme;
    if (saved) setTheme(saved);
  }, []);

  const applyTheme = (t: typeof theme) => {
    setTheme(t);
    localStorage.setItem("theme", t);
    const root = document.documentElement;
    if (t === "dark") root.classList.add("dark");
    else if (t === "light") root.classList.remove("dark");
    else {
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) root.classList.add("dark");
      else root.classList.remove("dark");
    }
    toast.success(`Theme set to ${t}`);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <p className="text-xs uppercase tracking-widest text-accent font-semibold">Preferences</p>
        <h2 className="text-2xl font-display text-foreground mt-1">Settings</h2>
      </div>

      <div className="bg-card rounded-3xl p-8 shadow-sm space-y-6">
        <div>
          <p className="font-medium text-foreground mb-3">Theme</p>
          <div className="flex gap-3">
            {(["light", "dark", "system"] as const).map((t) => (
              <Button key={t} variant={theme === t ? "default" : "outline"} onClick={() => applyTheme(t)} className="rounded-2xl capitalize">
                {t}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-foreground">Notifications</p>
            <p className="text-sm text-muted-foreground">Receive push notifications</p>
          </div>
          <Switch />
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
