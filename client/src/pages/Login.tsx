import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { ArrowRight, BookOpen, ShieldCheck } from "lucide-react";
import { consumePendingLogin } from "@/lib/credentialHandoff";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [handoffReady, setHandoffReady] = useState(false);
  const [, navigate] = useLocation();

  useEffect(() => {
    const pending = consumePendingLogin();
    if (pending) {
      setEmail(pending.email);
      setPassword(pending.password);
      setHandoffReady(true);
      toast.success("Your new account details are ready. Review them and sign in.");
    }
  }, []);

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: () => {
      toast.success("Welcome back to The Cognitarium Hub!");
      navigate("/dashboard");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Invalid email or password");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      toast.error("Please enter email and password");
      return;
    }
    loginMutation.mutate({ email: email.trim(), password });
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-[#121110] text-foreground flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      <div className="absolute inset-0 opacity-60 pointer-events-none" style={{ backgroundImage: "radial-gradient(#e7dfd4 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
      <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-[#F1D7AF]/30 blur-3xl pointer-events-none" />
      <div className="absolute -right-32 -bottom-32 h-96 w-96 rounded-full bg-[#7E453D]/10 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        <div className="text-center space-y-2">
          <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary p-2.5 shadow-sm">
            <img src="/manus-storage/cognitarium-hub-logo_2e4f180f.svg" alt="The Cognitarium Hub logo" className="h-full w-full object-contain" />
          </div>
          <h1 className="display-serif text-3xl font-bold tracking-tight">The Cognitarium Hub</h1>
          <p className="text-sm font-semibold text-muted-foreground">Adaptive JEE & Board Study Command Center</p>
        </div>

        <Card className="elevated-card rounded-[2rem] border border-border/80 bg-card p-6 sm:p-8 shadow-sm">
          <div className="mb-6">
            <p className="ink-kicker">Secure Access</p>
            <h2 className="text-2xl font-bold mt-1">Sign in to your desk</h2>
            {handoffReady && (
              <p className="mt-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-900">
                Account details loaded from your registration. Your password remains masked.
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
            <div>
              <label htmlFor="login-email" className="block text-xs font-black uppercase tracking-wider text-muted-foreground mb-1.5">
                Email Address
              </label>
              <Input
                id="login-email"
                name="email"
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loginMutation.isPending}
                autoComplete="off"
                className="h-12 rounded-xl bg-background/50 font-semibold"
              />
            </div>

            <div>
              <label htmlFor="login-password" className="block text-xs font-black uppercase tracking-wider text-muted-foreground mb-1.5">
                Password
              </label>
              <Input
                id="login-password"
                name="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loginMutation.isPending}
                autoComplete="new-password"
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
              <p className="font-bold text-foreground">Private student access</p>
              <p className="mt-0.5">Your credentials are used only to open your study desk. Never share your password on a public device.</p>
            </div>
          </div>
        </Card>

        <div className="text-center text-xs font-semibold text-muted-foreground">
          <a href="/" className="hover:underline">← Back to public overview</a>
          <span className="mx-2 text-border">•</span>
          <a href="/contact" className="hover:underline">Create a student account</a>
        </div>
      </div>
    </div>
  );
}
