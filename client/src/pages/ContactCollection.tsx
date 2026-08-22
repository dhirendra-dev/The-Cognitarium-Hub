import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, Copy, Eye, EyeOff, ShieldCheck, Sparkles, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { savePendingLogin } from "@/lib/credentialHandoff";

interface CredentialsData {
  email: string;
  password: string;
  name: string;
}

export default function ContactCollectionPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [credentials, setCredentials] = useState<CredentialsData | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const submitMutation = trpc.contactSubmissions.submit.useMutation({
    onSuccess: (data) => {
      if (data.credentials) {
        savePendingLogin({ email: data.credentials.email, password: data.credentials.password, name: data.credentials.name });
        setCredentials(data.credentials);
        setName("");
        setEmail("");
        setPhone("");
      }
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create account");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = "Name is required";
    } else if (name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Invalid email format";
    }

    if (phone.trim() && !/^[0-9\s\-\+\(\)]{10,}$/.test(phone)) {
      newErrors.phone = "Invalid phone number";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    await submitMutation.mutateAsync({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || undefined,
    });
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  if (credentials) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-4 font-sans" style={{ backgroundImage: 'radial-gradient(#e5e5e5 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
        <Card className="w-full max-w-md shadow-xl rounded-3xl border border-stone-200 bg-white p-2">
          <CardHeader className="space-y-3 text-center pb-2">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <CardTitle className="text-2xl font-serif font-bold text-stone-900">Account Created! 🎉</CardTitle>
            <CardDescription className="text-stone-600">Your secure access credentials for The Cognitarium Hub</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 pt-4">
            <Alert className="border-emerald-200 bg-emerald-50/60 rounded-2xl">
              <ShieldCheck className="h-4 w-4 text-emerald-700" />
              <AlertDescription className="text-emerald-900 text-xs font-medium">
                Your account is ready. Save your auto-generated credentials below.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-stone-600">Email Address</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="text"
                  value={credentials.email}
                  readOnly
                  className="bg-stone-50 text-stone-900 font-mono text-xs rounded-xl border-stone-200"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(credentials.email, "Email")}
                  className="rounded-xl border-stone-200 text-stone-700 hover:bg-stone-100 px-3"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-stone-600">Secure Password</Label>
              <div className="flex items-center gap-2">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={credentials.password}
                  readOnly
                  className="bg-stone-50 text-stone-900 font-mono text-xs rounded-xl border-stone-200"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowPassword(!showPassword)}
                  className="rounded-xl border-stone-200 text-stone-700 hover:bg-stone-100 px-3"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(credentials.password, "Password")}
                  className="rounded-xl border-stone-200 text-stone-700 hover:bg-stone-100 px-3"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <Button
              className="w-full bg-[#2D2420] hover:bg-[#3E322C] text-stone-50 font-bold py-3 rounded-xl shadow-md transition-all mt-2"
              onClick={() => {
                savePendingLogin({ email: credentials.email, password: credentials.password, name: credentials.name });
                window.location.href = "/login";
              }}
            >
              Sign In to Dashboard
            </Button>

            <Button
              variant="outline"
              className="w-full rounded-xl border-stone-200 text-stone-700 hover:bg-stone-100"
              onClick={() => setCredentials(null)}
            >
              Create Another Account
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-4 font-sans" style={{ backgroundImage: 'radial-gradient(#e5e5e5 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
      <Card className="w-full max-w-md shadow-xl rounded-3xl border border-stone-200 bg-white p-2">
        <CardHeader className="space-y-3 text-center pb-2">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-800 border border-amber-200/40">
            <BookOpen className="w-8 h-8" />
          </div>
          <CardTitle className="text-2xl font-serif font-bold text-stone-900">Join The Cognitarium Hub</CardTitle>
          <CardDescription className="text-stone-600 text-xs md:text-sm">
            Enter your details below to generate your secure student account instantly.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-stone-700">Full Name *</Label>
              <Input
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`rounded-xl border-stone-200 bg-stone-50/50 py-2.5 text-sm ${errors.name ? "border-red-400" : ""}`}
              />
              {errors.name && <p className="text-xs text-red-500 font-medium">{errors.name}</p>}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-stone-700">Email Address *</Label>
              <Input
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`rounded-xl border-stone-200 bg-stone-50/50 py-2.5 text-sm ${errors.email ? "border-red-400" : ""}`}
              />
              {errors.email && <p className="text-xs text-red-500 font-medium">{errors.email}</p>}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-stone-700">Phone Number (Optional)</Label>
              <Input
                type="tel"
                placeholder="+91 9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={`rounded-xl border-stone-200 bg-stone-50/50 py-2.5 text-sm ${errors.phone ? "border-red-400" : ""}`}
              />
              {errors.phone && <p className="text-xs text-red-500 font-medium">{errors.phone}</p>}
            </div>

            <Button
              type="submit"
              disabled={submitMutation.isPending}
              className="w-full bg-[#2D2420] hover:bg-[#3E322C] text-stone-50 font-bold py-3 rounded-xl shadow-md transition-all mt-4"
            >
              {submitMutation.isPending ? "Creating Account..." : "Create Account & Get Credentials"}
            </Button>

            <div className="text-center pt-2">
              <p className="text-xs text-stone-500">
                Already have an account?{" "}
                <a href="/login" className="text-amber-800 font-bold hover:underline">
                  Sign in here
                </a>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
