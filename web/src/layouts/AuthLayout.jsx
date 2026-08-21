function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 px-4">
      <div className="flex min-h-screen items-center justify-center">
        {children}
      </div>
    </div>
  );
}

export default AuthLayout;