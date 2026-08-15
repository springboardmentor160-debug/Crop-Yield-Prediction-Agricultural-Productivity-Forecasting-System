"use client";

import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";

interface Farm {
  id?: number;
  farmer_name: string;
  village: string;
  district: string;
  state: string;
  farm_size: string;
  crop: string;
}

export default function FarmProfilePage() {
  const [form, setForm] = useState<Farm>({
    farmer_name: "",
    village: "",
    district: "",
    state: "",
    farm_size: "",
    crop: "",
  });

  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadFarms() {
    try {
      setLoading(true);

      const res = await fetch("http://127.0.0.1:8000/farm");

      if (!res.ok) throw new Error();

      const data = await res.json();
      setFarms(data);
      setError("");
    } catch {
      setError("Unable to load farm details.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFarms();
  }, []);

  async function saveFarm() {
    try {
      const res = await fetch("http://127.0.0.1:8000/farm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.detail);
        return;
      }

      alert("Farm Profile Saved Successfully");

      setForm({
        farmer_name: "",
        village: "",
        district: "",
        state: "",
        farm_size: "",
        crop: "",
      });

      loadFarms();
    } catch {
      alert("Unable to save farm profile.");
    }
  }

  if (loading) return <Loading />;

  return (
    <>
      <Sidebar />

      <div
        style={{
          marginLeft: "260px",
          padding: "30px",
          background: "#f5f7fa",
          minHeight: "100vh",
        }}
      >
        <h1 style={{ color: "#2E7D32" }}>👨‍🌾 Farm Profile</h1>

        {error && <ErrorMessage message={error} />}

        <div
          style={{
            background: "#fff",
            padding: "25px",
            borderRadius: "12px",
            marginTop: "25px",
            boxShadow: "0 5px 15px rgba(0,0,0,.1)",
          }}
        >
          <input
            style={input}
            placeholder="Farmer Name"
            value={form.farmer_name}
            onChange={(e) =>
              setForm({ ...form, farmer_name: e.target.value })
            }
          />

          <input
            style={input}
            placeholder="Village"
            value={form.village}
            onChange={(e) =>
              setForm({ ...form, village: e.target.value })
            }
          />

          <input
            style={input}
            placeholder="District"
            value={form.district}
            onChange={(e) =>
              setForm({ ...form, district: e.target.value })
            }
          />

          <input
            style={input}
            placeholder="State"
            value={form.state}
            onChange={(e) =>
              setForm({ ...form, state: e.target.value })
            }
          />

          <input
            style={input}
            placeholder="Farm Size"
            value={form.farm_size}
            onChange={(e) =>
              setForm({ ...form, farm_size: e.target.value })
            }
          />

          <input
            style={input}
            placeholder="Crop"
            value={form.crop}
            onChange={(e) =>
              setForm({ ...form, crop: e.target.value })
            }
          />

          <button
            onClick={saveFarm}
            style={button}
          >
            💾 Save Farm Profile
          </button>
        </div>

        <h2
          style={{
            marginTop: "40px",
            color: "#2E7D32",
          }}
        >
          Saved Farms
        </h2>

        {farms.length === 0 ? (
          <p>No farm profiles available.</p>
        ) : (
          <table
            style={{
              width: "100%",
              background: "#fff",
              marginTop: "20px",
              borderCollapse: "collapse",
              boxShadow: "0 5px 15px rgba(0,0,0,.1)",
            }}
          >
            <thead
              style={{
                background: "#2E7D32",
                color: "#fff",
              }}
            >
              <tr>
                <th style={th}>Farmer</th>
                <th style={th}>Village</th>
                <th style={th}>District</th>
                <th style={th}>State</th>
                <th style={th}>Farm Size</th>
                <th style={th}>Crop</th>
              </tr>
            </thead>

            <tbody>
              {farms.map((farm) => (
                <tr key={farm.id}>
                  <td style={td}>{farm.farmer_name}</td>
                  <td style={td}>{farm.village}</td>
                  <td style={td}>{farm.district}</td>
                  <td style={td}>{farm.state}</td>
                  <td style={td}>{farm.farm_size}</td>
                  <td style={td}>{farm.crop}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}

const input = {
  width: "100%",
  padding: "12px",
  marginBottom: "15px",
  border: "1px solid #ccc",
  borderRadius: "8px",
};

const button = {
  width: "100%",
  padding: "14px",
  background: "#2E7D32",
  color: "white",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  fontSize: "16px",
};

const th = {
  padding: "12px",
  textAlign: "left" as const,
};

const td = {
  padding: "12px",
  borderBottom: "1px solid #ddd",
};