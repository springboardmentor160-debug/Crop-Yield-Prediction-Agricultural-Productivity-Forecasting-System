import { Link } from "react-router-dom";
import { Tractor } from "lucide-react";

function EmptyFarmState({
  title = "No farms found",
  message = "Create your first farm to start managing agricultural data.",
  showCreateButton = true,
}) {
  return (
    <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-14 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-green-100 text-green-700">
        <Tractor size={30} />
      </div>

      <h2 className="mt-5 text-xl font-bold text-gray-900">
        {title}
      </h2>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
        {message}
      </p>

      {showCreateButton && (
        <Link
          to="/farms/create"
          className="mt-6 inline-flex rounded-xl bg-green-700 px-5 py-3 font-semibold text-white hover:bg-green-800"
        >
          Create Farm
        </Link>
      )}
    </div>
  );
}

export default EmptyFarmState;