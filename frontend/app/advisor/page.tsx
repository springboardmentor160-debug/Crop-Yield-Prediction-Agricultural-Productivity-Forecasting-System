"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function AdvisorPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<any>(null);
  const [insights, setInsights] = useState<any>(null);
  const [calendar, setCalendar] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([
    { role: "ai", text: "Hello! I'm your YieldSense AI agricultural advisor. Ask me anything about crops, soil, weather, fertilizers, or farming practices!" }
  ]);
  const [input, setInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [selectedCrop, setSelectedCrop] = useState("wheat");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/"); return; }
    loadData();
  }, []);

  useEffect(() => { loadCalendar(); }, [selectedCrop]);

  const loadData = async () => {
    try {
      const [t, i] = await Promise.all([api.getDailyTasks(), api.getAIInsights()]);
      setTasks(t); setInsights(i);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const loadCalendar = async () => {
    try { const c = await api.getCropCalendar(selectedCrop); setCalendar(c); }
    catch (e) { console.error(e); }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = input;
    setMessages(prev => [...prev, { role: "user", text: userMsg }]);
    setInput("");
    setChatLoading(true);
    try {
      const res = await api.chatWithAdvisor(userMsg);
      setMessages(prev => [...prev, { role: "ai", text: res.ai_response }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: "ai", text: "Sorry, I couldn't process that. Please try again." }]);
    } finally { setChatLoading(false); }
  };

  const priorityColor = (p: string) => p === "high" ? "#ef4444" : p === "medium" ? "#f59e0b" : "#22c55e";
  const calendarColor = (type: string) => {
    if (type === "sowing") return "#22c55e";
    if (type === "irrigation") return "#3b82f6";
    if (type === "fertilizer") return "#f59e0b";
    if (type === "harvest") return "#a855f7";
    return "#6b9e6b";
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0a0f0a", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      <div style={{ textAlign: "center" }}><div style={{ fontSize: "48px", marginBottom: "16px" }}>🤖</div><div style={{ color: "#22c55e", fontSize: "13px" }}>LOADING AI ADVISOR...</div></div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0a0f0a", fontFamily: "'Segoe UI', system-ui, sans-serif", color: "#ffffff" }}>
      <nav style={{ backgroundColor: "#0d1a0d", borderBottom: "1px solid #1a2e1a", padding: "0 32px", height: "60px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <button onClick={() => router.push("/dashboard")} style={{ background: "none", border: "none", color: "#4a7a4a", cursor: "pointer", fontSize: "13px" }}>← Dashboard</button>
          <div style={{ width: "1px", height: "20px", backgroundColor: "#1a2e1a" }} />
          <span style={{ color: "#22c55e", fontWeight: 700, fontSize: "15px" }}>🤖 AI Advisor</span>
        </div>
        <button onClick={() => { localStorage.clear(); router.push("/"); }} style={{ backgroundColor: "transparent", border: "1px solid #1a2e1a", borderRadius: "8px", padding: "6px 14px", color: "#6b9e6b", cursor: "pointer", fontSize: "12px" }}>Sign Out</button>
      </nav>

      <div style={{ padding: "32px", maxWidth: "1400px", margin: "0 auto" }}>
        <div style={{ marginBottom: "28px" }}>
          <div style={{ fontSize: "11px", color: "#22c55e", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "8px" }}>Milestone 3 — Module 8</div>
          <h1 style={{ fontSize: "32px", fontWeight: 800 }}>AI Agricultural Advisor</h1>
          <p style={{ color: "#4a7a4a", fontSize: "14px" }}>Your intelligent farming assistant</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "20px", marginBottom: "20px" }}>

          {/* AI Chat */}
          <div style={{ backgroundColor: "#0d1a0d", border: "1px solid #1a2e1a", borderRadius: "16px", display: "flex", flexDirection: "column", height: "500px" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #1a2e1a", display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: "32px", height: "32px", background: "linear-gradient(135deg, #22c55e, #16a34a)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px" }}>🤖</div>
              <div>
                <div style={{ fontSize: "13px", fontWeight: 700 }}>YieldSense AI</div>
                <div style={{ fontSize: "10px", color: "#22c55e" }}>● Online</div>
              </div>
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
              {messages.map((msg, i) => (
                <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
                  <div style={{
                    maxWidth: "75%", padding: "10px 14px", borderRadius: msg.role === "user" ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
                    backgroundColor: msg.role === "user" ? "#22c55e" : "#0a0f0a",
                    color: msg.role === "user" ? "#0a0f0a" : "#ffffff",
                    fontSize: "13px", lineHeight: 1.5,
                    border: msg.role === "ai" ? "1px solid #1a2e1a" : "none",
                  }}>{msg.text}</div>
                </div>
              ))}
              {chatLoading && (
                <div style={{ display: "flex", justifyContent: "flex-start" }}>
                  <div style={{ backgroundColor: "#0a0f0a", border: "1px solid #1a2e1a", borderRadius: "12px 12px 12px 2px", padding: "10px 14px", fontSize: "13px", color: "#4a7a4a" }}>Thinking...</div>
                </div>
              )}
            </div>

            <div style={{ padding: "12px 16px", borderTop: "1px solid #1a2e1a", display: "flex", gap: "8px" }}>
              <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && sendMessage()}
                placeholder="Ask about crops, soil, weather, fertilizers..."
                style={{ flex: 1, padding: "10px 14px", backgroundColor: "#0a0f0a", border: "1px solid #1a2e1a", borderRadius: "8px", color: "#ffffff", fontSize: "13px", outline: "none" }} />
              <button onClick={sendMessage} style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)", border: "none", borderRadius: "8px", padding: "10px 18px", color: "#0a0f0a", fontWeight: 700, cursor: "pointer", fontSize: "13px" }}>Send</button>
            </div>

            {/* Quick suggestions */}
            <div style={{ padding: "8px 16px 12px", display: "flex", gap: "6px", flexWrap: "wrap" }}>
              {["Best crop?", "Fertilizer plan?", "Irrigation help?", "Disease risk?"].map(s => (
                <button key={s} onClick={() => { setInput(s); }} style={{ fontSize: "11px", color: "#22c55e", backgroundColor: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: "100px", padding: "3px 10px", cursor: "pointer" }}>{s}</button>
              ))}
            </div>
          </div>

          {/* Daily Tasks */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ backgroundColor: "#0d1a0d", border: "1px solid #1a2e1a", borderRadius: "16px", padding: "20px" }}>
              <div style={{ fontSize: "11px", color: "#4a7a4a", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "16px" }}>📅 Today's Tasks</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {tasks?.tasks?.map((task: any) => (
                  <div key={task.id} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", backgroundColor: "#0a0f0a", borderRadius: "8px", border: "1px solid #1a2e1a" }}>
                    <span style={{ fontSize: "16px" }}>{task.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "12px", fontWeight: 600 }}>{task.task}</div>
                      <div style={{ fontSize: "10px", color: "#4a7a4a" }}>{task.time}</div>
                    </div>
                    <span style={{ fontSize: "10px", color: priorityColor(task.priority), backgroundColor: `${priorityColor(task.priority)}15`, borderRadius: "100px", padding: "2px 8px" }}>{task.priority}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* AI Insights */}
        {insights && (
          <div style={{ backgroundColor: "#0d1a0d", border: "1px solid #1a2e1a", borderRadius: "16px", padding: "24px", marginBottom: "20px" }}>
            <div style={{ fontSize: "11px", color: "#4a7a4a", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "16px" }}>💡 AI Insights</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
              {insights.insights?.map((insight: any, i: number) => (
                <div key={i} style={{ padding: "16px", backgroundColor: "#0a0f0a", borderRadius: "10px", border: "1px solid #1a2e1a" }}>
                  <div style={{ fontSize: "24px", marginBottom: "8px" }}>{insight.icon}</div>
                  <div style={{ fontSize: "13px", fontWeight: 600, marginBottom: "6px" }}>{insight.title}</div>
                  <div style={{ fontSize: "12px", color: "#6b9e6b", lineHeight: 1.5, marginBottom: "8px" }}>{insight.insight}</div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "11px", color: "#4a7a4a" }}>Confidence</span>
                    <span style={{ fontSize: "11px", color: "#22c55e", fontWeight: 700 }}>{insight.confidence}%</span>
                  </div>
                  <div style={{ height: "3px", backgroundColor: "#1a2e1a", borderRadius: "2px", marginTop: "4px" }}>
                    <div style={{ height: "100%", width: `${insight.confidence}%`, backgroundColor: "#22c55e", borderRadius: "2px" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Crop Calendar */}
        <div style={{ backgroundColor: "#0d1a0d", border: "1px solid #1a2e1a", borderRadius: "16px", padding: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <div>
              <div style={{ fontSize: "11px", color: "#4a7a4a", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "4px" }}>📅 Smart Crop Calendar</div>
              <div style={{ fontSize: "16px", fontWeight: 700 }}>Season 2026 Schedule</div>
            </div>
            <select value={selectedCrop} onChange={e => setSelectedCrop(e.target.value)}
              style={{ padding: "8px 14px", backgroundColor: "#0a0f0a", border: "1px solid #1a2e1a", borderRadius: "8px", color: "#ffffff", fontSize: "13px", outline: "none" }}>
              {["wheat", "rice", "maize", "soybean", "cotton"].map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
            </select>
          </div>
          <div style={{ display: "flex", gap: "10px", overflowX: "auto", paddingBottom: "8px" }}>
            {calendar?.calendar?.map((item: any, i: number) => (
              <div key={i} style={{ minWidth: "150px", padding: "14px", backgroundColor: "#0a0f0a", borderRadius: "10px", border: `1px solid ${calendarColor(item.type)}40`, borderTop: `3px solid ${calendarColor(item.type)}` }}>
                <div style={{ fontSize: "10px", color: calendarColor(item.type), fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "6px" }}>{item.month}</div>
                <div style={{ fontSize: "12px", fontWeight: 600, marginBottom: "4px" }}>{item.activity}</div>
                <div style={{ fontSize: "11px", color: "#4a7a4a", lineHeight: 1.4 }}>{item.description}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
