import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Sparkles,
  Tractor,
} from "lucide-react";

const stages = {
  TRACTOR: "tractor",
  GROWING: "growing",
  GREEN: "green",
  HARVEST: "harvest",
  READY: "ready",
};

function PredictionLoader() {
  const [stage, setStage] = useState(
    stages.TRACTOR
  );

  useEffect(() => {
    const timers = [
      setTimeout(() => {
        setStage(stages.GROWING);
      }, 1800),

      setTimeout(() => {
        setStage(stages.GREEN);
      }, 2800),

      setTimeout(() => {
        setStage(stages.HARVEST);
      }, 3500),

      setTimeout(() => {
        setStage(stages.READY);
      }, 4100),
    ];

    return () => {
      timers.forEach((timer) =>
        clearTimeout(timer)
      );
    };
  }, []);

  const showSprouts = [
    stages.GROWING,
    stages.GREEN,
    stages.HARVEST,
    stages.READY,
  ].includes(stage);

  const showGreenCrops = [
    stages.GREEN,
    stages.HARVEST,
    stages.READY,
  ].includes(stage);

  const showHarvest = [
    stages.HARVEST,
    stages.READY,
  ].includes(stage);

  const predictionReady =
    stage === stages.READY;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-950/60 px-4 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-b from-sky-100 via-sky-50 to-amber-50 shadow-2xl">
        <div className="absolute left-8 top-8 h-20 w-20 rounded-full bg-yellow-300/80 blur-xl" />

        <div className="absolute right-10 top-10">
          <div className="h-3 w-20 rounded-full bg-white/80 blur-sm" />
          <div className="mt-2 ml-8 h-3 w-24 rounded-full bg-white/70 blur-sm" />
        </div>

        <div className="relative min-h-[430px] px-6 pb-8 pt-10 sm:px-10">
          <div
            className={`absolute inset-x-0 bottom-0 h-[175px] transition-colors duration-700 ${
              showHarvest
                ? "bg-gradient-to-b from-amber-300 to-amber-600"
                : showGreenCrops
                  ? "bg-gradient-to-b from-green-400 to-green-700"
                  : "bg-gradient-to-b from-amber-700 to-amber-950"
            }`}
          />

          <FieldRows
            showSprouts={showSprouts}
            showGreenCrops={showGreenCrops}
            showHarvest={showHarvest}
          />

          {!predictionReady && (
            <div className="absolute bottom-[125px] left-0 z-30 animate-[tractorDrive_3s_ease-in-out_forwards]">
              <div className="relative">
                <div className="rounded-2xl bg-green-700 p-3 shadow-xl">
                  <Tractor
                    size={52}
                    strokeWidth={1.8}
                    className="text-white"
                  />
                </div>

                <div className="absolute -bottom-2 left-2 h-4 w-4 rounded-full bg-gray-900 ring-4 ring-gray-600" />

                <div className="absolute -bottom-3 right-1 h-6 w-6 rounded-full bg-gray-900 ring-4 ring-gray-600" />
              </div>
            </div>
          )}

          {predictionReady && (
            <div className="absolute inset-0 z-40 flex items-center justify-center bg-gradient-to-b from-white/35 to-amber-100/50 backdrop-blur-[2px]">
              <div className="animate-[predictionReveal_0.5s_ease-out_forwards] text-center">
                <div className="relative mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-2xl">
                  <CheckCircle2
                    size={54}
                    className="text-green-700"
                  />

                  <Sparkles
                    size={26}
                    className="absolute -right-2 -top-2 animate-pulse text-amber-500"
                  />

                  <Sparkles
                    size={18}
                    className="absolute -bottom-1 -left-3 animate-pulse text-green-500"
                  />
                </div>

                <h2 className="mt-6 text-3xl font-black text-green-950 sm:text-4xl">
                  Prediction Ready
                </h2>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes tractorDrive {
          0% {
            transform: translateX(-110px);
          }

          100% {
            transform: translateX(
              calc(100vw - 70px)
            );
          }
        }

        @keyframes cropGrow {
          0% {
            opacity: 0;
            transform: translateY(24px) scaleY(0.1);
          }

          100% {
            opacity: 1;
            transform: translateY(0) scaleY(1);
          }
        }

        @keyframes predictionReveal {
          0% {
            opacity: 0;
            transform: translateY(20px) scale(0.9);
          }

          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-delay: 0ms !important;
          }
        }
      `}</style>
    </div>
  );
}

function FieldRows({
  showSprouts,
  showGreenCrops,
  showHarvest,
}) {
  const rows = Array.from({
    length: 5,
  });

  const cropsPerRow = Array.from({
    length: 13,
  });

  return (
    <div className="absolute inset-x-4 bottom-4 z-20 space-y-1 sm:inset-x-10">
      {rows.map((_, rowIndex) => (
        <div
          key={rowIndex}
          className="flex items-end justify-around"
          style={{
            opacity:
              showSprouts || showGreenCrops
                ? 1
                : 0,
          }}
        >
          {cropsPerRow.map(
            (_, cropIndex) => {
              const delay =
                cropIndex * 90 +
                rowIndex * 70;

              return (
                <span
                  key={cropIndex}
                  className={`inline-block origin-bottom text-2xl transition-all duration-500 sm:text-3xl ${
                    showHarvest
                      ? "grayscale-0"
                      : showGreenCrops
                        ? "saturate-150"
                        : ""
                  }`}
                  style={{
                    animation:
                      showSprouts
                        ? `cropGrow 0.65s ease-out ${delay}ms both`
                        : "none",
                  }}
                >
                  {showHarvest
                    ? "🌾"
                    : showGreenCrops
                      ? "🌿"
                      : "🌱"}
                </span>
              );
            }
          )}
        </div>
      ))}
    </div>
  );
}

export default PredictionLoader;