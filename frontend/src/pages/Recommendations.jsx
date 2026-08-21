import { useEffect, useState } from "react";
import { recommendationsApi } from "../api/resources";
import AppLayout from "../components/AppLayout";
import { EmptyState, PageHeader, Spinner } from "../components/UIKit";

const CATEGORY_STYLES = {
  fertilizer: "bg-gold-50 text-gold-700",
  irrigation: "bg-pine-50 text-pine-700",
  pest: "bg-red-50 text-risk-high",
  planting: "bg-soil-50 text-soil-600",
  general: "bg-pine-50 text-pine-600",
};

const PRIORITY_ORDER = { High: 0, Medium: 1, Low: 2 };

export default function Recommendations() {
  const [recs, setRecs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    recommendationsApi.all().then(({ data }) => setRecs(data)).finally(() => setLoading(false));
  }, []);

  const categories = ["All", ...new Set(recs.map((r) => r.category))];
  const filtered = (filter === "All" ? recs : recs.filter((r) => r.category === filter))
    .slice()
    .sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);

  return (
    <AppLayout>
      <PageHeader
        eyebrow="Recommendation Engine"
        title="Farming recommendations"
        description="Automated, prioritised agronomic advice generated from your latest yield predictions, soil tests, and weather readings."
      />

      {loading ? (
        <div className="flex h-48 items-center justify-center"><Spinner /></div>
      ) : recs.length === 0 ? (
        <EmptyState title="No recommendations yet" description="Run a yield prediction for one of your crops to generate tailored recommendations." />
      ) : (
        <>
          <div className="mb-5 flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setFilter(c)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold capitalize transition ${
                  filter === c ? "bg-pine-600 text-white" : "bg-white text-pine-500 border border-pine-100 hover:border-pine-300"
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {filtered.map((r) => (
              <div key={r.id} className="card">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className={`badge capitalize ${CATEGORY_STYLES[r.category] || CATEGORY_STYLES.general}`}>{r.category}</span>
                  <span className={`text-[10px] font-bold uppercase tracking-wide ${
                    r.priority === "High" ? "text-risk-high" : r.priority === "Medium" ? "text-gold-600" : "text-pine-400"
                  }`}>
                    {r.priority} priority
                  </span>
                </div>
                <h4 className="mb-1.5 font-display text-base font-semibold text-pine-900">{r.title}</h4>
                <p className="text-sm leading-relaxed text-pine-600">{r.description}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </AppLayout>
  );
}
