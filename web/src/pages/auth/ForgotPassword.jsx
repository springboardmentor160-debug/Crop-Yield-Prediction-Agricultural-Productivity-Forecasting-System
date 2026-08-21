import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import authApi from "../../api/authApi";
import AuthLayout from "../../layouts/AuthLayout";
import AuthCard from "../../components/auth/AuthCard";
import Button from "../../components/common/Button";

function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState(
    sessionStorage.getItem("resetEmail") || ""
  );

  const [loading, setLoading] = useState(false);

  const handleForgotPassword = async (event) => {
    event.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();

    try {
      setLoading(true);

      const response = await authApi.post(
        "/forgot-password",
        {
          email: normalizedEmail,
        }
      );

      sessionStorage.setItem(
        "resetEmail",
        normalizedEmail
      );

      toast.success(
        response.data.message ||
          "Password reset OTP sent successfully"
      );

      navigate("/reset-password", {
        state: {
          email: normalizedEmail,
          startTimer: true,
        },
      });
    } catch (error) {
      toast.error(
        error.response?.data?.detail ||
          "Failed to send password reset OTP"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <AuthCard
        title="Forgot Password"
        subtitle="Receive a secure password-reset code by email"
      >
        <form
          onSubmit={handleForgotPassword}
          className="space-y-4"
        >
          <input
            type="email"
            placeholder="Registered email address"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            autoComplete="email"
            className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-green-600"
          />

          <p className="text-sm leading-6 text-gray-500">
            We will send a six-digit password-reset code to your
            registered email. The code expires after 10 minutes.
          </p>

          <Button type="submit" disabled={loading}>
            {loading
              ? "Sending reset OTP..."
              : "Send Reset OTP"}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm">
          <Link to="/login" className="font-medium text-green-700">
            Back to login
          </Link>
        </p>
      </AuthCard>
    </AuthLayout>
  );
}

export default ForgotPassword;