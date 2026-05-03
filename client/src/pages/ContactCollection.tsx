import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, Mail, Phone, Copy, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

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
  const [isLoginMode, setIsLoginMode] = useState(false);

  const submitMutation = trpc.contactSubmissions.submit.useMutation({
    onSuccess: (data) => {
      if (data.credentials) {
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

    // Validate name
    if (!name.trim()) {
      newErrors.name = "Name is required";
    } else if (name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    // Validate email (required)
    if (!email.trim()) {
      newErrors.email = "Email is required";
    }

    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
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

    // Submit via tRPC
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
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl border-2 border-green-200">
          <CardHeader className="space-y-2 text-center">
            <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-2" />
            <CardTitle className="text-2xl text-green-700">Account Created! 🎉</CardTitle>
            <CardDescription>Your login credentials are ready</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">
                Your account is ready to use immediately!
              </AlertDescription>
            </Alert>

            {/* Email Display */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">Email</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="text"
                  value={credentials.email}
                  readOnly
                  className="bg-gray-50 text-gray-900 font-mono text-sm"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(credentials.email, "Email")}
                  className="px-3"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Password Display */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">Password</Label>
              <div className="flex items-center gap-2">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={credentials.password}
                  readOnly
                  className="bg-gray-50 text-gray-900 font-mono text-sm"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowPassword(!showPassword)}
                  className="px-3"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(credentials.password, "Password")}
                  className="px-3"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <Alert className="border-blue-200 bg-blue-50">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-700 text-sm">
                Save these credentials securely. You can change your password after logging in.
              </AlertDescription>
            </Alert>

            {/* Login Button */}
            <Button
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-2 rounded-lg transition"
              onClick={() => window.location.href = '/login'}
            >
              Go to Login
            </Button>

            {/* Create Another Account */}
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setCredentials(null)}
            >
              Create Another Account
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoginMode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl border-2 border-blue-200">
          <CardHeader className="space-y-2 text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">🔐</div>
            <CardTitle className="text-2xl">Login</CardTitle>
            <CardDescription>Enter your credentials to access the dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-gray-600 text-center">
                Redirecting to login page...
              </p>
              <Button
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-2 rounded-lg transition"
                onClick={() => window.location.href = '/login'}
              >
                Go to Login
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setIsLoginMode(false)}
              >
                Back to Sign Up
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-2 border-blue-200">
        <CardHeader className="space-y-2 text-center">
          <div className="text-4xl font-bold text-blue-600 mb-2">📚</div>
          <CardTitle className="text-2xl">Join Our Community</CardTitle>
          <CardDescription>Share your contact details to get started</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* General Error Alert */}
            {errors.contact && (
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-600">
                  {errors.contact}
                </AlertDescription>
              </Alert>
            )}

            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) {
                    const newErrors = { ...errors };
                    delete newErrors.name;
                    setErrors(newErrors);
                  }
                }}
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email Address *
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) {
                    const newErrors = { ...errors };
                    delete newErrors.email;
                    setErrors(newErrors);
                  }
                }}
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Phone Field */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Phone Number
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+91 9876543210"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  if (errors.phone) {
                    const newErrors = { ...errors };
                    delete newErrors.phone;
                    setErrors(newErrors);
                  }
                }}
                className={errors.phone ? "border-red-500" : ""}
              />
              {errors.phone && (
                <p className="text-sm text-red-600">{errors.phone}</p>
              )}
            </div>

            <p className="text-xs text-gray-500 text-center">
              * Required field
            </p>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={submitMutation.isPending}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-2 rounded-lg transition"
            >
              {submitMutation.isPending ? "Creating Account..." : "Create Account"}
            </Button>

            <p className="text-xs text-gray-500 text-center">
              Your account will be created instantly. Get your login credentials immediately!
            </p>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 text-center mb-3">
              Already have an account?
            </p>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setIsLoginMode(true)}
            >
              Login Here
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
