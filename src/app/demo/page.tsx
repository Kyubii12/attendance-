import { Metadata } from "next";
import DemoForm from "@/components/DemoForm";
import LiveCamera from "@/components/LiveCamera";
import { CheckCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Live Demo | NPCMST AttendAI",
  description: "Try the live facial recognition attendance demo for NPCMST.",
};

export default function DemoPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-[#0a1628] pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-[#c9a84c] text-sm font-semibold uppercase tracking-widest">Live Demo</span>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mt-3 mb-6">
            See It in Action
          </h1>
          <p className="text-gray-300 text-lg">
            Turn on your camera and watch the attendance system detect and log faces in real-time.
          </p>
        </div>
      </section>

      {/* Live Camera Section */}
      <section className="py-16 bg-[#111e35]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="text-2xl font-bold text-white">Live Facial Recognition</h2>
              <p className="text-gray-400 text-sm mt-1">
                Allow camera access, then click <span className="text-[#c9a84c] font-semibold">Start Camera</span> to begin.
              </p>
            </div>
            <span className="text-xs text-gray-500 bg-[#1a2f4e] px-3 py-1.5 rounded-full">
              Demo mode — no data is stored or transmitted
            </span>
          </div>
          <LiveCamera />
        </div>
      </section>

      {/* Request Demo + Benefits */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Benefits */}
            <div>
              <h2 className="text-2xl font-bold text-[#0a1628] mb-6">Want a Full Walkthrough?</h2>
              <ul className="space-y-4 mb-8">
                {[
                  "Live walkthrough of the full attendance workflow",
                  "Dashboard demo for faculty and admin roles",
                  "Q&A with the development team",
                  "Custom setup discussion for your department",
                  "Integration options with existing school systems",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-gray-600">
                    <CheckCircle size={18} className="text-[#c9a84c] flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>

              <div className="bg-[#0a1628] rounded-xl p-6 text-white">
                <div className="text-[#c9a84c] text-sm font-semibold mb-2">Currently in Pilot Phase</div>
                <p className="text-gray-300 text-sm leading-relaxed">
                  AttendAI is being piloted in select departments. Demo slots are limited — request yours early.
                </p>
              </div>
            </div>

            {/* Form */}
            <DemoForm />
          </div>
        </div>
      </section>
    </>
  );
}
