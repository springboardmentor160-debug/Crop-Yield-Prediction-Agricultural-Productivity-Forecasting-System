function FarmFilters({
  filters,
  onChange,
  onApply,
  onClear,
  showStatus = true,
  showOwnerEmail = false,
}) {
  return (
    <form
      onSubmit={onApply}
      className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
    >
      <div
        className={[
          "grid gap-4",
          showOwnerEmail
            ? "md:grid-cols-2 xl:grid-cols-5"
            : "md:grid-cols-2 xl:grid-cols-4",
        ].join(" ")}
      >
        {showOwnerEmail && (
          <input
            name="owner_email"
            type="email"
            value={filters.owner_email || ""}
            onChange={onChange}
            placeholder="Owner email"
            className="rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-green-600"
          />
        )}

        <input
          name="state"
          value={filters.state || ""}
          onChange={onChange}
          placeholder="State"
          className="rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-green-600"
        />

        <input
          name="district"
          value={filters.district || ""}
          onChange={onChange}
          placeholder="District"
          className="rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-green-600"
        />

        <input
          name="primary_crop"
          value={filters.primary_crop || ""}
          onChange={onChange}
          placeholder="Primary crop"
          className="rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-green-600"
        />

        {showStatus && (
          <select
            name="is_active"
            value={filters.is_active ?? "true"}
            onChange={onChange}
            className="rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-green-600"
          >
            <option value="true">Active farms</option>
            <option value="false">Inactive farms</option>
            <option value="">All statuses</option>
          </select>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="submit"
          className="rounded-xl bg-green-700 px-5 py-2.5 font-semibold text-white hover:bg-green-800"
        >
          Apply Filters
        </button>

        <button
          type="button"
          onClick={onClear}
          className="rounded-xl border border-gray-300 px-5 py-2.5 font-semibold text-gray-700 hover:bg-gray-50"
        >
          Clear Filters
        </button>
      </div>
    </form>
  );
}

export default FarmFilters;