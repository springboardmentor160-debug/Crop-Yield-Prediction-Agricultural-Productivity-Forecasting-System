import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Home,
  SearchX,
} from "lucide-react";

function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5 py-12">
      <section className="w-full max-w-2xl rounded-3xl border border-gray-200 bg-white px-6 py-12 text-center shadow-sm sm:px-10">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-green-100 text-green-700">
          <SearchX size={38} />
        </div>

        <p className="mt-7 text-sm font-extrabold uppercase tracking-[0.24em] text-green-700">
          Error 404
        </p>

        <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-gray-900">
          Page not found
        </h1>

        <p className="mx-auto mt-4 max-w-lg text-base leading-7 text-gray-600">
          The page you are trying to open does not exist,
          may have been moved, or the address may be
          incorrect.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-green-700 bg-white px-5 py-3 text-sm font-semibold text-green-700 transition hover:bg-green-50"
          >
            <ArrowLeft size={18} />
            Go Back
          </button>

          <Link
            to="/dashboard"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-800"
          >
            <Home size={18} />
            Go to Dashboard
          </Link>
        </div>
      </section>
    </main>
  );
}

export default NotFound;