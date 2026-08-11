import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center">
        <div className="text-xl font-bold text-gray-900">YieldSense AI</div>
        <div className="space-x-4">
          <Link href="/login" className="text-gray-600 hover:text-gray-900">Sign In</Link>
          <Link href="/login" className="btn-primary">Get Started</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center max-w-4xl mx-auto">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Predict Yields. Optimize Growth.
        </h1>
        <p className="text-lg text-gray-600 mb-10 max-w-2xl">
          A straightforward precision agriculture platform using machine learning to forecast crop yields, analyze environmental risks, and deliver soil recommendations.
        </p>
        <div className="flex gap-4">
          <Link href="/dashboard/farmer" className="btn-primary px-8 py-3 text-lg">
            Launch Dashboard
          </Link>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 text-left">
          <div className="card">
            <h3 className="font-bold text-gray-900 mb-2">Yield Forecasting</h3>
            <p className="text-gray-600 text-sm">XGBoost-powered predictions for crop output.</p>
          </div>
          <div className="card">
            <h3 className="font-bold text-gray-900 mb-2">Weather Intelligence</h3>
            <p className="text-gray-600 text-sm">Climate stress detection for drought, heat, and floods.</p>
          </div>
          <div className="card">
            <h3 className="font-bold text-gray-900 mb-2">Risk Assessment</h3>
            <p className="text-gray-600 text-sm">Automated environmental risk scoring.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
