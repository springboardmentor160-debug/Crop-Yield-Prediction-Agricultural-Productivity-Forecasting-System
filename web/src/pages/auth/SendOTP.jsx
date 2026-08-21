import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import authApi from "../../api/authApi";
import AuthLayout from "../../layouts/AuthLayout";
import AuthCard from "../../components/auth/AuthCard";
import Button from "../../components/common/Button";

function SendOTP() {
  const navigate = useNavigate();

  const [email, setEmail] = useState(
    sessionStorage.getItem("verificationEmail") || ""
  );

  const [loading, setLoading] = useState(false);

  const handleSendOTP = async (event) => {
    event.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();

    try {
      setLoading(true);

      const response = await authApi.post("/send-otp", {
        email: normalizedEmail,
      });

      sessionStorage.setItem(
        "verificationEmail",
        normalizedEmail
      );

      toast.success(
        response.data.message ||
          "Verification OTP sent successfully"
      );

      navigate("/verify-otp", {
        state: {
          email: normalizedEmail,
          startTimer: true,
        },
      });
    } catch (error) {
      toast.error(
        error.response?.data?.detail ||
          "Failed to send verification OTP"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <AuthCard
        title="Email Verification"
        subtitle="Send a new verification code to your email"
      >
        <form onSubmit={handleSendOTP} className="space-y-4">
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
            A six-digit OTP will be sent to your registered email.
            The code remains valid for 10 minutes.
          </p>

          <Button type="submit" disabled={loading}>
            {loading ? "Sending..." : "Send OTP"}
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

export default SendOTP;