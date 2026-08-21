"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

interface InsightItem {
  icon: string;
  title: string;
  insight: string;
  confidence: number;
}

interface TaskItem { id: number; priority: string; icon: string; task: string; time: string; done: boolean; }

export default function AdvisorPage() {
  const router = useRouter();
  const [insights, setInsights] = useState<InsightItem[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [message, setMessage] = useState("");
  const [chatResponse, setChatResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/"); return; }
    Promise.all([api.getAdvisorInsights(), api.getAdvisorTasks()])
      .then(([insightsData, tasksData]) => {
        setInsights(insightsData?.insights ?? []);
        setTasks(tasksData?.tasks ?? []);
      })
      .catch(() => router.push("/"))
      .finally(() => setLoading(false));
  }, []);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setSending(true);
    try {
      const data = await api.advisorChat(message.trim());
      setChatResponse(data.ai_response || data.response || "Advisor response received.");
      setMessage("");
    } catch {
      alert("Unable to send advisor message.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-green-700 text-white px-6 py-4 flex justify-between items-center shadow">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/dashboard")}
            className="bg-white text-green-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition"
          >
            ← Dashboard
          </button>
          <span className="text-2xl">🤖</span>
          <span className="text-xl font-bold">AI Advisor</span>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Advisor</h1>
          <p className="text-gray-500 text-sm">Ask the AI advisor for recommendations and farming guidance.</p>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl shadow-sm border p-6 text-center text-gray-500">Loading advisor insights...</div>
        ) : (
          <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
            <div className="space-y-6">
              <div className="bg-white rounded-3xl border p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Ask a question</h2>
                <form onSubmit={sendMessage} className="space-y-4">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={5}
                    placeholder="Ask about crop planning, irrigation, risk, or timing..."
                    className="w-full border rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <button
                    type="submit"
                    disabled={sending}
                    className={`w-full py-3 rounded-xl font-bold text-sm transition ${sending ? "bg-green-200 text-green-500 cursor-not-allowed" : "bg-green-600 hover:bg-green-700 text-white"}`}
                  >
                    {sending ? "Sending..." : "Send to Advisor"}
                  </button>
                </form>
                {chatResponse && (
                  <div className="mt-6 rounded-2xl bg-green-50 border border-green-200 p-4 text-sm text-gray-700">
                    <div className="font-semibold text-green-700 mb-2">Advisor Response</div>
                    <div>{chatResponse}</div>
                  </div>
                )}
              </div>

              <div className="bg-white rounded-3xl border p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Insights</h2>
                <div className="space-y-3">
                  {insights.length === 0 ? (
                    <p className="text-sm text-gray-500">No insights available yet.</p>
                  ) : (
                    insights.map((insight, idx) => (
                      <div key={idx} className="rounded-2xl bg-gray-50 p-4 text-sm text-gray-700">
                        <div className="flex items-start gap-3">
                          <div className="text-2xl">{insight.icon}</div>
                          <div>
                            <div className="font-semibold text-gray-800">{insight.title}</div>
                            <div className="text-xs text-gray-600 mt-1">{insight.insight}</div>
                            <div className="text-xs text-gray-400 mt-1">Confidence: {insight.confidence}%</div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-3xl border p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Action Items</h2>
                <div className="space-y-3">
                  {tasks.length === 0 ? (
                    <p className="text-sm text-gray-500">No tasks assigned yet.</p>
                  ) : (
                    tasks.map((task) => (
                      <div key={task.id} className="rounded-2xl bg-gray-50 p-4 flex items-start gap-3">
                        <div className="text-2xl">{task.icon}</div>
                        <div>
                          <div className="font-semibold text-gray-800">{task.task}</div>
                          <div className="text-xs text-gray-500 mt-1">Priority: {task.priority}</div>
                          <div className="text-xs text-gray-400 mt-2">{task.time}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
