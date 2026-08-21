import { FileSpreadsheet, UploadCloud } from "lucide-react";
import { useRef, useState } from "react";

function DatasetUploadCard({
  title,
  description,
  expectedColumns,
  loading,
  onUpload,
}) {
  const inputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileSelection = (event) => {
    const file = event.target.files?.[0] ?? null;
    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      return;
    }

    await onUpload(selectedFile);
    setSelectedFile(null);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="rounded-xl bg-green-100 p-3 text-green-700">
          <FileSpreadsheet size={26} />
        </div>

        <div>
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          <p className="mt-1 text-sm leading-6 text-gray-500">
            {description}
          </p>
        </div>
      </div>

      <div className="mt-5 rounded-xl bg-gray-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
          Expected columns
        </p>

        <p className="mt-2 break-words text-sm text-gray-700">
          {expectedColumns.join(", ")}
        </p>
      </div>

      <div className="mt-5">
        <input
          ref={inputRef}
          type="file"
          accept=".csv,text/csv"
          onChange={handleFileSelection}
          className="block w-full rounded-lg border border-gray-300 bg-white p-2 text-sm"
        />
      </div>

      {selectedFile && (
        <p className="mt-3 text-sm text-gray-600">
          Selected:{" "}
          <span className="font-medium text-gray-900">
            {selectedFile.name}
          </span>
        </p>
      )}

      <button
        type="button"
        disabled={!selectedFile || loading}
        onClick={handleUpload}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-green-700 px-4 py-3 font-semibold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <UploadCloud size={19} />
        {loading ? "Importing Dataset..." : "Upload and Import"}
      </button>
    </div>
  );
}

export default DatasetUploadCard;