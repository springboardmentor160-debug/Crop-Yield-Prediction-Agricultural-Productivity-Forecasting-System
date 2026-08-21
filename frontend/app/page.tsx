import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex flex-col justify-center items-center px-4 relative overflow-hidden">
        
        {/* Background Decorative Elements */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] mix-blend-screen animate-pulse-slow pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-700/20 rounded-full blur-[100px] mix-blend-screen animate-pulse-slow pointer-events-none" style={{ animationDelay: '2s' }}></div>

        <div className="max-w-4xl w-full mx-auto text-center z-10 animate-slide-up">
          <div className="inline-block mb-6 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary font-mono text-xs uppercase tracking-widest backdrop-blur-md">
            Yield Forecasting Engine v2.0
          </div>
          
          <h1 className="font-display text-5xl md:text-7xl font-extrabold leading-tight mb-8 tracking-tight">
            See the harvest <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-300">
              before you plant
            </span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-textSecondary mb-12 leading-relaxed">
            Harness advanced predictive analytics to forecast crop yields, evaluate climate risks, and optimize resources with precision accuracy.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup" className="w-full sm:w-auto btn-primary">
              Launch Platform
            </Link>
            <Link href="/login" className="w-full sm:w-auto btn-secondary">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
