import { Metadata } from "next";
import { GraduationCap, Target, Users, Lightbulb, CheckCircle, XCircle } from "lucide-react";
import CTABanner from "@/components/sections/CTABanner";

export const metadata: Metadata = {
  title: "About | NPCMST AttendAI",
  description: "Learn about the NPCMST Automated Facial Recognition Attendance System.",
};

export default function AboutPage() {
  return (
    <>
      <section className="bg-[#0a1628] pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-[#c9a84c] text-sm font-semibold uppercase tracking-widest">About</span>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mt-3 mb-6">
            Built for NPCMST, by NPCMST
          </h1>
          <p className="text-gray-300 text-lg leading-relaxed">
            AttendAI was developed to solve a real problem on campus — manual attendance was slow, error-prone, and unsustainable at scale.
          </p>
        </div>
      </section>

      {/* School Background */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-[#c9a84c] text-sm font-semibold uppercase tracking-widest">The School</span>
              <h2 className="text-3xl font-bold text-[#0a1628] mt-2 mb-4">
                Northern Philippines College for Maritime, Science and Technology
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                NPCMST is a premier institution in Ilocos Norte dedicated to producing globally competitive graduates in maritime, science, and technology disciplines.
              </p>
              <p className="text-gray-600 leading-relaxed">
                With thousands of students across multiple departments, managing attendance manually had become a significant administrative burden — leading to inaccuracies, disputes, and wasted class time.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: <GraduationCap size={28} />, label: "Students Enrolled", value: "2,000+" },
                { icon: <Users size={28} />, label: "Faculty Members", value: "120+" },
                { icon: <Target size={28} />, label: "Departments", value: "8" },
                { icon: <Lightbulb size={28} />, label: "Years Operating", value: "20+" },
              ].map((s) => (
                <div key={s.label} className="bg-gray-50 border border-gray-100 rounded-xl p-5 text-center">
                  <div className="text-[#c9a84c] flex justify-center mb-2">{s.icon}</div>
                  <div className="text-2xl font-bold text-[#0a1628]">{s.value}</div>
                  <div className="text-gray-500 text-xs mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Before / After */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#0a1628]">The Problem We Solved</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-red-50 border border-red-100 rounded-xl p-6">
              <h3 className="text-red-700 font-semibold mb-4 flex items-center gap-2">
                <XCircle size={18} /> Before AttendAI
              </h3>
              <ul className="space-y-3 text-sm text-gray-600">
                {[
                  "10–15 minutes lost per class for roll call",
                  "Frequent errors and proxy attendance",
                  "Paper-based records prone to loss",
                  "No real-time visibility for administrators",
                  "Manual report compilation took hours",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <XCircle size={14} className="text-red-400 flex-shrink-0 mt-0.5" /> {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-green-50 border border-green-100 rounded-xl p-6">
              <h3 className="text-green-700 font-semibold mb-4 flex items-center gap-2">
                <CheckCircle size={18} /> After AttendAI
              </h3>
              <ul className="space-y-3 text-sm text-gray-600">
                {[
                  "Attendance logged in under 1 second",
                  "99.7% recognition accuracy",
                  "Fully digital, encrypted records",
                  "Live dashboard for all stakeholders",
                  "One-click automated report generation",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <CheckCircle size={14} className="text-green-500 flex-shrink-0 mt-0.5" /> {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-[#c9a84c] text-sm font-semibold uppercase tracking-widest">The Team</span>
            <h2 className="text-3xl font-bold text-[#0a1628] mt-2">Built by NPCMST Students & Faculty</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: "Engr. Jose Dela Cruz", role: "Project Lead & System Architect", dept: "IT Department" },
              { name: "Maria Santos",         role: "Frontend Developer",              dept: "BSCS — 4th Year" },
              { name: "Carlo Reyes",          role: "ML / Face Recognition Engineer", dept: "BSCS — 4th Year" },
              { name: "Ana Lim",              role: "Backend Developer",               dept: "BSIT — 4th Year" },
              { name: "Dr. Ramon Cruz",       role: "Academic Adviser",               dept: "Academic Affairs" },
              { name: "Prof. Liza Ramos",     role: "QA & Testing Lead",              dept: "BSMT Department" },
            ].map((m) => (
              <div key={m.name} className="bg-gray-50 border border-gray-100 rounded-xl p-5">
                <div className="w-12 h-12 rounded-full bg-[#0a1628] text-[#c9a84c] flex items-center justify-center font-bold text-lg mb-3">
                  {m.name.charAt(0)}
                </div>
                <div className="font-semibold text-[#0a1628] text-sm">{m.name}</div>
                <div className="text-[#c9a84c] text-xs font-medium mt-0.5">{m.role}</div>
                <div className="text-gray-400 text-xs mt-0.5">{m.dept}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTABanner />
    </>
  );
}
