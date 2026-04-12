import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Heart, Utensils, HandCoins, ChevronDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import heroImg from "@/assets/hero-dogs.jpg";
import ImpactCounter from "@/components/ImpactCounter";

const Landing = () => {
  const impactRef = useRef<HTMLDivElement>(null);
  const [impactStats, setImpactStats] = useState({
    rescues: 0,
    foodDonations: 0,
    moneyDonations: 0,
  });

  useEffect(() => {
    const fetchImpactStats = async () => {
      const { data } = await supabase.rpc("get_public_impact_stats");
      const stats = data?.[0];

      setImpactStats({
        rescues: stats?.rescues ?? 0,
        foodDonations: stats?.food_donations ?? 0,
        moneyDonations: stats?.money_donations ?? 0,
      });
    };

    fetchImpactStats();
  }, []);

  const scrollToImpact = () => {
    impactRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen">
      <section className="relative h-screen flex flex-col">
        <img
          src={heroImg}
          alt="Street dogs running at sunset"
          className="absolute inset-0 w-full h-full object-cover"
          width={1920}
          height={1080}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/20" />
        
        <nav className="relative z-10 flex items-center justify-between p-6 md:px-12">
          <h1 className="text-2xl font-display text-primary-foreground italic">Safe-Paws</h1>
          <div className="flex gap-3">
            <Link to="/login" className="px-5 py-2 rounded-2xl text-primary-foreground/90 font-bold backdrop-blur-sm bg-white/10 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-white/10">
              Login
            </Link>
            <Link to="/register" className="px-5 py-2 rounded-2xl text-primary-foreground/90 font-bold backdrop-blur-sm bg-white/10 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-white/10">
              Register
            </Link>
            <button onClick={scrollToImpact} className="px-5 py-2 rounded-2xl text-primary-foreground/90 font-bold backdrop-blur-sm bg-white/10 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-white/10">
              Statistics
            </button>
          </div>
        </nav>

        <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6">
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-display text-primary-foreground max-w-4xl leading-tight">
            Protect Street Dogs With Safe-Paws
          </h2>
          <p className="mt-4 text-lg md:text-xl text-primary-foreground/80 max-w-2xl">
            Report injured dogs, support rescue teams, and save lives together.
          </p>
          <Link to="/login" className="mt-8">
            <button className="bg-coral text-coral-foreground hover:bg-coral/90 rounded-full px-10 py-4 text-lg font-semibold transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
              Login to Continue
            </button>
          </Link>
        </div>

        <button onClick={scrollToImpact} className="relative z-10 mx-auto mb-8 animate-bounce">
          <ChevronDown className="h-8 w-8 text-primary-foreground/70" />
        </button>
      </section>

      <section ref={impactRef} className="py-20 px-6 bg-secondary">
        <div className="max-w-5xl mx-auto text-center">
          <h3 className="text-3xl md:text-4xl font-display text-foreground mb-4">Our Impact</h3>
          <p className="text-muted-foreground mb-12 max-w-xl mx-auto">
            Real-time numbers from our community of rescuers and donors.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <ImpactCounter icon={<Heart className="h-10 w-10 text-coral" />} label="Animals Rescued" value={impactStats.rescues} />
            <ImpactCounter icon={<Utensils className="h-10 w-10 text-accent" />} label="Food Donations" value={impactStats.foodDonations} />
            <ImpactCounter icon={<HandCoins className="h-10 w-10 text-primary" />} label="Money Donations" value={impactStats.moneyDonations} />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
