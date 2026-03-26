"use client";
import Link from "next/link";
import { ScanFace, ArrowRight, ShieldCheck, Clock, FileText } from "lucide-react";

export default function Hero() {
  return (
    <section className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#1a2f4e] to-[#0a1628] flex items-center pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Text */}
          <div>
            <div className="inline-flex items-center gap-2 bg-[#c9a84c]/10 border border-[#c9a84c]/30 text-[#c9a84c] text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
              <ScanFace size={14} />
              Now Live at NPCMST
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              Attendance Tracking,{" "}
              <span className="text-[#c9a84c]">Reimagined</span>
            </h1>
            <p className="text-gray-300 text-lg leading-relaxed mb-8 max-w-xl">
              Say goodbye to manual roll calls. NPCMST&apos;s automated facial recognition system logs attendance in real-time — accurate, fast, and completely paperless.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Link
                href="/demo"
                className="flex items-center justify-center gap-2 bg-[#c9a84c] hover:bg-[#e8c96a] text-[#0a1628] font-bold px-6 py-3 rounded-lg transition-colors"
              >
                Request a Demo <ArrowRight size={18} />
              </Link>
              <Link
                href="/how-it-works"
                className="flex items-center justify-center gap-2 border border-gray-500 hover:border-[#c9a84c] text-white hover:text-[#c9a84c] px-6 py-3 rounded-lg transition-colors"
              >
                See How It Works
              </Link>
            </div>

            {/* Trust stats */}
            <div className="flex flex-wrap gap-6">
              {[
                { icon: <ScanFace size={18} />, stat: "99.7%", label: "Recognition Accuracy" },
                { icon: <Clock size={18} />, stat: "<1s", label: "Detection Speed" },
                { icon: <FileText size={18} />, stat: "100%", label: "Paperless Reports" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2 text-gray-300">
                  <span className="text-[#c9a84c]">{item.icon}</span>
                  <div>
                    <div className="text-white font-bold text-lg leading-none">{item.stat}</div>
                    <div className="text-xs text-gray-400">{item.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Visual card */}
          <div className="flex justify-center">
            <div className="relative w-full max-w-md">
              <div className="bg-[#1a2f4e] border border-[#c9a84c]/20 rounded-2xl p-8 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-white font-semibold">Live Attendance Feed</span>
                  <span className="flex items-center gap-1.5 text-green-400 text-xs font-medium">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    Active
                  </span>
                </div>

                {/* Simulated face scan UI */}
                <div className="bg-[#0a1628] rounded-xl p-6 mb-4 flex flex-col items-center">
                  <div className="w-24 h-24 rounded-full border-4 border-[#c9a84c] flex items-center justify-center mb-3 relative">
                    <ScanFace size={48} className="text-[#c9a84c]" />
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-[#0a1628]" />
                  </div>
                  <div className="text-white font-semibold">Student Detected</div>
                  <div className="text-gray-400 text-sm">BSMT-3A · ID: 2021-0042</div>
                </div>

                {[
                  { name: "Juan D.", dept: "BSMT-2B", time: "7:58 AM", status: "Present" },
                  { name: "Maria S.", dept: "BSCS-1A", time: "8:01 AM", status: "Present" },
                  { name: "Carlo R.", dept: "BSMT-3A", time: "8:05 AM", status: "Late" },
                ].map((s) => (
                  <div key={s.name} className="flex items-center justify-between py-2 border-b border-[#0a1628] last:border-0">
                    <div>
                      <div className="text-white text-sm font-medium">{s.name}</div>
                      <div className="text-gray-500 text-xs">{s.dept}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-gray-300 text-xs">{s.time}</div>
                      <span className={`text-xs font-semibold ${s.status === "Present" ? "text-green-400" : "text-yellow-400"}`}>
                        {s.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Floating badge */}
              <div className="absolute -bottom-4 -left-4 bg-[#c9a84c] text-[#0a1628] text-xs font-bold px-3 py-2 rounded-lg shadow-lg flex items-center gap-1.5">
                <ShieldCheck size={14} />
                Data Privacy Compliant
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
