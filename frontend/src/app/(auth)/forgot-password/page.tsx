/**
 * YieldSense AI  -  Forgot Password Page
 */

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { ROUTES } from "@/utils/constants";
import { validateEmail } from "@/utils/validators";

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const emailError = validateEmail(email);
    if (emailError) {
      setError(emailError);
      return;
    }

    setError("");
    setLoading(true);

    try {
      await resetPassword(email);
      setSent(true);
      toast.success("Password reset email sent!");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to send reset email";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="text-center py-4">
        <div className="w-16 h-16 rounded-2xl bg-green-100 dark:bg-green-900/20 flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Check your email
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          We&apos;ve sent a password reset link to <strong>{email}</strong>
        </p>
        <Link href={ROUTES.LOGIN}>
          <Button variant="outline" fullWidth>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to login
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Reset password
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Enter your email and we&apos;ll send you a reset link
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Email"
          type="email"
          placeholder="farmer@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={error}
          icon={<Mail className="h-4 w-4" />}
        />

        <Button type="submit" fullWidth isLoading={loading}>
          Send Reset Link
        </Button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        <Link
          href={ROUTES.LOGIN}
          className="text-green-600 hover:text-green-700 font-semibold inline-flex items-center gap-1"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to login
        </Link>
      </p>
    </>
  );
}
