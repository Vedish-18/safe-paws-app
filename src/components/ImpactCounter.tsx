import { useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  icon: ReactNode;
  label: string;
  table: "injury_reports" | "food_donations" | "money_donations";
  isSum?: boolean;
}

const ImpactCounter = ({ icon, label, table, isSum }: Props) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const fetch = async () => {
      try {
        if (isSum && table === "money_donations") {
          const { data } = await supabase.from(table).select("amount");
          const total = data?.reduce((s, r) => s + Number(r.amount), 0) ?? 0;
          setCount(total);
        } else {
          const { count: c } = await supabase.from(table).select("*", { count: "exact", head: true });
          setCount(c ?? 0);
        }
      } catch {
        setCount(0);
      }
    };
    fetch();
  }, [table, isSum]);

  return (
    <div className="bg-card rounded-3xl p-8 shadow-sm animate-count-up">
      <div className="flex justify-center mb-4">{icon}</div>
      <p className="text-4xl font-bold text-foreground font-body">
        {isSum ? `₹${count.toLocaleString()}` : count.toLocaleString()}
      </p>
      <p className="text-muted-foreground mt-2">{label}</p>
    </div>
  );
};

export default ImpactCounter;
