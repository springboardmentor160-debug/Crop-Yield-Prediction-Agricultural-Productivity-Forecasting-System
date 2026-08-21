/**
 * YieldSense AI  -  Signup Page
 */

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, User } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { ROUTES } from "@/utils/constants";
import { validateEmail, validatePassword, validateName } from "@/utils/validators";

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuth();
  const [formData, setFormData] = useState({
    display_name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "farmer" as "farmer" | "admin",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    const nameError = validateName(formData.display_name);
    const emailError = validateEmail(formData.email);
    const passwordError = validatePassword(formData.password);

    if (nameError) newErrors.display_name = nameError;
    if (emailError) newErrors.email = emailError;
    if (passwordError) newErrors.password = passwordError;
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      await signup({
        email: formData.email,
        password: formData.password,
        display_name: formData.display_name,
        role: formData.role,
      });
      toast.success("Account created successfully!");
      const targetRoute = formData.role === "admin" ? ROUTES.ADMIN : ROUTES.DASHBOARD;
      window.location.href = targetRoute;
    } catch (error: unknown) {

      const message = error instanceof Error ? error.message : "Registration failed";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };


  return (
    <>
      <div className="text-center mb-4">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
          Create your account
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Start predicting crop yields with AI
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <Input
          label="Full Name"
          type="text"
          placeholder="John Doe"
          value={formData.display_name}
          onChange={(e) => updateField("display_name", e.target.value)}
          error={errors.display_name}
          icon={<User className="h-4 w-4" />}
        />

        <Input
          label="Email"
          type="email"
          placeholder="farmer@example.com"
          value={formData.email}
          onChange={(e) => updateField("email", e.target.value)}
          error={errors.email}
          icon={<Mail className="h-4 w-4" />}
        />

        <div className="relative">
          <Input
            label="Password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) => updateField("password", e.target.value)}
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

        <Input
          label="Confirm Password"
          type="password"
          placeholder="••••••••"
          value={formData.confirmPassword}
          onChange={(e) => updateField("confirmPassword", e.target.value)}
          error={errors.confirmPassword}
          icon={<Lock className="h-4 w-4" />}
        />

        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            I am a
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: "farmer", label: "Farmer" },
              { value: "admin", label: "Administrator" },
            ].map((role) => (
              <button
                key={role.value}
                type="button"
                onClick={() => updateField("role", role.value)}
                className={`
                  px-3 py-2 rounded-lg text-xs font-medium border transition-colors duration-150
                  ${
                    formData.role === role.value
                      ? "border-[#1a6b3c] bg-[#e8f5ec] dark:bg-green-900/20 text-[#1a6b3c] dark:text-green-400"
                      : "border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500"
                  }
                `}
              >
                {role.label}
              </button>
            ))}
          </div>
        </div>

        <Button type="submit" fullWidth isLoading={loading} className="mt-2">
          Create Account
        </Button>
      </form>

      <p className="text-center text-xs text-gray-500 mt-4">
        Already have an account?{" "}
        <Link
          href={ROUTES.LOGIN}
          className="text-[#1a6b3c] hover:text-[#155730] font-semibold"
        >
          Sign in
        </Link>
      </p>
    </>
  );
}
