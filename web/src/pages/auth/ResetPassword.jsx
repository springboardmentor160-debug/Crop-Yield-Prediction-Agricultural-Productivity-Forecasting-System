import { useEffect, useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";
import toast from "react-hot-toast";

import authApi from "../../api/authApi";
import AuthLayout from "../../layouts/AuthLayout";
import AuthCard from "../../components/auth/AuthCard";
import Button from "../../components/common/Button";

const DEFAULT_COOLDOWN_SECONDS = 30;

function getRetryAfterSeconds(error) {
  const retryAfter = Number(
    error.response?.headers?.["retry-after"]
  );

  if (Number.isFinite(retryAfter) && retryAfter > 0) {
    return Math.ceil(retryAfter);
  }

  const detail = error.response?.data?.detail;

  if (typeof detail === "string") {
    const match = detail.match(/wait\s+(\d+)\s+seconds?/i);

    if (match) {
      return Number(match[1]);
    }
  }

  return DEFAULT_COOLDOWN_SECONDS;
}

function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();

  const initialEmail =
    location.state?.email ||
    sessionStorage.getItem("resetEmail") ||
    "";

  const shouldStartTimer =
    location.state?.startTimer === true;

  const [form, setForm] = useState({
    email: initialEmail,
    otp_code: "",
    new_password: "",
    confirm_password: "",
  });

  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const [secondsRemaining, setSecondsRemaining] = useState(
    shouldStartTimer ? DEFAULT_COOLDOWN_SECONDS : 0
  );

  useEffect(() => {
    if (secondsRemaining <= 0) {
      return undefined;
    }

    const timerId = window.setInterval(() => {
      setSecondsRemaining((current) =>
        current > 0 ? current - 1 : 0
      );
    }, 1000);

    return () => window.clearInterval(timerId);
  }, [secondsRemaining]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]:
        name === "otp_code"
          ? value.replace(/\D/g, "").slice(0, 6)
          : value,
    }));
  };

  const handleResetPassword = async (event) => {
    event.preventDefault();

    if (form.otp_code.length !== 6) {
      toast.error("Enter the complete six-digit OTP");
      return;
    }

    if (form.new_password.length < 8) {
      toast.error(
        "New password must contain at least 8 characters"
      );
      return;
    }

    if (form.new_password !== form.confirm_password) {
      toast.error("New password and confirmation do not match");
      return;
    }

    const payload = {
      email: form.email.trim().toLowerCase(),
      otp_code: form.otp_code,
      new_password: form.new_password,
    };

    try {
      setLoading(true);

      const response = await authApi.post(
        "/reset-password",
        payload
      );

      sessionStorage.removeItem("resetEmail");

      toast.success(
        response.data.message ||
          "Password reset successfully"
      );

      navigate("/login", {
        replace: true,
      });
    } catch (error) {
      toast.error(
        error.response?.data?.detail ||
          "Password reset failed"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (secondsRemaining > 0 || resending) {
      return;
    }

    const normalizedEmail = form.email.trim().toLowerCase();

    if (!normalizedEmail) {
      toast.error("Enter your registered email address");
      return;
    }

    try {
      setResending(true);

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

      setSecondsRemaining(DEFAULT_COOLDOWN_SECONDS);

      toast.success(
        response.data.message ||
          "A new password-reset OTP was sent"
      );
    } catch (error) {
      if (error.response?.status === 429) {
        setSecondsRemaining(
          getRetryAfterSeconds(error)
        );
      }

      toast.error(
        error.response?.data?.detail ||
          "Unable to resend password-reset OTP"
      );
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthLayout>
      <AuthCard
        title="Reset Password"
        subtitle="Enter the emailed OTP and create a new password"
      >
        <form
          onSubmit={handleResetPassword}
          className="space-y-4"
        >
          <input
            name="email"
            type="email"
            placeholder="Email address"
            value={form.email}
            onChange={handleChange}
            required
            autoComplete="email"
            className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-green-600"
          />

          <input
            name="otp_code"
            type="text"
            inputMode="numeric"
            placeholder="Six-digit reset OTP"
            value={form.otp_code}
            onChange={handleChange}
            required
            minLength={6}
            maxLength={6}
            autoComplete="one-time-code"
            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-center text-xl font-bold tracking-[0.4em] outline-none focus:border-green-600"
          />

          <input
            name="new_password"
            type="password"
            placeholder="New password"
            value={form.new_password}
            onChange={handleChange}
            required
            minLength={8}
            autoComplete="new-password"
            className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-green-600"
          />

          <input
            name="confirm_password"
            type="password"
            placeholder="Confirm new password"
            value={form.confirm_password}
            onChange={handleChange}
            required
            minLength={8}
            autoComplete="new-password"
            className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-green-600"
          />

          <Button type="submit" disabled={loading}>
            {loading
              ? "Updating password..."
              : "Reset Password"}
          </Button>
        </form>

        <div className="mt-5 text-center text-sm">
          {secondsRemaining > 0 ? (
            <p className="text-gray-500">
              Resend reset OTP in{" "}
              <span className="font-bold text-green-700">
                {secondsRemaining}s
              </span>
            </p>
          ) : (
            <button
              type="button"
              onClick={handleResendOTP}
              disabled={resending}
              className="font-semibold text-green-700 hover:text-green-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {resending
                ? "Sending new OTP..."
                : "Didn't receive it? Resend OTP"}
            </button>
          )}
        </div>

        <p className="mt-4 text-center text-sm">
          <Link to="/login" className="font-medium text-green-700">
            Back to login
          </Link>
        </p>
      </AuthCard>
    </AuthLayout>
  );
}

export default ResetPassword;
