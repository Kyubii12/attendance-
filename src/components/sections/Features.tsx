import { ScanFace, BarChart3, ShieldCheck, Smartphone, WifiOff, FileDown } from "lucide-react";

const features = [
  {
    icon: <ScanFace size={28} />,
    title: "Real-Time Face Detection",
    desc: "Identifies and logs students in under 1 second using advanced facial recognition algorithms.",
  },
  {
    icon: <BarChart3 size={28} />,
    title: "Automated Reports",
    desc: "Generate daily, weekly, or monthly attendance reports in PDF or CSV with one click.",
  },
  {
    icon: <ShieldCheck size={28} />,
    title: "Secure & Compliant",
    desc: "All biometric data is encrypted and handled in compliance with the Data Privacy Act of 2012.",
  },
  {
    icon: <Smartphone size={28} />,
    title: "Mobile-Friendly Dashboard",
    desc: "Faculty and admins can monitor attendance from any device, anywhere.",
  },
  {
    icon: <WifiOff size={28} />,
    title: "Offline Mode",
    desc: "Continues logging attendance even without internet. Data syncs automatically when reconnected.",
  },
  {
    icon: <FileDown size={28} />,
    title: "Role-Based Access",
    desc: "Separate dashboards for Admins, Faculty, and Students with appropriate permissions.",
  },
];

export default function Features() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="text-[#c9a84c] text-sm font-semibold uppercase tracking-widest">What It Does</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#0a1628] mt-2">
            Everything You Need, Nothing You Don&apos;t
          </h2>
          <p className="text-gray-500 mt-3 max-w-xl mx-auto">
            Built specifically for NPCMST&apos;s academic environment — reliable, fast, and easy to use.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-white border border-gray-100 rounded-xl p-6 hover:shadow-md hover:border-[#c9a84c]/30 transition-all group"
            >
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
  );
}
