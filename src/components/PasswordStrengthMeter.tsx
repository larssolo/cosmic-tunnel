import { useMemo } from "react";
import { Progress } from "@/components/ui/progress";

interface PasswordStrengthMeterProps {
  password: string;
}

export const PasswordStrengthMeter = ({ password }: PasswordStrengthMeterProps) => {
  const strength = useMemo(() => {
    if (!password) return { score: 0, label: "", color: "" };

    let score = 0;
    
    // Length check
    if (password.length >= 8) score += 25;
    if (password.length >= 12) score += 10;
    
    // Character variety checks
    if (/[a-z]/.test(password)) score += 15;
    if (/[A-Z]/.test(password)) score += 15;
    if (/[0-9]/.test(password)) score += 15;
    if (/[^a-zA-Z0-9]/.test(password)) score += 20;

    // Determine label and color
    if (score < 40) {
      return { score, label: "Weak", color: "bg-destructive" };
    } else if (score < 70) {
      return { score, label: "Medium", color: "bg-yellow-500" };
    } else {
      return { score, label: "Strong", color: "bg-green-500" };
    }
  }, [password]);

  if (!password) return null;

  return (
    <div className="space-y-2 mt-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Password strength:</span>
        <span className={`font-medium ${
          strength.label === "Weak" ? "text-destructive" :
          strength.label === "Medium" ? "text-yellow-500" :
          "text-green-500"
        }`}>
          {strength.label}
        </span>
      </div>
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className={`h-full transition-all duration-300 ${strength.color}`}
          style={{ width: `${strength.score}%` }}
        />
      </div>
    </div>
  );
};
