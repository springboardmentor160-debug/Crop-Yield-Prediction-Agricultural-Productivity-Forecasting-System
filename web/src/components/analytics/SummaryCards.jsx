import {
  Activity,
  ChartNoAxesCombined,
  Sprout,
  Tractor,
} from "lucide-react";


function formatNumber(value, decimals = 2) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return Number(0).toFixed(decimals);
  }

  return number.toLocaleString("en-IN", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}


function SummaryCards({ summary }) {
  const cards = [
    {
      title: "Total Predictions",
      value: Number(
        summary?.total_predictions || 0
      ).toLocaleString("en-IN"),
      description: "Predictions generated",
      icon: ChartNoAxesCombined,
      iconClass: "bg-violet-100 text-violet-600",
      decorationClass: "bg-violet-100",
    },
    {
      title: "Active Farms",
      value: Number(
        summary?.active_farms || 0
      ).toLocaleString("en-IN"),
      description: "Currently active farms",
      icon: Tractor,
      iconClass: "bg-amber-100 text-amber-600",
      decorationClass: "bg-amber-100",
    },
    {
      title: "Average Yield",
      value: `${formatNumber(
        summary?.average_predicted_yield
      )} t/ha`,
      description: "Average predicted yield",
      icon: Sprout,
      iconClass: "bg-emerald-100 text-emerald-600",
      decorationClass: "bg-emerald-100",
    },
    {
      title: "Average Production",
      value: `${formatNumber(
        summary?.average_estimated_production
      )} t`,
      description: "Average estimated production",
      icon: Activity,
      iconClass: "bg-sky-100 text-sky-600",
      decorationClass: "bg-sky-100",
    },
  ];

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <article
            key={card.title}
            className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md"
          >
            <div
              className={`absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-60 transition-transform duration-300 group-hover:scale-125 ${card.decorationClass}`}
            />

            <div className="relative">
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-2xl ${card.iconClass}`}
              >
                <Icon className="h-5 w-5" />
              </div>

              <p className="mt-5 text-sm font-semibold text-slate-500">
                {card.title}
              </p>

              <p className="mt-2 break-words text-2xl font-bold tracking-tight text-slate-900">
                {card.value}
              </p>

              <p className="mt-2 text-xs font-medium text-slate-400">
                {card.description}
              </p>
            </div>
          </article>
        );
      })}
    </section>
  );
}

export default SummaryCards;