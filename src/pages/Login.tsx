import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import authDog from "@/assets/auth-dog.jpg";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user");

      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle();

      const role = roleData?.role || "user";
      toast.success("Login successful!");
      navigate(`/${role}`, { replace: true });
    } catch (err: any) {
      toast.error(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left - Dog Image */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center bg-teal">
        <img src={authDog} alt="Golden retriever" className="w-full h-full object-cover" loading="lazy" width={768} height={1024} />
      </div>

      {/* Right - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gradient-to-br from-teal-light to-secondary">
        <div className="w-full max-w-md bg-card/60 backdrop-blur-sm rounded-3xl p-10 shadow-lg">
          <h1 className="text-3xl font-display text-center text-foreground mb-8">Login</h1>
          <form onSubmit={handleLogin} className="space-y-5">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="rounded-2xl bg-muted/50 border-0 h-12 text-foreground placeholder:text-muted-foreground"
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="rounded-2xl bg-muted/50 border-0 h-12 text-foreground placeholder:text-muted-foreground"
            />
            <Button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl h-12 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-base"
            >
              {loading ? "Logging in..." : "LOGIN"}
            </Button>
          </form>
          <p className="text-center mt-6 text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/register" className="text-primary font-medium hover:underline">Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
