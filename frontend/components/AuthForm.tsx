"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AuthForm({ type }: { type: string }) {
  const router = useRouter();

  const [show, setShow] = useState(false);

  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
    role: "Farmer",
  });

  const change = (e: any) => {
    setData({
      ...data,
      [e.target.name]: e.target.value,
    });
  };

  const submit = async () => {
    // Validation
    if (type === "register" && !data.name.trim()) {
      alert("Please enter your full name.");
      return;
    }

    if (!data.email.trim()) {
      alert("Please enter your email.");
      return;
    }

    if (!data.password.trim()) {
      alert("Please enter your password.");
      return;
    }

    const url =
      type === "login"
        ? "http://127.0.0.1:8000/login"
        : "http://127.0.0.1:8000/register";

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        alert(result.detail || "Invalid Email or Password");
        return;
      }

      if (type === "register") {
        alert("Registration Successful");
        router.push("/login");
        return;
      }

      // Login Success
      localStorage.setItem("email", result.email);
      localStorage.setItem("role", result.role);
      localStorage.setItem("token", result.access_token);
      localStorage.setItem("name", result.name);
      
      alert("Login Successful");

      router.push("/farm-profile");

    } catch (error) {
      console.error(error);
      alert("Unable to connect to server.");
    }
  };

  return (
    <div className="auth">

      <div className="auth-info">

        <h4>Smart Farming Powered By Artificial Intelligence</h4>

        <h1>
          Transforming Agricultural Data into 
          Accurate Yield Insights
        </h1>

        <p>
          YieldSense AI combines soil, weather, and crop intelligence to deliver
           accurate yield prediction and smarter farming recommendations.
        </p>

        <div className="feature-box">
          <div>🚜 Farm Management</div>
          <div>☁ Weather Analysis</div>
          <div>🌱 Soil Analysis</div>
          <div>🤖 AI Prediction</div>
        </div>

      </div>

      <div className="form-box">

        <h2>🌱 YieldSense AI</h2>

        <h3>
          {type === "login" ? "Welcome Back" : "Create Account"}
        </h3>

        {type === "register" && (
          <input
            name="name"
            placeholder="Full Name"
            value={data.name}
            onChange={change}
          />
        )}

        <input
          name="email"
          placeholder="Email"
          value={data.email}
          onChange={change}
        />

        <div className="password">

          <input
            name="password"
            type={show ? "text" : "password"}
            placeholder="Password"
            value={data.password}
            onChange={change}
          />

          <span onClick={() => setShow(!show)}>
            {show ? "🙈" : "👁"}
          </span>

        </div>

        {type === "register" && (
          <select
            name="role"
            value={data.role}
            onChange={change}
          >
            <option>Farmer</option>
            <option>Admin</option>
          </select>
        )}

        <button onClick={submit}>
          {type === "login" ? "Sign In" : "Create Account"}
        </button>

        <p>
          {type === "login" ? (
            <>
              New user? <Link href="/register">Register</Link>
            </>
          ) : (
            <>
              Already have an account? <Link href="/login">Login</Link>
            </>
          )}
        </p>

      </div>

    </div>
  );
}