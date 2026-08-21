/**
 * YieldSense AI  -  Login Page
 */

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { ROUTES } from "@/utils/constants";
import { validateEmail, validatePassword } from "@/utils/validators";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);

    if (emailError || passwordError) {
      setErrors({ email: emailError || undefined, password: passwordError || undefined });
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const userProfile = await login(email, password);
      toast.success("Welcome back!");
      const targetRoute = userProfile?.role === "admin" ? ROUTES.ADMIN : ROUTES.DASHBOARD;
      window.location.href = targetRoute;
    } catch (error: unknown) {


      const message = error instanceof Error ? error.message : "Login failed";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };


  return (
    <>
      <div className="text-center mb-5">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
          Welcome back
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Sign in to your YieldSense AI account
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email"
          type="email"
          placeholder="farmer@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          icon={<Mail className="h-4 w-4" />}
        />

        <div className="relative">
          <Input
            label="Password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            icon={<Lock className="h-4 w-4" />}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-[38px] text-gray-400 hover:text-gray-600 transition-colors"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        <div className="flex items-center justify-end">
          <Link
            href={ROUTES.FORGOT_PASSWORD}
            className="text-xs text-[#1a6b3c] hover:text-[#155730] font-medium"
          >
            Forgot password?
          </Link>
        </div>

        <Button type="submit" fullWidth isLoading={loading}>
          Sign In
        </Button>
      </form>

      <p className="text-center text-xs text-gray-500 mt-5">
        Don&apos;t have an account?{" "}
        <Link
          href={ROUTES.SIGNUP}
          className="text-[#1a6b3c] hover:text-[#155730] font-semibold"
        >
          Create one
        </Link>
      </p>
    </>
  );
}
