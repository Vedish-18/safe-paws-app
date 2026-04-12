import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import authDog from "@/assets/auth-dog.jpg";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user, role, loading: authLoading } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user && role) {
      navigate(`/${role}`, { replace: true });
    }
  }, [authLoading, user, role, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          toast.error("Invalid email or password. Please try again.");
        } else if (error.message.includes("Email not confirmed")) {
          toast.error("Please verify your email address before logging in.");
        } else {
          toast.error(error.message);
        }
        setLoading(false);
        return;
      }
      // Auth state change listener in useAuth will update user/role,
      // then the useEffect above will handle redirect
      toast.success("Login successful!");
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred");
      setLoading(false);
    }
  };

  // Show loading if auth is still initializing
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

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
