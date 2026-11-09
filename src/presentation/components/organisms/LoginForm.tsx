import React, { useState } from "react";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { Button } from "../atoms/Button";

export interface LoginFormProps {
  onSuccess?: () => void;
  className?: string;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSuccess,
  className = "",
}) => {
  const [email, setEmail] = useState("john.doe@company.com");
  const [password, setPassword] = useState("••••••••••••");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    try {
      setIsLoading(true);
      // Simulate realistic authentication delay
      await new Promise((resolve) => setTimeout(resolve, 600));

      // Save user session in localStorage if in browser
      if (typeof window !== "undefined") {
        localStorage.setItem(
          "autocv_user",
          JSON.stringify({
            name: "John Doe",
            email,
            role: "Senior Fullstack Engineer",
            signedInAt: new Date().toISOString(),
          })
        );
      }

      setIsLoading(false);
      if (onSuccess) {
        onSuccess();
      }
    } catch {
      setIsLoading(false);
      setError("Failed to sign in. Please try again.");
    }
  };

  return (
    <div className={`w-full max-w-[440px] ${className}`}>
      {/* Brand Header */}
      <div className="flex items-center gap-3">
        <svg viewBox="0 0 32 32" className="size-9" aria-hidden="true">
          <rect width="32" height="32" rx="8" fill="#0F172A" />
          <path
            d="M10 8.5h8.2L23 13.3V23a.5.5 0 0 1-.5.5h-12A.5.5 0 0 1 10 23V8.5Z"
            fill="#fff"
          />
          <path
            d="M18.2 8.5V13h4.8"
            fill="none"
            stroke="#CBD5E1"
            strokeWidth="1.2"
          />
          <rect
            x="12.6"
            y="16"
            width="7.6"
            height="1.5"
            rx=".75"
            fill="#2563EB"
          />
          <rect
            x="12.6"
            y="19.2"
            width="5.2"
            height="1.5"
            rx=".75"
            fill="#94A3B8"
          />
        </svg>
        <span className="text-[22px] font-bold tracking-tight text-slate-900">
          AutoCV
        </span>
        <span className="ml-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 border border-slate-200/60">
          Hackathon 2026 #HumanInTheLead
        </span>
      </div>

      <h1 className="mt-10 text-[28px] leading-tight font-bold tracking-tight text-slate-900">
        Welcome to AutoCV
      </h1>
      <p className="mt-2 text-[15px] leading-relaxed text-slate-600">
        Sign in to curate and generate your ATS-compliant engineering dossier.
      </p>

      {error && (
        <div className="mt-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-4">
        {/* Email */}
        <div>
          <label
            htmlFor="auth-email"
            className="block text-[13px] font-semibold text-slate-700 mb-1.5"
          >
            Email
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-slate-400">
              <Mail className="size-4" />
            </span>
            <input
              id="auth-email"
              type="email"
              autoComplete="email"
              placeholder="john.doe@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 w-full rounded-xl border border-slate-300 bg-white pl-10 pr-3.5 text-sm text-slate-900 shadow-xs outline-none transition-colors placeholder:text-slate-400 hover:border-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/15"
              required
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label
              htmlFor="auth-password"
              className="text-[13px] font-semibold text-slate-700"
            >
              Password
            </label>
            <button
              type="button"
              className="cursor-pointer text-[13px] font-medium text-blue-600 hover:text-blue-700 hover:underline"
            >
              Forgot password?
            </button>
          </div>
          <div className="relative">
            <span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-slate-400">
              <Lock className="size-4" />
            </span>
            <input
              id="auth-password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11 w-full rounded-xl border border-slate-300 bg-white pl-10 pr-11 text-sm text-slate-900 shadow-xs outline-none transition-colors placeholder:text-slate-400 hover:border-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/15"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute top-1/2 right-2 -translate-y-1/2 grid size-8 cursor-pointer place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            >
              {showPassword ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </button>
          </div>
        </div>

        {/* Remember device checkbox */}
        <label className="flex w-fit cursor-pointer items-center gap-2.5 text-[13px] text-slate-600 select-none pt-1">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="size-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600"
          />
          Remember this device for 30 days
        </label>

        {/* Submit Button */}
        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full h-[46px] shadow-md shadow-blue-500/25"
            isLoading={isLoading}
            icon={<ArrowRight className="size-4.5" />}
          >
            {isLoading ? "Signing in..." : "Sign In to Studio"}
          </Button>
        </div>
      </form>

      {/* Footer */}
      <p className="mt-6 text-center text-sm text-slate-600">
        Don&apos;t have an account?{" "}
        <button
          type="button"
          className="cursor-pointer font-semibold text-blue-600 hover:text-blue-700 hover:underline"
        >
          Create an account
        </button>
      </p>

      <p className="mt-8 text-center text-[11px] leading-relaxed text-slate-400">
        By signing in, you agree to the{" "}
        <a
          href="#"
          className="underline decoration-slate-300 underline-offset-2 hover:text-slate-600"
        >
          Terms of Service
        </a>{" "}
        &amp;{" "}
        <a
          href="#"
          className="underline decoration-slate-300 underline-offset-2 hover:text-slate-600"
        >
          Privacy Policy
        </a>
        .
      </p>
    </div>
  );
};
