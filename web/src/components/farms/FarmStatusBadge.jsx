function FarmStatusBadge({ isActive }) {
  return (
    <span
      className={[
        "inline-flex rounded-full px-3 py-1 text-xs font-semibold",
        isActive
          ? "bg-green-100 text-green-800"
          : "bg-gray-200 text-gray-700",
      ].join(" ")}
    >
      {isActive ? "Active" : "Inactive"}
    </span>
  );
}

export default FarmStatusBadge;