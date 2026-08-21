import { useEffect, useState } from "react";
import {
  BrainCircuit,
  CheckCircle2,
  Crown,
  Sprout,
  Tractor,
  Wheat,
} from "lucide-react";

const stages = [
  {
    title: "Preparing farm data",
    description:
      "Loading your farm area, state, soil, and selected season.",
    icon: Tractor,
  },
  {
    title: "Growing candidate crops",
    description:
      "Finding crops historically cultivated for this state and season.",
    icon: Sprout,
  },
  {
    title: "Comparing crop performance",
    description:
      "Running yield predictions for each suitable crop.",
    icon: Wheat,
  },
  {
    title: "AI ranking crops",
    description:
      "Scoring candidates using predicted yield and historical support.",
    icon: BrainCircuit,
  },
  {
    title: "Selecting the best crop",
    description:
      "Highlighting the strongest recommendation and alternatives.",
    icon: Crown,
  },
];

const STAGE_DURATION = 850;

function RecommendationLoader() {
  const [activeStage, setActiveStage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStage((current) => {
        if (current >= stages.length - 1) {
          clearInterval(interval);
          return current;
        }

        return current + 1;
      });
    }, STAGE_DURATION);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl overflow-hidden rounded-3xl border border-green-200 bg-white shadow-2xl">
        <div className="bg-gradient-to-r from-green-700 to-emerald-600 px-6 py-7 text-white lg:px-8">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-white/15 p-3">
              <BrainCircuit size={30} />
            </div>

            <div>
              <h2 className="text-2xl font-bold">
                Generating Crop Recommendation
              </h2>

              <p className="mt-1 text-sm text-green-50">
                YieldSense AI is comparing suitable crops for your farm.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4 px-6 py-7 lg:px-8">
          {stages.map((stage, index) => {
            const Icon = stage.icon;
            const completed = index < activeStage;
            const active = index === activeStage;

            return (
              <div
                key={stage.title}
                className={[
                  "flex items-start gap-4 rounded-2xl border p-4 transition-all duration-500",
                  active
                    ? "scale-[1.02] border-green-300 bg-green-50 shadow-sm"
                    : completed
                      ? "border-emerald-100 bg-emerald-50/60"
                      : "border-gray-200 bg-gray-50 opacity-60",
                ].join(" ")}
              >
                <div
                  className={[
                    "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition",
                    active
                      ? "bg-green-700 text-white"
                      : completed
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-gray-200 text-gray-500",
                  ].join(" ")}
                >
                  {completed ? (
                    <CheckCircle2 size={22} />
                  ) : (
                    <Icon
                      size={22}
                      className={active ? "animate-pulse" : ""}
                    />
                  )}
                </div>

                <div>
                  <p
                    className={[
                      "font-bold",
                      active
                        ? "text-green-900"
                        : completed
                          ? "text-emerald-900"
                          : "text-gray-600",
                    ].join(" ")}
                  >
                    {stage.title}
                  </p>

                  <p className="mt-1 text-sm leading-6 text-gray-600">
                    {stage.description}
                  </p>
                </div>
              </div>
            );
          })}

          <div className="pt-2">
            <div className="h-2 overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full rounded-full bg-green-700 transition-all duration-700"
                style={{
                  width: `${
                    ((activeStage + 1) / stages.length) * 100
                  }%`,
                }}
              />
            </div>

            <p className="mt-3 text-center text-sm font-medium text-gray-500">
              Please wait while the AI evaluates crop options.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RecommendationLoader;