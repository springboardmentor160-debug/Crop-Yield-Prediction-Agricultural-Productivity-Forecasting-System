"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

interface SystemSettings {
  app_name: string;
  version: string;
  debug: boolean;
  database: string;
  ai_model: string;
  weather_api: string;
  email_notifications: boolean;
}

export default function AdminSettingsPage() {
  const router = useRouter();

  const [settings, setSettings] = useState<SystemSettings>({
    app_name: "YieldSense AI",
    version: "1.0.0",
    debug: false,
    database: "PostgreSQL",
    ai_model: "XGBoost",
    weather_api: "OpenWeatherMap",
    email_notifications: true,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      setLoading(true);

      // Uncomment after backend endpoint is ready
      // const data = await api.getAdminSettings();
      // setSettings(data);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function saveSettings() {
    try {
      setSaving(true);

      // Uncomment after backend endpoint is ready
      // await api.updateAdminSettings(settings);

      setMessage("Settings saved successfully.");
    } catch {
      setMessage("Failed to save settings.");
    } finally {
      setSaving(false);

      setTimeout(() => {
        setMessage("");
      }, 3000);
    }
  }
    return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#0a0a14",
        color: "#ffffff",
        fontFamily: "'Segoe UI', system-ui, sans-serif",
      }}
    >
      {/* Header */}
      <nav
        style={{
          height: "60px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 32px",
          backgroundColor: "#0d0d1a",
          borderBottom: "1px solid #1a1a2e",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
          }}
        >
          <button
            onClick={() => router.push("/admin")}
            style={{
              background: "none",
              border: "none",
              color: "#6366f1",
              cursor: "pointer",
              fontSize: "13px",
            }}
          >
            ← Back
          </button>

          <span
            style={{
              color: "#6b6b9e",
              fontSize: "13px",
            }}
          >
            Admin / Settings
          </span>
        </div>

        <button
          onClick={saveSettings}
          disabled={saving}
          style={{
            backgroundColor: "#22c55e",
            color: "#fff",
            border: "none",
            padding: "10px 18px",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </nav>

      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "32px",
        }}
      >
        <h1
          style={{
            fontSize: "30px",
            fontWeight: 800,
            marginBottom: "8px",
          }}
        >
          System Settings
        </h1>

        <p
          style={{
            color: "#6b6b9e",
            marginBottom: "30px",
          }}
        >
          Configure your YieldSense AI platform.
        </p>

        {message && (
          <div
            style={{
              marginBottom: "24px",
              padding: "12px 16px",
              borderRadius: "8px",
              backgroundColor: "#1f2937",
              color: "#22c55e",
            }}
          >
            {message}
          </div>
        )}

        {loading ? (
          <div
            style={{
              textAlign: "center",
              padding: "80px",
              color: "#6b6b9e",
            }}
          >
            Loading settings...
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(400px,1fr))",
              gap: "24px",
            }}
          >
                        {/* Application Settings */}
            <div
              style={{
                backgroundColor: "#0d0d1a",
                border: "1px solid #1a1a2e",
                borderRadius: "14px",
                padding: "24px",
              }}
            >
              <h2
                style={{
                  marginTop: 0,
                  marginBottom: "20px",
                  fontSize: "20px",
                  fontWeight: 700,
                }}
              >
                Application
              </h2>

              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", marginBottom: "6px", color: "#9ca3af" }}>
                  Application Name
                </label>

                <input
                  type="text"
                  value={settings.app_name}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      app_name: e.target.value,
                    })
                  }
                  style={{
                    width: "100%",
                    padding: "12px",
                    backgroundColor: "#111827",
                    color: "#fff",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "6px", color: "#9ca3af" }}>
                  Version
                </label>

                <input
                  type="text"
                  value={settings.version}
                  readOnly
                  style={{
                    width: "100%",
                    padding: "12px",
                    backgroundColor: "#111827",
                    color: "#9ca3af",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                  }}
                />
              </div>
            </div>

            {/* AI Model */}
            <div
              style={{
                backgroundColor: "#0d0d1a",
                border: "1px solid #1a1a2e",
                borderRadius: "14px",
                padding: "24px",
              }}
            >
              <h2
                style={{
                  marginTop: 0,
                  marginBottom: "20px",
                  fontSize: "20px",
                  fontWeight: 700,
                }}
              >
                AI Model
              </h2>

              <div>
                <label style={{ display: "block", marginBottom: "6px", color: "#9ca3af" }}>
                  Prediction Model
                </label>

                <select
                  value={settings.ai_model}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      ai_model: e.target.value,
                    })
                  }
                  style={{
                    width: "100%",
                    padding: "12px",
                    backgroundColor: "#111827",
                    color: "#fff",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                  }}
                >
                  <option>XGBoost</option>
                  <option>Random Forest</option>
                  <option>Linear Regression</option>
                  <option>Gradient Boosting</option>
                </select>
              </div>
            </div>

            {/* Database */}
            <div
              style={{
                backgroundColor: "#0d0d1a",
                border: "1px solid #1a1a2e",
                borderRadius: "14px",
                padding: "24px",
              }}
            >
              <h2
                style={{
                  marginTop: 0,
                  marginBottom: "20px",
                  fontSize: "20px",
                  fontWeight: 700,
                }}
              >
                Database
              </h2>

              <div>
                <label style={{ display: "block", marginBottom: "6px", color: "#9ca3af" }}>
                  Database Engine
                </label>

                <input
                  type="text"
                  value={settings.database}
                  readOnly
                  style={{
                    width: "100%",
                    padding: "12px",
                    backgroundColor: "#111827",
                    color: "#22c55e",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                  }}
                />
              </div>
            </div>

            {/* Weather API */}
            <div
              style={{
                backgroundColor: "#0d0d1a",
                border: "1px solid #1a1a2e",
                borderRadius: "14px",
                padding: "24px",
              }}
            >
              <h2
                style={{
                  marginTop: 0,
                  marginBottom: "20px",
                  fontSize: "20px",
                  fontWeight: 700,
                }}
              >
                Weather API
              </h2>

              <div>
                <label style={{ display: "block", marginBottom: "6px", color: "#9ca3af" }}>
                  Provider
                </label>

                <input
                  type="text"
                  value={settings.weather_api}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      weather_api: e.target.value,
                    })
                  }
                  style={{
                    width: "100%",
                    padding: "12px",
                    backgroundColor: "#111827",
                    color: "#fff",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                  }}
                />
              </div>
            </div>
                        {/* Email Notifications */}
            <div
              style={{
                backgroundColor: "#0d0d1a",
                border: "1px solid #1a1a2e",
                borderRadius: "14px",
                padding: "24px",
              }}
            >
              <h2
                style={{
                  marginTop: 0,
                  marginBottom: "20px",
                  fontSize: "20px",
                  fontWeight: 700,
                }}
              >
                Notifications
              </h2>

              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  cursor: "pointer",
                }}
              >
                <span>Email Notifications</span>

                <input
                  type="checkbox"
                  checked={settings.email_notifications}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      email_notifications: e.target.checked,
                    })
                  }
                />
              </label>
            </div>

            {/* Debug Mode */}
            <div
              style={{
                backgroundColor: "#0d0d1a",
                border: "1px solid #1a1a2e",
                borderRadius: "14px",
                padding: "24px",
              }}
            >
              <h2
                style={{
                  marginTop: 0,
                  marginBottom: "20px",
                  fontSize: "20px",
                  fontWeight: 700,
                }}
              >
                System
              </h2>

              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  cursor: "pointer",
                }}
              >
                <span>Debug Mode</span>

                <input
                  type="checkbox"
                  checked={settings.debug}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      debug: e.target.checked,
                    })
                  }
                />
              </label>
            </div>

            {/* Save Information */}
            <div
              style={{
                gridColumn: "1 / -1",
                backgroundColor: "#111827",
                border: "1px solid #1f2937",
                borderRadius: "14px",
                padding: "24px",
              }}
            >
              <h2
                style={{
                  marginTop: 0,
                  marginBottom: "12px",
                  fontSize: "20px",
                  fontWeight: 700,
                }}
              >
                Save Configuration
              </h2>

              <p
                style={{
                  color: "#9ca3af",
                  marginBottom: "20px",
                  lineHeight: 1.6,
                }}
              >
                Changes made here affect the entire YieldSense AI platform.
                Click <strong>Save Settings</strong> to apply your changes.
              </p>

              <button
                onClick={saveSettings}
                disabled={saving}
                style={{
                  backgroundColor: "#22c55e",
                  color: "#fff",
                  border: "none",
                  padding: "12px 24px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: 700,
                  fontSize: "15px",
                }}
              >
                {saving ? "Saving..." : "Save Settings"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}