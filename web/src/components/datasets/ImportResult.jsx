import {
  AlertTriangle,
  CheckCircle2,
  Database,
  RefreshCw,
  SkipForward,
} from "lucide-react";

function ResultItem({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl bg-gray-50 p-4">
      <Icon size={21} className="text-green-700" />
      <p className="mt-3 text-xs uppercase tracking-wide text-gray-500">
        {label}
      </p>
      <p className="mt-1 text-xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

function ImportResult({ result }) {
  if (!result) {
    return null;
  }

  return (
    <div className="mt-8 rounded-2xl border border-green-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold text-gray-900">
        Import Result: {result.dataset}
      </h2>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <ResultItem
          icon={Database}
          label="Total Rows"
          value={result.total_rows}
        />

        <ResultItem
          icon={CheckCircle2}
          label="Inserted"
          value={result.inserted_rows}
        />

        <ResultItem
          icon={RefreshCw}
          label="Updated"
          value={result.updated_rows}
        />

        <ResultItem
          icon={SkipForward}
          label="Skipped"
          value={result.skipped_rows}
        />

        <ResultItem
          icon={AlertTriangle}
          label="Invalid"
          value={result.invalid_rows}
        />
      </div>

      {result.errors?.length > 0 && (
        <div className="mt-6">
          <h3 className="font-semibold text-red-700">
            Invalid row details
          </h3>

          <div className="mt-3 max-h-64 overflow-auto rounded-xl border border-red-100">
            {result.errors.map((error, index) => (
              <div
                key={`${error.row_number}-${index}`}
                className="border-b border-red-100 px-4 py-3 text-sm last:border-b-0"
              >
                <span className="font-semibold">
                  Row {error.row_number}:
                </span>{" "}
                {error.message}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ImportResult;