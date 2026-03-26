import { Metadata } from "next";
import {
  ScanFace, BarChart3, ShieldCheck, Smartphone,
  WifiOff, FileDown, Bell, Clock, Users, Lock
} from "lucide-react";
import CTABanner from "@/components/sections/CTABanner";

export const metadata: Metadata = {
  title: "Features | NPCMST AttendAI",
  description: "Explore all features of the NPCMST automated facial recognition attendance system.",
};

const features = [
  { icon: <ScanFace size={32} />, title: "Real-Time Face Detection", desc: "Sub-second identification using deep learning models trained on diverse facial datasets. Works in varying lighting conditions." },
  { icon: <BarChart3 size={32} />, title: "Automated Reports", desc: "Daily, weekly, and monthly attendance reports auto-generated and delivered to faculty inboxes. Export to PDF or CSV." },
  { icon: <ShieldCheck size={32} />, title: "Data Privacy Compliant", desc: "Biometric data is AES-256 encrypted at rest and in transit. Fully compliant with the Philippine Data Privacy Act of 2012." },
  { icon: <Smartphone size={32} />, title: "Mobile Dashboard", desc: "Responsive web dashboard accessible from any device. Faculty can view live attendance from their phones." },
  { icon: <WifiOff size={32} />, title: "Offline Mode", desc: "Attendance continues logging even without internet connectivity. Data syncs automatically when the connection is restored." },
  { icon: <FileDown size={32} />, title: "Role-Based Access", desc: "Three-tier access: Admin (full control), Faculty (class-level), Student (personal records only)." },
  { icon: <Bell size={32} />, title: "Instant Notifications", desc: "Automated alerts sent to parents and guardians when a student is marked absent or late." },
  { icon: <Clock size={32} />, title: "Flexible Scheduling", desc: "Supports multiple class schedules, irregular sessions, and special events with custom time windows." },
  { icon: <Users size={32} />, title: "Bulk Enrollment", desc: "Enroll entire classes at once using batch upload. Face data captured in a guided 30-second process per student." },
  { icon: <Lock size={32} />, title: "Anti-Spoofing", desc: "Liveness detection prevents photo or video spoofing attempts, ensuring only real faces are accepted." },
];

export default function FeaturesPage() {
  return (
    <>
      <section className="bg-[#0a1628] pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-[#c9a84c] text-sm font-semibold uppercase tracking-widest">Features</span>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mt-3 mb-6">
            Packed with Everything You Need
          </h1>
          <p className="text-gray-300 text-lg">
            Every feature was designed around real feedback from NPCMST faculty and administrators.
          </p>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="bg-white border border-gray-100 rounded-xl p-6 hover:shadow-md hover:border-[#c9a84c]/30 transition-all group">
                <div className="text-[#c9a84c] mb-4 group-hover:scale-110 transition-transform inline-block">
                  {f.icon}
                </div>
                <h3 className="text-[#0a1628] font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTABanner />
    </>
  );
}
