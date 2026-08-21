function AuthCard({ title, subtitle, children }) {
  return (
    <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
      <h1 className="text-center text-2xl font-bold text-gray-900">{title}</h1>
      {subtitle && (
        <p className="mt-2 text-center text-sm text-gray-500">{subtitle}</p>
      )}
      <div className="mt-6">{children}</div>
    </div>
  );
}

export default AuthCard;