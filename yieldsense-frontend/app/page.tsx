import Link from "next/link";

export default function Home() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{
        background: "linear-gradient(to right, #E8F5E9, #C8E6C9)",
      }}
    >
      <div className="bg-white shadow-2xl rounded-3xl p-10 max-w-5xl w-full text-center">

        <h1 className="text-6xl font-bold text-green-700 mb-4">
          🌾 YieldSense AI
        </h1>

        <p className="text-2xl text-gray-700 mb-8">
          AI-Powered Crop Yield Prediction System
        </p>

        <p className="text-gray-600 text-lg leading-8 mb-10">
          YieldSense AI helps farmers predict crop yield using
          Artificial Intelligence, Machine Learning, Weather Analysis,
          Soil Health Monitoring and Smart Farming Technologies.
        </p>

        <div className="flex flex-wrap justify-center gap-5 mb-12">

          <Link href="/login">
            <button className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl text-lg shadow-lg">
              🔐 Login
            </button>
          </Link>

          <Link href="/register">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl text-lg shadow-lg">
              📝 Register
            </button>
          </Link>

          <Link href="/dashboard">
            <button className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-xl text-lg shadow-lg">
              📊 Dashboard
            </button>
          </Link>

          <Link href="/farm-profile">
            <button className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-xl text-lg shadow-lg">
              👨‍🌾 Farm Profile
            </button>
          </Link>

        </div>

        <h2 className="text-3xl font-bold text-green-700 mb-8">
          🚀 Features
        </h2>

        <div className="grid md:grid-cols-2 gap-6 text-left">

          <Feature
            icon="🌾"
            title="AI Crop Yield Prediction"
            desc="Predict crop yield using Machine Learning."
          />

          <Feature
            icon="🌦"
            title="Weather Monitoring"
            desc="Live weather updates for better farming decisions."
          />

          <Feature
            icon="🌱"
            title="Soil Health Analysis"
            desc="Monitor soil nutrients, moisture and pH."
          />

          <Feature
            icon="📈"
            title="Analytics Dashboard"
            desc="Interactive charts and prediction insights."
          />

          <Feature
            icon="📜"
            title="Prediction History"
            desc="Track all previous crop predictions."
          />

          <Feature
            icon="👨‍🌾"
            title="Farm Management"
            desc="Store and manage farmer and farm details."
          />

        </div>

        <hr className="my-10" />

        <h3 className="text-2xl font-bold text-green-700">
          👩‍💻 Developed By
        </h3>

        <p className="text-lg mt-3 font-semibold">
          Kanne Nireesha
        </p>

        <p className="text-gray-600">
          B.Tech CSE • MRECW
        </p>

        <p className="mt-6 text-gray-500">
          © 2026 YieldSense AI | Version 2.0
        </p>

      </div>
    </div>
  );
}

function Feature({
  icon,
  title,
  desc,
}: {
  icon: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="bg-green-50 rounded-xl p-5 shadow">
      <h3 className="text-xl font-bold text-green-700">
        {icon} {title}
      </h3>

      <p className="text-gray-600 mt-2">
        {desc}
      </p>
    </div>
  );
}