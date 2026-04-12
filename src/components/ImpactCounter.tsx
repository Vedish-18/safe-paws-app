import { useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  icon: ReactNode;
  label: string;
  table?: "injury_reports" | "food_donations" | "money_donations";
  filter?: { column: string; value: string };
  value?: number;
}

const ImpactCounter = ({ icon, label, table, filter, value }: Props) => {
  const [count, setCount] = useState(value ?? 0);
  const [animatedCount, setAnimatedCount] = useState(0);

  useEffect(() => {
    if (typeof value === "number") {
      setCount(value);
      return;
    }

    if (!table) {
      setCount(0);
      return;
    }

    const fetchData = async () => {
      try {
        let query = supabase.from(table).select("*", { count: "exact", head: true });

        if (filter) {
          query = query.eq(filter.column, filter.value);
        }

        const { count: result } = await query;
        setCount(result ?? 0);
      } catch {
        setCount(0);
      }
    };

    fetchData();
  }, [table, filter, value]);

  useEffect(() => {
    if (count === 0) {
      setAnimatedCount(0);
      return;
    }

    const duration = 1500;
    const steps = 40;
    const increment = count / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= count) {
        setAnimatedCount(count);
        clearInterval(timer);
      } else {
        setAnimatedCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [count]);

  return (
    <div className="bg-card rounded-3xl p-8 shadow-sm">
      <div className="flex justify-center mb-4">{icon}</div>
      <p className="text-4xl font-bold text-foreground font-body">{animatedCount.toLocaleString()}</p>
      <p className="text-muted-foreground mt-2">{label}</p>
    </div>
  );
};

export default ImpactCounter;
