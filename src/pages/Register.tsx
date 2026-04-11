import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import authDog from "@/assets/auth-dog.jpg";

const Register = () => {
  const [form, setForm] = useState({
    fullName: "", email: "", phone: "", password: "", confirmPassword: "", role: "user"
  });
  const [loading, setLoading] = useState(false);

  const update = (field: string, value: string) => setForm((p) => ({ ...p, [field]: value }));

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            full_name: form.fullName,
            phone: form.phone,
            role: form.role,
          },
        },
      });
      if (error) throw error;
      toast.success("Registration successful! Please check your email to verify your account.");
    } catch (err: any) {
      toast.error(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center bg-teal">
        <img src={authDog} alt="Golden retriever" className="w-full h-full object-cover" loading="lazy" width={768} height={1024} />
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gradient-to-br from-teal-light to-secondary">
        <div className="w-full max-w-md bg-card/60 backdrop-blur-sm rounded-3xl p-10 shadow-lg">
          <h1 className="text-3xl font-display text-center text-foreground mb-8">Register</h1>
          <form onSubmit={handleRegister} className="space-y-4">
            <Input placeholder="Full Name" value={form.fullName} onChange={(e) => update("fullName", e.target.value)} required className="rounded-2xl bg-muted/50 border-0 h-12" />
            <Input type="email" placeholder="Email" value={form.email} onChange={(e) => update("email", e.target.value)} required className="rounded-2xl bg-muted/50 border-0 h-12" />
            <Input placeholder="Phone Number" value={form.phone} onChange={(e) => update("phone", e.target.value)} className="rounded-2xl bg-muted/50 border-0 h-12" />
            <Input type="password" placeholder="Password" value={form.password} onChange={(e) => update("password", e.target.value)} required className="rounded-2xl bg-muted/50 border-0 h-12" />
            <Input type="password" placeholder="Confirm Password" value={form.confirmPassword} onChange={(e) => update("confirmPassword", e.target.value)} required className="rounded-2xl bg-muted/50 border-0 h-12" />
            <Select value={form.role} onValueChange={(v) => update("role", v)}>
              <SelectTrigger className="rounded-2xl bg-muted/50 border-0 h-12">
                <SelectValue placeholder="Select Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="volunteer">Volunteer</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
            <Button type="submit" disabled={loading} className="w-full rounded-2xl h-12 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-base">
              {loading ? "Registering..." : "Register"}
            </Button>
          </form>
          <p className="text-center mt-6 text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-medium hover:underline">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
