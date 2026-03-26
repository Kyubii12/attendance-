import { UserCheck, Camera, ClipboardCheck, Send } from "lucide-react";

const steps = [
  {
    icon: <UserCheck size={32} />,
    step: "01",
    title: "Student Enrollment",
    desc: "Students register their face once through the enrollment portal. The system captures multiple angles for accuracy.",
  },
  {
    icon: <Camera size={32} />,
    step: "02",
    title: "Camera Scans on Entry",
    desc: "Cameras at entry points automatically detect and identify students as they enter the classroom or campus.",
  },
  {
    icon: <ClipboardCheck size={32} />,
    step: "03",
    title: "Attendance Auto-Logged",
    desc: "The system instantly marks attendance — Present, Late, or Absent — with a timestamp and confidence score.",
  },
  {
    icon: <Send size={32} />,
    step: "04",
    title: "Reports Generated & Sent",
    desc: "Faculty receive automated attendance summaries. Admins can export full reports anytime.",
  },
];

export default function HowItWorks() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="text-[#c9a84c] text-sm font-semibold uppercase tracking-widest">The Process</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#0a1628] mt-2">How It Works</h2>
          <p className="text-gray-500 mt-3 max-w-xl mx-auto">
            From enrollment to report — the entire process is automated and takes seconds.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((s, i) => (
            <div key={s.step} className="relative text-center">
              {/* Connector line */}
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-10 left-[60%] w-full h-0.5 bg-[#c9a84c]/20 z-0" />
              )}
              <div className="relative z-10 inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#0a1628] text-[#c9a84c] mb-4 mx-auto">
                {s.icon}
              </div>
              <div className="text-[#c9a84c] text-xs font-bold tracking-widest mb-1">{s.step}</div>
              <h3 className="text-[#0a1628] font-semibold text-lg mb-2">{s.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
