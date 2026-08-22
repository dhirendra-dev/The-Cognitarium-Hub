import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { BookOpen, Sparkles, ShieldCheck, ArrowRight } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [, navigate] = useLocation();
  
  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: () => {
      toast.success("Welcome back to Prep / Hub!");
      navigate("/dashboard");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Invalid email or password");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter email and password");
      return;
    }
    loginMutation.mutate({ email, password });
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-[#121110] text-foreground flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-accent/20 blur-3xl pointer-events-none" />
      <div className="absolute -right-32 -bottom-32 h-96 w-96 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        <div className="text-center space-y-2">
          <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
            <BookOpen className="h-6 w-6" />
          </div>
          <h1 className="display-serif text-3xl font-bold tracking-tight">Prep / Hub</h1>
          <p className="text-sm font-semibold text-muted-foreground">Adaptive JEE & Board Study Command Center</p>
        </div>

        <Card className="elevated-card rounded-[2rem] border border-border/80 bg-card p-8 shadow-sm">
          <div className="mb-6">
            <p className="ink-kicker">Secure Access</p>
            <h2 className="text-2xl font-bold mt-1">Sign in to your desk</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-muted-foreground mb-1.5">
                Email Address
              </label>
              <Input
                type="email"
                placeholder="dhirendraofficial0@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loginMutation.isPending}
                className="h-12 rounded-xl bg-background/50 font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-muted-foreground mb-1.5">
                Password
              </label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loginMutation.isPending}
                className="h-12 rounded-xl bg-background/50 font-semibold"
              />
            </div>

            <Button
              type="submit"
              className="h-12 w-full rounded-full font-bold shadow-sm transition-all"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? "Authenticating..." : "Open Study Desk"} <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>

          <div className="mt-6 rounded-xl bg-muted/40 p-4 text-xs leading-relaxed text-muted-foreground flex items-start gap-2.5">
            <ShieldCheck className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-foreground">Admin & Student Access</p>
              <p className="mt-0.5">Use your configured student credentials or administrator login to unlock full study tools and analytics.</p>
            </div>
          </div>
        </Card>

        <div className="text-center text-xs font-semibold text-muted-foreground">
          <a href="/" className="hover:underline">← Back to public overview</a>
        </div>
      </div>
    </div>
  );
}
