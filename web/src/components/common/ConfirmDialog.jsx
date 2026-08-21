import { AlertTriangle, X } from "lucide-react";

function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  loading = false,
  onConfirm,
  onClose,
}) {
  if (!open) {
    return null;
  }

  const confirmButtonClass =
    variant === "warning"
      ? "bg-amber-600 hover:bg-amber-700"
      : variant === "success"
        ? "bg-green-700 hover:bg-green-800"
        : "bg-red-600 hover:bg-red-700";

  const iconClass =
    variant === "warning"
      ? "bg-amber-100 text-amber-700"
      : variant === "success"
        ? "bg-green-100 text-green-700"
        : "bg-red-100 text-red-700";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !loading) {
          onClose();
        }
      }}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-message"
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div className={`rounded-xl p-3 ${iconClass}`}>
            <AlertTriangle size={25} />
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            aria-label="Close confirmation dialog"
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X size={21} />
          </button>
        </div>

        <h2
          id="confirm-dialog-title"
          className="mt-5 text-xl font-bold text-gray-900"
        >
          {title}
        </h2>

        <p
          id="confirm-dialog-message"
          className="mt-3 text-sm leading-6 text-gray-600"
        >
          {message}
        </p>

        <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-xl border border-gray-300 px-5 py-2.5 font-semibold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {cancelLabel}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`rounded-xl px-5 py-2.5 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50 ${confirmButtonClass}`}
          >
            {loading ? "Processing..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;