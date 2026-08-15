"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {

  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function register() {

    const response = await fetch("http://127.0.0.1:8000/register", {

      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        name,
        email,
        password,
      }),

    });

    const data = await response.json();

    if (response.ok) {

      alert("Registration Successful!");

      router.push("/login");

    } else {

      alert(data.detail || "Registration Failed");

    }

  }

  return (

    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        background: "#E8F5E9",
      }}
    >

      <div
        style={{
          background: "#fff",
          width: "420px",
          padding: "40px",
          borderRadius: "20px",
          boxShadow: "0 5px 20px rgba(0,0,0,.2)",
        }}
      >

        <h1
          style={{
            textAlign: "center",
            color: "#2E7D32",
            marginBottom: "30px",
          }}
        >
          🌾 Register
        </h1>

        <input
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{
            width: "100%",
            padding: "15px",
            marginBottom: "20px",
            borderRadius: "10px",
          }}
        />

        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            width: "100%",
            padding: "15px",
            marginBottom: "20px",
            borderRadius: "10px",
          }}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: "100%",
            padding: "15px",
            marginBottom: "20px",
            borderRadius: "10px",
          }}
        />

        <button
          onClick={register}
          style={{
            width: "100%",
            padding: "15px",
            background: "#2E7D32",
            color: "#fff",
            border: "none",
            borderRadius: "10px",
            cursor: "pointer",
            fontSize: "18px",
          }}
        >
          Register
        </button>

      </div>

    </div>

  );
}