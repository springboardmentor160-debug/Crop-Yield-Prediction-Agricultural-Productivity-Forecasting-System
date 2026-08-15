"use client";

import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";

interface History {
  area: string;
  item: string;
  predicted_yield: number;
}

export default function HistoryPage() {
  const [history, setHistory] = useState<History[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadHistory();
  }, []);

  async function loadHistory() {
    try {
      setLoading(true);

      const res = await fetch("http://127.0.0.1:8000/history");

      if (!res.ok) {
        throw new Error("Unable to fetch history");
      }

      const data = await res.json();

      setHistory(data);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Unable to load prediction history.");
    } finally {
      setLoading(false);
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
        <h1
          style={{
            color: "#2E7D32",
            marginBottom: "10px",
          }}
        >
          📜 Prediction History
        </h1>

        <p
          style={{
            color: "#666",
            marginBottom: "30px",
          }}
        >
          Previously predicted crop yields.
        </p>

        {error && <ErrorMessage message={error} />}

        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            background: "#fff",
            borderRadius: "12px",
            overflow: "hidden",
            boxShadow: "0 5px 15px rgba(0,0,0,.1)",
          }}
        >
          <thead
            style={{
              background: "#2E7D32",
              color: "white",
            }}
          >
            <tr>
              <th style={th}>Area</th>
              <th style={th}>Crop</th>
              <th style={th}>Predicted Yield</th>
            </tr>
          </thead>

          <tbody>
            {history.length === 0 ? (
              <tr>
                <td
                  colSpan={3}
                  style={{
                    textAlign: "center",
                    padding: "20px",
                  }}
                >
                  No prediction history found.
                </td>
              </tr>
            ) : (
              history.map((item, index) => (
                <tr key={index}>
                  <td style={td}>{item.area}</td>
                  <td style={td}>{item.item}</td>
                  <td style={td}>
                    {item.predicted_yield} hg/ha
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <button
          onClick={loadHistory}
          style={{
            marginTop: "25px",
            padding: "12px 30px",
            background: "#2E7D32",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "16px",
          }}
        >
          🔄 Refresh History
        </button>
      </div>
    </>
  );
}

const th = {
  padding: "15px",
  textAlign: "left" as const,
};

const td = {
  padding: "15px",
  borderBottom: "1px solid #eee",
};