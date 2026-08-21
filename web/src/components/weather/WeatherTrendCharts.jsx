import {
  CloudRain,
  Droplets,
  ThermometerSun,
} from "lucide-react";


function WeatherTrendCharts({
  records = [],
}) {
  if (!records.length) {
    return null;
  }

  const chartConfigurations = [
    {
      title: "Temperature Trend",
      description:
        "Average temperature recorded for each year.",
      dataKey: "avg_temp_c",
      unit: "°C",
      icon: ThermometerSun,
    },
    {
      title: "Rainfall Trend",
      description:
        "Total annual rainfall recorded for each year.",
      dataKey: "total_rainfall_mm",
      unit: "mm",
      icon: CloudRain,
    },
    {
      title: "Humidity Trend",
      description:
        "Average humidity percentage recorded for each year.",
      dataKey: "avg_humidity_percent",
      unit: "%",
      icon: Droplets,
    },
  ];

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-slate-900">
          Historical Weather Trends
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Year-by-year visual comparison of temperature,
          rainfall and humidity.
        </p>
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        {chartConfigurations.map((configuration) => (
          <WeatherLineChart
            key={configuration.dataKey}
            records={records}
            {...configuration}
          />
        ))}
      </div>
    </section>
  );
}


function WeatherLineChart({
  records,
  title,
  description,
  dataKey,
  unit,
  icon: Icon,
}) {
  const width = 600;
  const height = 300;

  const padding = {
    top: 25,
    right: 25,
    bottom: 55,
    left: 60,
  };

  const values = records.map((record) =>
    Number(record[dataKey])
  );

  const validValues = values.filter(
    (value) => Number.isFinite(value)
  );

  if (!validValues.length) {
    return null;
  }

  const actualMinimum = Math.min(...validValues);
  const actualMaximum = Math.max(...validValues);

  const difference =
    actualMaximum - actualMinimum;

  const valuePadding =
    difference === 0
      ? Math.max(
          Math.abs(actualMaximum) * 0.1,
          1
        )
      : difference * 0.15;

  const minimumValue =
    actualMinimum - valuePadding;

  const maximumValue =
    actualMaximum + valuePadding;

  const chartWidth =
    width - padding.left - padding.right;

  const chartHeight =
    height - padding.top - padding.bottom;

  const getX = (index) => {
    if (records.length === 1) {
      return padding.left + chartWidth / 2;
    }

    return (
      padding.left +
      (index / (records.length - 1)) *
        chartWidth
    );
  };

  const getY = (value) => {
    const range =
      maximumValue - minimumValue || 1;

    return (
      padding.top +
      ((maximumValue - value) / range) *
        chartHeight
    );
  };

  const points = records
    .map((record, index) => {
      const value = Number(record[dataKey]);

      if (!Number.isFinite(value)) {
        return null;
      }

      return {
        year: record.year,
        value,
        x: getX(index),
        y: getY(value),
      };
    })
    .filter(Boolean);

  const polylinePoints = points
    .map((point) => `${point.x},${point.y}`)
    .join(" ");

  const yAxisLabels = Array.from(
    { length: 5 },
    (_, index) => {
      const ratio = index / 4;

      return {
        value:
          maximumValue -
          ratio *
            (maximumValue - minimumValue),
        y:
          padding.top +
          ratio * chartHeight,
      };
    }
  );

  const displayedYearIndexes =
    getDisplayedYearIndexes(records.length);

  return (
    <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50">
            <Icon className="h-5 w-5 text-emerald-700" />
          </div>

          <div>
            <h3 className="font-bold text-slate-900">
              {title}
            </h3>

            <p className="mt-1 text-sm leading-5 text-slate-500">
              {description}
            </p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto p-4">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="min-w-[560px]"
          role="img"
          aria-label={title}
        >
          {yAxisLabels.map((label) => (
            <g key={label.y}>
              <line
                x1={padding.left}
                y1={label.y}
                x2={width - padding.right}
                y2={label.y}
                stroke="currentColor"
                strokeWidth="1"
                className="text-slate-200"
              />

              <text
                x={padding.left - 12}
                y={label.y + 4}
                textAnchor="end"
                className="fill-slate-500 text-[11px]"
              >
                {formatAxisValue(label.value)}
              </text>
            </g>
          ))}

          <line
            x1={padding.left}
            y1={padding.top}
            x2={padding.left}
            y2={height - padding.bottom}
            stroke="currentColor"
            strokeWidth="1.5"
            className="text-slate-300"
          />

          <line
            x1={padding.left}
            y1={height - padding.bottom}
            x2={width - padding.right}
            y2={height - padding.bottom}
            stroke="currentColor"
            strokeWidth="1.5"
            className="text-slate-300"
          />

          <polyline
            points={polylinePoints}
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-emerald-600"
          />

          {points.map((point, index) => (
            <g key={`${point.year}-${index}`}>
              <circle
                cx={point.x}
                cy={point.y}
                r="6"
                fill="white"
                stroke="currentColor"
                strokeWidth="4"
                className="text-emerald-600"
              />

              <title>
                {point.year}:{" "}
                {formatNumber(point.value)}{" "}
                {unit}
              </title>

              {displayedYearIndexes.has(index) && (
                <text
                  x={point.x}
                  y={height - padding.bottom + 27}
                  textAnchor="middle"
                  className="fill-slate-500 text-[11px]"
                >
                  {point.year}
                </text>
              )}
            </g>
          ))}

          <text
            x={18}
            y={height / 2}
            textAnchor="middle"
            transform={`rotate(-90 18 ${
              height / 2
            })`}
            className="fill-slate-500 text-[11px] font-semibold"
          >
            {unit}
          </text>
        </svg>
      </div>

      <div className="grid grid-cols-3 border-t border-slate-100 bg-slate-50">
        <ChartStat
          label="Lowest"
          value={`${formatNumber(
            actualMinimum
          )} ${unit}`}
        />

        <ChartStat
          label="Average"
          value={`${formatNumber(
            calculateAverage(validValues)
          )} ${unit}`}
        />

        <ChartStat
          label="Highest"
          value={`${formatNumber(
            actualMaximum
          )} ${unit}`}
        />
      </div>
    </article>
  );
}


function ChartStat({
  label,
  value,
}) {
  return (
    <div className="border-r border-slate-200 px-3 py-4 text-center last:border-r-0">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-sm font-bold text-slate-900">
        {value}
      </p>
    </div>
  );
}


function getDisplayedYearIndexes(
  totalRecords
) {
  const indexes = new Set();

  if (totalRecords <= 6) {
    for (
      let index = 0;
      index < totalRecords;
      index += 1
    ) {
      indexes.add(index);
    }

    return indexes;
  }

  indexes.add(0);
  indexes.add(totalRecords - 1);

  const interval = Math.ceil(
    totalRecords / 5
  );

  for (
    let index = interval;
    index < totalRecords - 1;
    index += interval
  ) {
    indexes.add(index);
  }

  return indexes;
}


function calculateAverage(values) {
  if (!values.length) {
    return 0;
  }

  return (
    values.reduce(
      (total, value) => total + value,
      0
    ) / values.length
  );
}


function formatAxisValue(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "0";
  }

  if (Math.abs(number) >= 1000) {
    return number.toFixed(0);
  }

  if (Math.abs(number) >= 100) {
    return number.toFixed(1);
  }

  return number.toFixed(2);
}


function formatNumber(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "0.00";
  }

  return number.toFixed(2);
}


export default WeatherTrendCharts;