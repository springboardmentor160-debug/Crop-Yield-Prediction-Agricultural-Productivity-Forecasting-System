import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import authApi from "../../api/authApi";
import AuthLayout from "../../layouts/AuthLayout";
import AuthCard from "../../components/auth/AuthCard";
import Button from "../../components/common/Button";

function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
  });

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleRegister = async (event) => {
    event.preventDefault();

    const payload = {
      full_name: form.full_name.trim(),
      email: form.email.trim().toLowerCase(),
      phone: form.phone.trim() || null,
      password: form.password,
    };

    if (payload.full_name.length < 2) {
      toast.error("Enter a valid full name");
      return;
    }

    if (payload.password.length < 8) {
      toast.error("Password must contain at least 8 characters");
      return;
    }

    try {
      setLoading(true);

      const response = await authApi.post("/register", payload);

      sessionStorage.setItem(
        "verificationEmail",
        response.data.email
      );

      toast.success(
        response.data.message ||
          "Registration successful. Check your email for the OTP."
      );

      navigate("/verify-otp", {
        state: {
          email: response.data.email,
          startTimer: true,
        },
      });
    } catch (error) {
      toast.error(
        error.response?.data?.detail ||
          "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <AuthCard
        title="Create Account"
        subtitle="Register as a farmer and verify your email"
      >
        <form onSubmit={handleRegister} className="space-y-4">
          <input
            name="full_name"
            placeholder="Full name"
            value={form.full_name}
            onChange={handleChange}
            required
            minLength={2}
            autoComplete="name"
            className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-green-600"
          />

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
            name="phone"
            type="tel"
            placeholder="Phone number (optional)"
            value={form.phone}
            onChange={handleChange}
            autoComplete="tel"
            className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-green-600"
          />

          <input
            name="password"
            type="password"
            placeholder="Password (minimum 8 characters)"
            value={form.password}
            onChange={handleChange}
            required
            minLength={8}
            autoComplete="new-password"
            className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-green-600"
          />

          <p className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-800">
            Public registration creates a farmer account. A six-digit
            verification code will be sent to your email.
          </p>

          <Button type="submit" disabled={loading}>
            {loading ? "Creating account..." : "Register"}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-green-700">
            Login
          </Link>
        </p>
      </AuthCard>
    </AuthLayout>
  );
}

export default Register;