import { useMemo } from "react";

interface PasswordStrengthIndicatorProps {
  password: string;
}

export function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
  const strength = useMemo(() => {
    if (!password) return { level: 0, label: "", color: "bg-gray-300" };

    let score = 0;
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*]/.test(password),
    };

    Object.values(checks).forEach(check => {
      if (check) score++;
    });

    if (score <= 2) return { level: 1, label: "Weak", color: "bg-red-500" };
    if (score <= 3) return { level: 2, label: "Fair", color: "bg-yellow-500" };
    if (score <= 4) return { level: 3, label: "Good", color: "bg-blue-500" };
    return { level: 4, label: "Strong", color: "bg-green-500" };
  }, [password]);

  if (!password) return null;

  return (
    <div className="mt-2 space-y-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map(i => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${
              i <= strength.level ? strength.color : "bg-gray-200"
            }`}
          />
        ))}
      </div>
      <p className="text-xs text-gray-600">
        Password strength: <span className={`font-semibold ${strength.color.replace('bg-', 'text-')}`}>{strength.label}</span>
      </p>
    </div>
  );
}
