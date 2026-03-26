import { Metadata } from "next";
import { UserCheck, Camera, ClipboardCheck, Send, CheckCircle } from "lucide-react";
import CTABanner from "@/components/sections/CTABanner";

export const metadata: Metadata = {
  title: "How It Works | NPCMST AttendAI",
  description: "Step-by-step breakdown of how the NPCMST facial recognition attendance system works.",
};

const steps = [
  {
    icon: <UserCheck size={40} />,
    step: "Step 01",
    title: "Student Face Enrollment",
    desc: "Each student completes a one-time enrollment through the web portal or enrollment kiosk. The system captures 5–10 facial angles in about 30 seconds to build a robust facial profile.",
    details: ["Guided capture process", "Works with glasses and masks (partial)", "Data encrypted immediately after capture"],
  },
  {
    icon: <Camera size={40} />,
    step: "Step 02",
    title: "Camera Scans on Entry",
    desc: "IP cameras installed at classroom and building entry points continuously scan for registered faces. No action required from students — just walk in.",
    details: ["Works in low-light conditions", "Handles multiple faces simultaneously", "Anti-spoofing liveness detection active"],
  },
  {
    icon: <ClipboardCheck size={40} />,
    step: "Step 03",
    title: "Attendance Auto-Logged",
    desc: "The moment a face is recognized, attendance is logged with a timestamp, confidence score, and status (Present, Late, or Absent). Faculty see updates in real-time.",
    details: ["Sub-1-second detection speed", "99.7% recognition accuracy", "Automatic late detection based on schedule"],
  },
  {
    icon: <Send size={40} />,
    step: "Step 04",
    title: "Reports Generated & Distributed",
    desc: "At the end of each class or day, the system auto-generates attendance summaries and sends them to the relevant faculty. Admins can pull full reports anytime.",
    details: ["PDF and CSV export", "Email delivery to faculty", "Parent/guardian notifications for absences"],
  },
];

export default function HowItWorksPage() {
  return (
    <>
      <section className="bg-[#0a1628] pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-[#c9a84c] text-sm font-semibold uppercase tracking-widest">The Process</span>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mt-3 mb-6">How It Works</h1>
          <p className="text-gray-300 text-lg">
            From enrollment to report — fully automated, end to end.
          </p>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-12">
            {steps.map((s, i) => (
              <div key={s.step} className="flex flex-col md:flex-row gap-8 items-start">
                <div className="flex-shrink-0 flex flex-col items-center">
                  <div className="w-20 h-20 rounded-full bg-[#0a1628] text-[#c9a84c] flex items-center justify-center">
                    {s.icon}
                  </div>
                  {i < steps.length - 1 && (
                    <div className="w-0.5 h-12 bg-[#c9a84c]/20 mt-4 hidden md:block" />
                  )}
                </div>
                <div className="flex-1 pb-8 border-b border-gray-100 last:border-0">
                  <div className="text-[#c9a84c] text-xs font-bold tracking-widest mb-1">{s.step}</div>
                  <h3 className="text-2xl font-bold text-[#0a1628] mb-3">{s.title}</h3>
                  <p className="text-gray-600 leading-relaxed mb-4">{s.desc}</p>
                  <ul className="space-y-1.5">
                    {s.details.map((d) => (
                      <li key={d} className="flex items-center gap-2 text-sm text-gray-500">
                        <CheckCircle size={14} className="text-[#c9a84c] flex-shrink-0" />
                        {d}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTABanner />
    </>
  );
}
