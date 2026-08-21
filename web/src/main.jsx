import React from "react";
import ReactDOM from "react-dom/client";
import { Toaster } from "react-hot-toast";

import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext";

import "./index.css";

ReactDOM.createRoot(
  document.getElementById("root")
).render(
  <React.StrictMode>
    <AuthProvider>
      <App />

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,

          style: {
            borderRadius: "12px",
            background: "#ffffff",
            color: "#1f2937",
            border: "1px solid #e5e7eb",
            boxShadow:
              "0 8px 24px rgba(0,0,0,0.08)",
          },

          success: {
            style: {
              borderLeft:
                "5px solid #15803d",
            },
          },

          error: {
            style: {
              borderLeft:
                "5px solid #dc2626",
            },
          },
        }}
      />
    </AuthProvider>
  </React.StrictMode>
);